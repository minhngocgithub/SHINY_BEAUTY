const express = require('express')
const router = express.Router()
const orderController = require('../controller/orderController')
const { authenticate, authorizeAdmin } = require('../middleware/auth.middleware')

router.post('/', authenticate, orderController.createOrder)
router.get('/all',authenticate, authorizeAdmin, orderController.getAllOrders)
router.get('/:id', authenticate, orderController.getOrderById)

router.put('/:id/deliver',authenticate, authorizeAdmin, orderController.updateOrderToDelivery)
router.get('/myOrders', authenticate, orderController.getMyOrders )
router.put('/:id/pay', authenticate, orderController.updateOrderToPaid)
router.put('/:id/cancel', authenticate, orderController.cancelOrder)
module.exports = router