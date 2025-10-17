import axios from "axios"
import axiosApiInstance from "../../utils/api";
const BASE_SALE_PROGRAM_API = "/sale-programs"

export const getActiveSaleProgramsApi = async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return await axiosApiInstance.get(
        `${BASE_SALE_PROGRAM_API}/active${queryString ? `?${queryString}` : ''}`
    );
};

export const getSaleProgramByIdApi = async (id) => {
    return await axiosApiInstance.get(`${BASE_SALE_PROGRAM_API}/${id}`);
};

export const getProductsBySaleProgramApi = async (id, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return await axiosApiInstance.get(
        `${BASE_SALE_PROGRAM_API}/${id}/products${queryString ? `?${queryString}` : ''}`
    );
};

export const getBundlesBySaleProgramApi = async (id, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return await axiosApiInstance.get(
        `${BASE_SALE_PROGRAM_API}/${id}/bundles${queryString ? `?${queryString}` : ''}`
    );
};

export const validateCouponCodeApi = async (code) => {
    return await axiosApiInstance.post(
        `${BASE_SALE_PROGRAM_API}/validate-coupon`, 
        { code }
    );
};

// ==================== ADMIN APIs ====================

export const createSaleProgramApi = async (data) => {
    const isFormData = data instanceof FormData;
    
    return await axiosApiInstance.post(
        `${BASE_SALE_PROGRAM_API}/admin/create`,
        data,
        isFormData ? {
            headers: { 'Content-Type': 'multipart/form-data' }
        } : undefined
    );
};

export const getAllSaleProgramsApi = async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return await axiosApiInstance.get(
        `${BASE_SALE_PROGRAM_API}/admin/all${queryString ? `?${queryString}` : ''}`
    );
};
export const updateSaleProgramApi = async (id, data) => {
    const isFormData = data instanceof FormData;
    
    return await axiosApiInstance.put(
        `${BASE_SALE_PROGRAM_API}/admin/${id}`,
        data,
        isFormData ? {
            headers: { 'Content-Type': 'multipart/form-data' }
        } : undefined
    );
};

export const deleteSaleProgramApi = async (id) => {
    return await axiosApiInstance.delete(`${BASE_SALE_PROGRAM_API}/admin/${id}`);
};

export const syncProductsToSaleProgramApi = async (id, options = {}) => {
    return await axiosApiInstance.post(
        `${BASE_SALE_PROGRAM_API}/admin/${id}/sync-products`,
        options
    );
};

export const syncBundlesToSaleProgramApi = async (id, options = {}) => {
    return await axiosApiInstance.post(
        `${BASE_SALE_PROGRAM_API}/admin/${id}/sync-bundles`,
        options
    );
};
export const getSaleProgramAnalyticsApi = async (id) => {
    return await axiosApiInstance.get(`${BASE_SALE_PROGRAM_API}/admin/${id}/analytics`);
};

export const toggleSaleProgramStatusApi = async (id, action) => {
    return await axiosApiInstance.patch(
        `${BASE_SALE_PROGRAM_API}/admin/${id}/toggle-status`,
        { action }
    );
};

export const uploadSaleProgramBannerApi = async (file) => {
    const formData = new FormData();
    formData.append('banner', file);
    
    return await axiosApiInstance.post(
        `${BASE_SALE_PROGRAM_API}/admin/upload-banner`,
        formData,
        {
            headers: { 'Content-Type': 'multipart/form-data' }
        }
    );
};

// ==================== HELPER FUNCTIONS ===================
export const buildSaleProgramFormData = (data, bannerFile = null) => {
    const formData = new FormData();
    
    // Basic fields
    if (data.title) formData.append('title', data.title);
    if (data.description) formData.append('description', data.description);
    if (data.shortDescription) formData.append('shortDescription', data.shortDescription);
    if (data.type) formData.append('type', data.type);
    if (data.startDate) formData.append('startDate', data.startDate);
    if (data.endDate) formData.append('endDate', data.endDate);
    if (data.maxUsage) formData.append('maxUsage', data.maxUsage);
    if (data.targetType) formData.append('targetType', data.targetType);
    if (data.stacking !== undefined) formData.append('stacking', data.stacking);
    if (data.autoPopulateProducts !== undefined) {
        formData.append('autoPopulateProducts', data.autoPopulateProducts);
    }
    if (data.autoPopulateBundles !== undefined) {
        formData.append('autoPopulateBundles', data.autoPopulateBundles);
    }
    
    // Complex objects - JSON stringify
    if (data.conditions) {
        formData.append('conditions', JSON.stringify(data.conditions));
    }
    if (data.benefits) {
        formData.append('benefits', JSON.stringify(data.benefits));
    }
    if (data.displaySettings) {
        formData.append('displaySettings', JSON.stringify(data.displaySettings));
    }
    if (data.targetUsers) {
        formData.append('targetUsers', JSON.stringify(data.targetUsers));
    }
    if (data.exclusiveWith) {
        formData.append('exclusiveWith', JSON.stringify(data.exclusiveWith));
    }
    
    // Banner image
    if (bannerFile) {
        formData.append('banner', bannerFile);
    } else if (data.bannerImage) {
        formData.append('bannerImage', data.bannerImage);
    }
    
    return formData;
};

export const formatSaleProgramForDisplay = (program) => {
    return {
        id: program._id || program.id,
        title: program.title,
        slug: program.slug,
        description: program.description,
        shortDescription: program.shortDescription,
        bannerImage: program.bannerImage,
        type: program.type,
        discountPercentage: program.benefits?.discountPercentage || 0,
        discountAmount: program.benefits?.discountAmount || 0,
        startDate: program.startDate,
        endDate: program.endDate,
        timeRemaining: program.timeRemaining,
        isActive: program.isCurrentlyActive,
        stats: program.stats
    };
}

export const isSaleProgramActive = (program) => {
    if (!program) return false;
    
    const now = new Date();
    const startDate = new Date(program.startDate);
    const endDate = program.endDate ? new Date(program.endDate) : null;
    
    return (
        program.isActive &&
        program.status === 'active' &&
        startDate <= now &&
        (!endDate || endDate >= now) &&
        (!program.maxUsage || program.currentUsage < program.maxUsage)
    );
};

export const calculateTimeRemaining = (endDate) => {
    if (!endDate) return null;
    
    const now = new Date();
    const end = new Date(endDate);
    const remaining = end.getTime() - now.getTime();
    
    if (remaining <= 0) return 'Expired';
    
    const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} left`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} left`;
    return `${minutes} minute${minutes > 1 ? 's' : ''} left`;
};
