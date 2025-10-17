import axios from "axios"
import axiosApiInstance from '../../utils/api'
axios.defaults.baseURL = import.meta.env.VITE_API_URL
const BASE_CART_API = '/cart'

export const getCartApi = async () => {
  return await axiosApiInstance.get(BASE_CART_API)
}

export const addToCartApi = async data => {
  return await axiosApiInstance.post(`${BASE_CART_API}/add`, data)
}

export const updateCartItemApi = async data => {
  return await axiosApiInstance.put(`${BASE_CART_API}/update`, data)
}

export const removeFromCartApi = async itemId => {
  return await axiosApiInstance.delete(`${BASE_CART_API}/remove/${itemId}`)
}

export const clearCartApi = async () => {
  return await axiosApiInstance.delete(`${BASE_CART_API}/clear`)
}

export const calculateCartTotals = cartSummary => {
  if (!cartSummary) {
    return {
      subtotal: '0.00',
      totalItems: 0,
      discount: '0.00',
      tax: '0.00',
      shipping: '0.00',
      total: '0.00'
    }
  }

  const subtotal = cartSummary.subtotal || 0
  const discount = cartSummary.totalDiscount || 0
  const tax = (subtotal - discount) * 0.1
  const shipping = subtotal > 50 ? 0 : 5.99
  const total = subtotal - discount + tax + shipping

  return {
    subtotal: subtotal.toFixed(2),
    totalItems: cartSummary.totalItems || 0,
    discount: discount.toFixed(2),
    tax: tax.toFixed(2),
    shipping: shipping.toFixed(2),
    total: total.toFixed(2),
    freeShipping: shipping === 0,
    bonusPoints: cartSummary.cartBenefits?.bonusPoints || 0
  }
}

export const validateCartItem = (product, quantity) => {
  if (!product || !product._id) {
    return { valid: false, message: 'Invalid product' }
  }

  if (quantity <= 0) {
    return { valid: false, message: 'Quantity must be greater than 0' }
  }

  if (quantity > product.countInstock) {
    return {
      valid: false,
      message: `Only ${product.countInstock} items available`
    }
  }

  if (product.countInstock === 0) {
    return { valid: false, message: 'Product is out of stock' }
  }

  if (product.flashSale?.isFlashSale) {
    if (quantity > product.flashSale.maxQuantityPerUser) {
      return {
        valid: false,
        message: `Maximum ${product.flashSale.maxQuantityPerUser} items per customer`
      }
    }

    if (quantity > product.flashSale.saleStock) {
      return {
        valid: false,
        message: `Only ${product.flashSale.saleStock} items available in flash sale`
      }
    }
  }

  return { valid: true }
}

export const formatCartItem = item => {
  const isProduct = item.itemType === 'product' || item.product
  const itemData = isProduct ? item.product : item.bundle
  if (!itemData) return null

  const price =
    item.finalPrice ||
    itemData.salePrice ||
    itemData.price ||
    itemData.bundlePrice ||
    0
  const originalPrice =
    item.originalPrice || itemData.price || itemData.originalPrice || price
  const discount = originalPrice - price

  return {
    ...item,
    displayPrice: price.toFixed(2),
    originalPrice: originalPrice.toFixed(2),
    subtotal: (price * item.quantity).toFixed(2),
    discount: discount.toFixed(2),
    totalDiscount: (discount * item.quantity).toFixed(2),
    savings: item.savings || 0,
    name: itemData.name,
    image: itemData.images?.[0] || itemData.image?.[0] || itemData.image,
    brand: itemData.brand,
    isProduct,
    hasDiscount: discount > 0
  }
}

export const getLocalCart = () => {
  try {
    const cart = localStorage.getItem('cart')
    return cart ? JSON.parse(cart) : []
  } catch (error) {
    console.error('Error getting local cart:', error)
    return []
  }
}

export const saveLocalCart = cartItems => {
  try {
    localStorage.setItem('cart', JSON.stringify(cartItems))
  } catch (error) {
    console.error('Error saving local cart:', error)
  }
}

export const mergeCartWithServer = async () => {
  try {
    const localCart = getLocalCart()
    if (localCart.length === 0) return

    for (const item of localCart) {
      const productId = item.product?._id || item.productId
      const bundleId = item.bundle?._id || item.bundleId

      if (productId || bundleId) {
        try {
          await addToCartApi({
            productId,
            bundleId,
            quantity: item.quantity
          })
        } catch (error) {
          console.warn('Could not add item to cart:', error)
        }
      }
    }

    localStorage.removeItem('cart')
    console.log('Cart merged with server successfully')
  } catch (error) {
    console.error('Error merging cart:', error)
  }
}

export const getCartCount = cartResponse => {
  if (!cartResponse) return 0

  if (cartResponse.summary?.totalItems) {
    return cartResponse.summary.totalItems
  }

  if (cartResponse.cartCount !== undefined) {
    return cartResponse.cartCount
  }

  if (Array.isArray(cartResponse.cartItems)) {
    return cartResponse.cartItems.reduce(
      (sum, item) => sum + (item.quantity || 0),
      0
    )
  }

  return 0
}
