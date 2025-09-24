const ProductBundle = require('../models/productBundle.models');
const Product = require('../models/product.models')
const { uploadImageCloudinary } = require('../utils/upload.service');
const BundleUtils = require('../utils/bundle.utils');
const createProductBundle = async (req, res) => {
    try {
        const {
        name,
        description,
        items,
        bundlePrice,
        category,
        brand,
        featured,
        featuredType
    } = req.body
    const pricingValidation = await BundleUtils.validateBundlePricing(bundlePrice, items)
    const productIds = items.map(item => item.product);
    const products = await Product.find({ _id: { $in: productIds } })

    if (products.length !== productIds.length) {
        return res.status(400).json({ success: false, message: 'One or more products do not exist' })
    }

    for (const item of items) {
        const product = products.find(p => p._id.toString() === item.product.toString());
        if (product.countInstock < item.quantity) {
            return res.status(400).json({ success: false, message: `Insufficient stock for product ${product.name}` })
        }
    }
    let imageData = null;

    if (req.body.image) {
        if (typeof req.body.image === 'object' && req.body.image.url && req.body.image.public_id) {
            imageData = req.body.image;
        } else if (typeof req.body.image === 'string' && req.body.image.startsWith('http')) {
            imageData = { url: req.body.image, public_id: null };
        }
    }
    const bundle = await ProductBundle.create({
        name,
        description,
        items,
        bundlePrice,
        category,
        brand,
        featured,
        featuredType,
        image: imageData,
        user: req.user.id,
        originalPrice: pricingValidation.originalTotal,
        savings: pricingValidation.savings,
        discountPercentage: pricingValidation.discountPercentage
    })

    await bundle.populate('items.product', 'name price images countInstock')
    await bundle.populate('category', 'name')

    res.status(201).json({
        success: true,
        bundle
    })
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Server Error', error: error.message })
    }
}
const getProductBundles = async (req, res) => {
    const resPerPage = 12;
    const bundlesCount = await ProductBundle.countDocuments({ isActive: true });

    const apiFeatures = new APIFeatures(
        ProductBundle.find({ isActive: true })
            .populate('items.product', 'name price images brand countInstock currentPrice isSaleActive')
            .populate('category', 'name'),
        req.query
    )
        .search()
        .filter()
        .pagination(resPerPage);

    let bundles = await apiFeatures.query;
    let filteredBundlesCount = bundles.length;

    res.status(200).json({
        success: true,
        bundlesCount,
        filteredBundlesCount,
        resPerPage,
        bundles
    });
}
const getFeaturedBundles = async (req, res) => {
    try {
        const { type = 'homepage', limit = 8 } = req.query;

        const bundles = await ProductBundle.find({
            featured: true,
            featuredType: type,
            isActive: true
        })
            .populate('items.product', 'name price images brand countInstock currentPrice isSaleActive')
            .populate('category', 'name')
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: bundles.length,
            bundles
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Server Error' })
    }
}
const getSingleBundle = async (req, res) => {
    try {
        const bundle = await ProductBundle.findById(req.params.id)
            .populate('items.product', 'name price images brand countInstock currentPrice isSaleActive description reviews')
            .populate('category', 'name');

        if (!bundle || !bundle.isActive) {
            return res.status(404).json({ success: false, message: 'Bundle not found' })
        }
        bundle.views += 1;
        await bundle.save({ validateBeforeSave: false });

        const stockCheck = await bundle.checkStock();
        const availableQuantity = await bundle.getAvailableQuantity();

        res.status(200).json({
            success: true,
            bundle,
            stockInfo: {
                ...stockCheck,
                maxQuantity: availableQuantity
            }
        });
    } catch (error) {
        return res.status(404).json({ success: false, message: 'Bundle not found' })
    }
}
const updateProductBundle = async (req, res) => {
    let bundle = await ProductBundle.findById(req.params.id);

    if (!bundle) {
        return next(new ErrorHandler('Bundle not found', 404));
    }

    const {
        name,
        description,
        image,
        items,
        bundlePrice,
        category,
        brand,
        featured,
        featuredType,
        isActive
    } = req.body;

    const updateData = {};

    // Update basic fields
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (brand !== undefined) updateData.brand = brand?.trim();
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);

    // Handle image updates
    if (image && Array.isArray(image)) {
        const validImages = image.filter(img =>
            img.public_id && img.url &&
            typeof img.public_id === 'string' &&
            typeof img.url === 'string'
        );
        updateData.image = validImages.slice(0, 5);
    }

    // Handle category updates
    if (category !== undefined) {
        if (Array.isArray(category) && category.length > 0) {
            // Validate categories exist
            const validCategories = await mongoose.model('Category').find({
                _id: { $in: category }
            });

            if (validCategories.length !== category.length) {
                return next(new ErrorHandler('One or more categories not found', 404));
            }
            updateData.category = category;
        } else {
            updateData.category = [];
        }
    }

    // Handle items update (most complex part)
    if (items && Array.isArray(items)) {
        if (items.length === 0) {
            return res.status(400).json({ success: false, message: 'Bundle must contain at least one item' });
        }

        if (items.length > 10) {
            return res.status(400).json({ success: false, message: 'Bundle cannot contain more than 10 items' });
        }

        // Validate items exist and have stock
        const productIds = items.map(item => item.product);
        const products = await Product.find({
            _id: { $in: productIds },
            isActive: true
        });

        if (products.length !== productIds.length) {
            return res.status(400).json({ success: false, message: 'One or more products do not exist or are inactive' });
        }

        // Check stock for each item
        for (const item of items) {
            const product = products.find(p => p._id.toString() === item.product.toString());

            if (product.countInstock < item.quantity) {
                return next(new ErrorHandler(
                    `Insufficient stock for ${product.name}. Available: ${product.countInstock}, Required: ${item.quantity}`,
                    400
                ));
            }

            if (item.quantity > 5) {
                return next(new ErrorHandler(
                    `Maximum 5 quantity allowed per product. ${product.name} has ${item.quantity}`,
                    400
                ));
            }
        }

        updateData.items = items;
    }

    // Handle bundle price update
    if (bundlePrice !== undefined) {
        const currentItems = items || bundle.items;

        try {
            await BundleUtils.validateBundlePricing(bundlePrice, currentItems);
            updateData.bundlePrice = Number(bundlePrice);
        } catch (error) {
            return res.status(400).json({ success: false, message: error.message });
        }
    }

    // Handle featured status update
    if (featured !== undefined) {
        if (featured && featuredType) {
            const validFeaturedTypes = ['homepage', 'category', 'deal']
            if (!validFeaturedTypes.includes(featuredType)) {
                return next(new ErrorHandler('Invalid featured type', 400))
            }

            // Check featured limits (exclude current bundle from count)
            const featuredCount = await ProductBundle.countDocuments({
                _id: { $ne: req.params.id },
                featured: true,
                featuredType,
                isActive: true
            });

            const maxFeatured = { homepage: 8, category: 12, deal: 6 }
            if (featuredCount >= maxFeatured[featuredType]) {
                return res.status(400).json({
                    success: false,
                    message: `Cannot feature more than ${maxFeatured[featuredType]} bundles on ${featuredType}`
                })
            }

            updateData.featured = true;
            updateData.featuredType = featuredType;
        } else {
            updateData.featured = false
        }
    }

    // Update the bundle
    bundle = await ProductBundle.findByIdAndUpdate(
        req.params.id,
        updateData,
        {
            new: true,
            runValidators: true
        }
    ).populate([
        {
            path: 'items.product',
            select: 'name price images countInstock currentPrice isSaleActive brand'
        },
        {
            path: 'category',
            select: 'name'
        }
    ]);

    const bundleResponse = {
        ...bundle.toObject(),
        savings: bundle.savings,
        actualDiscountPercentage: bundle.actualDiscountPercentage,
        totalItems: bundle.items.length,
        lastUpdated: bundle.updatedAt
    };

    res.status(200).json({
        success: true,
        message: 'Bundle updated successfully',
        data: {
            bundle: bundleResponse
        }
    });
}

// Delete product bundle - Admin only
const deleteProductBundle = async (req, res) => {
    const bundle = await ProductBundle.findById(req.params.id);

    if (!bundle) {
        return res.status(404).json({ success: false, message: 'Bundle not found' });
    }

    bundle.isActive = false;
    await bundle.save();

    res.status(200).json({
        success: true,
        message: 'Bundle deleted successfully'
    });
}

// Check bundle stock availability
const checkBundleStock = async (req, res) => {
    const bundle = await ProductBundle.findById(req.params.id);

    if (!bundle || !bundle.isActive) {
        return res.status(404).json({ success: false, message: 'Bundle not found' });
    }

    const stockCheck = await bundle.checkStock();
    const availableQuantity = await bundle.getAvailableQuantity();

    res.status(200).json({
        success: true,
        available: stockCheck.available,
        maxQuantity: availableQuantity,
        message: stockCheck.reason || 'Bundle is available'
    });
}

// Get bundles by category
const getBundlesByCategory = async (req, res) => {
    const { categoryId } = req.params;
    const { page = 1, limit = 12 } = req.query;

    const bundles = await ProductBundle.find({
        category: categoryId,
        isActive: true
    })
        .populate('items.product', 'name price images brand countInstock currentPrice isSaleActive')
        .populate('category', 'name')
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 });

    const total = await ProductBundle.countDocuments({
        category: categoryId,
        isActive: true
    });

    res.status(200).json({
        success: true,
        bundles,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
    });
}

// Admin: Get all bundles (including inactive)
const getAdminBundles = async (req, res) => {
    const {
        page = 1,
        limit = 20,
        sort = 'createdAt',
        order = 'desc',
        status = 'all',
        featured,
        search
    } = req.query;
    const filter = {};

    if (status === 'active') {
        filter.isActive = true;
    } else if (status === 'inactive') {
        filter.isActive = false;
    }

    if (featured !== undefined) {
        filter.featured = featured === 'true';
    }

    if (search) {
        filter.$or = [
            { name: new RegExp(search, 'i') },
            { description: new RegExp(search, 'i') },
            { brand: new RegExp(search, 'i') }
        ];
    }
    const totalBundles = await ProductBundle.countDocuments(filter)

    const currentPage = Math.max(1, parseInt(page));
    const pageSize = Math.min(100, Math.max(1, parseInt(limit)))
    const skip = (currentPage - 1) * pageSize;
    const totalPages = Math.ceil(totalBundles / pageSize);

    const sortObj = {};
    const validSorts = ['createdAt', 'updatedAt', 'name', 'bundlePrice', 'sold', 'views', 'featured']
    const sortField = validSorts.includes(sort) ? sort : 'createdAt'
    sortObj[sortField] = order === 'asc' ? 1 : -1;

    const bundles = await ProductBundle.find(filter)
        .populate('items.product', 'name price images countInstock currentPrice isSaleActive')
        .populate('category', 'name')
        .sort(sortObj)
        .skip(skip)
        .limit(pageSize)
        .lean();

    // Add admin-specific data
    const bundlesWithAdminData = bundles.map(bundle => {
        const totalStock = bundle.items.reduce((sum, item) => {
            return sum + Math.floor(item.product.countInstock / item.quantity);
        }, 0);
        return {
            ...bundle,
            adminInfo: {
                totalPossibleBundles: Math.min(...bundle.items.map(item =>
                    Math.floor(item.product.countInstock / item.quantity)
                )),
                revenue: bundle.sold * bundle.bundlePrice,
                conversionRate: bundle.views > 0 ? ((bundle.sold / bundle.views) * 100).toFixed(2) : 0,
                profitMargin: bundle.originalPrice > 0 ?
                    (((bundle.bundlePrice - bundle.originalPrice * 0.7) / bundle.bundlePrice) * 100).toFixed(2) : 0,
                daysActive: Math.floor((Date.now() - new Date(bundle.createdAt)) / (1000 * 60 * 60 * 24))
            }
        };
    });

    // Calculate summary statistics for admin dashboard
    const summaryStats = {
        totalBundles,
        activeBundles: await ProductBundle.countDocuments({ isActive: true }),
        featuredBundles: await ProductBundle.countDocuments({ featured: true, isActive: true }),
        totalRevenue: bundles.reduce((sum, bundle) => sum + (bundle.sold * bundle.bundlePrice), 0),
        averageConversion: totalBundles > 0 ?
            (bundles.reduce((sum, bundle) => {
                const rate = bundle.views > 0 ? (bundle.sold / bundle.views) * 100 : 0;
                return sum + rate;
            }, 0) / bundles.length).toFixed(2) : 0
    };

    res.status(200).json({
        success: true,
        data: {
            bundles: bundlesWithAdminData,
            pagination: {
                currentPage,
                totalPages,
                pageSize,
                totalItems: totalBundles,
                hasNextPage: currentPage < totalPages,
                hasPrevPage: currentPage > 1
            },
            filters: { status, featured, search, sort, order },
            summary: summaryStats
        }
    });
}

const searchBundles = async (req, res) => {
    try {
        const {
            keyword = '',
            category,
            brand,
            minPrice,
            maxPrice,
            minDiscount,
            featured,
            sortBy = 'createdAt',
            sortOrder = 'desc',
            page = 1,
            limit = 12
        } = req.query;

        const query = { isActive: true };

        if (keyword) {
            query.$or = [
                { name: { $regex: keyword, $options: 'i' } },
                { description: { $regex: keyword, $options: 'i' } },
                { brand: { $regex: keyword, $options: 'i' } }
            ];
        }

        if (category) {
            query.category = { $in: Array.isArray(category) ? category : [category] };
        }

        if (brand) {
            query.brand = { $regex: brand, $options: 'i' };
        }
        if (minPrice || maxPrice) {
            query.bundlePrice = {};
            if (minPrice) query.bundlePrice.$gte = Number(minPrice);
            if (maxPrice) query.bundlePrice.$lte = Number(maxPrice);
        }

        if (minDiscount) {
            query.discountPercentage = { $gte: Number(minDiscount) };
        }
        if (featured !== undefined) {
            query.featured = featured === 'true';
        }
        const sortObj = {};
        const validSorts = ['createdAt', 'bundlePrice', 'discountPercentage', 'sold', 'views', 'name'];
        const sortField = validSorts.includes(sortBy) ? sortBy : 'createdAt';
        sortObj[sortField] = sortOrder === 'asc' ? 1 : -1;

        // Pagination
        const currentPage = Math.max(1, parseInt(page));
        const pageSize = Math.min(50, Math.max(1, parseInt(limit)));
        const skip = (currentPage - 1) * pageSize;

        // Execute query
        const [bundles, totalCount] = await Promise.all([
            ProductBundle.find(query)
                .populate('items.product', 'name price images brand countInstock currentPrice isSaleActive')
                .populate('category', 'name')
                .sort(sortObj)
                .skip(skip)
                .limit(pageSize)
                .lean(),
            ProductBundle.countDocuments(query)
        ]);

        const totalPages = Math.ceil(totalCount / pageSize);

        res.status(200).json({
            success: true,
            data: {
                bundles,
                pagination: {
                    currentPage,
                    totalPages,
                    pageSize,
                    totalItems: totalCount,
                    hasNextPage: currentPage < totalPages,
                    hasPrevPage: currentPage > 1
                },
                filters: {
                    keyword,
                    category,
                    brand,
                    minPrice,
                    maxPrice,
                    minDiscount,
                    featured,
                    sortBy,
                    sortOrder
                }
            }
        });

    } catch (error) {
        return res.status(500).json({ 
            success: false, 
            message: 'Server Error',
            error: error.message 
        })
    }
}
const uploadBundleImage = async (req, res) => {
    try {
        // Kiểm tra có file được upload không
        if (!req.file) {
            return res.status(400).json({ 
                success: false, 
                message: "Please upload an image file" 
            });
        }
        if (!req.file.mimetype.startsWith('image')) {
            return res.status(400).json({ 
                success: false, 
                message: "Please upload only image files" 
            });
        }
        const uploadResult = await uploadImageCloudinary(req.file, "bundles");

        return res.status(200).json({
            success: true,
            message: "Bundle image uploaded successfully",
            image: {
                public_id: uploadResult.public_id,
                url: uploadResult.url
            }
        });

    } catch (error) {
        console.error("Upload bundle image error:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Failed to upload image",
            error: error.message 
        });
    }
};

module.exports = {
    createProductBundle,
    getProductBundles,
    getFeaturedBundles,
    getSingleBundle,
    updateProductBundle,
    deleteProductBundle,
    checkBundleStock,
    getBundlesByCategory,
    getAdminBundles,
    searchBundles,
    uploadBundleImage
}