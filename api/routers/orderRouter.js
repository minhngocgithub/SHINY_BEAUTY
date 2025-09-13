const express = require('express')
const router = express.Router()
const orderController = require('../controller/orderController')
const { authenticate, authorizeAdmin } = require('../middleware/auth.middleware')

router.post('/', authenticate, orderController.addToCart)
router.get('/allOrder',authenticate, authorizeAdmin, orderController.getAllOrders)
router.get('/:id', authenticate, orderController.getOrderById)

router.put('/:id/delivery',authenticate, authorizeAdmin, orderController.updateOrderToDelivery)
router.get('/myOrders', authenticate, orderController.getMyOrders )
module.exports = router