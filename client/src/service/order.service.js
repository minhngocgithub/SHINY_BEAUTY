import axiosApiInstance from "../../utils/api";
axios.defaults.baseURL = import.meta.env.VITE_API_URL
const BASE_ORDER_API = '/order'

export const createOrderApi = async (data) => {
  return await axiosApiInstance.post(`${BASE_ORDER_API}/`, data)
}
export const getMyOrdersApi = async (params = {}) => {
  return await axiosApiInstance.get(`${BASE_ORDER_API}/myOrders`, { params })
}

export const getOrderDetailApi = async (orderId) => {
  return await axiosApiInstance.get(`${BASE_ORDER_API}/${orderId}`)
}

export const cancelOrderApi = async (orderId) => {
  return await axiosApiInstance.put(`${BASE_ORDER_API}/${orderId}/cancel`)
}

export const updateOrderToPaidApi = async (orderId, paymentData) => {
  return await axiosApiInstance.put(`${BASE_ORDER_API}/${orderId}/pay`, paymentData)
}

export const getAllOrdersApi = async (params = {}) => {
  return await axiosApiInstance.get(`${BASE_ORDER_API}/all`, { params })
}

export const updateOrderToDeliveredApi = async (orderId) => {
  return await axiosApiInstance.put(`${BASE_ORDER_API}/${orderId}/deliver`)
}