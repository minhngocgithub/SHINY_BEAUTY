const mongoose = require("mongoose")
const LoyaltyService = require("../utils/loyalty.utils")

const orderSchema = new mongoose.Schema(
  {
    // Core order info
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },

    orderItems: [
      {
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        image: { type: String, required: true },
        price: { type: Number, required: true },
        originalPrice: { type: Number, required: true },
        product: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: "Product",
        },
        // Bundle support (optional)
        bundle: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "ProductBundle",
        },
      },
    ],

    shippingAddress: {
      fullName: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
      phone: { type: String, required: true },
    },

    paymentMethod: {
      type: String,
      required: true,
      enum: ["COD", "VNPAY", "MOMO", "BANK_TRANSFER"],
    },

    paymentResult: {
      payUrl: String,
      transactionId: String,
      status: String,
      paidAt: Date,
    },

    // Sale Program tracking
    appliedPrograms: [
      {
        program: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "SaleProgram",
          required: true,
        },
        programName: String,
        discountAmount: {
          type: Number,
          required: true,
        },
        discountType: {
          type: String,
          enum: ["percentage", "fixed_amount", "flash_sale", "bundle_deal"],
          required: true,
        },
        // Track which product/bundle this program applied to
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        bundleId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "ProductBundle",
        },
        appliedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Coupon tracking
    couponProgram: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SaleProgram",
    },
    couponCode: String,
    couponDiscount: {
      type: Number,
      default: 0,
    },

    // Loyalty system
    loyaltyPointsEarned: {
      type: Number,
      default: 0,
    },
    loyaltyPointsUsed: {
      type: Number,
      default: 0,
    },
    loyaltyDiscount: {
      type: Number,
      default: 0,
    },

    // Pricing breakdown
    itemsPrice: {
      type: Number,
      required: true,
      default: 0,
    },
    taxPrice: {
      type: Number,
      required: true,
      default: 0,
    },
    shippingPrice: {
      type: Number,
      required: true,
      default: 0,
    },
    totalDiscount: {
      type: Number,
      default: 0,
    },
    totalPrice: {
      type: Number,
      required: true,
      default: 0,
    },

    // Order status
    status: {
      type: String,
      enum: ["PENDING", "CONFIRMED", "PAID", "DELIVERED", "CANCELLED"],
      default: "PENDING",
    },

    isPaid: {
      type: Boolean,
      required: true,
      default: false,
    },
    paidAt: Date,

    isDelivered: {
      type: Boolean,
      required: true,
      default: false,
    },
    deliveredAt: Date,

    note: String,
  },
  {
    timestamps: true,
  },
)

orderSchema.methods.markAsPaid = async function (paymentResult = {}) {
  this.isPaid = true
  this.paidAt = Date.now()
  this.status = "PAID"

  if (paymentResult.transactionId) {
    this.paymentResult.transactionId = paymentResult.transactionId
  }
  if (paymentResult.status) {
    this.paymentResult.status = paymentResult.status
  }
  if (paymentResult.paidAt) {
    this.paymentResult.paidAt = paymentResult.paidAt
  }

  await this.save()

  // Update program stats after payment
  await this.updateProgramStats()

  // Update stock after payment
  await this.updateStock()
}

orderSchema.methods.markAsDelivered = async function () {
  this.isDelivered = true
  this.deliveredAt = Date.now()
  this.status = "DELIVERED"
  await this.save()
}

orderSchema.methods.updateStock = async function () {
  const Product = mongoose.model("Product")
  const ProductBundle = mongoose.model("ProductBundle")

  for (const item of this.orderItems) {
    if (item.bundle) {
      // Update bundle stock
      await ProductBundle.findByIdAndUpdate(item.bundle, {
        $inc: { countInStock: -item.quantity },
      })
    } else {
      // Update product stock
      await Product.findByIdAndUpdate(item.product, {
        $inc: { countInStock: -item.quantity },
      })
    }
  }
}

orderSchema.methods.calculateLoyaltyPoints = async function () {
  try {
    const User = mongoose.model("User")
    const user = await User.findById(this.user)

    if (!user) {
      return Math.floor(this.totalPrice / 10000)
    }
    return LoyaltyService.calculatePointsToEarn(user, this.totalPrice)
  } catch (error) {
    console.error("Error calculating loyalty points:", error)
    return Math.floor(this.totalPrice / 10000)
  }
}

orderSchema.methods.applyLoyaltyDiscount = async function () {
  try {
    const User = mongoose.model("User")
    const user = await User.findById(this.user)

    if (!user) return 0

    // Calculate loyalty discount based on tier
    const discount = LoyaltyService.calculateDiscount(user, this.itemsPrice)
    this.loyaltyDiscount = discount

    return discount
  } catch (error) {
    console.error("Error applying loyalty discount:", error)
    return 0
  }
}

orderSchema.pre("save", async function (next) {
  // Validate total price calculation
  const calculatedTotal =
    this.itemsPrice + this.taxPrice + this.shippingPrice - this.totalDiscount - this.loyaltyDiscount

  // Allow small rounding differences (1 VND)
  if (Math.abs(calculatedTotal - this.totalPrice) > 1) {
    return next(new Error(`Total price mismatch. Expected: ${calculatedTotal}, Got: ${this.totalPrice}`))
  }

  if (this.isPaid && this.loyaltyPointsEarned === 0) {
    this.loyaltyPointsEarned = await this.calculateLoyaltyPoints()
  }

  next()
})

orderSchema.post("save", async (doc) => {
  if (doc.isPaid && doc.loyaltyPointsEarned > 0) {
    try {
      const User = mongoose.model("User")

      // Update loyalty points and profile stats
      await User.findByIdAndUpdate(doc.user, {
        $inc: {
          "loyaltyProfile.points": doc.loyaltyPointsEarned,
          "loyaltyProfile.totalSpent": doc.totalPrice,
          "loyaltyProfile.totalOrders": 1,
        },
        $set: {
          "loyaltyProfile.lastPurchaseDate": new Date(),
        },
      })
    } catch (error) {
      console.error("Error updating user loyalty profile:", error)
    }
  }
})

orderSchema.index({ user: 1, createdAt: -1 })
orderSchema.index({ status: 1 })
orderSchema.index({ "appliedPrograms.program": 1 })
orderSchema.index({ couponProgram: 1 })
orderSchema.index({ isPaid: 1, paidAt: -1 })

const Order = mongoose.model("Order", orderSchema)

module.exports = Order
