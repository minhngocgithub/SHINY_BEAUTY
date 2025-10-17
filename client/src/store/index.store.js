import { getInfo } from '../service/auth.service'
import { useAuthStore } from './auth.store'
import { useCartStore } from './cart.store'
import { useWishlistStore } from './wishlist.store'

export const initAuthStore = async () => {
  const authStore = useAuthStore()
  const cartStore = useCartStore()
  const wishlistStore = useWishlistStore()

  const accessToken = localStorage.getItem('accessToken')

  if (accessToken) {
    try {
      const { data } = await getInfo()
      authStore.setAuthStore({
        user: data,
        isLoggedIn: true,
      })

      // Load cart, wishlist, and sync after login
      await Promise.all([
        cartStore.syncCartAfterLogin(),
        wishlistStore.syncWishlistAfterLogin()
      ])

      console.log('✅ Auth initialized successfully')
    } catch (error) {
      console.error('Auth initialization failed:', error)
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      window.location.reload()
    }
  } else {
    // Load local cart and wishlist for guests
    try {
      await Promise.all([
        cartStore.fetchCart(),
        wishlistStore.fetchWishlist()
      ])
      console.log('✅ Guest data loaded successfully')
    } catch (error) {
      console.error('Failed to load guest data:', error)
    }
  }
}