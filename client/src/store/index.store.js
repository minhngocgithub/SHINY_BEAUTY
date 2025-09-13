import { getInfo } from '../service/auth.service'
import { useAuthStore } from './auth.store'


export const initAuthStore = async () => {
  const authStore = useAuthStore()
  const accessToken = localStorage.getItem('accessToken')
  if (accessToken) {
    try {
      const { data } = await getInfo()
      authStore.setAuthStore({
        user: data,
        isLoggedIn: true,
      })
    } catch (error) {
      console.log(error)
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      window.location.reload()
    }
    console.log('initAuthStore', authStore)
  }
}