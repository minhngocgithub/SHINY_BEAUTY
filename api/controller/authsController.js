const User = require('../models/user.models')
const argon = require('argon2')
const sendMail = require('../utils/sendMail')
const crypto = require('crypto')
const { generateAccessToken, generateRefreshToken } = require('../utils/createToken')
const { uploadImageCloudinary, deleteImageFromCloudinary } = require('../utils/upload.service')
const OTP = require('../models/otp.models')
const fs = require('fs')

const register = async(req, res) => {
    const { name, email, password, otp } = req.body
    try {
        // Kiểm tra tất cả các trường dữ liệu
        if(!name || !email || !password || !otp){
            return res.status(400).json('Please fill in fields')
        }
        
        // Kiểm tra OTP trước khi kiểm tra email tồn tại
        const otpRecord = await OTP.findOne({ email, otp });
        if (!otpRecord) {
            return res.status(400).json({ success: false, message: 'Mã OTP không chính xác hoặc đã hết hạn' });
        }
        
        // Sau khi xác thực OTP thành công, kiểm tra email tồn tại
        const existingUser = await User.findOne({ email: email })
        if(existingUser) {
            return res.status(402).json('Email is registed')
        }
        
        // Mã hóa mật khẩu
        const hashPassword = await argon.hash(password)
        
        // Đánh dấu OTP đã được sử dụng
        otpRecord.verified = true;
        await otpRecord.save();
    
        // Tạo user mới sau khi đã kiểm tra OTP và email
        const user = await User.create({
            name, 
            email,
            password: hashPassword,
            isOAuthUser: false // Đánh dấu user được tạo bằng email/password
        })
        
        if(user){
            // Xóa OTP đã sử dụng
            await OTP.deleteMany({ email });
            return res.status(200).json({
                name: user.name,
                email: user.email,
                isOAuthUser: user.isOAuthUser
            })
        } else {
            return res.status(401).json('Invalid email or password register')
        }  
    } catch (error) {
        console.log(error)
        return res.status(500).json('Error')
    }
}

const login = async(req, res) => {
    const { email, password } = req.body
    try {
        if(!email || !password)  return res.status(422).json({'message': 'Invalid field'})
        
        const user = await User.findOne({ email })
        if(user) {
            // Kiểm tra nếu user là OAuth user (không có password)
            if (user.isOAuthUser) {
                return res.status(422).json('This account was created using OAuth. Please use OAuth login instead.')
            }
            
            const match = await argon.verify(user.password, password)
            if(match) {
                const { password, isAdmin, refreshToken, ...userData  } = user.toObject()
                const accessToken = generateAccessToken(user._id, isAdmin)
                const newRefreshToken = generateRefreshToken(user._id)
                await User.findByIdAndUpdate(user._id, { refreshToken: newRefreshToken }, { new: true })
                return res.status(200).json({
                    sucess: true,
                    _id: user.id,
                    avatar: user.avatar,
                    accessToken,
                    newRefreshToken,
                    userData,
                    isAdmin,
                    isOAuthUser: user.isOAuthUser
                })
            } else {
                return res.status(422).json('Email and Password not match.')
            }
        } else {
            return res.status(404).json('Not found this User.')
        }
    } catch (error) {
        return res.status(500).json('Unable login!')
        
    }
}

const getProfile = async(req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }
        res.status(200).json({
          success: true,
          id: user._id,
          name: user.name,        
          email: user.email,
          phone: user.phone,
          dateOfBirth: user.dateOfBirth,
          avatar: user.avatar,
          isOAuthUser: user.isOAuthUser,
          googleId: user.googleId,
          facebookId: user.facebookId,
          twitterId: user.twitterId,
          isAdmin: user.isAdmin,
          createAt: user.createAt
        });
    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({ 
          success: false, 
          message: 'Server error' 
        });
    }
}

const logOut = async(req, res) => {
    try {
        const cookiesOption = {
            httpOnly : true,
            secure : true,
            sameSite : "None"
        }

        res.clearCookie("accessToken",cookiesOption)
        res.clearCookie("refreshToken",cookiesOption)

        return res.json({
            message : "Logout successfully",
            success : true
        })
    } catch (error) {
        return res.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

const forgotPassword = async(req, res) => {
    try {
        const { email } = req.body
         
        if(!email) return res.status(422).json({ 'message': 'Email is not invalid!' }) // Check email

        const user = await User.findOne({ email }) // Find user by email    
        
        if(!user) return res.status(401).json({'message': 'Can not find this user'})  
        
        // Tạo token reset password
        const resetToken = crypto.randomBytes(32).toString('hex')
        // Hash token và lưu vào database
        user.resetPasswordToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');
        
        
        // Set thời gian hết hạn token (15 phút)
        user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
        // Lưu user với thông tin token reset
        await user.save({ validateBeforeSave: false })
        // Tạo URL reset password
        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`
        
        // Tạo nội dung email
        const message = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Password Reset Request</h2>
                <p>You requested to reset your password. Please click the button below to set a new password:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
                </div>
                <p>If you didn't request a password reset, please ignore this email.</p>
                <p><strong>Note:</strong> This link will expire in 15 minutes.</p>
                <p>If the button doesn't work, copy and paste this URL into your browser:</p>
                <p>${resetUrl}</p>
            </div>
        `
        // Gửi email
        try {
            await sendMail({
                email: user.email,
                subject: "Reset Password",
                html: message
            });
            
            res.status(200).json({
                success: true,
                message: 'Email đặt lại mật khẩu đã được gửi'
            });
            
        } catch (error) {
            // Nếu gửi email thất bại, reset lại các trường token
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            
            await user.save({ validateBeforeSave: false });
            
            return res.status(500).json({
                success: false,
                message: 'Không thể gửi email. Vui lòng thử lại sau',
                error: error.message
            });
        }

    } catch (error) {
        return res.status(500).json(error)
    }
}

const resetPassword = async(req, res) => {
    try {
        const { password } = req.body;
        const token = req.params.token || req.body.token;
        
        if(!password || !token) return res.status(400).json({
            success: false,
            message: 'Missing required fields'
        });
        
        // Hash the token
        const resetPasswordToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');
        
        // Find user
        const user = await User.findOne({ 
            resetPasswordToken, 
            resetPasswordExpire: { $gt: Date.now() }
        });
        
        if(!user) return res.status(400).json({
            success: false,
            message: 'Invalid or expired reset token'
        });
        
        // Hash password using argon2
        const hashedPassword = await argon.hash(password);
        
        // Update user
        user.password = hashedPassword; // Save hashed password
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        user.passwordChangedAt = Date.now();
        
        await user.save();
        
        return res.status(200).json({
            success: true,
            message: 'Password updated successfully'
        });
    } catch (error) {
        console.log("Reset password error:", error);
        return res.status(500).json({
            success: false,
            message: 'An error occurred while resetting password',
            error: error.message
        });
    }
}

const updateMyInfo = async(req, res) => {
    try {
        if (req.user.isOAuthUser && req.body.email && req.body.email !== req.user.email) {
            return res.status(400).json({
                message: "OAuth users cannot change their email address",
                error: true,
                success: false
            });
        }
        
        const updateUser = await User.findByIdAndUpdate(req.user._id, req.body, {
            new:true,
			runValidators:true,
			useFindAndModify:false
        })
        
        if (!updateUser) {
            return res.status(404).json({
                message: "User not found",
                error: true,
                success: false
            });
        }
        
        return res.status(200).json({
            message : "Updated successfully",
            error : false,
            success : true,
            data : updateUser,
            newAccessToken: generateAccessToken(updateUser._id, updateUser.isAdmin)
        })
    } catch (error) {
        return res.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload an image",
      })
    }
    if (req.user.isOAuthUser) {
      return res.status(400).json({
        success: false,
        message: "OAuth users cannot change their avatar through this method",
      })
    }
    
    if (req.user.avatar && req.user.avatar.public_id) {
      await deleteImageFromCloudinary(req.user.avatar.public_id)
    }
    const uploadResult = await uploadImageCloudinary(req.file, "avatars")
    console.log(uploadResult);

    if (req.file.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path)
    }
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        avatar: {
          public_id: uploadResult.public_id,
          url: uploadResult.url,
        },
      },
      { new: true },
    )
    if (!updatedUser) {
        return res.status(404).json({
            success: false,
            message: "User not found",
        });
    }
    return res.status(200).json({
      success: true,
      message: "Avatar uploaded successfully",
      avatar: updatedUser.avatar,
    })
  } catch (error) {
    console.error("Lỗi upload avatar:", error)

    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path)
    }

    return res.status(500).json({
      success: false,
      message: error.message || "Lỗi hệ thống",
    })
  }
}

const deleteAvatar = async (req, res) => {
    try {
        // Kiểm tra nếu user là OAuth user
        if (req.user.isOAuthUser) {
            return res.status(400).json({
                message: "OAuth users cannot delete their avatar",
                success: false
            });
        }
        
        // Nếu có avatar cũ, xóa khỏi Cloudinary
        if (req.user.avatar && req.user.avatar.public_id) {
            await deleteImageFromCloudinary(req.user.avatar.public_id);
        }

        // Cập nhật user
        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            { 
                avatar: {
                    public_id: null,
                    url: null
                }
            },
            { new: true }
        );

        return res.status(200).json({
            message: "Xóa avatar thành công",
            success: true
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message || "Lỗi hệ thống",
            success: false
        });
    }
}

// Thêm function để xử lý OAuth login
const handleOAuthLogin = async (req, res) => {
    try {
        const user = req.user;
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'OAuth authentication failed'
            });
        }
        
        const { password, refreshToken, ...userData } = user.toObject();
        const accessToken = generateAccessToken(user._id, user.isAdmin);
        const newRefreshToken = generateRefreshToken(user._id);
        
        // Cập nhật refresh token
        await User.findByIdAndUpdate(user._id, { refreshToken: newRefreshToken }, { new: true });
        
        return res.status(200).json({
            success: true,
            _id: user._id,
            avatar: user.avatar,
            accessToken,
            newRefreshToken,
            userData,
            isAdmin: user.isAdmin,
            isOAuthUser: user.isOAuthUser
        });
    } catch (error) {
        console.error('OAuth login error:', error);
        return res.status(500).json({
            success: false,
            message: 'OAuth login failed'
        });
    }
};

module.exports = {
    register,
    login,
    getProfile,
    updateMyInfo,
    logOut,
    forgotPassword,
    resetPassword,
    uploadAvatar,
    deleteAvatar,
    handleOAuthLogin
}