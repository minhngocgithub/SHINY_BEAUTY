import axiosApiInstance from "../../utils/api";
import axios from "axios";

axios.defaults.baseURL = import.meta.env.VITE_API_URL;
const BASE_BUNDLE_API = '/bundle';

export const getAllBundlesApi = async (params = {}) => {
  return await axiosApiInstance.get(`${BASE_BUNDLE_API}/all`, { params });
};

export const getBundleByIdApi = async (bundleId) => {
  return await axiosApiInstance.get(`${BASE_BUNDLE_API}/${bundleId}`);
};

export const searchBundlesApi = async (params = {}) => {
  return await axiosApiInstance.get(`${BASE_BUNDLE_API}/search`, { params });
};

export const checkBundleStockApi = async (bundleId) => {
  return await axiosApiInstance.get(`${BASE_BUNDLE_API}/${bundleId}/stock`);
};

export const getFeaturedBundlesApi = async (params = {}) => {
  return await axiosApiInstance.get(`${BASE_BUNDLE_API}/featured`, { params });
};

export const getBundlesByCategoryApi = async (categoryId, params = {}) => {
  return await axiosApiInstance.get(`${BASE_BUNDLE_API}/category/${categoryId}`, { params });
};
export const getBundlesByProductApi = async (productId, params = {}) => {
  return await axiosApiInstance.get(`${BASE_BUNDLE_API}/product/${productId}`, { params });
};
export const getAdminBundlesApi = async (params = {}) => {
  return await axiosApiInstance.get(`${BASE_BUNDLE_API}/admin/all`, { params });
};

export const createBundleApi = async (bundleData) => {
  return await axiosApiInstance.post(`${BASE_BUNDLE_API}/admin/create`, bundleData);
};

export const updateBundleApi = async (bundleId, bundleData) => {
  return await axiosApiInstance.put(`${BASE_BUNDLE_API}/${bundleId}`, bundleData);
};

export const deleteBundleApi = async (bundleId) => {
  return await axiosApiInstance.delete(`${BASE_BUNDLE_API}/${bundleId}`);
};

export const uploadBundleImageApi = async (formData) => {
  return await axiosApiInstance.post(`${BASE_BUNDLE_API}/admin/upload-image`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

export const calculateBundleSavings = (bundle) => {
  if (!bundle) return { savings: 0, percentage: 0 };
  
  const savings = bundle.originalPrice - bundle.bundlePrice;
  const percentage = bundle.originalPrice > 0 
    ? Math.round((savings / bundle.originalPrice) * 100) 
    : 0;
  
  return { savings, percentage };
};

export const isBundleAvailable = (bundle) => {
  return bundle && bundle.isActive && bundle.items && bundle.items.length > 0;
};

export const formatBundleData = (bundle) => {
  if (!bundle) return null;
  
  const { savings, percentage } = calculateBundleSavings(bundle);
  
  return {
    ...bundle,
    formattedSavings: savings,
    discountPercentage: percentage,
    isAvailable: isBundleAvailable(bundle)
  };
};

export const getBundlesByIdsApi = async (bundleIds) => {
  const promises = bundleIds.map(id => getBundleByIdApi(id));
  return await Promise.all(promises);
};

export const bulkUpdateBundlesApi = async (updates) => {
  const promises = updates.map(({ bundleId, data }) => 
    updateBundleApi(bundleId, data)
  );
  return await Promise.all(promises);
};
