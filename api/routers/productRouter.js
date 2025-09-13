const express = require('express')
const router = express.Router()
const productController = require('../controller/productController')
const featuredController = require('../controller/featuredController')
const saledController = require('../controller/saleProductController')
const { authenticate, authorizeAdmin } = require('../middleware/auth.middleware')

// Specific routes must come before parameterized routes
router.get('/searchProduct', authenticate, productController.searchProduct)
router.get('/newProduct', productController.getNewProduct)
router.get('/bestSeller', authenticate, productController.getBestSeller)
router.get('/allProduct', authenticate, authorizeAdmin, productController.getAllProducts)
router.delete('/:id', authenticate, authorizeAdmin, productController.deleteProduct)
// Parameterized route must come last

router.post('/addProduct', authenticate, authorizeAdmin, productController.createProduct)
router.put('/updateProduct/:id', authenticate, authorizeAdmin, productController.updateProduct)

// Feature a product
router.get('/featured', authenticate , featuredController.getFeaturedProducts)
router.get('/featured/:type', authenticate, featuredController.getFeaturedByType)
router.get('/faetured/analytics', authenticate, authorizeAdmin, featuredController.getFeaturedAnalytics)
router.put('/featured/:id', authenticate, authorizeAdmin, featuredController.setProductFeatured)
router.delete('/featured/:id', authenticate, authorizeAdmin, featuredController.removeProductFeatured)
router.put('/featured/order', authenticate, authorizeAdmin, featuredController.updateFeaturedOrder)
router.post('/featured/auto-promote', authenticate, authorizeAdmin, featuredController.autoPromoteProducts)
router.post('/faetured/:id/track', authenticate, featuredController.trackFeaturedInteraction)
router
// Sale a product
router.get('/sale', authenticate, saledController.getSaleProducts)
router.get('/flash-sale', authenticate, saledController.getFlashSaleProducts)
router.put('/:id/sale', authenticate, authorizeAdmin, saledController.setSaleForProduct)
router.put('/:id/sale/end', authenticate, authorizeAdmin, saledController.endSaleForProduct)
router.put('/:id/flash-sale', authenticate, authorizeAdmin, saledController.setFlashSaleForProduct)
router.get('/sale/statistics', authenticate, authorizeAdmin, saledController.getSaleStatistics)
router.get('/bulk-sale', authenticate, authorizeAdmin, saledController.setBulkSale)
router.put('/:id/sale/update', authenticate, authorizeAdmin, saledController.updateSalePrice)
router.get('/expired-sales', authenticate, authorizeAdmin, saledController.getExpiredSales)
router.put('/cleanup-expired-sales', authenticate, authorizeAdmin, saledController.cleanupExpiredSales)

router.get('/:id', productController.getProduct)

module.exports = router