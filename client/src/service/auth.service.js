import axios from "axios"
import axiosApiInstance from "../../utils/api"
axios.defaults.baseURL = import.meta.env.VITE_API_URL
const BASE_URL = ""
const BASE_USER_API = "/users"
const BASE_USER_OTP_API = "/otp"

export const refreshAccessToken = async () => {
  const refresh_token = localStorage.getItem("newRefreshToken")
  const data = {
    newRefreshToken: refresh_token,
  }
  return await axios.post(`${BASE_USER_API}/refresh-token`, data)
}

export const loginApi = async (data) => {
  return await axiosApiInstance.post(`${BASE_USER_API}/login`, data, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  })
}

export const registerApi = async (data) => {
  return await axiosApiInstance.post(`${BASE_USER_API}/register`, data)
}

export const logoutAccountApi = async () => {
  console.log("logout")
  return await axiosApiInstance.post(`${BASE_USER_API}/logOut`)
}

export const getInfo = async () => {
  return await axiosApiInstance.get(`${BASE_USER_API}/profile`)
}

export const updateUserProfile = async (data) => {
  const response = await axiosApiInstance.put(`${BASE_USER_API}/profile/update`, data)
  return response.data
}


export const uploadAvatar = async (formData) => {
  return await axiosApiInstance.post(`${BASE_USER_API}/upload-avatar`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  })
}

export const sendOTPApi = async (data) => {
  return await axiosApiInstance.post(`${BASE_USER_OTP_API}/send-otp`, data)
}

export const resendOTPApi = async (data) => {
  return await axiosApiInstance.post(`${BASE_USER_OTP_API}/resend-otp`, data)
}

export const forgotPasswordApi = async (email) => {
  return await axiosApiInstance.post(`${BASE_USER_API}/password/forgot`, email)
}

export const resetPasswordApi = async (data) => {
  return await axiosApiInstance.post(`${BASE_USER_API}/password/reset/${data.token}`, { password: data.password })
}

// OAuth Services
export const getOAuthUrls = async () => {
  return await axios.get(`${BASE_URL}/auth/oauth/urls`)
}

export const linkOAuthAccount = async (data) => {
  return await axiosApiInstance.post(`${BASE_URL}/auth/oauth/link`, data)
}

export const unlinkOAuthAccount = async (data) => {
  return await axiosApiInstance.post(`${BASE_URL}/auth/oauth/unlink`, data)
}

