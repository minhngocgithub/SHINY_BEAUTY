import axios from "axios"
import axiosApiInstance from "../../utils/api"
axios.defaults.baseURL = import.meta.env.VITE_API_URL
const BASE_CATEGORY_API = "/category"

export const getCategoriesApi = async () => {
  return await axiosApiInstance.get(`${BASE_CATEGORY_API}/all-category`)
}

export const addNewCategoryApi = async (data) => {
  return await axiosApiInstance.post(`${BASE_CATEGORY_API}/add-category`, data)
}

export const updateCategoryApi = async (data) => {
  return await axiosApiInstance.put(`${BASE_CATEGORY_API}/update-category`, data)
}

export const deleteCategoryApi = async (data) => {
  return await axiosApiInstance.delete(`${BASE_CATEGORY_API}/delete-category`, { data })
}

// New hierarchical endpoints
export const getCategoryTreeApi = async () => {
  return await axiosApiInstance.get(`${BASE_CATEGORY_API}/tree`)
}

export const getRootCategoriesWithChildrenApi = async () => {
  return await axiosApiInstance.get(`${BASE_CATEGORY_API}/root-with-children`)
}

export const getCategoryBySlugApi = async (slug) => {
  return await axiosApiInstance.get(`${BASE_CATEGORY_API}/slug/${slug}`)
}

export const getCategoryBreadcrumbApi = async (slug) => {
  return await axiosApiInstance.get(`${BASE_CATEGORY_API}/breadcrumb/${slug}`)
}

export const createCategoryApi = async (payload) => {
  return await axiosApiInstance.post(`${BASE_CATEGORY_API}`, payload)
}

export const updateCategoryNewApi = async (payload) => {
  return await axiosApiInstance.put(`${BASE_CATEGORY_API}`, payload)
}

export const updateCategoryHierarchyApi = async (payload) => {
  return await axiosApiInstance.put(`${BASE_CATEGORY_API}/hierarchy`, payload)
}

export const getCategorySlug = (name) => {
  return name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9-]/g, "")
}

export const getCategoryBySlug = (categories, slug) => {
  return categories.find((cat) => getCategorySlug(cat.name) === slug)
}
