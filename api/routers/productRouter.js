const express = require('express')
const router = express.Router()
const productController = require('../controller/productController')
const featuredController = require('../controller/featuredController')
const saledController = require('../controller/saleProductController')
const { authenticate, authorizeAdmin } = require('../middleware/auth.middleware')
const { applySaleProgramToProducts } = require('../middleware/applySaleProgram.middleware')
const upload = require('../config/multer')

// PUBLIC ROUTES
router.get('/search',applySaleProgramToProducts, productController.searchProduct)
router.get('/bestSeller', applySaleProgramToProducts, productController.getBestSeller)
router.get('/newProduct', applySaleProgramToProducts, productController.getNewProduct)
router.get('/allProduct', applySaleProgramToProducts, productController.getAllProducts)

// FEATURED ROUTES
router.get('/featured', applySaleProgramToProducts, featuredController.getFeaturedProducts)
router.get('/featured/:type', authenticate, applySaleProgramToProducts, featuredController.getFeaturedByType)
router.get('/featured/analytics', authenticate, authorizeAdmin, featuredController.getFeaturedAnalytics)
router.put('/featured/:id', authenticate, authorizeAdmin, featuredController.setProductFeatured)
router.delete('/featured/:id', authenticate, authorizeAdmin, featuredController.removeProductFeatured)
router.put('/featured/order', authenticate, authorizeAdmin, featuredController.updateFeaturedOrder)
router.post('/featured/auto-promote', authenticate, authorizeAdmin, featuredController.autoPromoteProducts)
router.post('/featured/:id/track', authenticate, featuredController.trackFeaturedInteraction)

// SALE ROUTES
router.get('/sale', applySaleProgramToProducts, saledController.getSaleProducts)
router.get('/flash-sale', applySaleProgramToProducts, saledController.getFlashSaleProducts)
router.get('/sale/statistics', authenticate, authorizeAdmin, saledController.getSaleStatistics)
router.get('/expired-sales', authenticate, authorizeAdmin, saledController.getExpiredSales)
router.put('/:id/sale', authenticate, authorizeAdmin, saledController.setSaleForProduct)
router.put('/:id/sale/end', authenticate, authorizeAdmin, saledController.endSaleForProduct)
router.put('/:id/sale/update', authenticate, authorizeAdmin, saledController.updateSalePrice)
router.put('/:id/flash-sale', authenticate, authorizeAdmin, saledController.setFlashSaleForProduct)
router.post('/bulk-sale', authenticate, authorizeAdmin, saledController.setBulkSale)
router.put('/cleanup-expired-sales', authenticate, authorizeAdmin, saledController.cleanupExpiredSales)
router.post('/sale/category/:categoryId', authenticate, authorizeAdmin, saledController.setSaleForCategory)
router.post('/sale/brand/:brandName', authenticate, authorizeAdmin, saledController.setSaleForBrand)
router.post('/sale/categories', authenticate, authorizeAdmin, saledController.setSaleForMultipleCategories)
router.delete('/sale/category/:categoryId', authenticate, authorizeAdmin, saledController.endSaleForCategory)
router.delete('/sale/brand/:brandName', authenticate, authorizeAdmin, saledController.endSaleForBrand)

// ADMIN ROUTES
router.post('/addProduct', authenticate, authorizeAdmin, upload.single('image'), productController.createProduct)
router.put('/updateProduct/:id', authenticate, authorizeAdmin, upload.single('image'), productController.updateProduct)
router.delete('/:id', authenticate, authorizeAdmin, productController.deleteProduct)
router.post('/upload-image', authenticate, authorizeAdmin, upload.single('image'), productController.uploadProductImage)

// PARAMETERIZED ROUTES
router.get('/:id/related', applySaleProgramToProducts, productController.getRelatedProducts)
router.get('/:id/with-reviews', applySaleProgramToProducts, productController.getProductWithReviews)
router.get('/:id/review-data', applySaleProgramToProducts, productController.getProductsWithReviewData)
router.get('/:id', applySaleProgramToProducts, productController.getProduct)

module.exports = router
