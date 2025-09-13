const mongoose = require('mongoose')
const Schema = mongoose.Schema

const orderSchema= new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    orderItems: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
        },
        name: { type: String, require: true },
        quantity: { type: Number, require: true },
        image: { type: String, require: true },
        price: { type: Number, require: true },
    }],
    shippingAddress: {
        address: { type: String, require: true },
        phone: {type: String, require: true},
        city: { type: String, require: true },
        postalCode: { type: String, require: true },
    },
    paymentMethod: { type: String, require: true },
    paymentResult: {
        id: { type: String },
        status: { type: String },
        update_time: { type: String },
        email_address: { type: String }
    },
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
    itemsPrice: { type: Number, require: true, default: 0.0 },
    taxPrice: { type: Number, require: true, default: 0.0 },
    shippingPrice: { type: Number, require: true, default: 0.0 },
    totalPrice:{type:Number, required:true, default:0.0},
	isPaid:{type:Boolean, required:true, default:false},
    paidAt: { type: Date },
    isDelivered: { type: Boolean, require: true, default: false },
    deliveredAt: { type: Date },
    status: {
        type: String,
        enum: ['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'],
        default: 'PENDING'
    }
}, {timestamps: true})
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ isPaid: 1, isDelivered: 1 });
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

orderSchema.post('save', async function() {
    if (this.isPaid && this.user && !this._loyaltyUpdated) {
        try {
            const User = mongoose.model('User');
            const user = await User.findById(this.user);
            
            if (user) {
                user.updateLoyaltyProfile({
                    totalPrice: this.totalPrice
                });
                if (this.loyaltyPointsEarned > 0) {
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
// Pre-save validation
orderSchema.pre('save', function(next) {
    const calculatedTotal = this.itemsPrice + this.taxPrice + this.shippingPrice - (this.loyaltyDiscount || 0);
    
    if (Math.abs(this.totalPrice - calculatedTotal) > 0.01) {
        return next(new Error('Total price calculation mismatch'));
    }
    
    next();
});
module.exports = mongoose.model('Order', orderSchema)