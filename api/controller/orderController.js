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
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      loyaltyPointsUsed = 0,
      loyaltyDiscount = 0,
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ success: false, message: "No order items found" });
    }
    for (const item of orderItems) {
      if (item.itemType === "product" && item.product) {
        const product = await Product.findById(item.product);
        if (!product) {
          return res.status(404).json({ success: false, message: `Product ${item.name} not found` });
        }
        if (product.countInstock < item.quantity) {
          return res.status(400).json({ success: false, message: `Insufficient stock for ${item.name}` });
        }
      } else if (item.itemType === "bundle" && item.bundle) {
        const bundle = await ProductBundle.findById(item.bundle);
        if (!bundle) {
          return res.status(404).json({ success: false, message: `Bundle ${item.name} not found` });
        }

        const stockCheck = await bundle.checkStock();
        if (!stockCheck.available) {
          return res.status(400).json({ success: false, message: stockCheck.reason });
        }

        const availableQuantity = await bundle.getAvailableQuantity();
        if (item.quantity > availableQuantity) {
          return res.status(400).json({ success: false, message: `Only ${availableQuantity} ${item.name} available` });
        }
      }
    }

    const order = new Order({
      user: req.user._id,
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      loyaltyPointsUsed,
      loyaltyDiscount,
    });

    const createdOrder = await order.save();

    // Update stock after successful order creation
    await createdOrder.updateStock();

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      order: createdOrder,
    });
  } catch (err) {
    console.error("Create order error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}
const updateOrderToPaid = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (order.isPaid) {
      return res.status(400).json({ success: false, message: "Order already paid" });
    }

    order.markAsPaid();
    order.paymentResult = {
      id: req.body.id,
      status: req.body.status,
      update_time: req.body.update_time,
      email_address: req.body.payer_email_address,
    };

    const updatedOrder = await order.save();

    res.status(200).json({
      success: true,
      message: "Order marked as paid",
      order: updatedOrder,
    });
  } catch (err) {
    console.error("Update order to paid error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
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