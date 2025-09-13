const express = require('express')
const router = express.Router()
const authsController = require('../controller/authsController')
const { authenticate, authorizeAdmin } = require('../middleware/auth.middleware')
const upload = require('../config/multer');
// 
router.post('/register', authsController.register)
router.post('/login', authsController.login)

// 
router.get('/profile', authenticate, authsController.getProfile)
router.put('/profile/update', authenticate, authsController.updateMyInfo)
router.post('/logOut', authsController.logOut)

// 
router.post('/password/forgot', authsController.forgotPassword)
router.post('/password/reset/:token', authsController.resetPassword )
router.post('/upload-avatar', upload.single('avatar'), authenticate, authsController.uploadAvatar)

module.exports = router