import axios from "axios";
import { refreshAccessToken } from "../src/service/auth.service";

const excludeUrls = ['/users/login', '/users/refresh-token']
const axiosApiInstance = axios.create()

axiosApiInstance.defaults.baseURL = import.meta.env.VITE_API_URL
// Request interceptor API Calls
axiosApiInstance.interceptors.request.use(
    async (config) => {
        const access_token = localStorage.getItem('accessToken')
        config.headers = {
            Authorization: `Bearer ${access_token}`,
            Accept: 'application/json'
        }
        return config
    },
    (error) => {
        Promise.reject(error)
    }
)
// Response interceptor API Calls
axiosApiInstance.interceptors.response.use(
    (response) => {
        return response
    },
    async (error) => {
        const originalRequest = error.config
        if(
            error.response && error.response.status === 401 
            && !originalRequest._retry && !excludeUrls.includes(originalRequest.url)
        ) {
            originalRequest._retry = true
            try {
                const token = await refreshAccessToken()
                localStorage.setItem('accessToken', token.data.accessToken)
                localStorage.setItem('refreshToken', token.data.refreshToken)
                axios.defaults.headers.common['Authorization'] = 'Bearer' + token.data.accessToken
                return axiosApiInstance(originalRequest)
            } catch (error) {
                console.error("Error: ", error, originalRequest.url);
                localStorage.clear()
                window.location.href = '/login'
            }
        }
        return Promise.reject(error)
    }
)
export default axiosApiInstance