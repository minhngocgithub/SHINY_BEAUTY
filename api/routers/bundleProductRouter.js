const express = require('express')
const router = express.Router()
const { authenticate, authorizeAdmin } = require('../middleware/auth.middleware')
const upload = require('../config/multer')
const {validateBundleExist,
    validateBundleItems,
    validateBundlePricing,
    checkBundleStock,
    validateBundleCompatibility,
    checkSeasonalRelevance,
    trackBundleViews,
    validateAdminBundleOperation,
    formatBundleResponse
} = require('../middleware/bundle.middleware')
const bundleProductController = require('../controller/bundleController')

router.get('/all', formatBundleResponse, bundleProductController.getProductBundles)
router.get('/:bundleId', validateBundleExist, trackBundleViews, checkSeasonalRelevance, formatBundleResponse,  bundleProductController.getSingleBundle)
router.get('/search', formatBundleResponse, bundleProductController.searchBundles)
router.get('/:bundleId/stock', validateBundleExist, checkBundleStock, bundleProductController.checkBundleStock)
router.get('/featured', validateBundleExist, formatBundleResponse, bundleProductController.getFeaturedBundles)
router.get('/category/:categoryId', bundleProductController.getBundlesByCategory)
router.get('/admin/all', authenticate, authorizeAdmin, formatBundleResponse, bundleProductController.getAdminBundles)
router.post('/admin/create', authenticate, authorizeAdmin, validateBundleItems, validateBundlePricing, validateBundleCompatibility(), formatBundleResponse, bundleProductController.createProductBundle)
router.put('/:bundleId', authenticate, authorizeAdmin, validateBundleExist, validateAdminBundleOperation, validateBundleItems, validateBundlePricing, validateBundleCompatibility(), formatBundleResponse, bundleProductController.updateProductBundle)
router.delete('/:bundleId', authenticate, authorizeAdmin, validateBundleExist, validateAdminBundleOperation, bundleProductController.deleteProductBundle)
router.post('/admin/upload-image', authenticate, authorizeAdmin, upload.single("image"), bundleProductController.uploadBundleImage);
router.get('/product/:productId', bundleProductController.getBundlesByProduct);
module.exports = router