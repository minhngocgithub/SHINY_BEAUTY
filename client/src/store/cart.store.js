import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from './auth.store'
import {
    addToCartApi,
    getCartApi,
    updateCartItemApi,
    removeFromCartApi,
    clearCartApi,
    calculateCartTotals,
    validateCartItem,
    formatCartItem,
    getLocalCart,
    saveLocalCart,
    mergeCartWithServer,
    getCartCount
} from '../service/cart.service'

export const useCartStore = defineStore('cart', () => {
    const authStore = useAuthStore()

    // State
    const cartItems = ref([])
    const cartSummary = ref(null)
    const loading = ref(false)
    const error = ref(null)

    // Computed
    const cartCount = computed(() => {
        if (cartSummary.value?.totalItems) {
            return cartSummary.value.totalItems
        }
        return cartItems.value.reduce((sum, item) => sum + (item.quantity || 0), 0)
    })

    const cartTotals = computed(() => {
        return calculateCartTotals(cartSummary.value)
    })

    const isEmpty = computed(() => cartItems.value.length === 0)

    const formattedCartItems = computed(() => {
        return cartItems.value.map(item => formatCartItem(item)).filter(item => item !== null)
    })

    // Actions
    const fetchCart = async (forceServer = false) => {
        try {
            loading.value = true
            error.value = null

            // Nếu forceServer = true, luôn fetch từ server (dùng sau khi login)
            // Ngược lại, kiểm tra xem user có login không
            const isLoggedIn = forceServer || authStore.state.isLoggedIn

            if (!isLoggedIn) {
                const localCart = getLocalCart()
                cartItems.value = localCart
                return
            }

            const response = await getCartApi()

            if (response.data.success) {
                cartItems.value = response.data.cartItems || []
                cartSummary.value = response.data.summary || null
            }
        } catch (err) {
            error.value = err.response?.data?.message || 'Failed to fetch cart'
            console.error('Fetch cart error:', err)

            // Fallback to local cart nếu không phải authenticated request
            if (!authStore.state.isLoggedIn) {
                cartItems.value = getLocalCart()
            }
        } finally {
            loading.value = false
        }
    }

    const addToCart = async ({ product, bundle, quantity = 1 }) => {
        try {
            loading.value = true
            error.value = null

            if (product) {
                const validation = validateCartItem(product, quantity)
                if (!validation.valid) {
                    throw new Error(validation.message)
                }
            }

            if (!authStore.state.isLoggedIn) {
                addToLocalCart(product, bundle, quantity)
                return { success: true, message: 'Added to cart' }
            }

            const requestData = { quantity }

            if (product) {
                requestData.productId = product._id
            } else if (bundle) {
                requestData.bundleId = bundle._id
            } else {
                throw new Error('Product or Bundle is required')
            }

            const response = await addToCartApi(requestData)

            if (response.data.success) {
                cartItems.value = response.data.cartItems || []
                cartSummary.value = response.data.summary || null

                return {
                    success: true,
                    message: response.data.message || 'Added to cart successfully',
                    cartCount: getCartCount(response.data)
                }
            }
        } catch (err) {
            error.value = err.response?.data?.message || err.message || 'Failed to add to cart'
            console.error('Add to cart error:', err)
            throw err
        } finally {
            loading.value = false
        }
    }

    const updateQuantity = async (itemId, quantity) => {
        try {
            loading.value = true
            error.value = null

            if (!authStore.state.isLoggedIn) {
                updateLocalCartQuantity(itemId, quantity)
                return
            }

            const response = await updateCartItemApi({ itemId, quantity })

            if (response.data.success) {
                cartItems.value = response.data.cartItems || []
                cartSummary.value = response.data.summary || null
            }
        } catch (err) {
            error.value = err.response?.data?.message || 'Failed to update cart'
            console.error('Update cart error:', err)
            throw err
        } finally {
            loading.value = false
        }
    }

    const removeItem = async (itemId) => {
        try {
            loading.value = true
            error.value = null

            if (!authStore.state.isLoggedIn) {
                removeFromLocalCart(itemId)
                return
            }

            const response = await removeFromCartApi(itemId)

            if (response.data.success) {
                cartItems.value = response.data.cartItems || []
                cartSummary.value = response.data.summary || null
            }
        } catch (err) {
            error.value = err.response?.data?.message || 'Failed to remove item'
            console.error('Remove item error:', err)
            throw err
        } finally {
            loading.value = false
        }
    }

    const clearCart = async () => {
        try {
            loading.value = true
            error.value = null

            if (!authStore.state.isLoggedIn) {
                localStorage.removeItem('cart')
                cartItems.value = []
                cartSummary.value = null
                return
            }

            const response = await clearCartApi()

            if (response.data.success) {
                cartItems.value = []
                cartSummary.value = null
            }
        } catch (err) {
            error.value = err.response?.data?.message || 'Failed to clear cart'
            console.error('Clear cart error:', err)
            throw err
        } finally {
            loading.value = false
        }
    }

    // Local cart helpers
    const addToLocalCart = (product, bundle, quantity) => {
        const localCart = getLocalCart()
        const itemData = product || bundle
        const itemType = product ? 'product' : 'bundle'

        const existingIndex = localCart.findIndex(item => {
            if (product) {
                return item.product?._id === product._id
            } else {
                return item.bundle?._id === bundle._id
            }
        })

        if (existingIndex > -1) {
            localCart[existingIndex].quantity += quantity
        } else {
            localCart.push({
                _id: `local_${Date.now()}`,
                [itemType]: itemData,
                quantity,
                itemType,
                addedAt: new Date().toISOString()
            })
        }

        saveLocalCart(localCart)
        cartItems.value = localCart
    }

    const updateLocalCartQuantity = (itemId, quantity) => {
        const localCart = getLocalCart()
        const item = localCart.find(i => i._id === itemId)
        if (item) {
            item.quantity = quantity
            saveLocalCart(localCart)
            cartItems.value = localCart
        }
    }

    const removeFromLocalCart = (itemId) => {
        let localCart = getLocalCart()
        localCart = localCart.filter(i => i._id !== itemId)
        saveLocalCart(localCart)
        cartItems.value = localCart
    }

    const syncCartAfterLogin = async () => {
        try {
            // Merge local cart với server
            await mergeCartWithServer()

            // Fetch cart từ server với forceServer = true
            // Để chắc chắn nó fetch từ server ngay cả khi state chưa update
            await fetchCart(true)

            console.log('✅ Cart synced successfully after login')
        } catch (err) {
            console.error('Sync cart error:', err)
        }
    }

    return {
        cartItems,
        cartSummary,
        loading,
        error,

        cartCount,
        cartTotals,
        isEmpty,
        formattedCartItems,

        fetchCart,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        syncCartAfterLogin
    }
})