const User = require('../models/user.models')
const OTP = require('../models/otp.models')
const transporter = require('../config/nodemailer')
const crypto = require('crypto')
const dotenv = require('dotenv')
dotenv.config()

// Tạo và gửi OTP
const sendVerificationOTP = async (email) => {
    // Tạo OTP ngẫu nhiên 6 chữ số
    const otp = crypto.randomInt(100000, 999999).toString();
    
    // Lưu OTP vào database
    // Xóa OTP cũ nếu có
    await OTP.deleteMany({ email });
    
    // Tạo OTP mới
    await OTP.create({
      email,
      otp
    });
    
    // Tạo nội dung email
    const mailOptions = {
      from: process.env.EMAIL_NAME || 'your-email@gmail.com',
      to: email,
      subject: 'Mã xác minh đăng ký tài khoản',
      html: 
        `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Xác minh tài khoản của bạn</h2>
          <p>Cảm ơn bạn đã đăng ký. Vui lòng sử dụng mã OTP sau để hoàn tất quá trình đăng ký:</p>
          <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; letter-spacing: 5px; font-weight: bold;">
            ${otp}
          </div>
          <p>Mã OTP này sẽ hết hạn sau 5 phút.</p>
          <p>Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này.</p>
        </div>
        `
    };
    
    // Gửi email
    await transporter.sendMail(mailOptions);
    
    return true;
};

// API gửi OTP
const sendOTP = async (req, res) => {
    const { email } = req.body;
    try {
        // Kiểm tra định dạng email cơ bản
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ success: false, message: 'Định dạng email không hợp lệ' });
        }
        
        // Kiểm tra tên miền Gmail
        if (!email.toLowerCase().endsWith('@gmail.com')) {
            return res.status(400).json({ success: false, message: 'Vui lòng sử dụng email Gmail' });
        }
        
        // Kiểm tra email đã tồn tại chưa
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Email đã được đăng ký' });
        }
        
        // Gửi OTP
        await sendVerificationOTP(email);
        
        res.json({ success: true, message: 'Mã OTP đã được gửi đến email của bạn' });
    } catch (error) {
        console.error('Lỗi khi gửi OTP:', error);
        res.status(500).json({ success: false, message: 'Không thể gửi mã xác minh, vui lòng thử lại sau' });
    }
};
// API xác minh OTP
const verifyOTP = async (req, res) => {
    const { email, otp } = req.body;
    
    try {
      // Kiểm tra OTP
      const otpRecord = await OTP.findOne({ email, otp });
      if (!otpRecord) {
        return res.status(400).json({ success: false, message: 'Mã OTP không chính xác hoặc đã hết hạn' });
      }
      
      // Đánh dấu OTP đã xác minh
      otpRecord.verified = true;
      await otpRecord.save();
      
      return res.json({ success: true, message: 'Xác minh OTP thành công' });
    } catch (error) {
      console.error('Lỗi xác minh OTP:', error);
      return res.status(500).json({ success: false, message: 'Lỗi hệ thống' });
    }
};
// API gửi lại OTP
const resendOTP = async (req, res) => {
    const { email } = req.body;
    
    try {
      // Kiểm tra xem đã gửi OTP gần đây chưa
      const recentOTP = await OTP.findOne({ 
        email, 
        createdAt: { $gt: new Date(Date.now() - 60000) } // 60 giây
      });
      
      if (recentOTP) {
        return res.status(400).json({ 
          success: false, 
          message: 'Vui lòng đợi 60 giây trước khi yêu cầu gửi lại mã',
          remainingTime: Math.ceil((recentOTP.createdAt.getTime() + 60000 - Date.now()) / 1000)
        });
      }
      
      // Gửi OTP mới
      await sendVerificationOTP(email);
      
      return res.json({ success: true, message: 'Mã OTP mới đã được gửi đến email của bạn' });
    } catch (error) {
      console.error('Lỗi gửi lại OTP:', error);
      return res.status(500).json({ success: false, message: 'Không thể gửi lại mã, vui lòng thử lại sau' });
    }
};

module.exports = {
    sendOTP,
    verifyOTP,
    resendOTP
};
    
  
  