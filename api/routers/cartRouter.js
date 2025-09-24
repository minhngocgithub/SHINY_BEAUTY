const express = require('express');
const router = express.Router();
const cartController = require('../controller/cartController');
const { authenticate } = require('../middleware/auth.middleware');


router.post('/add', authenticate, cartController.addToCard);
router.get('/', authenticate, cartController.getCart);
router.put('/update', authenticate, cartController.updateCartItem);
router.delete('/remove/:itemId', authenticate, cartController.removeFromCart);
router.delete('/clear', authenticate, cartController.clearCart);

module.exports = router;