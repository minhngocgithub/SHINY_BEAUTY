const Review = require('../models/review.models');
const Order = require('../models/order.models');
const Product = require('../models/product.models');
const User = require('../models/user.models');
const { uploadImageCloudinary, deleteImageFromCloudinary } = require('../utils/upload.service');

const createReview = async (req, res) => {
    try {
        const { product, rating, comment, reviewType = 'rating' } = req.body;
        const userId = req.user._id;

        if (!product || !comment) {
            return res.status(400).json({
                success: false,
                message: 'Product and comment are required'
            });
        }

        if (reviewType === 'rating' && !rating) {
            return res.status(400).json({
                success: false,
                message: 'Rating is required for rating reviews'
            });
        }

        const productExists = await Product.findById(product);
        if (!productExists) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        const hasOrdered = await Order.findOne({
            user: userId,
            'orderItems.product': product,
            status: 'DELIVERED',
        });

        if (reviewType === 'rating' && !hasOrdered) {
            return res.status(403).json({ 
                success: false, 
                message: 'You can only review products you have received.' 
            });
        }

        if (reviewType === 'rating') {
            const existedReview = await Review.hasUserReviewed(userId, product, 'rating');
            if (existedReview) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'You already reviewed this product.' 
                });
            }
        }

        let images = [];
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const result = await uploadImageCloudinary(file, 'reviews');
                images.push({
                    public_id: result.public_id,
                    url: result.secure_url
                });
            }
        } else if (req.body.images && Array.isArray(req.body.images)) {
            images = req.body.images;
        }

        const review = await Review.create({
            user: userId,
            product,
            order: hasOrdered?._id,
            rating: reviewType === 'rating' ? rating : undefined,
            comment,
            images,
            reviewType,
            verifiedPurchase: !!hasOrdered,
            status: 'pending'
        });

        await review.populate('user', 'name avatar email');

        res.status(201).json({ 
            success: true, 
            review,
            message: 'Your review has been submitted and is pending approval.'
        });
    } catch (error) {
        console.error('Create Review Error:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

const getReviewsByProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        const { 
            page = 1, 
            limit = 10, 
            type = 'all',
            sortBy = 'createdAt', 
            order = 'desc', 
            hasImage,
            verifiedOnly,
            minRating
        } = req.query;

        const filter = { 
            product: productId, 
            status: 'published' 
        };

        if (type !== 'all') {
            filter.reviewType = type;
        }

        if (hasImage === 'true') {
            filter.images = { $exists: true, $not: { $size: 0 } };
        }

        if (verifiedOnly === 'true') {
            filter.verifiedPurchase = true;
        }

        if (minRating) {
            filter.rating = { $gte: Number(minRating) };
        }

        let sortOptions = {};
        if (sortBy === 'helpful') {
            sortOptions = { 'helpful.length': order === 'asc' ? 1 : -1 };
        } else if (sortBy === 'rating') {
            sortOptions = { rating: order === 'asc' ? 1 : -1 };
        } else {
            sortOptions = { [sortBy]: order === 'asc' ? 1 : -1 };
        }

        const reviews = await Review.find(filter)
            .populate('user', 'name avatar email')
            .populate({
                path: 'reply.admin',
                select: 'name avatar role'
            })
            .sort(sortOptions)
            .skip((page - 1) * limit)
            .limit(Number(limit))
            .lean();

        const total = await Review.countDocuments(filter);

        res.status(200).json({
            success: true,
            reviews,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / limit),
                total
            }
        });
    } catch (error) {
        console.error('Get Reviews Error:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
}

// Tổng hợp thống kê review của sản phẩm (trung bình sao, phân bố, review nổi bật)
const getProductReviewSummary = async (req, res) => {
    try {
        const { productId } = req.params;
        const stats = await Review.getProductStats(productId);
        const featuredReviews = await Review.getFeaturedReviews(productId, 3);

        res.status(200).json({
            success: true,
            summary: {
                ...stats,
                featuredReviews
            }
        });
    } catch (error) {
        console.error('Get Review Summary Error:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
}
// Đánh dấu review là “hữu ích” hoặc “không hữu ích”
const markHelpful = async (req, res) => {
    try {
        const { id } = req.params;
        const { isHelpful = true } = req.body;
        const userId = req.user._id;

        const review = await Review.findById(id);
        if (!review) {
            return res.status(404).json({ 
                success: false, 
                message: 'Review not found' 
            });
        }

        review.helpful = review.helpful.filter(id => id.toString() !== userId.toString());
        review.notHelpful = review.notHelpful.filter(id => id.toString() !== userId.toString());

        if (isHelpful) {
            review.helpful.push(userId);
        } else {
            review.notHelpful.push(userId);
        }

        await review.save();

        res.json({ 
            success: true, 
            helpfulCount: review.helpful.length,
            notHelpfulCount: review.notHelpful.length,
            helpfulScore: review.helpful.length - review.notHelpful.length
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
}
// Admin trả lời review hoặc câu hỏi của User
const replyReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({
                success: false,
                message: 'Reply message is required'
            });
        }

        const review = await Review.findById(id);
        if (!review) {
            return res.status(404).json({ 
                success: false, 
                message: 'Review not found' 
            });
        }

        review.reply.push({
            admin: req.user._id,
            message
        });

        if (review.reviewType === 'question') {
            review.isAnswered = true;
        }

        await review.save();
        await review.populate('reply.admin', 'name avatar role');

        return res.status(200).json({
            success: true,
            review,
            message: 'Reply added successfully'
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
}

const updateReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { rating, comment, images } = req.body;

        const review = await Review.findById(id);
        if (!review) {
            return res.status(404).json({ 
                success: false, 
                message: 'Review not found' 
            });
        }

        if (review.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ 
                success: false, 
                message: 'You can only update your own review.' 
            });
        }

        if (review.status !== 'pending') {
            return res.status(400).json({ 
                success: false, 
                message: 'You can only update pending reviews.' 
            });
        }

        if (rating !== undefined && review.reviewType === 'rating') {
            review.rating = rating;
        }
        if (comment) review.comment = comment;
        if (images) review.images = images;

        await review.save();

        res.json({ 
            success: true, 
            review,
            message: 'Review updated successfully'
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
}
// Admin duyệt, ẩn hoặc đánh dấu review có vấn đề
const moderateReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['pending', 'published', 'hidden', 'flagged'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
        }

        const review = await Review.findById(id);
        if (!review) {
            return res.status(404).json({ 
                success: false, 
                message: 'Review not found' 
            });
        }

        review.status = status;
        await review.save();

        res.json({ 
            success: true, 
            review,
            message: `Review status updated to ${status}`
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
}

const deleteReview = async (req, res) => {
    try {
        const { id } = req.params;

        const review = await Review.findById(id);
        if (!review) {
            return res.status(404).json({ 
                success: false, 
                message: 'Review not found' 
            });
        }

        const isOwner = review.user.toString() === req.user._id.toString();
        const isAdmin = req.user.role === 'admin';

        if (!isOwner && !isAdmin) {
            return res.status(403).json({ 
                success: false, 
                message: 'Forbidden' 
            });
        }

        if (review.images && review.images.length > 0) {
            for (const image of review.images) {
                if (image.public_id) {
                    await deleteImageFromCloudinary(image.public_id);
                }
            }
        }

        await review.remove();

        return res.status(200).json({ 
            success: true,
            message: 'Review deleted successfully'
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
}
// Kiểm tra user có thể review sản phẩm không
const canUserReview = async (req, res) => {
    try {
        const { productId } = req.params;
        const userId = req.user._id;

        const hasOrdered = await Order.findOne({
            user: userId,
            'orderItems.product': productId,
            status: 'DELIVERED',
        });

        const hasReviewed = await Review.hasUserReviewed(userId, productId, 'rating');

        return res.status(200).json({
            success: true,
            canReview: !!hasOrdered && !hasReviewed,
            hasPurchased: !!hasOrdered,
            hasReviewed: !!hasReviewed,
            canAskQuestion: true,
            canGiveFeedback: !!hasOrdered
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
}
// User báo cáo review vi phạm
const flagReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        if (!reason) {
            return res.status(400).json({
                success: false,
                message: 'Reason is required'
            });
        }

        const review = await Review.findById(id);
        if (!review) {
            return res.status(404).json({ 
                success: false, 
                message: 'Review not found' 
            });
        }

        const alreadyFlagged = review.flaggedBy.some(
            flag => flag.user.toString() === req.user._id.toString()
        );

        if (alreadyFlagged) {
            return res.status(400).json({
                success: false,
                message: 'You have already flagged this review'
            });
        }

        review.flaggedBy.push({
            user: req.user._id,
            reason
        });

        if (review.flaggedBy.length >= 3) {
            review.status = 'flagged';
        }

        await review.save();

        return res.status(200).json({ 
            success: true,
            message: 'Review has been flagged for moderation',
            flagCount: review.flaggedBy.length
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
}
// Lấy tất cả review của chính user (cả rating, question, feedback)
const getUserReviews = async (req, res) => {
    try {
        const userId = req.user._id;
        const { page = 1, limit = 10, type } = req.query;

        const filter = { user: userId };
        if (type) filter.reviewType = type;

        const reviews = await Review.find(filter)
            .populate('product', 'name image price')
            .populate('reply.admin', 'name avatar role')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit));

        const total = await Review.countDocuments(filter);

        res.json({
            success: true,
            reviews,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / limit),
                total
            }
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

module.exports = {
    createReview,
    getReviewsByProduct,
    getProductReviewSummary,
    markHelpful,
    replyReview,
    updateReview,
    moderateReview,
    deleteReview,
    canUserReview,
    flagReview,
    getUserReviews
};
