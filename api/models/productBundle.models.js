const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productBundleSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Please enter bundle name'],
        trim: true,
        maxLength: [150, 'Bundle name cannot exceed 150 characters']
    },
    
    description: {
        type: String,
        required: [true, 'Please enter bundle description']
    },
    
    image: [{
        public_id: { type: String, required: true },
        url: { type: String, required: true }
    }],
    
    // Bundle items
    items: [{
        product: {
            type: mongoose.Schema.ObjectId,
            ref: 'Product',
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1,
            default: 1
        }
    }],
    
    // Pricing
    originalPrice: {
        type: Number,
        default: 0
    },
    
    bundlePrice: {
        type: Number,
        required: [true, 'Please enter bundle price'],
        min: 0
    },
    
    discountPercentage: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    
    // Basic info
    category: [{
        type: mongoose.Schema.ObjectId,
        ref: 'Category'
    }],
    
    brand: String,
    
    // Status
    isActive: {
        type: Boolean,
        default: true
    },
    
    // Stats
    sold: {
        type: Number,
        default: 0
    },
    
    views: {
        type: Number,
        default: 0
    },
    
    // Featured
    featured: {
        type: Boolean,
        default: false
    },
    
    featuredType: {
        type: String,
        enum: ['homepage', 'category', 'deal'],
        default: 'homepage'
    }
    
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual fields
productBundleSchema.virtual('savings').get(function() {
    return this.originalPrice - this.bundlePrice;
});

productBundleSchema.virtual('actualDiscountPercentage').get(function() {
    if (this.originalPrice === 0) return 0;
    return Math.round(((this.originalPrice - this.bundlePrice) / this.originalPrice) * 100);
});

// Methods
productBundleSchema.methods.calculateOriginalPrice = async function() {
    await this.populate('items.product');
    
    let total = 0;
    for (const item of this.items) {
        const product = item.product;
        const price = product.isSaleActive ? product.currentPrice : product.price;
        total += price * item.quantity;
    }
    
    this.originalPrice = total;
    return total;
};

productBundleSchema.methods.checkStock = async function() {
    await this.populate('items.product');
    
    for (const item of this.items) {
        if (item.product.countInstock < item.quantity) {
            return {
                available: false,
                reason: `${item.product.name} is out of stock`,
                product: item.product.name
            };
        }
    }
    
    return { available: true };
};

productBundleSchema.methods.getAvailableQuantity = async function() {
    await this.populate('items.product');
    
    let minQuantity = Infinity;
    
    for (const item of this.items) {
        const maxForThisItem = Math.floor(item.product.countInstock / item.quantity);
        minQuantity = Math.min(minQuantity, maxForThisItem);
    }
    
    return minQuantity === Infinity ? 0 : minQuantity;
};

// Pre-save middleware
productBundleSchema.pre('save', async function(next) {
    if (this.isModified('items') && this.items.length > 0) {
        await this.calculateOriginalPrice();
        
        if (this.bundlePrice > 0 && this.originalPrice > 0) {
            this.discountPercentage = Math.round(
                ((this.originalPrice - this.bundlePrice) / this.originalPrice) * 100
            );
        }
    }
    next();
});

// Indexes
productBundleSchema.index({ isActive: 1 });
productBundleSchema.index({ featured: 1, featuredType: 1 });
productBundleSchema.index({ category: 1 });
productBundleSchema.index({ brand: 1 });
productBundleSchema.index({ createdAt: -1 });

module.exports = mongoose.model('ProductBundle', productBundleSchema);