const Product = require("../models/product.models")
const User = require("../models/user.models")
const ProductBundle = require("../models/productBundle.models")

const addToCard = async (req, res) => {
    try {
        const { productId, bundleId, quantity = 1 } = req.body
        const userId = req.user._id
        if(!productId && !bundleId) {
            return res.status(400).json({ 
                success: false,
                message: "ProductId or BundleId is required" 
            })          
        }
        if(quantity <= 0) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be greater than 0"
            })
        }
        const user = await User.findById(userId)
        if(!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }
        if(productId) {
            const product = await Product.findById(productId)
            if(!product) {
                return res.status(404).json({
                    success: false,
                    message: "Product not found"
                })
            }
            if(product.countInstock < quantity) {
                return res.status(400).json({
                    success: false,
                    message: 'Insufficient stock'
                })  
            }
            if(product.flashSale?.isFlashSale) {
                if(quantity > product.flashSale.maxQuantityPerUser) {
                    return res.status(400).json({
                        success: false,
                        message: `You can only add up to ${product.flashSale.maxQuantityPerUser} items of this product to your cart`
                    })
                }
                if(quantity > product.flashSale.saleStock) {
                    return res.status(400).json({
                        success: false,
                        message: 'Not enough flash sale stock'
                    })
                }
            }
            const existingItem = user.cartItems.find(item => item.product?.toString() === productId)
            if(existingItem) {
                const newQuantity = existingItem.quantity + quantity
                if(newQuantity > product.countInstock) {
                    return res.status(400).json({
                        success: false,
                        message: 'Insufficient stock'
                    })
                }
                existingItem.quantity = newQuantity
            } else {
                user.cartItems.push({ product: productId, quantity })
            }
        }
        if(bundleId) {
            const bundle = await ProductBundle.findById(bundleId)
            if(!bundle || !bundle.isActive) {
                return res.status(404).json({
                    success: false,
                    message: "Product bundle not found"
                })
            }
            const stockCheck = await bundle.checkStock()
            if(!stockCheck.available) {
                return res.status(400).json({
                    success: false,
                    message: `Only ${availableQuantity} bundles available`
                })
            }
            const existingBundle = user.cartItems.find(item => 
                item.bundle && item.bundle.toString() === bundleId
            );

            if (existingBundle) {
                const newQuantity = existingBundle.quantity + quantity;
                if (newQuantity > availableQuantity) {
                    return res.status(400).json({
                        success: false,
                        message: 'Total quantity exceeds available bundle stock'
                    });
                }
                existingBundle.quantity = newQuantity;
            } else {
                user.cartItems.push({
                    bundle: bundleId,
                    quantity,
                    itemType: 'bundle'
                });
            }
        }
        await user.save()
        const updatedUser = await User.findById(userId)
            .populate('cartItems.product', 'name price images brand countInstock currentPrice isSaleActive discountPercentage')
            .populate('cartItems.bundle', 'name bundlePrice image discountPercentage');

        res.status(200).json({
            success: true,
            message: 'Item added to cart successfully',
            cartItems: updatedUser.cartItems,
            cartCount: updatedUser.cartItems.reduce((sum, item) => sum + item.quantity, 0)
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
}
const getCart = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .populate('cartItems.product', 'name price images brand countInstock currentPrice isSaleActive discountPercentage salePrice')
            .populate('cartItems.bundle', 'name bundlePrice image discountPercentage originalPrice')

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Tính toán cart summary
        let subtotal = 0
        let totalItems = 0

        const cartItems = user.cartItems.map(item => {
            let itemPrice = 0
            let itemName = ''
            let itemImage = ''

            if (item.itemType === 'product' && item.product) {
                itemPrice = item.product.currentPrice || item.product.price
                itemName = item.product.name
                itemImage = item.product.images?.[0]?.url || ''
            } else if (item.itemType === 'bundle' && item.bundle) {
                itemPrice = item.bundle.bundlePrice;
                itemName = item.bundle.name
                itemImage = item.bundle.image?.[0]?.url || ''
            }

            const itemTotal = itemPrice * item.quantity
            subtotal += itemTotal
            totalItems += item.quantity

            return {
                ...item.toObject(),
                itemPrice,
                itemTotal,
                itemName,
                itemImage
            };
        });

        res.status(200).json({
            success: true,
            cartItems,
            summary: {
                totalItems,
                subtotal,
                itemCount: user.cartItems.length
            }
        });

    } catch (error) {
        console.error('Get cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
}
const updateCartItem = async (req, res) => {
    try {
        const { itemId, quantity } = req.body;

        if (quantity <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Quantity must be greater than 0'
            });
        }

        const user = await User.findById(req.user._id);
        const cartItem = user.cartItems.id(itemId);

        if (!cartItem) {
            return res.status(404).json({
                success: false,
                message: 'Cart item not found'
            });
        }

        // Validate stock cho product
        if (cartItem.itemType === 'product' && cartItem.product) {
            const product = await Product.findById(cartItem.product);
            if (quantity > product.countInstock) {
                return res.status(400).json({
                    success: false,
                    message: 'Quantity exceeds available stock'
                });
            }
        }

        // Validate stock cho bundle
        if (cartItem.itemType === 'bundle' && cartItem.bundle) {
            const bundle = await ProductBundle.findById(cartItem.bundle);
            const availableQuantity = await bundle.getAvailableQuantity();
            if (quantity > availableQuantity) {
                return res.status(400).json({
                    success: false,
                    message: 'Quantity exceeds available bundle stock'
                });
            }
        }

        cartItem.quantity = quantity;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Cart item updated successfully'
        });

    } catch (error) {
        console.error('Update cart item error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
}
const removeFromCart = async (req, res) => {
    try {
        const { itemId } = req.params;

        const user = await User.findById(req.user._id);
        const cartItem = user.cartItems.id(itemId);

        if (!cartItem) {
            return res.status(404).json({
                success: false,
                message: 'Cart item not found'
            });
        }

        cartItem.remove();
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Item removed from cart successfully'
        });

    } catch (error) {
        console.error('Remove from cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
}
const clearCart = async (req, res) => {
    try {
        await User.findByIdAndUpdate(
            req.user._id,
            { $set: { cartItems: [] } }
        );

        res.status(200).json({
            success: true,
            message: 'Cart cleared successfully'
        });

    } catch (error) {
        console.error('Clear cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
}
module.exports = { 
    addToCard,
    getCart,
    updateCartItem,
    removeFromCart,
    clearCart
}