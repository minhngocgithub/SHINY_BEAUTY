const Product = require('../models/product.models');
const {  } = require('../middleware/product.middleware');
const setSaleForProduct = async (req, res) => {
    try {
        const { id } = req.params
        const {salePrice, discountPercentage, saleStartDate, saleEndDate, saleType = 'percentage'} = req.body
        if(!salePrice && !discountPercentage) {
            return res.status(400).json({ 
                status: 'error',
                message: 'Please provide either salePrice or discountPercentage'
             })
        }
        if (discountPercentage && (discountPercentage < 0 || discountPercentage > 100)) {
            return res.status(400).json({
                status: 'error',
                message: 'Discount percentage must be between 0 and 100',
                code: 'INVALID_DISCOUNT'
            });
        }
        const product = await Product.findById(id)
        if(!product) {
            return res.status(404).json({
                status: 'error',
                message: 'Product not found'
            })
        }
        product.setSale({
            salePrice,
            discountPercentage,
            startDate,
            endDate,
            saleType: saleType || 'percentage'
        })
        if (!product.discountPercentage && product.salePrice) {
            const basePrice = product.originalPrice || product.price;
            product.discountPercentage = Math.round(
                ((basePrice - product.salePrice) / basePrice) * 100
            );
        }
        await product.save();
        return res.status(200).json({
            status: 'success',
            message: 'Sale set successfully',
            data: {
                product: {
                    id: product._id,
                    name: product.name,
                    brand: product.brand,
                    originalPrice: product.originalPrice,
                    salePrice: product.salePrice,
                    currentPrice: product.currentPrice,
                    discountPercentage: product.discountPercentage,
                    isOnSale: product.isOnSale,
                    isSaleActive: product.isSaleActive,
                    savings: product.savings,
                    saleStartDate: product.saleStartDate,
                    saleEndDate: product.saleEndDate,
                    saleType: product.saleType
                }
            }
        });

    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: error.message,
            code: 'INTERNAL_ERROR'
        });
    }
}
const endSaleForProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findById(id)
        if (!product) {
            return res.status(404).json({
                status: 'error',
                message: 'Product not found',
                code: 'PRODUCT_NOT_FOUND'
            });
        }

        if (!product.isOnSale) {
            return res.status(400).json({
                status: 'error',
                message: 'Product is not currently on sale',
                code: 'NOT_ON_SALE'
            });
        }

        product.endSale();
        await product.save();

        return res.status(200).json({
            status: 'success',
            message: 'Sale ended successfully',
            data: {
                product: {
                    id: product._id,
                    name: product.name,
                    brand: product.brand,
                    price: product.price,
                    isOnSale: product.isOnSale,
                    isSaleActive: product.isSaleActive
                }
            }
        });

    } catch (error) {
        console.error('End sale error:', error);
        return res.status(500).json({
            status: 'error',
            message: error.message,
            code: 'INTERNAL_ERROR'
        });
    }
};
const setFlashSaleForProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            discountPercentage, 
            saleStock, 
            maxQuantityPerUser = 5, 
            saleStartDate, 
            saleEndDate 
        } = req.body;

        // Validation
        if (!discountPercentage || !saleStock) {
            return res.status(400).json({
                status: 'error',
                message: 'Discount percentage and sale stock are required',
                code: 'MISSING_FLASH_SALE_DATA'
            });
        }

        if (discountPercentage < 0 || discountPercentage > 100) {
            return res.status(400).json({
                status: 'error',
                message: 'Discount percentage must be between 0 and 100',
                code: 'INVALID_DISCOUNT'
            });
        }

        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({
                status: 'error',
                message: 'Product not found',
                code: 'PRODUCT_NOT_FOUND'
            });
        }

        if (saleStock > product.countInstock) {
            return res.status(400).json({
                status: 'error',
                message: 'Sale stock cannot exceed available stock',
                code: 'INSUFFICIENT_STOCK'
            });
        }

        product.setFlashSale({
            discountPercentage,
            saleStock,
            maxQuantityPerUser,
            startDate: saleStartDate,
            endDate: saleEndDate
        });

        await product.save();

        return res.status(200).json({
            status: 'success',
            message: 'Flash sale set successfully',
            data: {
                product: {
                    id: product._id,
                    name: product.name,
                    brand: product.brand,
                    originalPrice: product.originalPrice,
                    salePrice: product.salePrice,
                    currentPrice: product.currentPrice,
                    discountPercentage: product.discountPercentage,
                    isOnSale: product.isOnSale,
                    isSaleActive: product.isSaleActive,
                    savings: product.savings,
                    flashSale: {
                        isFlashSale: product.flashSale.isFlashSale,
                        originalStock: product.flashSale.originalStock,
                        saleStock: product.flashSale.saleStock,
                        maxQuantityPerUser: product.flashSale.maxQuantityPerUser,
                        stockRemaining: product.flashSale.saleStock,
                        progress: ((product.flashSale.originalStock - product.flashSale.saleStock) / product.flashSale.originalStock * 100).toFixed(2)
                    }
                }
            }
        });

    } catch (error) {
        console.error('Set flash sale error:', error);
        return res.status(500).json({
            status: 'error',
            message: error.message,
            code: 'INTERNAL_ERROR'
        });
    }
};
const getSaleProducts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const skip = (page - 1) * limit;
        const sortBy = req.query.sortBy || 'discountPercentage';
        const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

        // Build query for active sales
        const now = new Date();
        const query = {
            isOnSale: true,
            $or: [
                { saleStartDate: { $lte: now }, saleEndDate: { $gte: now } },
                { saleStartDate: { $lte: now }, saleEndDate: null },
                { saleStartDate: null, saleEndDate: { $gte: now } },
                { saleStartDate: null, saleEndDate: null }
            ]
        };

        // Add search functionality
        if (req.query.search) {
            query.$and = [
                {
                    $or: [
                        { name: { $regex: req.query.search, $options: 'i' } },
                        { brand: { $regex: req.query.search, $options: 'i' } }
                    ]
                }
            ];
        }

        // Add category filter
        if (req.query.category) {
            query.category = req.query.category;
        }

        // Add brand filter
        if (req.query.brand) {
            query.brand = { $regex: req.query.brand, $options: 'i' };
        }

        // Add discount range filter
        if (req.query.minDiscount) {
            query.discountPercentage = { $gte: parseInt(req.query.minDiscount) };
        }
        if (req.query.maxDiscount) {
            query.discountPercentage = { 
                ...query.discountPercentage, 
                $lte: parseInt(req.query.maxDiscount) 
            };
        }

        const products = await Product.find(query)
            .populate('category', 'name')
            .sort({ [sortBy]: sortOrder })
            .skip(skip)
            .limit(limit)
            .select('name brand price originalPrice salePrice discountPercentage image isOnSale category');

        const totalProducts = await Product.countDocuments(query);
        const totalPages = Math.ceil(totalProducts / limit);

        return res.status(200).json({
            status: 'success',
            message: 'Sale products retrieved successfully',
            data: {
                products: products.map(product => ({
                    id: product._id,
                    name: product.name,
                    brand: product.brand,
                    category: product.category,
                    image: product.image,
                    originalPrice: product.originalPrice,
                    salePrice: product.salePrice,
                    currentPrice: product.currentPrice,
                    discountPercentage: product.discountPercentage,
                    savings: product.savings,
                    isOnSale: product.isOnSale,
                    isSaleActive: product.isSaleActive
                })),
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalProducts,
                    hasNext: page < totalPages,
                    hasPrev: page > 1
                }
            }
        });

    } catch (error) {
        console.error('Get sale products error:', error);
        return res.status(500).json({
            status: 'error',
            message: error.message,
            code: 'INTERNAL_ERROR'
        });
    }
};
const getFlashSaleProducts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const skip = (page - 1) * limit;

        const now = new Date();
        const query = {
            'flashSale.isFlashSale': true,
            isOnSale: true,
            $or: [
                { saleStartDate: { $lte: now }, saleEndDate: { $gte: now } },
                { saleStartDate: { $lte: now }, saleEndDate: null },
                { saleStartDate: null, saleEndDate: { $gte: now } },
                { saleStartDate: null, saleEndDate: null }
            ]
        };

        const products = await Product.find(query)
            .populate('category', 'name')
            .sort({ 'flashSale.saleStock': 1 }) // Ưu tiên sản phẩm sắp hết
            .skip(skip)
            .limit(limit);

        const totalProducts = await Product.countDocuments(query);

        return res.status(200).json({
            status: 'success',
            message: 'Flash sale products retrieved successfully',
            data: {
                products: products.map(product => ({
                    id: product._id,
                    name: product.name,
                    brand: product.brand,
                    category: product.category,
                    image: product.image,
                    originalPrice: product.originalPrice,
                    salePrice: product.salePrice,
                    currentPrice: product.currentPrice,
                    discountPercentage: product.discountPercentage,
                    savings: product.savings,
                    flashSale: {
                        isFlashSale: product.flashSale.isFlashSale,
                        saleStock: product.flashSale.saleStock,
                        maxQuantityPerUser: product.flashSale.maxQuantityPerUser,
                        progress: product.flashSale.originalStock > 0 
                            ? ((product.flashSale.originalStock - product.flashSale.saleStock) / product.flashSale.originalStock * 100).toFixed(2)
                            : 0
                    }
                })),
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(totalProducts / limit),
                    totalProducts
                }
            }
        });

    } catch (error) {
        console.error('Get flash sale products error:', error);
        return res.status(500).json({
            status: 'error',
            message: error.message,
            code: 'INTERNAL_ERROR'
        });
    }
};
const getSaleStatistics = async (req, res) => {
    try {
        const now = new Date();

        // Total active sales
        const activeSalesCount = await Product.countDocuments({
            isOnSale: true,
            $or: [
                { saleStartDate: { $lte: now }, saleEndDate: { $gte: now } },
                { saleStartDate: { $lte: now }, saleEndDate: null },
                { saleStartDate: null, saleEndDate: { $gte: now } },
                { saleStartDate: null, saleEndDate: null }
            ]
        });

        // Active flash sales
        const flashSalesCount = await Product.countDocuments({
            'flashSale.isFlashSale': true,
            isOnSale: true
        });

        // Expired sales
        const expiredSalesCount = await Product.countDocuments({
            isOnSale: true,
            saleEndDate: { $lt: now }
        });

        // Sales by type
        const salesByType = await Product.aggregate([
            {
                $match: {
                    isOnSale: true,
                    $or: [
                        { saleStartDate: { $lte: now }, saleEndDate: { $gte: now } },
                        { saleStartDate: { $lte: now }, saleEndDate: null },
                        { saleStartDate: null, saleEndDate: { $gte: now } },
                        { saleStartDate: null, saleEndDate: null }
                    ]
                }
            },
            {
                $group: {
                    _id: '$saleType',
                    count: { $sum: 1 },
                    avgDiscount: { $avg: '$discountPercentage' }
                }
            }
        ]);

        // Top discount products
        const topDiscountProducts = await Product.find({
            isOnSale: true,
            discountPercentage: { $gt: 0 }
        })
        .sort({ discountPercentage: -1 })
        .limit(10)
        .populate('category', 'name')
        .select('name brand price salePrice discountPercentage image');

        // Revenue impact (estimated)
        const salesRevenue = await Product.aggregate([
            {
                $match: {
                    isOnSale: true,
                    sold: { $gt: 0 }
                }
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: { 
                        $sum: { 
                            $multiply: ['$sold', { $ifNull: ['$salePrice', '$price'] }] 
                        } 
                    },
                    totalSaved: {
                        $sum: {
                            $multiply: [
                                '$sold',
                                { $subtract: [{ $ifNull: ['$originalPrice', '$price'] }, { $ifNull: ['$salePrice', '$price'] }] }
                            ]
                        }
                    }
                }
            }
        ]);

        return res.status(200).json({
            status: 'success',
            message: 'Sale statistics retrieved successfully',
            data: {
                overview: {
                    activeSales: activeSalesCount,
                    flashSales: flashSalesCount,
                    expiredSales: expiredSalesCount
                },
                salesByType: salesByType.map(item => ({
                    type: item._id,
                    count: item.count,
                    avgDiscount: Math.round(item.avgDiscount * 100) / 100
                })),
                topDiscountProducts: topDiscountProducts.map(product => ({
                    id: product._id,
                    name: product.name,
                    brand: product.brand,
                    category: product.category,
                    image: product.image,
                    originalPrice: product.price,
                    salePrice: product.salePrice,
                    discountPercentage: product.discountPercentage
                })),
                revenue: {
                    totalRevenue: salesRevenue[0]?.totalRevenue || 0,
                    totalSaved: salesRevenue[0]?.totalSaved || 0
                }
            }
        });

    } catch (error) {
        console.error('Get sale statistics error:', error);
        return res.status(500).json({
            status: 'error',
            message: error.message,
            code: 'INTERNAL_ERROR'
        });
    }
};
const setBulkSale = async (req, res) => {
    try {
        const { id, saleData } = req.body;
        const { discountPercentage, saleStartDate, saleEndDate, saleType = 'percentage' } = saleData;

        // Validation
        if (!id || !Array.isArray(id) || id.length === 0) {
            return res.status(400).json({
                status: 'error',
                message: 'Product IDs array is required',
                code: 'MISSING_PRODUCT_IDS'
            });
        }

        if (!discountPercentage) {
            return res.status(400).json({
                status: 'error',
                message: 'Discount percentage is required',
                code: 'MISSING_DISCOUNT'
            });
        }

        if (discountPercentage < 0 || discountPercentage > 100) {
            return res.status(400).json({
                status: 'error',
                message: 'Discount percentage must be between 0 and 100',
                code: 'INVALID_DISCOUNT'
            });
        }

        const products = await Product.find({ _id: { $in: id } });

        if (products.length !== id.length) {
            return res.status(404).json({
                status: 'error',
                message: 'Some products not found',
                code: 'PRODUCTS_NOT_FOUND'
            });
        }

        const results = {
            successful: [],
            failed: []
        };

        for (const product of products) {
            try {
                product.setSale({
                    discountPercentage,
                    startDate: saleStartDate,
                    endDate: saleEndDate,
                    saleType
                });

                await product.save();
                
                results.successful.push({
                    id: product._id,
                    name: product.name,
                    discountPercentage: product.discountPercentage,
                    salePrice: product.salePrice
                });

            } catch (error) {
                results.failed.push({
                    id: product._id,
                    name: product.name,
                    error: error.message
                });
            }
        }

        return res.status(200).json({
            status: 'success',
            message: `Bulk sale operation completed. ${results.successful.length} successful, ${results.failed.length} failed`,
            data: {
                summary: {
                    totalProcessed: ids.length,
                    successful: results.successful.length,
                    failed: results.failed.length
                },
                results: results
            }
        });

    } catch (error) {
        console.error('Bulk sale error:', error);
        return res.status(500).json({
            status: 'error',
            message: error.message,
            code: 'INTERNAL_ERROR'
        });
    }
};
const updateSalePrice = async (req, res) => {
    try {
        const { id } = req.params;
        const { discountPercentage, salePrice } = req.body;

        if (!discountPercentage && !salePrice) {
            return res.status(400).json({
                status: 'error',
                message: 'Please provide either discountPercentage or salePrice',
                code: 'MISSING_UPDATE_DATA'
            });
        }

        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({
                status: 'error',
                message: 'Product not found',
                code: 'PRODUCT_NOT_FOUND'
            });
        }

        if (!product.isOnSale) {
            return res.status(400).json({
                status: 'error',
                message: 'Product is not currently on sale',
                code: 'NOT_ON_SALE'
            });
        }

        if (discountPercentage) {
            if (discountPercentage < 0 || discountPercentage > 100) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Discount percentage must be between 0 and 100',
                    code: 'INVALID_DISCOUNT'
                });
            }
            
            const basePrice = product.originalPrice || product.price;
            product.salePrice = Math.round(basePrice * (1 - discountPercentage / 100) * 100) / 100;
            product.discountPercentage = discountPercentage;
        }

        if (salePrice) {
            const basePrice = product.originalPrice || product.price;
            if (salePrice >= basePrice) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Sale price must be less than original price',
                    code: 'INVALID_SALE_PRICE'
                });
            }
            
            product.salePrice = salePrice;
            product.discountPercentage = Math.round(
                ((basePrice - salePrice) / basePrice) * 100
            );
        }

        await product.save();

        return res.status(200).json({
            status: 'success',
            message: 'Sale price updated successfully',
            data: {
                product: {
                    id: product._id,
                    name: product.name,
                    originalPrice: product.originalPrice,
                    salePrice: product.salePrice,
                    currentPrice: product.currentPrice,
                    discountPercentage: product.discountPercentage,
                    savings: product.savings
                }
            }
        });

    } catch (error) {
        console.error('Update sale price error:', error);
        return res.status(500).json({
            status: 'error',
            message: error.message,
            code: 'INTERNAL_ERROR'
        });
    }
};
const getExpiredSales = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const now = new Date();
        const query = {
            isOnSale: true,
            saleEndDate: { $lt: now }
        };

        const expiredProducts = await Product.find(query)
            .populate('category', 'name')
            .sort({ saleEndDate: -1 })
            .skip(skip)
            .limit(limit)
            .select('name brand price salePrice discountPercentage saleEndDate image category');

        const totalExpired = await Product.countDocuments(query);

        return res.status(200).json({
            status: 'success',
            message: 'Expired sales retrieved successfully',
            data: {
                products: expiredProducts.map(product => ({
                    id: product._id,
                    name: product.name,
                    brand: product.brand,
                    category: product.category,
                    image: product.image,
                    originalPrice: product.price,
                    salePrice: product.salePrice,
                    discountPercentage: product.discountPercentage,
                    saleEndDate: product.saleEndDate,
                    daysExpired: Math.ceil((now - product.saleEndDate) / (1000 * 60 * 60 * 24))
                })),
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(totalExpired / limit),
                    totalProducts: totalExpired
                }
            }
        });

    } catch (error) {
        console.error('Get expired sales error:', error);
        return res.status(500).json({
            status: 'error',
            message: error.message,
            code: 'INTERNAL_ERROR'
        });
    }
};
const cleanupExpiredSales = async (req, res) => {
    try {
        const now = new Date();
        
        const expiredProducts = await Product.find({
            isOnSale: true,
            saleEndDate: { $lt: now }
        });

        let cleanedCount = 0;
        const cleanedProducts = [];

        for (const product of expiredProducts) {
            try {
                product.endSale();
                await product.save();
                cleanedCount++;
                cleanedProducts.push({
                    id: product._id,
                    name: product.name,
                    brand: product.brand
                });
            } catch (error) {
                console.error(`Failed to clean product ${product._id}:`, error);
            }
        }

        return res.status(200).json({
            status: 'success',
            message: `Successfully cleaned up ${cleanedCount} expired sales`,
            data: {
                cleanedCount,
                totalFound: expiredProducts.length,
                cleanedProducts
            }
        });

    } catch (error) {
        console.error('Cleanup expired sales error:', error);
        return res.status(500).json({
            status: 'error',
            message: error.message,
            code: 'INTERNAL_ERROR'
        });
    }
};
module.exports = {
    setSaleForProduct,
    endSaleForProduct,
    setFlashSaleForProduct,
    getSaleProducts,
    getFlashSaleProducts,
    getSaleStatistics,
    setBulkSale,
    updateSalePrice,
    getExpiredSales,
    cleanupExpiredSales
}