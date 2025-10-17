const express = require('express');
const router = express.Router();
const wishlistController = require('../controller/wishListController');
const { authenticate } = require('../middleware/auth.middleware');

router.get('/', authenticate, wishlistController.getWishlist);

router.post('/add',authenticate, wishlistController.addToWishlist);

router.delete('/remove/:productId',authenticate, wishlistController.removeFromWishlist);

router.get('/check/:productId',authenticate, wishlistController.checkInWishlist);

router.delete('/clear',authenticate, wishlistController.clearWishlist);

router.post('/move-to-cart/:productId',authenticate, wishlistController.moveToCart);

router.get('/price-changes',authenticate, wishlistController.getPriceChanges);

module.exports = router;