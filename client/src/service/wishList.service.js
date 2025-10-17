import axios from "axios"
import axiosApiInstance from "../../utils/api";
axios.defaults.baseURL = import.meta.env.VITE_API_URL
const BASE_WISHLIST_API = '/wishlist'

export const getWishlistApi = async () => {
    return await axiosApiInstance.get(BASE_WISHLIST_API);
}
export const addToWishlistApi = async (productId) => {
    return await axiosApiInstance.post(`${BASE_WISHLIST_API}/add`, { productId });
}
export const removeFromWishlistApi = async (productId) => {
    return await axiosApiInstance.delete(`${BASE_WISHLIST_API}/remove/${productId}`);
}
export const checkInWishlistApi = async (productId) => {
    return await axiosApiInstance.get(`${BASE_WISHLIST_API}/check/${productId}`);
}
export const clearWishlistApi = async () => {
    return await axiosApiInstance.delete(`${BASE_WISHLIST_API}/clear`);
}
export const moveToCartApi = async (productId, quantity = 1) => {
    return await axiosApiInstance.post(
        `${BASE_WISHLIST_API}/move-to-cart/${productId}`,
        { quantity }
    );
}
export const getPriceChangesApi = async () => {
    return await axiosApiInstance.get(`${BASE_WISHLIST_API}/price-changes`);
}
export const formatWishlistItem = (item) => {
    const product = item.product;
    if (!product) return null;

    const currentPrice = product.salePrice || product.price;
    const originalPrice = item.priceWhenAdded || product.price;
    const priceDiff = originalPrice - currentPrice;
    const pricePercentChange = originalPrice > 0 
        ? ((priceDiff / originalPrice) * 100).toFixed(2)
        : 0;

    return {
        ...item,
        product: {
            ...product,
            displayPrice: currentPrice.toFixed(2),
            originalPrice: originalPrice.toFixed(2)
        },
        priceDiff: priceDiff.toFixed(2),
        pricePercentChange,
        isPriceLower: priceDiff > 0,
        hasPriceChange: Math.abs(priceDiff) > 0.01
    };
}
export const getLocalWishlist = () => {
    try {
        const wishlist = localStorage.getItem('wishlist');
        return wishlist ? JSON.parse(wishlist) : [];
    } catch (error) {
        console.error('Error getting local wishlist:', error);
        return [];
    }
}
export const saveLocalWishlist = (items) => {
    try {
        localStorage.setItem('wishlist', JSON.stringify(items));
    } catch (error) {
        console.error('Error saving local wishlist:', error);
    }
}
export const mergeWishlistWithServer = async () => {
    try {
        const localWishlist = getLocalWishlist();
        if (localWishlist.length === 0) return;

        for (const item of localWishlist) {
            const productId = item.product?._id || item.productId;
            if (productId) {
                try {
                    await addToWishlistApi(productId);
                } catch (error) {
                    console.warn(`Could not add product ${productId} to wishlist:`, error);
                }
            }
        }

        localStorage.removeItem('wishlist');
        console.log('Wishlist merged with server successfully');
    } catch (error) {
        console.error('Error merging wishlist:', error);
    }
}
