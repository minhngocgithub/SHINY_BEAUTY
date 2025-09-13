const express = require('express')
const router = express.Router()
const otpController = require('../controller/otpController')
const { authenticate, authorizeAdmin } = require('../middleware/auth.middleware')

// Route gửi OTP
router.post('/send-otp', otpController.sendOTP);

// Route xác minh OTP
router.post('/verify-otp', otpController.verifyOTP);

// Route gửi lại OTP
router.post('/resend-otp', otpController.resendOTP);

module.exports = router;