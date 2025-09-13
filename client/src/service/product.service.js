import axiosApiInstance from '../../utils/api'
import axios from 'axios'
axios.defaults.baseURL = import.meta.env.VITE_API_URL
const BASE_PRODUCT_API = '/product'

export const createProductApi = async(data) => {
    return await axiosApiInstance.post(`${BASE_PRODUCT_API}/addProduct`, data)
}
export const updateProductApi = async(id, data) => {
    return await axiosApiInstance.put(`${BASE_PRODUCT_API}/updateProduct/${id}`, data)
}
export const getAllProductsApi = async(data) => {
    return await axiosApiInstance.get(`${BASE_PRODUCT_API}/allProduct`, data)
}
export const getProductApi = async(id, data) => {
    return await axiosApiInstance.get(`${BASE_PRODUCT_API}/${id}`, data)
}
export const searchProductApi = async(query) => {
    return await axiosApiInstance.get(`${BASE_PRODUCT_API}?${query}`)
}
export const getNewProductApi = async(data) => {
    return await axiosApiInstance.get(`${BASE_PRODUCT_API}/newProduct`, data)
}
export const getBestSellerApi = async(data) => {
    return await axiosApiInstance.get(`${BASE_PRODUCT_API}/bestSeller`, data)
}
export const getFeaturedProductApi = async(data) => {
    return await axiosApiInstance.get(`${BASE_PRODUCT_API}/featured`, data)
}
export const uploadApi = async(file) => {
    return await axiosApiInstance.post('/upload', file)
}