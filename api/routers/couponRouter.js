const express = require('express')
const router = express.Router()
const couponController = require('../controller/couponController')
const { authenticate, authorizeAdmin } = require('../middleware/auth.middleware')

router.post('/', authenticate, authorizeAdmin, couponController.createCoupon)
router.get('/:id', authenticate, couponController.getCoupon)
router.get('/allCoupon', authenticate, couponController.getAllCoupon)
router.post('/validate', authenticate, couponController.validateCoupon)
router.delete('/:id', authenticate, authorizeAdmin, couponController.deleteCoupon)

module.exports = router