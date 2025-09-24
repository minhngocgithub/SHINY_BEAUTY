const mongoose = require('mongoose')

const cartItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
    },
    bundle: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ProductBundle",
    },
    quantity: {
        type: Number,
        required: true,
        default: 1,
        min: 1
    },
    itemType: {
        type: String,
        enum: ['product', 'bundle'],
        required: true,
        default: 'product'
    },
    addedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
})
cartItemSchema.pre('save', function(next) {
    if ((this.product && this.bundle) || (!this.product && !this.bundle)) {
        const err = new Error('Cart item must have either product or bundle, but not both');
        return next(err);
    }
    if (this.product) {
        this.itemType = 'product';
    } else if (this.bundle) {
        this.itemType = 'bundle';
    }
    
    next();
});
const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        unique: true,
        required: true,
    },
    password: {
        type: String,
        required: function() {
            return !this.isOAuthUser; // Password không bắt buộc cho OAuth users
        }
    },
    phone: {
        type: String,
        required: false,
        validate: {
            validator: function(v) {
                return !v || /^[0-9]{9,10}$/.test(v); // Validate phone format nếu có
            },
            message: 'Phone number must be 9-10 digits'
        }
    },
    dateOfBirth: {
        type: Date,
        required: false,
        validate: {
            validator: function(v) {
                if (!v) return true;
                const today = new Date();
                const birthDate = new Date(v);                
                if (isNaN(birthDate.getTime())) {
                    return false;
                }                
                if (birthDate > today) {
                    return false;
                }
                let age = today.getFullYear() - birthDate.getFullYear();
                const monthDiff = today.getMonth() - birthDate.getMonth();
                
                if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                    age--;
                }                
                return age >= 10 && age <= 100;
            },
            message: 'Date of birth must be valid and result in age between 10-100'
        }
    },
    googleId: { type: String, sparse: true },
    facebookId: { type: String, sparse: true },
    twitterId: { type: String, sparse: true },
    isOAuthUser: { type: Boolean, default: false },
    avatar: {
        public_id: {
            type: String,
            required: function() {
                return !this.isOAuthUser;
            }
        },
        url: {
            type: String,
            required: function() {
                return !this.isOAuthUser;
            }
        }
    },
    cartItems: [cartItemSchema],
    loyaltyProfile: {
        tier: {
            type: String,
            enum: ['NEW_CUSTOMER', 'REGULAR', 'VIP', 'PLATINUM'],
            default: 'NEW_CUSTOMER'
        },
        points: {
            type: Number,
            default: 0
        },
        totalSpent: {
            type: Number,
            default: 0
        },
        totalOrders: {
            type: Number,
            default: 0
        },
        joinDate: {
            type: Date,
            default: Date.now
        },
        lastPurchaseDate: Date,
        averageOrderValue: {
            type: Number,
            default: 0
        },
        // Customer Lifetime Value
        cltv: {
            type: Number,
            default: 0
        },
        // Tần suất mua hàng (days)
        purchaseFrequency: {
            type: Number,
            default: 0
        }
    },
    isAdmin: { 
        type: Boolean, 
        required: true, 
        default: false 
    },
    createAt: {
        type: Date,
        default: Date.now
    },
    behaviorMetrics: {
        wishlistCount: { type: Number, default: 0 },
        reviewsCount: { type: Number, default: 0 },
        referralsCount: { type: Number, default: 0 },
        socialShares: { type: Number, default: 0 },
        loginFrequency: { type: Number, default: 0 }
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date
}, { timestamps: true} )

userSchema.index({ email: 1 }, { unique: true })
userSchema.index({ 'loyaltyProfile.tier': -1 })
userSchema.index({ 'loyaltyProfile.totalSpent': -1 })
userSchema.index({ 'loyaltyProfile.totalOrders': -1 })
userSchema.index({ 'cartItems.product': 1 });
userSchema.index({ 'cartItems.bundle': 1 });
userSchema.index({ 'cartItems.addedAt': 1 });

userSchema.virtual('isNewCustomer').get(function() {
    return this.loyaltyProfile.totalOrders === 0;
})
userSchema.virtual('customerLifespanDays').get(function() {
    if(!this.loyaltyProfile.joinDate) return 0;
    const diffTime = Date.now() - this.createdAt.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
})
userSchema.methods.updateLoyaltyProfile = function(orderData) {
    if(!orderData || !orderData.totalPrice) {
        console.log('Order data with totalPrice is required to update loyalty profile');
    }
    this.loyaltyProfile.totalSpent += orderData.totalPrice;
    this.loyaltyProfile.totalOrders += 1;
    this.loyaltyProfile.lastPurchaseDate = new Date();

    this.loyaltyProfile.averageOrderValue = this.loyaltyProfile.totalSpent / this.loyaltyProfile.totalOrders;
    const newTier = this.caculateLoyaltyTier();
    if(newTier !== this.loyaltyProfile.tier) {
        this.loyaltyProfile.tier = newTier;
    }
    return this
}
userSchema.methods.calculateTier = function() {
    const { totalSpent, totalOrders } = this.loyaltyProfile;
    
    // Tier logic - carefully tested
    if (totalSpent >= 2000 && totalOrders >= 50) {
        return 'PLATINUM';
    }
    
    if (totalSpent >= 1000 && totalOrders >= 20) {
        return 'VIP';
    }
    
    if (totalOrders >= 3) {
        return 'REGULAR';
    }
    
    return 'NEW_CUSTOMER';
};

userSchema.methods.addLoyaltyPoints = function(points) {
    if (typeof points !== 'number' || points < 0) {
        console.log('Points must be a positive number');
    }
    
    this.loyaltyProfile.points += points;
    return this;
};
userSchema.methods.spendLoyaltyPoints = function(points) {
    if (typeof points !== 'number' || points < 0) {
        console.log('Points must be a positive number');
    }
    
    if (this.loyaltyProfile.points < points) {
        console.log('Insufficient points');
    }
    
    this.loyaltyProfile.points -= points;
    return this;
};

userSchema.methods.getTierBenefits = function() {
    const TIER_BENEFITS = {
        NEW_CUSTOMER: {
            name: 'New Customer',
            discountRate: 0,
            freeShippingThreshold: 100,
            pointsMultiplier: 1,
            earlyAccess: false,
            birthdayGift: false
        },
        REGULAR: {
            name: 'Regular Customer',
            discountRate: 0.05,
            freeShippingThreshold: 75,
            pointsMultiplier: 1.2,
            earlyAccess: false,
            birthdayGift: true
        },
        VIP: {
            name: 'VIP Customer',
            discountRate: 0.10,
            freeShippingThreshold: 50,
            pointsMultiplier: 1.5,
            earlyAccess: true,
            birthdayGift: true,
            exclusiveProducts: true
        },
        PLATINUM: {
            name: 'Platinum Elite',
            discountRate: 0.15,
            freeShippingThreshold: 0,
            pointsMultiplier: 2,
            earlyAccess: true,
            birthdayGift: true,
            exclusiveProducts: true,
            conciergeService: true
        }
    };
    
    return TIER_BENEFITS[this.loyaltyProfile.tier] || TIER_BENEFITS.NEW_CUSTOMER;
};
userSchema.methods.getCartTotal = async function() {
    await this.populate([
        { 
            path: 'cartItems.product', 
            select: 'name price currentPrice isSaleActive discountPercentage' 
        },
        { 
            path: 'cartItems.bundle', 
            select: 'name bundlePrice discountPercentage' 
        }
    ]);

    let total = 0;
    let itemCount = 0;

    for (const item of this.cartItems) {
        let itemPrice = 0;
        
        if (item.itemType === 'product' && item.product) {
            itemPrice = item.product.currentPrice || item.product.price;
        } else if (item.itemType === 'bundle' && item.bundle) {
            itemPrice = item.bundle.bundlePrice;
        }
        
        total += itemPrice * item.quantity;
        itemCount += item.quantity;
    }

    return {
        subtotal: Math.round(total * 100) / 100,
        itemCount,
        totalItems: this.cartItems.length
    };
};

userSchema.methods.clearExpiredCartItems = async function() {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    this.cartItems = this.cartItems.filter(item => item.addedAt > sevenDaysAgo);
    await this.save();
    
    return this.cartItems.length;
};

userSchema.methods.findCartItem = function(productId, bundleId) {
    return this.cartItems.find(item => {
        if (productId && item.product) {
            return item.product.toString() === productId.toString();
        }
        if (bundleId && item.bundle) {
            return item.bundle.toString() === bundleId.toString();
        }
        return false;
    });
};


userSchema.pre('save', function(next) {
    // Ensure loyalty profile exists
    if (!this.loyaltyProfile) {
        this.loyaltyProfile = {
            tier: 'NEW_CUSTOMER',
            points: 0,
            totalSpent: 0,
            totalOrders: 0,
            averageOrderValue: 0
        };
    }
    
    next();
});
module.exports = mongoose.model('User', userSchema)
