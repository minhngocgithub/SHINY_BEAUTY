import axios from "axios";
import axiosApiInstance from '../../utils/api'

axios.defaults.baseURL = import.meta.env.VITE_API_URL
const BASE_SUBCATEGORY_API = '/subCategory'

export const getCategoriesApi = async() => {
    return await axiosApiInstance.get(`${BASE_SUBCATEGORY_API}/all-subcategory`)
}

export const addNewCategoryApi = async() => {
    return await axiosApiInstance.post(`${BASE_SUBCATEGORY_API}/add-subcategory`)
}

export const updateCategoryApi = async() => {
    return await axiosApiInstance.put(`${BASE_SUBCATEGORY_API}/update-subcategory`)
}

export const deleteCategoryApi = async() => {
    return await axiosApiInstance.delete(`${BASE_SUBCATEGORY_API}/delete-subcategory`)
}