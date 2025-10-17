import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
    getReviewsByProductApi,
    getProductReviewSummaryApi,
    createReviewApi,
    markReviewHelpfulApi,
    deleteReviewApi,
    getMyReviewsApi,
    calculateAverageRating,
    getRatingDistributionWithPercentage,
    formatReviewData,
    formatReviewSummary
} from '../service/review.service'

export const useReviewStore = defineStore('review', () => {
    const reviews = ref([])
    const reviewSummary = ref(null)
    const myReviews = ref([])
    const loading = ref(false)
    const error = ref(null)

    const totalReviews = computed(() => reviews.value.length)

    const averageRating = computed(() => {
        return calculateAverageRating(reviews.value)
    })

    const ratingDistribution = computed(() => {
        return getRatingDistributionWithPercentage(reviews.value)
    })

    const formattedReviews = computed(() => {
        return reviews.value.map(review => formatReviewData(review))
    })

    // Actions
    const fetchProductReviews = async (productId, params = {}) => {
        try {
            loading.value = true
            error.value = null

            const response = await getReviewsByProductApi(productId, params)

            if (response.data.success) {
                reviews.value = response.data.reviews || []
            }
        } catch (err) {
            error.value = err.response?.data?.message || 'Failed to fetch reviews'
            console.error('Fetch reviews error:', err)
            reviews.value = []
        } finally {
            loading.value = false
        }
    }

    const fetchReviewSummary = async (productId) => {
        try {
            loading.value = true
            error.value = null

            const response = await getProductReviewSummaryApi(productId)

            if (response.data.success) {
                reviewSummary.value = formatReviewSummary(response.data.summary)
            }
        } catch (err) {
            error.value = err.response?.data?.message || 'Failed to fetch review summary'
            console.error('Fetch review summary error:', err)
        } finally {
            loading.value = false
        }
    }

    const createReview = async (reviewData) => {
        try {
            loading.value = true
            error.value = null

            const response = await createReviewApi(reviewData)

            if (response.data.success) {
                reviews.value.unshift(response.data.review)
                return response.data.review
            }
        } catch (err) {
            error.value = err.response?.data?.message || 'Failed to create review'
            console.error('Create review error:', err)
            throw err
        } finally {
            loading.value = false
        }
    }

    const markHelpful = async (reviewId, isHelpful) => {
        try {
            loading.value = true
            error.value = null

            const response = await markReviewHelpfulApi(reviewId, isHelpful)

            if (response.data.success) {
                const reviewIndex = reviews.value.findIndex(r => r._id === reviewId)
                if (reviewIndex > -1) {
                    reviews.value[reviewIndex] = response.data.review
                }
                return response.data.review
            }
        } catch (err) {
            error.value = err.response?.data?.message || 'Failed to mark review helpful'
            console.error('Mark helpful error:', err)
            throw err
        } finally {
            loading.value = false
        }
    }

    const deleteReview = async (reviewId) => {
        try {
            loading.value = true
            error.value = null

            const response = await deleteReviewApi(reviewId)

            if (response.data.success) {
                reviews.value = reviews.value.filter(r => r._id !== reviewId)
            }
        } catch (err) {
            error.value = err.response?.data?.message || 'Failed to delete review'
            console.error('Delete review error:', err)
            throw err
        } finally {
            loading.value = false
        }
    }

    const fetchMyReviews = async (params = {}) => {
        try {
            loading.value = true
            error.value = null

            const response = await getMyReviewsApi(params)

            if (response.data.success) {
                myReviews.value = response.data.reviews || []
            }
        } catch (err) {
            error.value = err.response?.data?.message || 'Failed to fetch my reviews'
            console.error('Fetch my reviews error:', err)
            myReviews.value = []
        } finally {
            loading.value = false
        }
    }

    return {
        reviews,
        reviewSummary,
        myReviews,
        loading,
        error,

        totalReviews,
        averageRating,
        ratingDistribution,
        formattedReviews,

        fetchProductReviews,
        fetchReviewSummary,
        createReview,
        markHelpful,
        deleteReview,
        fetchMyReviews
    }
})