const User = require('../models/user.models');
const Product = require('../models/product.models');

const getWishlist = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId)
            .populate(
                'wishlistItems.product',
                'name brand price salePrice image countInstock ratings discountPercentage isOnSale'
            )
            .lean();

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        const wishlistItems = (user.wishlistItems || []).filter(item => item.product !== null);

        return res.status(200).json({
            success: true,
            wishlist: {
                items: wishlistItems,
                totalItems: wishlistItems.length
            }
        });
    } catch (error) {
        console.error('Get wishlist error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error retrieving wishlist',
            error: error.message
        });
    }
};
const addToWishlist = async (req, res) => {
    try {
        const userId = req.user._id;
        const { productId } = req.body;

        if (!productId) {
            return res.status(400).json({
                success: false,
                message: 'Product ID is required'
            });
        }
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if already in wishlist
        const exists = user.wishlistItems.some(
            item => item.product.toString() === productId
        );

        if (exists) {
            return res.status(400).json({
                success: false,
                message: 'Product already in wishlist'
            });
        }
        user.wishlistItems.push({
            product: productId,
            priceWhenAdded: product.salePrice || product.price,
            addedAt: new Date()
        });

        await user.save();

        // Get updated user with populated wishlist
        const updatedUser = await User.findById(userId)
            .populate(
                'wishlistItems.product',
                'name brand price salePrice image countInstock ratings'
            )
            .lean();

        return res.status(200).json({
            success: true,
            message: 'Product added to wishlist',
            wishlist: {
                items: updatedUser.wishlistItems,
                totalItems: updatedUser.wishlistItems.length
            }
        })
    } catch (error) {
        console.error('Add to wishlist error:', error)
        return res.status(500).json({
            success: false,
            message: 'Error adding to wishlist',
            error: error.message
        });
    }
};
const removeFromWishlist = async (req, res) => {
    try {
        const userId = req.user._id;
        const { productId } = req.params;

        if (!productId) {
            return res.status(400).json({
                success: false,
                message: 'Product ID is required'
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const initialLength = user.wishlistItems.length;
        user.wishlistItems = user.wishlistItems.filter(
            item => item.product.toString() !== productId
        );

        if (user.wishlistItems.length === initialLength) {
            return res.status(404).json({
                success: false,
                message: 'Product not found in wishlist'
            });
        }

        await user.save();

        return res.status(200).json({
            success: true,
            message: 'Product removed from wishlist',
            totalItems: user.wishlistItems.length
        });
    } catch (error) {
        console.error('Remove from wishlist error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error removing from wishlist',
            error: error.message
        });
    }
};
const checkInWishlist = async (req, res) => {
    try {
        const userId = req.user._id;
        const { productId } = req.params;

        if (!productId) {
            return res.status(400).json({
                success: false,
                message: 'Product ID is required'
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const inWishlist = user.wishlistItems.some(
            item => item.product.toString() === productId
        );

        return res.status(200).json({
            success: true,
            inWishlist
        });
    } catch (error) {
        console.error('Check wishlist error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error checking wishlist',
            error: error.message
        });
    }
};
const clearWishlist = async (req, res) => {
    try {
        const userId = req.user._id;

        const result = await User.findByIdAndUpdate(
            userId,
            { $set: { wishlistItems: [] } },
            { new: true }
        );

        if (!result) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Wishlist cleared successfully'
        });
    } catch (error) {
        console.error('Clear wishlist error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error clearing wishlist',
            error: error.message
        });
    }
};
const moveToCart = async (req, res) => {
    try {
        const userId = req.user._id;
        const { productId } = req.params;
        const { quantity = 1 } = req.body;

        if (!productId) {
            return res.status(400).json({
                success: false,
                message: 'Product ID is required'
            });
        }

        if (quantity <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Quantity must be greater than 0'
            });
        }

        // Check product exists and in stock
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        if (product.countInstock < quantity) {
            return res.status(400).json({
                success: false,
                message: `Only ${product.countInstock} items available in stock`
            });
        }

        // Get user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Add to cart
        const existingCartItem = user.cartItems.find(
            item => item.product && item.product.toString() === productId
        );

        if (existingCartItem) {
            const newQuantity = existingCartItem.quantity + quantity;
            if (newQuantity > product.countInstock) {
                return res.status(400).json({
                    success: false,
                    message: `Cannot add ${quantity} items. Total would exceed available stock.`
                });
            }
            existingCartItem.quantity = newQuantity;
        } else {
            user.cartItems.push({
                product: productId,
                quantity
            });
        }

        // Remove from wishlist
        user.wishlistItems = user.wishlistItems.filter(
            item => item.product.toString() !== productId
        );

        await user.save();

        return res.status(200).json({
            success: true,
            message: 'Product moved to cart successfully',
            cartCount: user.cartItems.reduce((sum, item) => sum + item.quantity, 0)
        });
    } catch (error) {
        console.error('Move to cart error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error moving to cart',
            error: error.message
        });
    }
};
const getPriceChanges = async (req, res) => {
    try {
        const userId = req.user._id;

        const user = await User.findById(userId)
            .populate('wishlistItems.product', 'name price salePrice image');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const priceChanges = user.wishlistItems
            .filter(item => item.product && item.priceWhenAdded)
            .map(item => {
                const currentPrice = item.product.salePrice || item.product.price;
                const originalPrice = item.priceWhenAdded;
                const priceDiff = currentPrice - originalPrice;
                const percentChange = ((priceDiff / originalPrice) * 100).toFixed(2);

                return {
                    product: {
                        _id: item.product._id,
                        name: item.product.name,
                        image: item.product.image
                    },
                    originalPrice: originalPrice.toFixed(2),
                    currentPrice: currentPrice.toFixed(2),
                    priceDiff: priceDiff.toFixed(2),
                    percentChange,
                    isPriceLower: priceDiff < 0,
                    addedAt: item.addedAt
                };
            })
            .filter(item => item.priceDiff !== '0.00');

        return res.status(200).json({
            success: true,
            priceChanges,
            totalPriceChanges: priceChanges.length
        });
    } catch (error) {
        console.error('Get price changes error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error getting price changes',
            error: error.message
        });
    }
};
module.exports = {
    getWishlist,
    addToWishlist,
    removeFromWishlist,
    checkInWishlist,
    clearWishlist,
    moveToCart,
    getPriceChanges
}