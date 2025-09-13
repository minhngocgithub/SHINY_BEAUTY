const mongoose = require('mongoose')
const Schema = mongoose.Schema

const couponSchema = new Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true
        },
        targetUsers: {
            type: String,
            enum: ["all", "specific", "new_customers", "vip_customers"],
            default: "all",
        },

        code: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true,
            minLength: [3, "Coupon code must be at least 3 characters"],
            maxLength: [20, "Coupon code cannot exceed 20 characters"]
        },
        discountPercentage: {
            type: Number,
            required: true,
            min: 0,
            max: 100
        },
        expire: {
            type: Date,
            required: true
        },
        isActive: {
            type: Boolean,
            default: true
        },
        usedBy: [
        {
            user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            },
            order: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
            },
            usedAt: {
            type: Date,
            default: Date.now,
            },
            discountAmount: Number,
        },
    ],
    }, 
    {
        timestamps: true
    }
)

module.exports = mongoose.model('Coupon', couponSchema)