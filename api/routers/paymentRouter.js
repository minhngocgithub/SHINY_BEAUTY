const express = require('express')
const router = express.Router()
const { authenticate, authorizeAdmin } = require('../middleware/auth.middleware')

const paymentController = require('../controller/paymentController')

router.post('/create-checkout-session', authenticate, paymentController.createCheckoutSession)
router.post('/checkout-success', authenticate, paymentController.checkoutSuccess)

module.exports = router