const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    
    orderItems: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
        },
        bundle: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ProductBundle'
        },
        name: { 
            type: String, 
            required: true 
        },
        quantity: { 
            type: Number, 
            required: true,
            min: 1
        },
        image: { 
            type: String, 
            required: true 
        },
        price: { 
            type: Number, 
            required: true,
            min: 0
        },
        // For bundle items
        bundleItems: [{
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product'
            },
            name: String,
            quantity: Number,
            price: Number
        }],
        itemType: {
            type: String,
            enum: ['product', 'bundle'],
            default: 'product'
        }
    }],
    
    shippingAddress: {
        address: { 
            type: String, 
            required: true 
        },
        phone: {
            type: String, 
            required: true
        },
        city: { 
            type: String, 
            required: true 
        },
        postalCode: { 
            type: String, 
            required: true 
        }
    },
    
    paymentMethod: { 
        type: String, 
        required: true 
    },
    
    paymentResult: {
        id: { type: String },
        status: { type: String },
        update_time: { type: String },
        email_address: { type: String }
    },
    
    // Loyalty system
    loyaltyPointsEarned: {
        type: Number,
        default: 0,
        min: 0
    },
    loyaltyPointsUsed: {
        type: Number,
        default: 0,
        min: 0
    },
    loyaltyDiscount: {
        type: Number,
        default: 0,
        min: 0
    },
    
    // Pricing
    itemsPrice: { 
        type: Number, 
        required: true, 
        default: 0.0,
        min: 0
    },
    taxPrice: { 
        type: Number, 
        required: true, 
        default: 0.0,
        min: 0
    },
    shippingPrice: { 
        type: Number, 
        required: true, 
        default: 0.0,
        min: 0
    },
    totalPrice: {
        type: Number, 
        required: true, 
        default: 0.0,
        min: 0
    },
    
    // Payment & Delivery status
    isPaid: {
        type: Boolean, 
        required: true, 
        default: false
    },
    paidAt: { 
        type: Date 
    },
    isDelivered: { 
        type: Boolean, 
        required: true, 
        default: false 
    },
    deliveredAt: { 
        type: Date 
    },
    
    status: {
        type: String,
        enum: ['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'],
        default: 'PENDING'
    }
    
}, { 
    timestamps: true 
});

// Indexes
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ isPaid: 1, isDelivered: 1 });
orderSchema.index({ 'orderItems.product': 1 });
orderSchema.index({ 'orderItems.bundle': 1 });

// Instance methods
orderSchema.methods.calculateLoyaltyPoints = function() {
    // 1 point per dollar spent (excluding shipping and tax)
    return Math.floor(this.itemsPrice);
};

orderSchema.methods.markAsPaid = function() {
    this.isPaid = true;
    this.paidAt = new Date();
    this.status = 'PAID';
    this.loyaltyPointsEarned = this.calculateLoyaltyPoints();
    return this;
};

orderSchema.methods.markAsDelivered = function() {
    this.isDelivered = true;
    this.deliveredAt = new Date();
    this.status = 'DELIVERED';
    return this;
};

orderSchema.methods.updateStock = async function() {
    const Product = mongoose.model('Product');
    const ProductBundle = mongoose.model('ProductBundle');
    
    for (const item of this.orderItems) {
        if (item.itemType === 'product' && item.product) {
            // Update individual product stock
            await Product.findByIdAndUpdate(
                item.product,
                {
                    $inc: {
                        countInstock: -item.quantity,
                        sold: item.quantity
                    }
                }
            );
        } else if (item.itemType === 'bundle' && item.bundle) {
            // Update bundle stock and individual products in bundle
            const bundle = await ProductBundle.findById(item.bundle).populate('items.product');
            
            if (bundle) {
                // Update bundle sold count
                bundle.sold += item.quantity;
                await bundle.save();
                
                // Update individual products in bundle
                for (const bundleItem of bundle.items) {
                    const quantityToDeduct = bundleItem.quantity * item.quantity;
                    await Product.findByIdAndUpdate(
                        bundleItem.product._id,
                        {
                            $inc: {
                                countInstock: -quantityToDeduct,
                                sold: quantityToDeduct
                            }
                        }
                    );
                }
            }
        }
    }
};

// Pre-save middleware
orderSchema.pre('save', function(next) {
    // Validate total price calculation
    const calculatedTotal = this.itemsPrice + this.taxPrice + this.shippingPrice - (this.loyaltyDiscount || 0);
    
    if (Math.abs(this.totalPrice - calculatedTotal) > 0.01) {
        return next(new Error('Total price calculation mismatch'));
    }
    
    next();
});

// Post-save middleware for loyalty points
orderSchema.post('save', async function() {
    if (this.isPaid && this.user && !this._loyaltyUpdated) {
        try {
            const User = mongoose.model('User');
            const user = await User.findById(this.user);
            
            if (user && user.updateLoyaltyProfile) {
                user.updateLoyaltyProfile({
                    totalPrice: this.totalPrice
                });
                
                if (this.loyaltyPointsEarned > 0 && user.addLoyaltyPoints) {
                    user.addLoyaltyPoints(this.loyaltyPointsEarned);
                }
                
                await user.save();
                this._loyaltyUpdated = true;
            }
        } catch (error) {
            console.error('Error updating user loyalty profile:', error);
        }
    }
});

module.exports = mongoose.model('Order', orderSchema);