const SaleProgram = require('../models/saleProgram.models');
const Product = require('../models/product.models');
const ProductBundle = require('../models/productBundle.models');
const SaleProgramUtils = require('../utils/saleProgram.utils');
const { uploadImageCloudinary, deleteImageFromCloudinary } = require('../utils/upload.service');
const slugify = require('slugify');

const createSaleProgram = async (req, res) => {
    try {
        const {
            title,
            description,
            shortDescription,
            type,
            conditions,
            benefits,
            startDate,
            endDate,
            maxUsage,
            targetType,
            targetUsers,
            displaySettings,
            stacking,
            exclusiveWith,
            autoPopulateProducts = true,
            autoPopulateBundles = false
        } = req.body;

        if (!title || !type || !startDate) {
            return res.status(400).json({
                success: false,
                message: 'Title, type, and start date are required'
            });
        }
        const slug = slugify(title, { lower: true, strict: true });

        const existingProgram = await SaleProgram.findOne({ slug });
        if (existingProgram) {
            return res.status(400).json({
                success: false,
                message: 'A program with this title already exists'
            });
        }
        if (endDate && new Date(startDate) >= new Date(endDate)) {
            return res.status(400).json({
                success: false,
                message: 'Start date must be before end date'
            });
        }
        const parsedConditions = typeof conditions === 'string'
            ? JSON.parse(conditions)
            : (conditions || {});
        if (autoPopulateProducts) {
            const productQuery = { countInstock: { $gt: 0 } };

            if (parsedConditions.categories?.length > 0) {
                productQuery.category = { $in: parsedConditions.categories };
            }

            if (parsedConditions.brands?.length > 0) {
                productQuery.brand = { $in: parsedConditions.brands };
            }

            if (parsedConditions.applicableProducts?.length > 0) {
                productQuery._id = { $in: parsedConditions.applicableProducts };
            }

            if (parsedConditions.excludeProducts?.length > 0) {
                productQuery._id = {
                    ...productQuery._id,
                    $nin: parsedConditions.excludeProducts
                };
            }
            const applicableProducts = await Product.find(productQuery).select('_id')
            parsedConditions.applicableProducts = applicableProducts.map(p => p._id)
        }
        if (autoPopulateBundles) {
            const bundleQuery = { isActive: true };

            if (parsedConditions.categories?.length > 0) {
                bundleQuery.category = { $in: parsedConditions.categories };
            }

            if (parsedConditions.brands?.length > 0) {
                bundleQuery.brand = { $in: parsedConditions.brands };
            }

            const applicableBundles = await ProductBundle.find(bundleQuery).select('_id');
            parsedConditions.applicableBundles = applicableBundles.map(b => b._id);
        }
        let bannerImage = null;
        if (req.file) {
            const uploadResult = await uploadImageCloudinary(req.file, 'sale-programs');
            bannerImage = uploadResult.url;
        } else if (req.body.bannerImage) {
            bannerImage = req.body.bannerImage;
        }
        const saleProgram = await SaleProgram.create({
            title,
            slug,
            description,
            shortDescription,
            type,
            conditions: parsedConditions,
            benefits: typeof benefits === 'string' ? JSON.parse(benefits) : (benefits || {}),
            displaySettings: typeof displaySettings === 'string' ? JSON.parse(displaySettings) : (displaySettings || {}),
            startDate,
            endDate,
            maxUsage,
            targetType,
            targetUsers,
            stacking,
            exclusiveWith,
            bannerImage,
            createdBy: req.user._id
        })

        await saleProgram.populate([
            { path: 'conditions.applicableProducts', select: 'name price brand image' },
            { path: 'conditions.categories', select: 'name' },
            { path: 'conditions.applicableBundles', select: 'name bundlePrice' }
        ]);

        res.status(201).json({
            success: true,
            message: 'Sale program created successfully',
            saleProgram,
            stats: {
                productsAdded: parsedConditions.applicableProducts?.length || 0,
                bundlesAdded: parsedConditions.applicableBundles?.length || 0
            }
        });

    } catch (error) {
        console.error('Create sale program error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// ==================== GET ALL SALE PROGRAMS ====================
const getAllSalePrograms = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            status,
            type,
            search,
            sort = 'createdAt',
            order = 'desc'
        } = req.query;

        const filter = {};

        if (status && status !== 'all') {
            filter.status = status;
        }

        if (type) {
            filter.type = type;
        }

        if (search) {
            filter.$or = [
                { title: new RegExp(search, 'i') },
                { description: new RegExp(search, 'i') }
            ];
        }

        const sortObj = {};
        sortObj[sort] = order === 'asc' ? 1 : -1;

        const currentPage = Math.max(1, parseInt(page));
        const pageSize = Math.min(100, Math.max(1, parseInt(limit)));
        const skip = (currentPage - 1) * pageSize;

        const [salePrograms, total] = await Promise.all([
            SaleProgram.find(filter)
                .populate('createdBy', 'name email')
                .populate('conditions.applicableProducts', 'name price')
                .populate('conditions.categories', 'name')
                .populate('conditions.applicableBundles', 'name bundlePrice')
                .sort(sortObj)
                .skip(skip)
                .limit(pageSize),
            SaleProgram.countDocuments(filter)
        ]);

        res.status(200).json({
            success: true,
            data: {
                salePrograms,
                pagination: {
                    currentPage,
                    totalPages: Math.ceil(total / pageSize),
                    pageSize,
                    totalItems: total
                }
            }
        });
    } catch (error) {
        console.error('Get all sale programs error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

const getActiveSalePrograms = async (req, res) => {
    try {
        const { type, category, brand, applyStacking } = req.query;
        const user = req.user || null;

        let salePrograms = await SaleProgramUtils.getActiveSalePrograms({ user });

        if (type) {
            salePrograms = salePrograms.filter(program => program.type === type);
        }

        if (category) {
            salePrograms = salePrograms.filter(program =>
                program.conditions.categories?.some(cat => cat._id.toString() === category)
            );
        }

        if (brand) {
            salePrograms = salePrograms.filter(program =>
                program.conditions.brands?.includes(brand)
            );
        }
        const filteredPrograms = applyStacking === 'true'
            ? SaleProgramUtils.filterByStackingRules(salePrograms)
            : salePrograms;

        const formattedPrograms = filteredPrograms.map(program => ({
            id: program._id,
            title: program.title,
            slug: program.slug,
            shortDescription: program.shortDescription,
            type: program.type,
            bannerImage: program.bannerImage,
            displaySettings: program.displaySettings,
            timeRemaining: program.timeRemaining,
            isCurrentlyActive: program.isCurrentlyActive,
            benefits: program.benefits,
            stacking: program.stacking
        }));

        res.status(200).json({
            success: true,
            salePrograms: formattedPrograms
        });

    } catch (error) {
        console.error('Get active sale programs error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        })
    }
}

const getSaleProgramById = async (req, res) => {
    try {
        const { id } = req.params;

        const saleProgram = await SaleProgram.findById(id)
            .populate('conditions.applicableProducts', 'name price image brand')
            .populate('conditions.categories', 'name')
            .populate('conditions.applicableBundles', 'name bundlePrice image')
            .populate('createdBy', 'name email');

        if (!saleProgram) {
            return res.status(404).json({
                success: false,
                message: 'Sale program not found'
            })
        }

        saleProgram.stats.views += 1
        await saleProgram.save()

        res.status(200).json({
            success: true,
            saleProgram
        });

    } catch (error) {
        console.error('Get sale program error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
}
const getProductsBySaleProgram = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            page = 1,
            limit = 12,
            sortBy = 'discountPercentage',
            sortOrder = 'desc'
        } = req.query;

        const saleProgram = await SaleProgram.findById(id)
            .populate('conditions.applicableProducts')
            .populate('conditions.categories', 'name');

        if (!saleProgram) {
            return res.status(404).json({
                success: false,
                message: 'Sale program not found'
            });
        }

        if (!saleProgram.isCurrentlyActive) {
            return res.status(400).json({
                success: false,
                message: 'This sale program is not currently active'
            });
        }
        let products = saleProgram.conditions.applicableProducts || []
        const sortOrderValue = sortOrder === 'asc' ? 1 : -1
        products.sort((a, b) => {
            if (sortBy === 'price') {
                return (a.price - b.price) * sortOrderValue
            } else if (sortBy === 'name') {
                return a.name.localeCompare(b.name) * sortOrderValue
            }
            return 0
        })
        const currentPage = Math.max(1, parseInt(page))
        const pageSize = Math.min(50, Math.max(1, parseInt(limit)))
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize
        const paginatedProducts = products.slice(startIndex, endIndex)

        res.status(200).json({
            success: true,
            saleProgram: {
                id: saleProgram._id,
                title: saleProgram.title,
                description: saleProgram.description,
                shortDescription: saleProgram.shortDescription,
                discountPercentage: saleProgram.benefits.discountPercentage,
                discountAmount: saleProgram.benefits.discountAmount,
                timeRemaining: saleProgram.timeRemaining,
                bannerImage: saleProgram.bannerImage
            },
            products: paginatedProducts,
            pagination: {
                currentPage,
                totalPages: Math.ceil(products.length / pageSize),
                totalProducts: products.length,
                pageSize
            }
        })

    } catch (error) {
        console.error('Get products by sale program error:', error)
        res.status(500).json({
            success: false,
            message: 'Server error'
        })
    }
}

const getBundlesBySaleProgram = async (req, res) => {
    try {
        const { id } = req.params;
        const { page = 1, limit = 12 } = req.query;

        const saleProgram = await SaleProgram.findById(id)
            .populate({
                path: 'conditions.applicableBundles',
                populate: {
                    path: 'items.product',
                    select: 'name price image'
                }
            });

        if (!saleProgram) {
            return res.status(404).json({
                success: false,
                message: 'Sale program not found'
            });
        }

        const bundles = saleProgram.conditions.applicableBundles || [];

        const currentPage = Math.max(1, parseInt(page))
        const pageSize = Math.min(50, Math.max(1, parseInt(limit)))
        const startIndex = (currentPage - 1) * pageSize;
        const paginatedBundles = bundles.slice(startIndex, startIndex + pageSize)

        res.status(200).json({
            success: true,
            saleProgram: {
                id: saleProgram._id,
                title: saleProgram.title,
                type: saleProgram.type
            },
            bundles: paginatedBundles,
            pagination: {
                currentPage,
                totalPages: Math.ceil(bundles.length / pageSize),
                totalBundles: bundles.length
            }
        });

    } catch (error) {
        console.error('Get bundles by sale program error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
}

const updateSaleProgram = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const saleProgram = await SaleProgram.findById(id);
        if (!saleProgram) {
            return res.status(404).json({
                success: false,
                message: 'Sale program not found'
            });
        }

        // Update slug if title changed
        if (updateData.title && updateData.title !== saleProgram.title) {
            updateData.slug = slugify(updateData.title, { lower: true, strict: true });
        }

        // Handle banner image upload
        if (req.file) {
            const uploadResult = await uploadImageCloudinary(req.file, 'sale-programs');
            updateData.bannerImage = uploadResult.url;
        }

        // Track changes in history
        const changes = Object.keys(updateData);
        saleProgram.history.push({
            updatedBy: req.user._id,
            changes: changes.reduce((acc, key) => {
                acc[key] = { from: saleProgram[key], to: updateData[key] };
                return acc;
            }, {})
        });

        updateData.lastModifiedBy = req.user._id;

        const updatedProgram = await SaleProgram.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: 'Sale program updated successfully',
            saleProgram: updatedProgram
        });

    } catch (error) {
        console.error('Update sale program error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        })
    }
}
const syncProductsToSaleProgram = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            includeOutOfStock = false,
            forceRefresh = false
        } = req.body;

        const saleProgram = await SaleProgram.findById(id);
        if (!saleProgram) {
            return res.status(404).json({
                success: false,
                message: 'Sale program not found'
            });
        }
        const conditions = saleProgram.conditions;
        if (!forceRefresh && conditions.applicableProducts?.length > 0) {
            return res.status(200).json({
                success: true,
                message: 'Products already synced. Use forceRefresh=true to re-sync',
                productsCount: conditions.applicableProducts.length
            });
        }

        const productQuery = {};

        if (!includeOutOfStock) {
            productQuery.countInstock = { $gt: 0 };
        }

        if (conditions.categories?.length > 0) {
            productQuery.category = { $in: conditions.categories };
        }

        if (conditions.brands?.length > 0) {
            productQuery.brand = { $in: conditions.brands };
        }

        if (conditions.excludeProducts?.length > 0) {
            productQuery._id = { $nin: conditions.excludeProducts };
        }

        const products = await Product.find(productQuery).select('_id');
        const productIds = products.map(p => p._id);

        saleProgram.conditions.applicableProducts = productIds;
        await saleProgram.save();

        res.status(200).json({
            success: true,
            message: `Synced ${productIds.length} products to sale program`,
            data: {
                productsCount: productIds.length,
                saleProgram: {
                    id: saleProgram._id,
                    title: saleProgram.title,
                    type: saleProgram.type
                }
            }
        });

    } catch (error) {
        console.error('Sync products error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
}
const syncBundlesToSaleProgram = async (req, res) => {
    try {
        const { id } = req.params;
        const { includeInactive = false } = req.body

        const saleProgram = await SaleProgram.findById(id)
        if (!saleProgram) {
            return res.status(404).json({
                success: false,
                message: 'Sale program not found'
            });
        }

        const conditions = saleProgram.conditions;
        const bundleQuery = {};

        if (!includeInactive) {
            bundleQuery.isActive = true;
        }

        if (conditions.categories?.length > 0) {
            bundleQuery.category = { $in: conditions.categories };
        }

        if (conditions.brands?.length > 0) {
            bundleQuery.brand = { $in: conditions.brands };
        }

        const bundles = await ProductBundle.find(bundleQuery).select('_id');
        const bundleIds = bundles.map(b => b._id);

        saleProgram.conditions.applicableBundles = bundleIds;
        await saleProgram.save();

        res.status(200).json({
            success: true,
            message: `Synced ${bundleIds.length} bundles to sale program`,
            data: {
                bundlesCount: bundleIds.length
            }
        });

    } catch (error) {
        console.error('Sync bundles error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
}
const deleteSaleProgram = async (req, res) => {
    try {
        const { id } = req.params;

        const saleProgram = await SaleProgram.findById(id)
        if (!saleProgram) {
            return res.status(404).json({
                success: false,
                message: 'Sale program not found'
            });
        }

        saleProgram.status = 'expired';
        saleProgram.isActive = false;
        await saleProgram.save();

        res.status(200).json({
            success: true,
            message: 'Sale program deleted successfully'
        });

    } catch (error) {
        console.error('Delete sale program error:', error)
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
}

const validateCouponCode = async (req, res) => {
    try {
        const { code } = req.body;
        const user = req.user;

        if (!code) {
            return res.status(400).json({
                success: false,
                message: 'Coupon code is required'
            });
        }

        const salePrograms = await SaleProgramUtils.getActiveSalePrograms({ user })
        const couponProgram = salePrograms.find(program =>
            program.conditions.requiredPromoCode?.toLowerCase() === code.toLowerCase()
        )
        if (!couponProgram) {
            return res.status(404).json({
                success: false,
                message: 'Invalid or expired coupon code'
            })
        }
        res.status(200).json({
            success: true,
            message: 'Coupon code is valid',
            coupon: {
                code: couponProgram.conditions.requiredPromoCode,
                discountPercentage: couponProgram.benefits.discountPercentage,
                discountAmount: couponProgram.benefits.discountAmount,
                type: couponProgram.type,
                title: couponProgram.title,
                programId: couponProgram._id
            }
        })
    } catch (error) {
        console.error('Validate coupon code error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
}
const getSaleProgramAnalytics = async (req, res) => {
    try {
        const { id } = req.params;

        const analytics = await SaleProgramUtils.getProgramAnalytics(id)

        if (!analytics) {
            return res.status(404).json({
                success: false,
                message: 'Sale program not found'
            });
        }

        res.status(200).json({
            success: true,
            analytics
        });

    } catch (error) {
        console.error('Get analytics error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
}
const toggleSaleProgramStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { action } = req.body;

        const saleProgram = await SaleProgram.findById(id);
        if (!saleProgram) {
            return res.status(404).json({
                success: false,
                message: 'Sale program not found'
            });
        }

        if (action === 'pause') {
            saleProgram.status = 'paused';
        } else if (action === 'resume') {
            saleProgram.status = 'active';
        } else {
            return res.status(400).json({
                success: false,
                message: 'Invalid action. Use "pause" or "resume"'
            });
        }

        await saleProgram.save();

        res.status(200).json({
            success: true,
            message: `Sale program ${action}d successfully`,
            saleProgram
        })

    } catch (error) {
        console.error('Toggle sale program status error:', error)
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
}
const uploadSaleProgramBanner = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please upload an image"
            });
        }

        if (!req.file.mimetype.startsWith('image')) {
            return res.status(400).json({
                success: false,
                message: "Please upload only image files"
            });
        }

        const uploadResult = await uploadImageCloudinary(req.file, "sale-programs");

        return res.status(200).json({
            success: true,
            message: "Banner uploaded successfully",
            image: {
                public_id: uploadResult.public_id,
                url: uploadResult.url
            }
        });

    } catch (error) {
        console.error("Upload banner error:", error);
        return res.status(500).json({
            success: false,
            message: "Upload failed",
            error: error.message
        });
    }
};

module.exports = {
    createSaleProgram,
    getAllSalePrograms,
    getActiveSalePrograms,
    getSaleProgramById,
    getProductsBySaleProgram,
    getBundlesBySaleProgram,
    updateSaleProgram,
    syncProductsToSaleProgram,
    syncBundlesToSaleProgram,
    deleteSaleProgram,
    validateCouponCode,
    getSaleProgramAnalytics,
    toggleSaleProgramStatus,
    uploadSaleProgramBanner
};