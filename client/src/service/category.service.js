import axios from "axios";
import axiosApiInstance from '../../utils/api'

axios.defaults.baseURL = import.meta.env.VITE_API_URL
const BASE_CATEGORY_API = '/category'

export const getCategoriesApi = async() => {
    return await axiosApiInstance.get(`${BASE_CATEGORY_API}/all-category`)
}

export const addNewCategoryApi = async() => {
    return await axiosApiInstance.post(`${BASE_CATEGORY_API}/add-category`)
}

export const updateCategoryApi = async() => {
    return await axiosApiInstance.put(`${BASE_CATEGORY_API}/update-category`)
}

export const deleteCategoryApi = async() => {
    return await axiosApiInstance.delete(`${BASE_CATEGORY_API}/delete-category`)
}