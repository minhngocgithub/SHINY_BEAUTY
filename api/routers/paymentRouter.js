const express = require('express')
const router = express.Router()
const { authenticate, authorizeAdmin } = require('../middleware/auth.middleware')

const paymentController = require('../controller/paymentController')

router.post('/create-order', authenticate, paymentController.createOrderWithPayment)
router.post('/stripe/verify', paymentController.verifyStripePayment)
router.post('/webhook/stripe', paymentController.handleStripeWebhook);
router.post('/webhook/momo', paymentController.handleMoMoWebhook);
router.post('/webhook/zalopay', paymentController.handleZaloPayWebhook);
router.get('/methods', paymentController.getPaymentMethods);
router.get('/status/:orderId', authenticate, paymentController.getPaymentStatus);
module.exports = router