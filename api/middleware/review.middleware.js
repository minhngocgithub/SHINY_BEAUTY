const Review = require('../models/review.models');
const Order = require('../models/order.models');
const Product = require('../models/product.models');

/**
 * 🎯 Validate review data
 */
const validateReviewData = (req, res, next) => {
    const { product, comment, reviewType, rating } = req.body;

    // Check required fields
    if (!product) {
        return res.status(400).json({
            success: false,
            message: 'Product ID is required'
        });
    }

    if (!comment || comment.trim().length < 10) {
        return res.status(400).json({
            success: false,
            message: 'Comment must be at least 10 characters'
        });
    }

    // If rating review, rating is required
    if (reviewType === 'rating' && (!rating || rating < 1 || rating > 5)) {
        return res.status(400).json({
            success: false,
            message: 'Rating must be between 1 and 5'
        });
    }

    next();
};

/**
 * 🎯 Check if user can review (has purchased and delivered)
 */
const canReviewProduct = async (req, res, next) => {
    try {
        const { product, reviewType } = req.body;
        const userId = req.user._id;

        // For questions and general feedback, anyone can post
        if (reviewType === 'question') {
            return next();
        }

        // For rating reviews and product feedback, must have purchased
        const hasOrdered = await Order.findOne({
            user: userId,
            'orderItems.product': product,
            status: 'DELIVERED'
        });

        if (!hasOrdered) {
            return res.status(403).json({
                success: false,
                message: 'You can only review products you have purchased and received'
            });
        }

        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * 🎯 Check duplicate review
 */
const checkDuplicateReview = async (req, res, next) => {
    try {
        const { product, reviewType } = req.body;
        const userId = req.user._id;

        // Only check for rating reviews
        if (reviewType !== 'rating') {
            return next();
        }

        const existingReview = await Review.findOne({
            user: userId,
            product: product,
            reviewType: 'rating'
        });

        if (existingReview) {
            return res.status(400).json({
                success: false,
                message: 'You have already reviewed this product',
                existingReview: {
                    id: existingReview._id,
                    rating: existingReview.rating,
                    comment: existingReview.comment,
                    status: existingReview.status,
                    createdAt: existingReview.createdAt
                }
            });
        }

        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * 🎯 Check if user owns the review
 */
const isReviewOwner = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const review = await Review.findById(id);
        
        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        if (review.user.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You can only modify your own reviews'
            });
        }

        // Attach review to request for next middleware
        req.review = review;
        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * 🎯 Check if review can be edited (only pending reviews)
 */
const canEditReview = (req, res, next) => {
    const review = req.review;

    if (review.status !== 'pending') {
        return res.status(400).json({
            success: false,
            message: 'Only pending reviews can be edited'
        });
    }

    next();
};

/**
 * 🎯 Rate limiting for reviews (prevent spam)
 */
const reviewRateLimit = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

        // Check how many reviews user created in last 24 hours
        const recentReviews = await Review.countDocuments({
            user: userId,
            createdAt: { $gte: oneDayAgo }
        });

        // Limit: 10 reviews per day
        if (recentReviews >= 10) {
            return res.status(429).json({
                success: false,
                message: 'You have reached the daily limit for reviews. Please try again tomorrow.'
            });
        }

        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * 🎯 Validate product exists
 */
const validateProductExists = async (req, res, next) => {
    try {
        const { product } = req.body;

        const productExists = await Product.findById(product);
        
        if (!productExists) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * 🎯 Sanitize review content (prevent XSS)
 */
const sanitizeReviewContent = (req, res, next) => {
    if (req.body.comment) {
        // Remove HTML tags
        req.body.comment = req.body.comment
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<[^>]+>/g, '')
            .trim();
    }

    next();
};

module.exports = {
    validateReviewData,
    canReviewProduct,
    checkDuplicateReview,
    isReviewOwner,
    canEditReview,
    reviewRateLimit,
    validateProductExists,
    sanitizeReviewContent
};