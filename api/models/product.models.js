const mongoose = require('mongoose');
const { applyMiddleware } = require('../middleware/product.middleware');
const Schema = mongoose.Schema;

const productSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Please enter product name'],
        trim: true,
        maxLength: [100, 'Product name cannot exceed 100 characters']
    },
    image: [{
        public_id: { type: String, required: true },
        url: { type: String, required: true }
    }],
    brand: { type: String, required: true },
    category: [{
        type: mongoose.Schema.ObjectId,
        ref: 'Category'
    }],
    description: {
        type: String,
        required: [true, 'Please enter the product description']
    },
    
    featured: {
        type: Boolean,
        default: false
    },
    featuredType: {
        type: String,
        enum: ['homepage', 'category', 'search', 'banner', 'deal_of_day', 'trending'],
        default: 'homepage'
    },
    featuredOrder: {
        type: Number,
        default: 0
    },
    featuredAt: {
        type: Date
    },
    featuredExpiry: {
        type: Date
    },
    featuredPriority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },
    featuredInCategories: [{
        type: mongoose.Schema.ObjectId,
        ref: 'Category'
    }],
    featuredMetrics: {
        views: { type: Number, default: 0 },
        clicks: { type: Number, default: 0 },
        conversions: { type: Number, default: 0 },
        ctr: { type: Number, default: 0 },
        conversionRate: { type: Number, default: 0 }
    },
    featuredViews: { type: Number, default: 0 },
    featuredClicks: { type: Number, default: 0 },
    featuredHistory: [{
        featuredAt: Date,
        removedAt: Date,
        reason: String,
        removeReason: String,
        by: { type: mongoose.Schema.ObjectId, ref: 'User' },
        removedBy: { type: mongoose.Schema.ObjectId, ref: 'User' }
    }],
    
    trendingScore: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    isNewProduct: {
        type: Boolean,
        default: true
    },
    newUntil: {
        type: Date,
        default: () => new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
    },
    isBestSeller: {
        type: Boolean,
        default: false
    },
    
    price: {
        type: Number,
        required: [true, 'Please enter the product price'],
        max: [99999, 'Product price cannot exceed 5 digits']
    },
    originalPrice: {
        type: Number
    },
    salePrice: {
        type: Number,
        validate: {
            validator: function(value) {
                if (!value) return true;
                const basePrice = this.originalPrice || this.price;
                return value < basePrice;
            },
            message: 'Sale price must be less than original price'
        }
    },
    discountPercentage: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    isOnSale: {
        type: Boolean,
        default: false
    },
    saleStartDate: {
        type: Date
    },
    saleEndDate: {
        type: Date,
        validate: {
            validator: function(value) {
                if (!value || !this.saleStartDate) return true;
                return value > this.saleStartDate;
            },
            message: 'Sale end date must be after start date'
        }
    },
    saleType: {
        type: String,
        enum: ['percentage', 'fixed_amount', 'flash_sale', 'clearance', 'seasonal'],
        default: 'percentage'
    },
    
    flashSale: {
        isFlashSale: { 
            type: Boolean, 
            default: false
        },
        originalStock: { 
            type: Number
        },
        saleStock: { 
            type: Number
        },
        maxQuantityPerUser: { 
            type: Number, 
            default: 5 
        }
    },
    
    countInstock: {
        type: Number,
        required: [true, 'Please enter product quantity'],
        max: [9999999, 'Product quantity cannot exceed 7 digits'],
        default: 0
    },
    sold: {
        type: Number,
        default: 0
    },
    ratings: {
        average: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },
        count: {
            type: Number,
            default: 0
        },
        
    },
    totalRating: {
        type: Number,
        default: 0
    }
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

productSchema.methods.setFeatured = function(options = {}) {
    const { order = 0, expiry = null, reason = 'Manual feature', by = null, type = 'homepage' } = options;
    
    if (this.featured) {
        return false;
    }
    
    this.featured = true;
    this.featuredType = type;
    this.featuredOrder = order;
    this.featuredAt = new Date();
    this.featuredExpiry = expiry;
    
    if (!this.featuredHistory) {
        this.featuredHistory = [];
    }
    this.featuredHistory.push({
        featuredAt: new Date(),
        reason,
        by
    });
    
    return true;
};

productSchema.methods.removeFeatured = function(reason = 'Manual removal', by = null) {
    if (!this.featured) {
        return this;
    }
    
    this.featured = false;
    
    if (this.featuredHistory && this.featuredHistory.length > 0) {
        const lastEntry = this.featuredHistory[this.featuredHistory.length - 1];
        if (lastEntry && !lastEntry.removedAt) {
            lastEntry.removedAt = new Date();
            lastEntry.removeReason = reason;
            lastEntry.removedBy = by;
        }
    }
    
    return this;
};

productSchema.methods.calculateTrendingScore = function() {
    const now = new Date();
    const ageInDays = (now - this.createdAt) / (1000 * 60 * 60 * 24);
    
    let score = 0;
    score += Math.min(this.sold * 2, 40);
    score += (this.ratings?.average || 0) * 5;
    score += Math.min((this.featuredViews || 0) / 10, 20);
    score += this.countInstock > 0 ? 10 : 0;
    score += Math.max(5 - (ageInDays / 10), 0);
    
    return Math.min(Math.round(score), 100);
};

productSchema.methods.autoSetFeatured = function(options = {}) {
    const { featuredType = 'homepage', duration = 30, minTrendingScore = 70 } = options;
    
    if (this.featured) return false;
    
    const trendingScore = this.calculateTrendingScore();
    if (trendingScore < minTrendingScore) return false;
    
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + duration);
    
    return this.setFeatured({
        type: featuredType,
        order: trendingScore,
        expiry,
        reason: `Auto-promoted (score: ${trendingScore})`
    });
};

productSchema.methods.getFeaturedPerformance = function() {
    if (!this.featured) return null;
    
    const views = this.featuredViews || 0;
    const clicks = this.featuredClicks || 0;
    const conversions = this.featuredMetrics?.conversions || 0;
    
    return {
        views,
        clicks,
        conversions,
        ctr: views > 0 ? ((clicks / views) * 100).toFixed(2) : 0,
        conversionRate: clicks > 0 ? ((conversions / clicks) * 100).toFixed(2) : 0,
        trendingScore: this.calculateTrendingScore(),
        metrics: this.featuredMetrics
    };
};
productSchema.statics.updateRatingsFromReviews = async function(productId) {
    try {
        const Review = require('./review.models');
        
        const stats = await Review.aggregate([
            { 
                $match: { 
                    product: mongoose.Types.ObjectId(productId),
                    reviewType: 'rating',
                    status: 'published'
                }
            },
            {
                $group: {
                    _id: null,
                    totalRating: { $sum: '$rating' },
                    count: { $sum: 1 },
                    average: { $avg: '$rating' }
                }
            }
        ]);

        const product = await this.findById(productId);
        if (!product) return null;

        if (stats.length > 0) {
            product.totalRating = stats[0].totalRating;
            product.ratings.count = stats[0].count;
            product.ratings.average = Number(stats[0].average.toFixed(2));
        } else {
            product.totalRating = 0;
            product.ratings.count = 0;
            product.ratings.average = 0;
        }

        await product.save();
        return product;
    } catch (error) {
        console.error('Update ratings error:', error);
        throw error;
    }
};

productSchema.methods.getWithReviewSummary = async function() {
    const Review = require('./review.models');
    
    const reviewStats = await Review.getProductStats(this._id);
    
    return {
        ...this.toObject(),
        reviewSummary: reviewStats
    };
};

productSchema.methods.hasReviews = async function() {
    const Review = require('./review.models');
    const count = await Review.countDocuments({
        product: this._id,
        status: 'published'
    });
    return count > 0;
};

applyMiddleware(productSchema);

module.exports = mongoose.model('Product', productSchema);