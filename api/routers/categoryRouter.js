const express = require('express')
const router = express.Router()
const categoryController = require('../controller/categoryController')
const { authenticate, authorizeAdmin } = require('../middleware/auth.middleware')

// Backward-compatible routes
router.post('/add-category', authenticate, authorizeAdmin, categoryController.addNewCategory)
router.get('/all-category', authenticate, categoryController.getListCategory )
router.put('/update-category', authenticate, authorizeAdmin, categoryController.updateCategoryName)
router.delete('/delete-category', authenticate, authorizeAdmin, categoryController.deleteCategory)

// New hierarchical routes
router.get('/tree', categoryController.getCategoryTree)
router.get('/root-with-children', categoryController.getRootCategoriesWithChildren)
router.get('/slug/:slug', categoryController.getCategoryBySlug)
router.get('/breadcrumb/:slug', categoryController.getCategoryWithBreadcrumb)
router.post('/', authenticate, authorizeAdmin, categoryController.createCategory)
router.put('/hierarchy', authenticate, authorizeAdmin, categoryController.updateCategoryHierarchy)
router.put('/', authenticate, authorizeAdmin, categoryController.updateCategory)

module.exports = router