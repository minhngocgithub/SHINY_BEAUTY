const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const saleProgramSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    slug: {
        type: String,
        trim: true,
        unique: true,
        sparse: true
    },
    shortDescription: {
        type: String,
        trim: true,
        maxlength: 160
    },
    description: {
        type: String,
        required: true
    },
    bannerImage: {
        type: String 
    },
    landingPageUrl: {
        type: String // Đường dẫn landing page cho campaign (nếu có)
    },

    type: {
        type: String,
        enum: [
            'percentage_sale',
            'fixed_amount_sale', 
            'flash_sale',
            'free_sample',
            'points_multiplier',
            'bundle_offer',
            'buy_x_get_y',
            'spend_x_get_y',
            'free_shipping',
            'gift_with_purchase'
        ],
        required: true
    },
    conditions: {
        minOrderValue: { type: Number, default: 0 },
        maxOrderValue: { type: Number },
        minQuantity: { type: Number },
        maxQuantity: { type: Number },
        applicableProducts: [{
            type: mongoose.Schema.ObjectId,
            ref: 'Product'
        }],
        excludeProducts: [{
            type: mongoose.Schema.ObjectId,
            ref: 'Product'
        }],
        categories: [{
            type: mongoose.Schema.ObjectId,
            ref: 'Category'
        }],
        brands: [{
            type: String
        }],
        applicableBundles: [{
            type: mongoose.Schema.ObjectId,
            ref: 'ProductBundle'
        }],
        membershipRequired: { type: Boolean, default: false },
        membershipTiers: [{
            type: String,
            enum: ['NEW_CUSTOMER', 'REGULAR', 'VIP', 'PLATINUM']
        }],
        isAppExclusive: { type: Boolean, default: false },
        newCustomersOnly: { type: Boolean, default: false },
        firstOrderOnly: { type: Boolean, default: false },
        paymentMethods: [{
            type: String,
            enum: ['cod', 'stripe', 'momo', 'zalopay']
        }],
        maxUsagePerUser: { type: Number },
        requiredPromoCode: { type: String }
    },

    targetType: {
        type: String,
        enum: ['all', 'tier', 'user', 'new_customer'],
        default: 'all'
    },
    targetUsers: [{
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    }],

    benefits: {
        discountPercentage: { type: Number, min: 0, max: 100 },
        discountAmount: { type: Number, min: 0 },
        sampleProducts: [{
            product: { type: mongoose.Schema.ObjectId, ref: 'Product' },
            quantity: { type: Number, default: 1 }
        }],
        maxSamplesPerOrder: { type: Number, default: 3 },
        pointsMultiplier: { type: Number, default: 1 },
        bonusPoints: { type: Number, default: 0 },
        bundleProducts: [{
            product: { type: mongoose.Schema.ObjectId, ref: 'Product' },
            quantity: { type: Number, required: true },
            isRequired: { type: Boolean, default: true }
        }],
        bundlePrice: { type: Number },
        buyQuantity: { type: Number },
        getQuantity: { type: Number },
        getProducts: [{
            type: mongoose.Schema.ObjectId,
            ref: 'Product'
        }],
        freeShipping: { type: Boolean, default: false },
        giftProducts: [{
            product: { type: mongoose.Schema.ObjectId, ref: 'Product' },
            quantity: { type: Number, default: 1 }
        }]
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    maxUsage: { type: Number },
    currentUsage: { type: Number, default: 0 },

    status: {
        type: String,
        enum: ['draft', 'scheduled', 'active', 'expired', 'paused'],
        default: 'active'
    },
    isActive: { type: Boolean, default: true },

    stacking: { type: Boolean, default: true },
    exclusiveWith: [{
        type: mongoose.Schema.ObjectId,
        ref: 'SaleProgram'
    }],
    stats: {
        views: { type: Number, default: 0 },
        applications: { type: Number, default: 0 },
        successfulOrders: { type: Number, default: 0 },
        totalRevenue: { type: Number, default: 0 },
        totalDiscount: { type: Number, default: 0 }
    },
    trackingCode: { type: String },
    createdBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    lastModifiedBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    history: [{
        updatedAt: { type: Date, default: Date.now },
        updatedBy: { type: mongoose.Schema.ObjectId, ref: 'User' },
        changes: { type: Object }
    }]
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual để check xem chương trình có active không
saleProgramSchema.virtual('isCurrentlyActive').get(function() {
    const now = new Date();
    return this.isActive &&
           this.startDate <= now &&
           (!this.endDate || this.endDate >= now) &&
           (!this.maxUsage || this.currentUsage < this.maxUsage) &&
           this.status === 'active';
});

// Virtual để tính thời gian còn lại
saleProgramSchema.virtual('timeRemaining').get(function() {
    if (!this.endDate) return null;
    const now = new Date();
    const remaining = this.endDate.getTime() - now.getTime();
    if (remaining <= 0) return null;
    const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} left`;
    return `${hours} hour${hours > 1 ? 's' : ''} left`;
});

// Method để validate điều kiện áp dụng
saleProgramSchema.methods.validateConditions = function(cart, user) {
    const conditions = this.conditions;
    let errors = [];
    if (conditions.minOrderValue && cart.total < conditions.minOrderValue) {
        errors.push(`Minimum order value of $${conditions.minOrderValue} required`);
    }
    if (conditions.membershipRequired && !user.isMember) {
        errors.push('Membership required for this offer');
    }
    if (conditions.isAppExclusive && !cart.fromApp) {
        errors.push('This offer is only available on our mobile app');
    }
    if (conditions.newCustomersOnly && user.orderCount > 0) {
        errors.push('This offer is for new customers only');
    }
    return {
        isValid: errors.length === 0,
        errors
    };
};

// Method để tính toán benefit
saleProgramSchema.methods.calculateBenefit = function(cart) {
    const benefits = this.benefits;
    let result = {
        discount: 0,
        freeSamples: [],
        bonusPoints: 0,
        freeShipping: false,
        gifts: []
    };
    switch (this.type) {
        case 'percentage_sale':
            result.discount = cart.subtotal * (benefits.discountPercentage / 100);
            break;
        case 'fixed_amount_sale':
            result.discount = benefits.discountAmount;
            break;
        case 'free_sample':
            result.freeSamples = benefits.sampleProducts.slice(0, benefits.maxSamplesPerOrder);
            break;
        case 'points_multiplier':
            result.bonusPoints = cart.basePoints * (benefits.pointsMultiplier - 1);
            break;
        case 'free_shipping':
            result.freeShipping = benefits.freeShipping;
            break;
    }
    return result;
};

// Index cho performance
saleProgramSchema.index({ type: 1, isActive: 1, startDate: 1, endDate: 1 });
saleProgramSchema.index({ 'conditions.categories': 1 });
saleProgramSchema.index({ 'conditions.brands': 1 });
saleProgramSchema.index({ 'conditions.applicableProducts': 1 });

module.exports = mongoose.model('SaleProgram', saleProgramSchema);