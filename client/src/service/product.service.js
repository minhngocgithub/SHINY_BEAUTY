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
export const uploadApi = async(file) => {
    return await axiosApiInstance.post('/upload', file)
}
// Sales products
export const getSaleProductsApi = async() => {
    return await axiosApiInstance.get(`${BASE_PRODUCT_API}/sale`)
}
export const getFlashSaleProductsApi = async() => {
    return await axiosApiInstance.get(`${BASE_PRODUCT_API}/flash-sale`)
}
export const setSaleForProductApi = async(id, data) => {
    return await axiosApiInstance.put(`${BASE_PRODUCT_API}/${id}/sale`, data)
}
export const endSaleForProductApi = async(id) => {
    return await axiosApiInstance.put(`${BASE_PRODUCT_API}/${id}/sale/end`)
}
export const setFlashSaleForProductApi = async(id, data) => {
    return await axiosApiInstance.put(`${BASE_PRODUCT_API}/${id}/flash-sale`, data)
}
export const getSaleStatisticsApi = async() => {
    return await axiosApiInstance.get(`${BASE_PRODUCT_API}/sale/statistics`)
}
export const setBulkSaleApi = async(data) => {
    return await axiosApiInstance.get(`${BASE_PRODUCT_API}/bulk-sale`, data)
}
export const updateSalePriceApi = async(id, data) => {
    return await axiosApiInstance.put(`${BASE_PRODUCT_API}/${id}/sale/update`, data)
}
export const getExpiredSalesApi = async() => {
    return await axiosApiInstance.get(`${BASE_PRODUCT_API}/expired-sales`)
}
export const cleanupExpiredSalesApi = async() => {
    return await axiosApiInstance.put(`${BASE_PRODUCT_API}/cleanup-expired-sales`)
}
export const setSaleForCategoryApi = async(categoryId, data) => {
    return await axiosApiInstance.post(`${BASE_PRODUCT_API}/sale/category/${categoryId}`, data)
}
export const setSaleForBrandApi = async(brandName, data) => {
    return await axiosApiInstance.post(`${BASE_PRODUCT_API}/sale/brand/${brandName}`, data)
}
export const setSaleForMultipleCategoriesApi = async(data) => {
    return await axiosApiInstance.post(`${BASE_PRODUCT_API}/sale/categories`, data)
}
export const endSaleForCategoryApi = async(categoryId) => {
    return await axiosApiInstance.delete(`${BASE_PRODUCT_API}/sale/category/${categoryId}`)
}
// Featured products
export const getFeaturedProductApi = async(params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    return await axiosApiInstance.get(`/product/featured${queryString ? `?${queryString}` : ''}`)
}

export const getFeaturedByTypeApi = async(type, params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    return await axiosApiInstance.get(`/product/featured/${type}${queryString ? `?${queryString}` : ''}`)
}

export const setProductFeaturedApi = async(id, data) => {
    return await axiosApiInstance.put(`/product/featured/${id}`, data)
}

export const removeProductFeaturedApi = async(id, data = {}) => {
    return await axiosApiInstance.delete(`/product/featured/${id}`, { data })
}

export const updateFeaturedOrderApi = async(products) => {
    return await axiosApiInstance.put(`/product/featured/order`, { products })
}

// FIX: Sửa typo từ 'faetured' thành 'featured'
export const trackFeaturedInteractionApi = async(id, type) => {
    return await axiosApiInstance.post(`/product/featured/${id}/track`, { type })
}

export const getFeaturedAnalyticsApi = async(params = {}) => {
    const queryString = new URLSearchParams(params).toString() 
    return await axiosApiInstance.get(`/product/featured/analytics${queryString ? `?${queryString}` : ''}`)
}

export const autoPromoteFeaturedApi = async(data) => {
    return await axiosApiInstance.post(`/product/featured/auto-promote`, data)
}

// Trending Products APIs
export const getTrendingProductsApi = async(params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    return await axiosApiInstance.get(`/product/featured/trending${queryString ? `?${queryString}` : ''}`)
}

export const updateTrendingScoreApi = async(id) => {
    return await axiosApiInstance.post(`/product/${id}/trending/update`)
}

export const bulkUpdateTrendingScoresApi = async() => {
    return await axiosApiInstance.post(`/product/trending/bulk-update`)
}