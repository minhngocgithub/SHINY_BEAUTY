const Product = require('../models/product.models');

const getFeaturedProducts = async (req, res) => {
    try {
        const {
            limit = 12,
            page = 1,
            sortBy = 'order',
            category,
            priceRange
        } = req.query;

        let query = {
            featured: true,
            $or: [
                { featuredExpiry: null },
                { featuredExpiry: { $gt: new Date() } }
            ]
        };

        if (category) {
            query.category = category;
        }

        if (priceRange) {
            const [minPrice, maxPrice] = priceRange.split('-').map(Number);
            if (!isNaN(minPrice) && !isNaN(maxPrice)) {
                query.price = { $gte: minPrice, $lte: maxPrice };
            }
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        let sort = { featuredOrder: 1, featuredAt: -1 };

        switch (sortBy) {
            case 'date':
                sort = { featuredAt: -1 };
                break;
            case 'popularity':
                sort = { featuredViews: -1, featuredClicks: -1 };
                break;
            case 'sales':
                sort = { sold: -1 };
                break;
            case 'price_low':
                sort = { price: 1 };
                break;
            case 'price_high':
                sort = { price: -1 };
                break;
        }

        const [products, total] = await Promise.all([
            Product.find(query)
                .sort(sort)
                .limit(parseInt(limit))
                .skip(skip)
                .select('-featuredHistory -__v'),
            Product.countDocuments(query)
        ]);

        res.status(200).json({
            status: "success",
            results: products.length,
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit)),
            data: { products }
        });

    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "Could not fetch featured products"
        });
    }
};

const setProductFeatured = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            order = 0,
            expiry = null,
            reason = 'Manual feature',
            featuredType = 'homepage'
        } = req.body;

        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        if (product.featured) {
            return res.status(400).json({
                success: false,
                message: 'Product is already featured'
            });
        }

        product.featured = true;
        product.featuredType = featuredType;
        product.featuredOrder = order;
        product.featuredAt = new Date();
        product.featuredExpiry = expiry ? new Date(expiry) : null;

        if (!product.featuredHistory) {
            product.featuredHistory = [];
        }
        product.featuredHistory.push({
            featuredAt: new Date(),
            reason,
            by: req.user?._id
        });

        await product.save();

        res.status(200).json({
            success: true,
            message: 'Product featured successfully',
            data: {
                product: {
                    _id: product._id,
                    name: product.name,
                    featured: product.featured,
                    featuredAt: product.featuredAt,
                    featuredOrder: product.featuredOrder,
                    featuredExpiry: product.featuredExpiry,
                    featuredType: product.featuredType
                }
            }
        });

    } catch (error) {
        console.error('Set featured error:', error);
        res.status(500).json({
            success: false,
            message: 'Error featuring product'
        });
    }
};

const removeProductFeatured = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason = 'Manual removal' } = req.body;

        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        if (!product.featured) {
            return res.status(400).json({
                success: false,
                message: 'Product is not featured'
            });
        }

        product.featured = false;

        if (product.featuredHistory?.length > 0) {
            const lastEntry = product.featuredHistory[product.featuredHistory.length - 1];
            if (lastEntry && !lastEntry.removedAt) {
                lastEntry.removedAt = new Date();
                lastEntry.removeReason = reason;
                lastEntry.removedBy = req.user?._id;
            }
        }

        await product.save();

        res.status(200).json({
            success: true,
            message: 'Featured status removed successfully',
            data: {
                product: {
                    _id: product._id,
                    name: product.name,
                    featured: product.featured
                }
            }
        });

    } catch (error) {
        console.error('Remove featured error:', error);
        res.status(500).json({
            success: false,
            message: 'Error removing featured status'
        });
    }
};

const updateFeaturedOrder = async (req, res) => {
    try {
        const { products } = req.body;

        if (!Array.isArray(products) || products.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Products array is required and cannot be empty'
            });
        }

        const updatePromises = products.map(item => {
            if (!item.id || typeof item.order !== 'number') {
                throw new Error('Each product must have id and order');
            }
            return Product.findByIdAndUpdate(
                item.id,
                { featuredOrder: item.order },
                { new: true }
            );
        });

        await Promise.all(updatePromises);

        res.status(200).json({
            success: true,
            message: 'Featured order updated successfully'
        });

    } catch (error) {
        console.error('Update order error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating featured order'
        });
    }
};

const getFeaturedByType = async (req, res) => {
    try {
        const { type } = req.params;
        const { limit = 12 } = req.query;

        const validTypes = ['homepage', 'category', 'search', 'banner', 'deal_of_day', 'trending'];

        if (!validTypes.includes(type)) {
            return res.status(400).json({
                success: false,
                message: `Invalid featured type. Valid types: ${validTypes.join(', ')}`
            });
        }

        const products = await Product.find({
            featured: true,
            featuredType: type,
            $or: [
                { featuredExpiry: null },
                { featuredExpiry: { $gt: new Date() } }
            ]
        })
            .sort({ featuredOrder: 1, featuredAt: -1 })
            .limit(parseInt(limit))
            .select('-featuredHistory -__v')
            .lean();

        res.status(200).json({
            success: true,
            data: {
                type,
                products,
                count: products.length
            }
        });

    } catch (error) {
        console.error('Get by type error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching featured products'
        });
    }
};

const trackFeaturedInteraction = async (req, res) => {
    try {
        const { id } = req.params;
        const { type } = req.body;

        if (!['view', 'click'].includes(type)) {
            return res.status(400).json({
                success: false,
                message: 'Type must be either "view" or "click"'
            });
        }

        const product = await Product.findById(id);
        if (!product || !product.featured) {
            return res.status(404).json({
                success: false,
                message: 'Featured product not found'
            });
        }

        if (type === 'view') {
            product.featuredViews = (product.featuredViews || 0) + 1;
            if (!product.featuredMetrics) {
                product.featuredMetrics = { views: 0, clicks: 0, conversions: 0, ctr: 0, conversionRate: 0 };
            }
            product.featuredMetrics.views = (product.featuredMetrics.views || 0) + 1;
        } else if (type === 'click') {
            product.featuredClicks = (product.featuredClicks || 0) + 1;
            if (!product.featuredMetrics) {
                product.featuredMetrics = { views: 0, clicks: 0, conversions: 0, ctr: 0, conversionRate: 0 };
            }
            product.featuredMetrics.clicks = (product.featuredMetrics.clicks || 0) + 1;

            const views = product.featuredViews || 0;
            if (views > 0) {
                product.featuredMetrics.ctr = ((product.featuredClicks / views) * 100).toFixed(2);
            }
        }

        await product.save();

        res.status(200).json({
            success: true,
            message: 'Interaction tracked successfully'
        });

    } catch (error) {
        console.error('Track interaction error:', error);
        res.status(500).json({
            success: false,
            message: 'Error tracking interaction'
        });
    }
};

const getFeaturedAnalytics = async (req, res) => {
    try {
        const { period = '7d', type } = req.query;

        let dateFilter = {};
        const now = new Date();

        switch (period) {
            case '1d':
                dateFilter = { $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) };
                break;
            case '7d':
                dateFilter = { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) };
                break;
            case '30d':
                dateFilter = { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) };
                break;
            case '90d':
                dateFilter = { $gte: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) };
                break;
            default:
                dateFilter = { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) };
        }

        let query = {
            featured: true,
            featuredAt: dateFilter
        };

        if (type) {
            query.featuredType = type;
        }

        const products = await Product.find(query)
            .select('name featuredType featuredViews featuredClicks featuredMetrics trendingScore sold')
            .lean();

        const analytics = {
            totalProducts: products.length,
            totalViews: 0,
            totalClicks: 0,
            totalConversions: 0,
            averageCTR: 0,
            averageConversionRate: 0,
            topPerformers: [],
            byType: {}
        };

        products.forEach(p => {
            analytics.totalViews += p.featuredViews || 0;
            analytics.totalClicks += p.featuredClicks || 0;
            analytics.totalConversions += p.featuredMetrics?.conversions || 0;

            const type = p.featuredType || 'homepage';
            if (!analytics.byType[type]) {
                analytics.byType[type] = {
                    count: 0,
                    views: 0,
                    clicks: 0,
                    conversions: 0,
                    ctr: 0
                };
            }

            analytics.byType[type].count += 1;
            analytics.byType[type].views += p.featuredViews || 0;
            analytics.byType[type].clicks += p.featuredClicks || 0;
            analytics.byType[type].conversions += p.featuredMetrics?.conversions || 0;
        });

        if (analytics.totalViews > 0) {
            analytics.averageCTR = parseFloat(((analytics.totalClicks / analytics.totalViews) * 100).toFixed(2));
        }

        if (analytics.totalClicks > 0) {
            analytics.averageConversionRate = parseFloat(((analytics.totalConversions / analytics.totalClicks) * 100).toFixed(2));
        }

        Object.keys(analytics.byType).forEach(type => {
            const typeData = analytics.byType[type];
            if (typeData.views > 0) {
                typeData.ctr = parseFloat(((typeData.clicks / typeData.views) * 100).toFixed(2));
            }
        });

        analytics.topPerformers = products
            .map(p => {
                const views = p.featuredViews || 0;
                const clicks = p.featuredClicks || 0;
                return {
                    id: p._id,
                    name: p.name,
                    type: p.featuredType,
                    views,
                    clicks,
                    ctr: views > 0 ? parseFloat(((clicks / views) * 100).toFixed(2)) : 0,
                    trendingScore: p.trendingScore || 0,
                    sold: p.sold || 0
                };
            })
            .sort((a, b) => b.ctr - a.ctr)
            .slice(0, 10);

        res.status(200).json({
            success: true,
            data: {
                period,
                analytics
            }
        });

    } catch (error) {
        console.error('Get analytics error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching analytics'
        });
    }
};

const autoPromoteProducts = async (req, res) => {
    try {
        const {
            minTrendingScore = 70,
            maxPromotions = 10,
            featuredType = 'trending',
            duration = 30
        } = req.body;

        const candidates = await Product.find({
            featured: false,
            countInstock: { $gt: 0 },
            sold: { $gte: 5 },
            'ratings.average': { $gte: 4.0 }
        }).limit(50);

        const promoted = [];

        for (const candidate of candidates) {
            if (promoted.length >= maxPromotions) break;

            const trendingScore = candidate.calculateTrendingScore();

            if (trendingScore >= minTrendingScore) {
                const expiry = new Date();
                expiry.setDate(expiry.getDate() + duration);

                candidate.featured = true;
                candidate.featuredType = featuredType;
                candidate.featuredOrder = trendingScore;
                candidate.featuredAt = new Date();
                candidate.featuredExpiry = expiry;
                candidate.trendingScore = trendingScore;

                if (!candidate.featuredHistory) {
                    candidate.featuredHistory = [];
                }
                candidate.featuredHistory.push({
                    featuredAt: new Date(),
                    reason: `Auto-promoted (trending score: ${trendingScore})`
                });

                await candidate.save();

                promoted.push({
                    id: candidate._id,
                    name: candidate.name,
                    trendingScore
                });
            }
        }

        res.status(200).json({
            success: true,
            message: `Successfully promoted ${promoted.length} products`,
            data: {
                promoted,
                count: promoted.length
            }
        });

    } catch (error) {
        console.error('Auto promote error:', error);
        res.status(500).json({
            success: false,
            message: 'Error auto-promoting products'
        });
    }
};

module.exports = {
    getFeaturedProducts,
    setProductFeatured,
    removeProductFeatured,
    updateFeaturedOrder,
    getFeaturedByType,
    trackFeaturedInteraction,
    getFeaturedAnalytics,
    autoPromoteProducts
};