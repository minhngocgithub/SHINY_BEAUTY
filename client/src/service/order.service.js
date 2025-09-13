import axiosApiInstance from "../../utils/api";
import { CART_CLEAR_ITEMS } from '../constants/cartConstant'
axios.defaults.baseURL = import.meta.env.VITE_API_URL
const BASE_ORDER_API = '/order'
import { logoutAccountApi, getInfo } from "./auth.service";

export const getAllOrderApi = 