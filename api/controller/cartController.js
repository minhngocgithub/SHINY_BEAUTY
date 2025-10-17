const Product = require("../models/product.models")
const User = require("../models/user.models")
const ProductBundle = require("../models/productBundle.models")
const SaleProgramUtils = require("../utils/saleProgram.utils")

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
        const cartWithPrograms = await SaleProgramUtils.applyProgramsToCart(user.cartItems, user);
        let subtotal = 0;
        let totalItems = 0;
        let totalDiscount = 0;

        const enhancedCartItems = cartWithPrograms.map(item => {
            const itemSubtotal = item.finalPrice || 0;
            const itemDiscount = item.discount || 0;
            
            subtotal += itemSubtotal;
            totalItems += item.quantity;
            totalDiscount += itemDiscount;

            return {
                ...item.toObject ? item.toObject() : item,
                savings: (item.originalPrice || 0) - itemSubtotal,
                discountSource: item.appliedProgram ? 'sale_program' : 
                               (item.product?.isSaleActive ? 'product_sale' : 'none'),
                finalPrice: itemSubtotal,
                discount: itemDiscount
            };
        });

        // Get cart-level programs (free shipping, gifts, etc.)
        const cartLevelPrograms = await SaleProgramUtils.getCartLevelPrograms(
            { subtotal, items: enhancedCartItems }, 
            user
        );

        // Apply cart-level benefits
        const cartBenefits = SaleProgramUtils.applyCartLevelBenefits(
            { subtotal }, 
            cartLevelPrograms
        );

        res.status(200).json({
            success: true,
            cartItems: enhancedCartItems,
            summary: {
                totalItems,
                subtotal: subtotal,
                totalDiscount: totalDiscount + cartBenefits.additionalDiscount,
                itemCount: user.cartItems.length,
                cartBenefits,
                applicablePrograms: cartLevelPrograms.map(program => ({
                    id: program._id,
                    title: program.title,
                    type: program.type,
                    description: program.shortDescription
                }))
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