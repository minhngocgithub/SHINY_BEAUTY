const Product = require('../models/product.models')
const Order = require('../models/order.models')

//@desc		GET all orders
//@route	GET /api/v1/orders
//@access	Private/Admin
const getAllOrders = async(req, res) => {
    const orders = await Order.find({}).populate('user', 'name')
    if(orders) {
        let totalAmount = 0
        orders.map(order => totalAmount += order.totalPrice)
        return res.status(200).json({
            count: orders.length,
            orders,
            totalAmount
        })
    } else {
        return res.status(404).json('Not found any order.')
    }
}

//@desc		GET order by ID
//@route	GET /api/v1/orders/:id
//@access	Private
const getOrderById = async(req, res) => {
    try {
        const { id } = req.params
        const order = await Order.findById({id}).populate('user', 'email')
        if(order) return res.status(200).json({order})

    } catch (error) {
        return res.status(404).json('Not found any order')
    }
}

//@desc 	Update order to be delivered
//@route 	PUT /api/v1/orders/:id/deliver
//@access Private/admin
const updateOrderToDelivery = async(req, res) => {
    try {
        const { id } = req.params
        const order = await Order.findById({id})
        if(order) {
            order.isDelivered = true
            order.deliveredAt = Date.now()
            const updateOrder = await order.save()
            return res.status(200).json({ message: 'success', updateOrder })
        }
    } catch (error) {
        return res.status(500).json({message: 'Order cannot update', error})
    }
}
//@desc 	Get logged in user orders
//@route 	GET /api/v1/orders/myorders
//@access Private
const getMyOrders = async(req, res) => {
    const orders = await Order.find({ user: req.user._id })
    if(orders) {
        return res.status(200).json(orders)
    } else {
        return res.status(500).json(error)
    }

}
const addToCart = async(req, res) => {
    try {
        const { orderItems, shippingAddress, paymentMethod,
        itemsPrice, taxPrice, shippingPrice, totalPrice } = req.body
        if(orderItems && orderItems.length === 0) {
            return res.status(404).json('Not found any order item')
        } else {
            const order = new Order({
                user: req.user._id,
                orderItems, shippingAddress, paymentMethod,
                itemsPrice, taxPrice, shippingPrice, totalPrice
            })
            const createOrder = order.save()
            res.status(200).json({ message: 'Create order successfully.', createOrder })
        }
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message })
    }
}

module.exports = {
    getAllOrders,
    addToCart,
    getOrderById,
    updateOrderToDelivery,
    getMyOrders,

}