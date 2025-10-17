import axios from "axios";
import axiosApiInstance from '../../utils/api'

axios.defaults.baseURL = import.meta.env.VITE_API_URL
const BASE_SUBCATEGORY_API = '/subCategory'

export const getSubCategoriesApi = async(categoryId) => {
    const params = categoryId ? { params: { categoryId } } : {}
    return await axiosApiInstance.get(`${BASE_SUBCATEGORY_API}/all-subcategory`, params)
}

export const addNewSubCategoryApi = async(data) => {
    return await axiosApiInstance.post(`${BASE_SUBCATEGORY_API}/add-subcategory`, data)
}

export const updateSubCategoryApi = async(data) => {
    return await axiosApiInstance.put(`${BASE_SUBCATEGORY_API}/update-subcategory`, data)
}

export const deleteSubCategoryApi = async(data) => {
    return await axiosApiInstance.delete(`${BASE_SUBCATEGORY_API}/delete-subcategory`, { data })
}