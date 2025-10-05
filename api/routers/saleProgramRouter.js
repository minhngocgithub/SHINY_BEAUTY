const express = require('express');
const router = express.Router();
const { authenticate, authorizeAdmin } = require('../middleware/auth.middleware');
const validateObject = require('../middleware/validateObjectId')
const upload = require('../config/multer');
const saleProgramController = require('../controller/saleProgramController');

router.get('/active', saleProgramController.getActiveSalePrograms);
router.get('/:id', saleProgramController.getSaleProgramById);
router.get('/:id/products', saleProgramController.getProductsBySaleProgram);
router.get('/:id/bundles', saleProgramController.getBundlesBySaleProgram);
router.post('/validate-coupon', authenticate, saleProgramController.validateCouponCode);

// Admin routes
router.post('/admin/create', authenticate, authorizeAdmin, upload.single('banner'), saleProgramController.createSaleProgram);
router.get('/admin/all', authenticate, authorizeAdmin, saleProgramController.getAllSalePrograms);
router.put('/admin/:id', authenticate, authorizeAdmin, upload.single('banner'), saleProgramController.updateSaleProgram);
router.delete('/admin/:id', authenticate, authorizeAdmin, saleProgramController.deleteSaleProgram);
router.post('/admin/:id/sync-products', authenticate, authorizeAdmin, validateObject(), saleProgramController.syncProductsToSaleProgram);
router.post('/admin/:id/sync-bundles', authenticate, authorizeAdmin, validateObject(), saleProgramController.syncBundlesToSaleProgram);
router.get('/admin/:id/analytics', authenticate, authorizeAdmin, validateObject(), saleProgramController.getSaleProgramAnalytics);
router.patch('/admin/:id/toggle-status', authenticate, authorizeAdmin, validateObject(), saleProgramController.toggleSaleProgramStatus);
router.post('/admin/upload-banner', authenticate, authorizeAdmin, upload.single('bannerImage'), saleProgramController.uploadSaleProgramBanner);

module.exports = router;