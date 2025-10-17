import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from './auth.store'
import {
    getWishlistApi,
    addToWishlistApi,
    removeFromWishlistApi,
    checkInWishlistApi,
    clearWishlistApi,
    moveToCartApi,
    getPriceChangesApi,
    formatWishlistItem,
    getLocalWishlist,
    saveLocalWishlist,
    mergeWishlistWithServer
} from '../service/wishList.service'

export const useWishlistStore = defineStore('wishlist', () => {
    const authStore = useAuthStore()

    // State
    const wishlistItems = ref([])
    const priceChanges = ref([])
    const loading = ref(false)
    const error = ref(null)

    // Computed
    const wishlistCount = computed(() => wishlistItems.value.length)

    const isEmpty = computed(() => wishlistItems.value.length === 0)

    const formattedWishlistItems = computed(() => {
        return wishlistItems.value
            .map(item => formatWishlistItem(item))
            .filter(item => item !== null)
    })

    const itemsWithPriceDrops = computed(() => {
        return formattedWishlistItems.value.filter(item => item.isPriceLower)
    })

    const totalSavings = computed(() => {
        return itemsWithPriceDrops.value
            .reduce((sum, item) => sum + parseFloat(item.priceDiff), 0)
            .toFixed(2)
    })

    // Actions
    const fetchWishlist = async () => {
        try {
            loading.value = true
            error.value = null

            // If not logged in, use local wishlist
            if (!authStore.state.isLoggedIn) {
                const localWishlist = getLocalWishlist()
                wishlistItems.value = localWishlist
                console.log('Loaded local wishlist:', localWishlist.length, 'items')
                return
            }

            // Fetch from server if logged in
            const response = await getWishlistApi()

            if (response.data.success) {
                wishlistItems.value = response.data.wishlist?.items || []
                console.log('Loaded wishlist from server:', wishlistItems.value.length, 'items')
            }
        } catch (err) {
            error.value = err.response?.data?.message || 'Failed to fetch wishlist'
            console.error('Fetch wishlist error:', err)

            // Fallback to local wishlist on error
            if (!authStore.state.isLoggedIn) {
                wishlistItems.value = getLocalWishlist()
            }
        } finally {
            loading.value = false
        }
    }

    const addToWishlist = async (product) => {
        try {
            loading.value = true
            error.value = null

            if (!product || !product._id) {
                throw new Error('Invalid product')
            }

            if (!authStore.state.isLoggedIn) {
                // Add to local wishlist for guests
                addToLocalWishlist(product)
                return {
                    success: true,
                    message: 'Added to wishlist'
                }
            }

            const response = await addToWishlistApi(product._id)

            if (response.data.success) {
                wishlistItems.value = response.data.wishlist?.items || []
                console.log('Product added to wishlist. Total:', wishlistItems.value.length)
                return {
                    success: true,
                    message: response.data.message || 'Added to wishlist successfully'
                }
            }
        } catch (err) {
            const message = err.response?.data?.message || err.message || 'Failed to add to wishlist'
            error.value = message
            console.error('Add to wishlist error:', err)
            throw err
        } finally {
            loading.value = false
        }
    }

    const removeFromWishlist = async (productId) => {
        try {
            loading.value = true
            error.value = null

            if (!authStore.state.isLoggedIn) {
                removeFromLocalWishlist(productId)
                return
            }

            const response = await removeFromWishlistApi(productId)

            if (response.data.success) {
                wishlistItems.value = wishlistItems.value.filter(
                    item => item.product?._id !== productId
                )
                console.log('Product removed from wishlist. Total:', wishlistItems.value.length)
                return {
                    success: true,
                    message: response.data.message || 'Removed from wishlist'
                }
            }
        } catch (err) {
            error.value = err.response?.data?.message || 'Failed to remove from wishlist'
            console.error('Remove from wishlist error:', err)
            throw err
        } finally {
            loading.value = false
        }
    }

    const toggleWishlist = async (product) => {
        const exists = isInWishlist(product._id)

        if (exists) {
            await removeFromWishlist(product._id)
            return { action: 'removed' }
        } else {
            await addToWishlist(product)
            return { action: 'added' }
        }
    }

    const isInWishlist = (productId) => {
        return wishlistItems.value.some(
            item => item.product?._id === productId || item.productId === productId
        )
    }

    const clearWishlist = async () => {
        try {
            loading.value = true
            error.value = null

            if (!authStore.state.isLoggedIn) {
                localStorage.removeItem('wishlist')
                wishlistItems.value = []
                return
            }

            const response = await clearWishlistApi()

            if (response.data.success) {
                wishlistItems.value = []
                console.log('Wishlist cleared')
            }
        } catch (err) {
            error.value = err.response?.data?.message || 'Failed to clear wishlist'
            console.error('Clear wishlist error:', err)
            throw err
        } finally {
            loading.value = false
        }
    }

    const moveToCart = async (productId, quantity = 1) => {
        try {
            loading.value = true
            error.value = null

            if (!authStore.state.isLoggedIn) {
                throw new Error('Please login to move items to cart')
            }

            const response = await moveToCartApi(productId, quantity)

            if (response.data.success) {
                wishlistItems.value = wishlistItems.value.filter(
                    item => item.product?._id !== productId
                )

                return {
                    success: true,
                    message: response.data.message || 'Moved to cart successfully'
                }
            }
        } catch (err) {
            error.value = err.response?.data?.message || err.message || 'Failed to move to cart'
            console.error('Move to cart error:', err)
            throw err
        } finally {
            loading.value = false
        }
    }

    const fetchPriceChanges = async () => {
        try {
            loading.value = true
            error.value = null

            if (!authStore.state.isLoggedIn) {
                priceChanges.value = []
                return
            }

            const response = await getPriceChangesApi()

            if (response.data.success) {
                priceChanges.value = response.data.priceChanges || []
            }
        } catch (err) {
            console.error('Fetch price changes error:', err)
            priceChanges.value = []
        } finally {
            loading.value = false
        }
    }

    // Local wishlist helpers
    const addToLocalWishlist = (product) => {
        const localWishlist = getLocalWishlist()
        const exists = localWishlist.some(item => item.product._id === product._id)

        if (!exists) {
            localWishlist.push({
                _id: `local_${Date.now()}`,
                product,
                addedAt: new Date().toISOString(),
                priceWhenAdded: product.salePrice || product.price
            })
            saveLocalWishlist(localWishlist)
            wishlistItems.value = localWishlist
            console.log('Added to local wishlist. Total:', localWishlist.length)
        }
    }

    const removeFromLocalWishlist = (productId) => {
        let localWishlist = getLocalWishlist()
        localWishlist = localWishlist.filter(item => item.product._id !== productId)
        saveLocalWishlist(localWishlist)
        wishlistItems.value = localWishlist
        console.log('Removed from local wishlist. Total:', localWishlist.length)
    }

    const syncWishlistAfterLogin = async () => {
        try {
            console.log('Starting wishlist sync...')
            await mergeWishlistWithServer()
            await fetchWishlist()
            console.log('Wishlist synced successfully')
        } catch (err) {
            console.error('Sync wishlist error:', err)
        }
    }

    return {
        wishlistItems,
        priceChanges,
        loading,
        error,

        wishlistCount,
        isEmpty,
        formattedWishlistItems,
        itemsWithPriceDrops,
        totalSavings,

        fetchWishlist,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        isInWishlist,
        clearWishlist,
        moveToCart,
        fetchPriceChanges,
        syncWishlistAfterLogin
    }
})