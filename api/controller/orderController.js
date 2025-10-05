const Product = require('../models/product.models')
const Order = require('../models/order.models')

const getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, userId } = req.query;

    let filter = {};
    if (status) filter.status = status;
    if (userId) filter.user = userId;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const orders = await Order.find(filter)
      .populate('user', 'name email')
      .populate('orderItems.product', 'name image')
      .populate('orderItems.bundle', 'name image')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(filter);

    const totalAgg = await Order.aggregate([
      { $match: filter },
      { $group: { _id: null, totalAmount: { $sum: "$totalPrice" } } }
    ]);
    const totalAmount = totalAgg[0]?.totalAmount || 0;

    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      orders,
      totalAmount
    });
  } catch (err) {

    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('orderItems.product', 'name price image brand')
      .populate('orderItems.bundle', 'name bundlePrice image')
      .populate('orderItems.bundleItems.product', 'name price image');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.status(200).json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

const updateOrderToDelivery = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    if (order.isDelivered) {
      return res.status(400).json({
        success: false,
        message: "Order already delivered"
      });
    }
    order.markAsDelivered();
    const updatedOrder = await order.save();

    res.status(200).json({
      success: true,
      message: "Order marked as delivered",
      order: updatedOrder
    });
  } catch (err) {
    console.error("Update order delivery error:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
}

const getMyOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    let filter = { user: req.user._id };
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const orders = await Order.find(filter)
      .populate('orderItems.product', 'name image')
      .populate('orderItems.bundle', 'name image')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      orders,
    });
  } catch (err) {

    res.status(500).json({ success: false, message: "Internal server error" });
  }
}
const createOrder = async (req, res) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      appliedPrograms = [],
      couponProgram,
      couponCode,
      note,
    } = req.body

    let itemsPrice = 0
    let totalDiscount = 0
    let couponDiscount = 0

    const enhancedOrderItems = orderItems.map((item) => ({
      ...item,
      originalPrice: item.price, // Store original price before discounts
    }))

    // Calculate items price
    enhancedOrderItems.forEach((item) => {
      itemsPrice += item.originalPrice * item.quantity
    })

    // Calculate program discounts
    appliedPrograms.forEach((program) => {
      totalDiscount += program.discountAmount
    })

    // Calculate coupon discount
    if (couponProgram && couponCode) {
      couponDiscount = req.body.couponDiscount || 0
      totalDiscount += couponDiscount
    }

    const taxPrice = itemsPrice * 0.1
    const shippingPrice = itemsPrice > 500000 ? 0 : 30000
    const totalPrice = itemsPrice + taxPrice + shippingPrice - totalDiscount

    const order = new Order({
      user: req.user._id,
      orderItems: enhancedOrderItems,
      shippingAddress,
      paymentMethod,
      appliedPrograms,
      couponProgram,
      couponCode,
      couponDiscount,
      note,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      totalDiscount,
    })

    const createdOrder = await order.save()

    // Update stock for all items
    await createdOrder.updateStock()

    res.status(201).json(createdOrder)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}
const updateOrderToPaid = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)

    if (order) {
      if (order.status === "PENDING") {
        order.status = "CONFIRMED"
      } else if (order.status === "CONFIRMED") {
        order.status = "PAID"
        order.paidAt = Date.now()

        order.paymentResult = {
          id: req.body.id,
          status: req.body.status,
          update_time: req.body.update_time,
          email_address: req.body.payer?.email_address,
          payUrl: req.body.payUrl,
          transactionId: req.body.transactionId,
        }
      }

      const updatedOrder = await order.save()
      res.json(updatedOrder)
    } else {
      res.status(404).json({ message: "Order not found" })
    }
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}
const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    if (order.status === "DELIVERED") {
      return res.status(400).json({ success: false, message: "Cannot cancel delivered order" });
    }

    if (order.status === "CANCELLED") {
      return res.status(400).json({ success: false, message: "Order already cancelled" });
    }

    order.status = "CANCELLED";
    const updatedOrder = await order.save();

    res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      order: updatedOrder,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

module.exports = {
  getAllOrders,
  createOrder,
  getOrderById,
  updateOrderToDelivery,
  getMyOrders,
  updateOrderToPaid,
  cancelOrder

}