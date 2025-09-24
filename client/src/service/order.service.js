import axiosApiInstance from "../../utils/api";
axios.defaults.baseURL = import.meta.env.VITE_API_URL
const BASE_ORDER_API = '/order'
import { logoutAccountApi, getInfo } from "./auth.service";

export const createOrderApi = async(data) => {
    return await axiosApiInstance.post(`${BASE_ORDER_API}/`, data)
}
