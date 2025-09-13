const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    index: true
  },
  otp: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300 // OTP hết hạn sau 5 phút (300 giây)
  },
  verified: {
    type: Boolean,
    default: false
  }
});

// Đảm bảo OTP tự động hết hạn sau 5 phút bằng index TTL của MongoDB
otpSchema.index({ createdAt: 1 }, { expireAfterSeconds: 300 });

const OTP = mongoose.model('OTP', otpSchema);

module.exports = OTP;