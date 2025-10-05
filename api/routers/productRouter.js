const express = require('express')
const router = express.Router()
const productController = require('../controller/productController')
const featuredController = require('../controller/featuredController')
const saledController = require('../controller/saleProductController')
const { authenticate, authorizeAdmin } = require('../middleware/auth.middleware')
const upload = require('../config/multer')
// Specific routes must come before parameterized routes
router.get('/searchProduct', authenticate, productController.searchProduct)
router.get('/newProduct', productController.getNewProduct)
router.get('/bestSeller', productController.getBestSeller)
router.get('/allProduct', authenticate, productController.getAllProducts)
router.delete('/:id', authenticate, authorizeAdmin, productController.deleteProduct)
// Parameterized route must come last

router.post('/addProduct', authenticate, authorizeAdmin, productController.createProduct)
router.put('/updateProduct/:id', authenticate, authorizeAdmin, productController.updateProduct)
router.post('/upload-image', authenticate, authorizeAdmin, upload.single("image"), productController.uploadProductImage)
// Feature a product
router.get('/featured', featuredController.getFeaturedProducts)
router.get('/featured/:type', authenticate, featuredController.getFeaturedByType)
router.get('/featured/analytics', authenticate, authorizeAdmin, featuredController.getFeaturedAnalytics)
router.put('/featured/:id', authenticate, authorizeAdmin, featuredController.setProductFeatured)
router.delete('/featured/:id', authenticate, authorizeAdmin, featuredController.removeProductFeatured)
router.put('/featured/order', authenticate, authorizeAdmin, featuredController.updateFeaturedOrder)
router.post('/featured/auto-promote', authenticate, authorizeAdmin, featuredController.autoPromoteProducts)
router.post('/featured/:id/track', authenticate, featuredController.trackFeaturedInteraction)

// Sale a product
router.get('/sale', authenticate, saledController.getSaleProducts)
router.get('/flash-sale', authenticate, saledController.getFlashSaleProducts)
router.put('/:id/sale', authenticate, authorizeAdmin, saledController.setSaleForProduct)
router.put('/:id/sale/end', authenticate, authorizeAdmin, saledController.endSaleForProduct)
router.put('/:id/flash-sale', authenticate, authorizeAdmin, saledController.setFlashSaleForProduct)
router.get('/sale/statistics', authenticate, authorizeAdmin, saledController.getSaleStatistics)
router.post('/bulk-sale', authenticate, authorizeAdmin, saledController.setBulkSale)
router.put('/:id/sale/update', authenticate, authorizeAdmin, saledController.updateSalePrice)
router.get('/expired-sales', authenticate, authorizeAdmin, saledController.getExpiredSales)
router.put('/cleanup-expired-sales', authenticate, authorizeAdmin, saledController.cleanupExpiredSales)
router.post('/sale/category/:categoryId', saledController.setSaleForCategory); 
router.post('/sale/brand/:brandName', saledController.setSaleForBrand);
router.post('/sale/categories', saledController.setSaleForMultipleCategories);
router.delete('/sale/category/:categoryId', saledController.endSaleForCategory);
router.delete('/sale/brand/:brandName', saledController.endSaleForBrand);
// 
router.get('/:id', productController.getProduct)

module.exports = router