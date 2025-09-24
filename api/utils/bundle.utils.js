const bundleProduct = require('../models/productBundle.models')
const Product = require('../models/product.models');

class BundleUtils {
    static async validateBundlePricing(bundlePrice, items) {
        let originalPrice = 0;
        for (const item of items) {
            const product = await Product.findById(item.product)
            if (!product) {
                throw new Error(`Product with ID ${item.product} not found`);
            }
            const price = product.isSaleActive ? product.currentPrice : product.price
            originalPrice += price * item.quantity
        }
        if (bundlePrice >= originalPrice) {
            throw new Error('Bundle price must be less than the total original price of included products')
        }
        return {
            originalPrice,
            savings: originalPrice - bundlePrice,
            discountPercentage: Math.round(((originalPrice - bundlePrice) / originalPrice) * 100)
        }

    }
    static validateBundleCompatibility(items, compatibilityRules = {}) {
        const incompatibilities = [];

        if (compatibilityRules.requiredSameCategory) {
            // Lấy category từ product nếu có populate, nếu không thì bỏ qua
            const categories = items
                .map(item => {
                    if (item.product && item.product.category) {
                        return item.product.category.toString();
                    }
                    return null;
                })
                .filter(Boolean);

            const uniqueCategories = [...new Set(categories)];

            if (uniqueCategories.length > 1) {
                incompatibilities.push('All products should be from the same category');
            }
        }

        if (compatibilityRules.minItems && items.length < compatibilityRules.minItems) {
            incompatibilities.push(`Bundle should have at least ${compatibilityRules.minItems} items`);
        }

        if (compatibilityRules.maxItems && items.length > compatibilityRules.maxItems) {
            incompatibilities.push(`Bundle should have at most ${compatibilityRules.maxItems} items`);
        }

        return {
            isCompatible: incompatibilities.length === 0,
            issues: incompatibilities,
        };
    }
    static async processBundlePurchase(bundleId, quantity = 1) {
        const bundle = await bundleProduct.findById(bundleId)
            .populate('items.product');

        if (!bundle || !bundle.isActive) {
            throw new Error('Bundle not found or inactive');
        }

        // Check stock availability first
        const stockCheck = await bundle.checkStock();
        if (!stockCheck.available) {
            throw new Error(stockCheck.reason);
        }

        const availableQty = await bundle.getAvailableQuantity();
        if (quantity > availableQty) {
            throw new Error(`Only ${availableQty} bundles available`);
        }

        // Reduce stock for each item in bundle
        const stockUpdates = [];
        for (const item of bundle.items) {
            const newStock = item.product.countInstock - (item.quantity * quantity);
            stockUpdates.push(
                Product.findByIdAndUpdate(
                    item.product._id,
                    {
                        countInstock: newStock,
                        $inc: { sold: item.quantity * quantity }
                    }
                )
            );
        }

        stockUpdates.push(
            bundleProduct.findByIdAndUpdate(
                bundleId,
                { $inc: { sold: quantity } }
            )
        );

        await Promise.all(stockUpdates);

        return {
            success: true,
            bundleId,
            quantityPurchased: quantity,
            totalPrice: bundle.bundlePrice * quantity
        };
    }

    // Update bundle pricing based on product price changes
    static async updateBundlePricingFromProducts(bundleId) {
        const bundle = await bundleProduct.findById(bundleId);
        if (!bundle) {
            throw new Error('Bundle not found');
        }

        const originalPrice = await bundle.calculateOriginalPrice();
        const currentDiscountPercentage = bundle.discountPercentage;
        const newBundlePrice = Math.round(originalPrice * (100 - currentDiscountPercentage) / 100);

        bundle.bundlePrice = newBundlePrice;
        await bundle.save();

        return {
            bundleId,
            newOriginalPrice: originalPrice,
            newBundlePrice,
            maintainedDiscount: currentDiscountPercentage
        };
    }

    // ==================== RECOMMENDATIONS & SUGGESTIONS ====================

    // Get bundle recommendations based on category
    static async getBundleRecommendations(bundleId, limit = 4) {
        const currentBundle = await bundleProduct.findById(bundleId)
            .populate('category items.product');

        if (!currentBundle) return [];

        const recommendations = await bundleProduct.find({
            _id: { $ne: bundleId },
            isActive: true,
            category: { $in: currentBundle.category }
        })
            .populate('items.product', 'name price images brand')
            .populate('category', 'name')
            .sort({ sold: -1, views: -1 })
            .limit(limit);

        return recommendations;
    }

    // Auto-suggest bundle creation based on categories
    static async suggestBundleFromPurchaseHistory(limit = 5) {
        const pipeline = [
            { $match: { isActive: true } },
            {
                $group: {
                    _id: '$category',
                    products: { $push: { id: '$_id', name: '$name', price: '$price', sold: '$sold' } },
                    avgPrice: { $avg: '$price' },
                    totalSold: { $sum: '$sold' }
                }
            },
            { $match: { 'products.1': { $exists: true } } },
            { $sort: { totalSold: -1 } },
            { $limit: limit }
        ];

        const suggestions = await Product.aggregate(pipeline);

        return suggestions.map(suggestion => ({
            category: suggestion._id,
            suggestedProducts: suggestion.products
                .sort((a, b) => b.sold - a.sold)
                .slice(0, 4),
            estimatedBundlePrice: Math.round(suggestion.avgPrice * 0.85),
            marketDemand: suggestion.totalSold
        }));
    }

    // ==================== ANALYTICS & REPORTING ====================

    // Get bundle analytics for admin
    static async getBundleAnalytics(bundleId) {
        const bundle = await bundleProduct.findById(bundleId)
            .populate('items.product', 'name price sold views');

        if (!bundle) {
            throw new Error('Bundle not found');
        }

        const totalViews = bundle.views;
        const totalSold = bundle.sold;
        const conversionRate = totalViews > 0 ? (totalSold / totalViews * 100).toFixed(2) : 0;

        const itemPerformance = bundle.items.map(item => ({
            product: item.product.name,
            productId: item.product._id,
            quantityInBundle: item.quantity,
            individualSales: item.product.sold,
            bundleContribution: item.quantity * totalSold
        }));

        return {
            bundleId,
            bundleName: bundle.name,
            totalViews,
            totalSold,
            conversionRate: parseFloat(conversionRate),
            revenue: totalSold * bundle.bundlePrice,
            savings: bundle.savings * totalSold,
            itemPerformance,
            createdAt: bundle.createdAt
        };
    }

    // Generate bundle comparison data
    static async generateBundleComparison(bundleIds) {
        const bundles = await bundleProduct.find({
            _id: { $in: bundleIds },
            isActive: true
        }).populate('items.product', 'name price brand category');

        if (bundles.length === 0) return null;

        const comparison = {
            bundles: bundles.map(bundle => ({
                id: bundle._id,
                name: bundle.name,
                bundlePrice: bundle.bundlePrice,
                originalPrice: bundle.originalPrice,
                savings: bundle.savings,
                discountPercentage: bundle.actualDiscountPercentage,
                itemCount: bundle.items.length,
                brands: [...new Set(bundle.items.map(item => item.product.brand))],
                categories: [...new Set(bundle.items.map(item => item.product.category.toString()))]
            })),
            bestValue: null,
            bestSavings: null
        };

        comparison.bestValue = comparison.bundles.reduce((best, current) =>
            current.discountPercentage > best.discountPercentage ? current : best
        );

        comparison.bestSavings = comparison.bundles.reduce((best, current) =>
            current.savings > best.savings ? current : best
        );

        return comparison;
    }

    // ==================== HELPER FUNCTIONS ====================

    // Generate SEO-friendly bundle URL slug
    static generateBundleSlug(name) {
        return name
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }

    // Calculate bundle weight for shipping
    static async calculateBundleWeight(bundleId) {
        const bundle = await bundleProduct.findById(bundleId)
            .populate('items.product', 'weight dimensions');

        if (!bundle) return 0;

        let totalWeight = 0;
        for (const item of bundle.items) {
            const productWeight = item.product.weight || 0;
            totalWeight += productWeight * item.quantity;
        }

        return totalWeight;
    }

    // Check if bundle is eligible for free shipping
    static checkFreeShippingEligibility(bundlePrice, freeShippingThreshold = 500000) {
        return bundlePrice >= freeShippingThreshold;
    }

    // Format bundle for cart display
    static formatBundleForCart(bundle) {
        return {
            id: bundle._id,
            name: bundle.name,
            image: bundle.image[0]?.url,
            bundlePrice: bundle.bundlePrice,
            originalPrice: bundle.originalPrice,
            savings: bundle.savings,
            discountPercentage: bundle.actualDiscountPercentage,
            items: bundle.items.map(item => ({
                productId: item.product._id,
                productName: item.product.name,
                quantity: item.quantity,
                price: item.product.price
            }))
        };
    }

    // Check seasonal bundle eligibility
    static checkSeasonalEligibility(bundle, season = null) {
        if (!season) {
            const month = new Date().getMonth() + 1;
            if (month >= 3 && month <= 5) season = 'spring';
            else if (month >= 6 && month <= 8) season = 'summer';
            else if (month >= 9 && month <= 11) season = 'autumn';
            else season = 'winter';
        }

        const seasonalCategories = {
            summer: ['sunscreen', 'moisturizer-light', 'face-wash'],
            winter: ['moisturizer-heavy', 'lip-balm', 'face-oil'],
            spring: ['cleanser', 'toner', 'serum'],
            autumn: ['anti-aging', 'moisturizer', 'treatment']
        };

        const seasonalKeywords = seasonalCategories[season] || [];

        const hasSeasonalProducts = bundle.items.some(item =>
            seasonalKeywords.some(keyword =>
                item.product.name.toLowerCase().includes(keyword) ||
                item.product.category?.name?.toLowerCase().includes(keyword)
            )
        );

        return {
            isSeasonal: hasSeasonalProducts,
            season,
            relevantProducts: bundle.items.filter(item =>
                seasonalKeywords.some(keyword =>
                    item.product.name.toLowerCase().includes(keyword)
                )
            ).map(item => item.product.name)
        };
    }

    // Generate bundle review summary
    static generateBundleReviewSummary(reviews) {
        if (!reviews || reviews.length === 0) {
            return {
                averageRating: 0,
                totalReviews: 0,
                ratingDistribution: {},
                topPositives: [],
                topConcerns: []
            };
        }

        const totalReviews = reviews.length;
        const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews;

        const ratingDistribution = {};
        for (let i = 1; i <= 5; i++) {
            ratingDistribution[i] = reviews.filter(review => review.rating === i).length;
        }

        const positiveKeywords = ['great', 'excellent', 'love', 'amazing', 'perfect', 'recommend'];
        const concernKeywords = ['expensive', 'small', 'not worth', 'disappointed', 'poor'];

        const topPositives = [];
        const topConcerns = [];

        reviews.forEach(review => {
            const comment = review.comment.toLowerCase();
            positiveKeywords.forEach(keyword => {
                if (comment.includes(keyword)) topPositives.push(keyword);
            });
            concernKeywords.forEach(keyword => {
                if (comment.includes(keyword)) topConcerns.push(keyword);
            });
        });

        return {
            averageRating: Math.round(averageRating * 10) / 10,
            totalReviews,
            ratingDistribution,
            topPositives: [...new Set(topPositives)].slice(0, 3),
            topConcerns: [...new Set(topConcerns)].slice(0, 3)
        };
    }
}
module.exports = BundleUtils