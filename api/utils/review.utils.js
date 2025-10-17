const Review = require('../models/review.models')
const Product = require('../models/product.models')

const getReviewStatistics = async (filters = {}) => {
    try {
        const { startDate, endDate, productId, userId } = filters
        const matchConditions = { archived: false }

        if (startDate || endDate) {
            matchConditions.createdAt = {}
            if (startDate) matchConditions.createdAt.$gte = new Date(startDate)
            if (endDate) matchConditions.createdAt.$lte = new Date(endDate)
        }
        if (productId) matchConditions.product = productId
        if (userId) matchConditions.user = userId

        const stats = await Review.aggregate([
            { $match: matchConditions },
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    totalRatings: { $sum: { $cond: [{ $eq: ['$reviewType', 'rating'] }, 1, 0] } },
                    totalQuestions: { $sum: { $cond: [{ $eq: ['$reviewType', 'question'] }, 1, 0] } },
                    totalFeedback: { $sum: { $cond: [{ $eq: ['$reviewType', 'feedback'] }, 1, 0] } },
                    avgRating: {
                        $avg: { $cond: [{ $eq: ['$reviewType', 'rating'] }, '$rating', null] }
                    },
                    verifiedCount: { $sum: { $cond: ['$verifiedPurchase', 1, 0] } },
                    withImagesCount: {
                        $sum: {
                            $cond: [
                                { $gt: [{ $size: { $ifNull: ['$images', []] } }, 0] },
                                1,
                                0
                            ]
                        }
                    }
                }
            }
        ])

        const statusBreakdown = await Review.aggregate([
            { $match: matchConditions },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ])

        return {
            overall: stats[0] || {
                total: 0,
                totalRatings: 0,
                totalQuestions: 0,
                totalFeedback: 0,
                avgRating: 0,
                verifiedCount: 0,
                withImagesCount: 0
            },
            byStatus: statusBreakdown.reduce((acc, item) => {
                acc[item._id] = item.count
                return acc
            }, {})
        }
    } catch (error) {
        console.error('Get Review Statistics Error:', error)
        throw error
    }
}

const getTopReviewers = async (limit = 10) => {
    try {
        const topReviewers = await Review.aggregate([
            {
                $match: {
                    status: 'published',
                    reviewType: 'rating',
                    archived: false
                }
            },
            {
                $group: {
                    _id: '$user',
                    reviewCount: { $sum: 1 },
                    totalHelpful: { $sum: { $size: '$helpful' } },
                    avgRating: { $avg: '$rating' },
                    verifiedReviews: { $sum: { $cond: ['$verifiedPurchase', 1, 0] } }
                }
            },
            { $sort: { totalHelpful: -1, reviewCount: -1 } },
            { $limit: limit },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            { $unwind: '$user' },
            {
                $project: {
                    userId: '$_id',
                    name: '$user.name',
                    avatar: '$user.avatar',
                    email: '$user.email',
                    reviewCount: 1,
                    totalHelpful: 1,
                    avgRating: { $round: ['$avgRating', 2] },
                    verifiedReviews: 1
                }
            }
        ])
        return topReviewers
    } catch (error) {
        console.error('Get Top Reviewers Error:', error)
        throw error
    }
}

const getProductsNeedingModeration = async (limit = 20) => {
    try {
        const products = await Review.aggregate([
            { $match: { status: 'pending', archived: false } },
            {
                $group: {
                    _id: '$product',
                    pendingCount: { $sum: 1 },
                    oldestReview: { $min: '$createdAt' }
                }
            },
            { $sort: { pendingCount: -1, oldestReview: 1 } },
            { $limit: limit },
            {
                $lookup: {
                    from: 'products',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'product'
                }
            },
            { $unwind: '$product' },
            {
                $project: {
                    productId: '$_id',
                    name: '$product.name',
                    image: '$product.image',
                    pendingCount: 1,
                    oldestReview: 1,
                    waitingDays: {
                        $divide: [{ $subtract: [new Date(), '$oldestReview'] }, 1000 * 60 * 60 * 24]
                    }
                }
            }
        ])
        return products
    } catch (error) {
        console.error('Get Products Needing Moderation Error:', error)
        throw error
    }
}

const bulkModerateReviews = async (reviewIds, status, adminId) => {
    try {
        if (!['published', 'hidden', 'flagged'].includes(status)) throw new Error('Invalid status')

        const result = await Review.updateMany(
            { _id: { $in: reviewIds }, archived: false },
            { $set: { status } }
        )

        const affectedProducts = await Review.distinct('product', {
            _id: { $in: reviewIds }
        })

        for (const productId of affectedProducts) {
            await Product.updateRatingsFromReviews(productId)
        }

        return {
            modifiedCount: result.modifiedCount,
            affectedProducts: affectedProducts.length
        }
    } catch (error) {
        console.error('Bulk Moderate Reviews Error:', error)
        throw error
    }
}

const exportReviewsToCSV = async (filters = {}) => {
    try {
        const { startDate, endDate, productId, status, reviewType } = filters
        const query = { archived: false }

        if (startDate || endDate) {
            query.createdAt = {}
            if (startDate) query.createdAt.$gte = new Date(startDate)
            if (endDate) query.createdAt.$lte = new Date(endDate)
        }
        if (productId) query.product = productId
        if (status) query.status = status
        if (reviewType) query.reviewType = reviewType

        const reviews = await Review.find(query)
            .populate('user', 'name email')
            .populate('product', 'name')
            .sort({ createdAt: -1 })
            .lean()

        const csvData = reviews.map(review => ({
            'Review ID': review._id,
            Date: new Date(review.createdAt).toISOString(),
            Type: review.reviewType,
            Product: review.product?.name || 'N/A',
            User: review.user?.name || 'Anonymous',
            Email: review.user?.email || 'N/A',
            Rating: review.rating || 'N/A',
            Comment: review.comment,
            Status: review.status,
            'Verified Purchase': review.verifiedPurchase ? 'Yes' : 'No',
            'Helpful Count': review.helpful?.length || 0,
            'Has Images': review.images?.length > 0 ? 'Yes' : 'No',
            'Flagged Count': review.flaggedBy?.length || 0
        }))

        return csvData
    } catch (error) {
        console.error('Export Reviews To CSV Error:', error)
        throw error
    }
}

const getProductReviewInsights = async (productId) => {
    try {
        const insights = await Review.aggregate([
            {
                $match: {
                    product: productId,
                    reviewType: 'rating',
                    status: 'published',
                    archived: false
                }
            },
            {
                $facet: {
                    trends: [
                        {
                            $group: {
                                _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
                                avgRating: { $avg: '$rating' },
                                count: { $sum: 1 }
                            }
                        },
                        { $sort: { '_id.year': 1, '_id.month': 1 } }
                    ],
                    summary: [
                        {
                            $group: {
                                _id: null,
                                totalReviews: { $sum: 1 },
                                avgRating: { $avg: '$rating' },
                                verifiedPercent: { $avg: { $cond: ['$verifiedPurchase', 100, 0] } },
                                withImagesPercent: {
                                    $avg: {
                                        $cond: [
                                            { $gt: [{ $size: { $ifNull: ['$images', []] } }, 0] },
                                            100,
                                            0
                                        ]
                                    }
                                }
                            }
                        }
                    ],
                    responseTime: [
                        { $match: { 'reply.0': { $exists: true } } },
                        {
                            $project: {
                                responseTime: {
                                    $divide: [
                                        { $subtract: [{ $arrayElemAt: ['$reply.repliedAt', 0] }, '$createdAt'] },
                                        1000 * 60 * 60
                                    ]
                                }
                            }
                        },
                        {
                            $group: {
                                _id: null,
                                avgResponseTime: { $avg: '$responseTime' },
                                repliedCount: { $sum: 1 }
                            }
                        }
                    ]
                }
            }
        ])

        return insights[0] || { trends: [], summary: [], responseTime: [] }
    } catch (error) {
        console.error('Get Product Review Insights Error:', error)
        throw error
    }
}

const sendReviewNotification = async (review, type = 'new') => {
    try {
        console.log(`📧 Sending ${type} review notification:`, {
            reviewId: review._id,
            type,
            productId: review.product,
            userId: review.user
        })
        return true
    } catch (error) {
        console.error('Send Review Notification Error:', error)
        return false
    }
}

module.exports = {
    getReviewStatistics,
    getTopReviewers,
    getProductsNeedingModeration,
    bulkModerateReviews,
    exportReviewsToCSV,
    getProductReviewInsights,
    sendReviewNotification
}
