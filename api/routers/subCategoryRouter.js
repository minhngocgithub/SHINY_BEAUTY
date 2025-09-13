const express = require('express')
const router = express.Router()
const subCategoryController = require('../controller/subCategoryController')
const { authenticate, authorizeAdmin } = require('../middleware/auth.middleware')

router.post('/add-subcategory', authenticate, authorizeAdmin, subCategoryController.addSubCategory)
router.get('/all-subcategory', authenticate, subCategoryController.getSubCategory)
router.put('/update-subcategory', authenticate, authorizeAdmin, subCategoryController.updateSubCategory)
router.delete('/delete-subcategory', authenticate, authorizeAdmin, subCategoryController.deleteSubCategory)

module.exports = router