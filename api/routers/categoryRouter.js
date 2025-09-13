const express = require('express')
const router = express.Router()
const categoryController = require('../controller/categoryController')
const { authenticate, authorizeAdmin } = require('../middleware/auth.middleware')

router.post('/add-category', authenticate, authorizeAdmin, categoryController.addNewCategory)
router.get('/all-category', authenticate, categoryController.getListCategory )
router.put('/update-category', authenticate, authorizeAdmin, categoryController.updateCategoryName)
router.delete('/delete-category', authenticate, authorizeAdmin, categoryController.deleteCategory)

module.exports = router