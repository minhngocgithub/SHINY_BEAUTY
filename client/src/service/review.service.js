import axiosApiInstance from "../../utils/api"
const BASE_REVIEW_API = '/review'

export const createReviewApi = async (reviewData) => {
  return await axiosApiInstance.post(`${BASE_REVIEW_API}/reviews`, reviewData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}
export const getReviewsByProductApi = async (productId, params = {}) => {
  return await axiosApiInstance.get(`${BASE_REVIEW_API}/product/${productId}`, { params })
}
export const getProductReviewSummaryApi = async (productId) => {
  return await axiosApiInstance.get(`${BASE_REVIEW_API}/product/${productId}/summary`)
}
export const canUserReviewApi = async (productId) => {
  return await axiosApiInstance.get(`${BASE_REVIEW_API}/product/${productId}/can-review`)
}
export const markReviewHelpfulApi = async (reviewId, isHelpful = true) => {
  return await axiosApiInstance.post(`${BASE_REVIEW_API}/${reviewId}/helpful`, { isHelpful })
}
export const updateReviewApi = async (reviewId, updateData) => {
  return await axiosApiInstance.put(`${BASE_REVIEW_API}/${reviewId}`, updateData)
}
export const deleteReviewApi = async (reviewId) => {
  return await axiosApiInstance.delete(`${BASE_REVIEW_API}/${reviewId}`)
}
export const flagReviewApi = async (reviewId, reason) => {
  return await axiosApiInstance.post(`${BASE_REVIEW_API}/${reviewId}/flag`, { reason })
}
export const getMyReviewsApi = async (params = {}) => {
  return await axiosApiInstance.get(`${BASE_REVIEW_API}/me`, { params })
}
export const replyToReviewApi = async (reviewId, message) => {
  return await axiosApiInstance.post(`${BASE_REVIEW_API}/${reviewId}/replies`, { message })
}
export const moderateReviewApi = async (reviewId, status) => {
  return await axiosApiInstance.patch(`${BASE_REVIEW_API}/${reviewId}/moderation`, { status })
}
export const calculateAverageRating = (reviews) => {
  if (!reviews || reviews.length === 0) return 0
  const sum = reviews.reduce((acc, review) => acc + (review.rating || 0), 0)
  return (sum / reviews.length).toFixed(1)
}
export const getRatingDistribution = (reviews) => {
  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  if (!reviews || reviews.length === 0) return distribution
  reviews.forEach(review => {
    if (review.rating >= 1 && review.rating <= 5) distribution[review.rating]++
  })
  return distribution
}
export const getRatingDistributionWithPercentage = (reviews) => {
  const distribution = getRatingDistribution(reviews)
  const total = reviews?.length || 0
  return Object.keys(distribution).reduce((acc, rating) => {
    acc[rating] = {
      count: distribution[rating],
      percentage: total > 0 ? ((distribution[rating] / total) * 100).toFixed(1) : 0
    }
    return acc
  }, {})
}
export const filterReviewsByRating = (reviews, rating) => {
  if (!reviews || !rating) return reviews
  return reviews.filter(review => review.rating === rating)
}
export const filterReviewsWithImages = (reviews) => {
  if (!reviews) return []
  return reviews.filter(review => review.images && review.images.length > 0)
}
export const filterVerifiedReviews = (reviews) => {
  if (!reviews) return []
  return reviews.filter(review => review.verifiedPurchase === true)
}

export const sortReviewsByHelpful = (reviews) => {
  if (!reviews) return []
  return [...reviews].sort((a, b) => {
    const aHelpful = a.helpful?.length || 0
    const bHelpful = b.helpful?.length || 0
    return bHelpful - aHelpful
  })
}
export const sortReviewsByDate = (reviews, order = 'desc') => {
  if (!reviews) return []
  return [...reviews].sort((a, b) => {
    const dateA = new Date(a.createdAt)
    const dateB = new Date(b.createdAt)
    return order === 'asc' ? dateA - dateB : dateB - dateA
  })
}

export const sortReviewsByRating = (reviews, order = 'desc') => {
  if (!reviews) return []
  return [...reviews].sort((a, b) => {
    return order === 'asc' ? a.rating - b.rating : b.rating - a.rating
  })
}
export const formatReviewData = (review) => {
  if (!review) return null
  return {
    ...review,
    helpfulCount: review.helpful?.length || 0,
    notHelpfulCount: review.notHelpful?.length || 0,
    helpfulScore: (review.helpful?.length || 0) - (review.notHelpful?.length || 0),
    hasImages: review.images && review.images.length > 0,
    imageCount: review.images?.length || 0,
    hasReply: review.reply && review.reply.length > 0,
    replyCount: review.reply?.length || 0,
    isVerified: review.verifiedPurchase === true,
    isPending: review.status === 'pending',
    isPublished: review.status === 'published',
    isHidden: review.status === 'hidden',
    isFlagged: review.status === 'flagged',
    isQuestion: review.reviewType === 'question',
    isRating: review.reviewType === 'rating',
    isFeedback: review.reviewType === 'feedback'
  }
}

export const formatReviewSummary = (summary) => {
  if (!summary) return null
  return {
    ...summary,
    averageRating: summary.averageRating ? Number(summary.averageRating.toFixed(1)) : 0,
    ratingDistribution: summary.ratingDistribution || [],
    byType: summary.byType || [],
    featuredReviews: summary.featuredReviews || []
  }
}

export const getReviewTypeLabel = (type) => {
  const labels = {
    rating: 'Review',
    question: 'Question',
    feedback: 'Feedback'
  }
  return labels[type] || type
}

export const getReviewStatusLabel = (status) => {
  const labels = {
    pending: 'Pending',
    published: 'Published',
    hidden: 'Hidden',
    flagged: 'Flagged'
  }
  return labels[status] || status
}

export const validateReviewData = (reviewData) => {
  const errors = []
  if (!reviewData.product) errors.push('Product is required')
  if (!reviewData.comment || reviewData.comment.trim().length === 0) errors.push('Comment is required')
  if (reviewData.comment && reviewData.comment.length < 10) errors.push('Comment must be at least 10 characters')
  if (reviewData.comment && reviewData.comment.length > 2000) errors.push('Comment must not exceed 2000 characters')
  if (reviewData.reviewType === 'rating' && (!reviewData.rating || reviewData.rating < 1 || reviewData.rating > 5)) errors.push('Rating must be between 1 and 5 for rating reviews')
  if (reviewData.images && reviewData.images.length > 5) errors.push('Maximum 5 images allowed')
  return {
    isValid: errors.length === 0,
    errors
  }
}

export const createReviewFormData = (reviewData, imageFiles = []) => {
  const formData = new FormData()
  formData.append('product', reviewData.product)
  formData.append('comment', reviewData.comment)
  formData.append('reviewType', reviewData.reviewType || 'rating')
  if (reviewData.rating) formData.append('rating', reviewData.rating)
  if (imageFiles && imageFiles.length > 0) {
    imageFiles.forEach((file) => formData.append('images', file))
  }
  return formData
}
