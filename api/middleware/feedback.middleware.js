const Feedback = require('../models/feedback.models')

const validateFeedbackData = (req, res, next) => {
    const { message, type } = req.body;
    if (!message || message.trim().length < 10) {
        return res.status(400).json({
            success: false,
            message: 'Feedback message must be at least 10 characters'
        });
    }
    const validTypes = ['suggestion', 'bug', 'question', 'other'];
    if (type && !validTypes.includes(type)) {
        return res.status(400).json({
            success: false,
            message: `Feedback type must be one of: ${validTypes.join(', ')}`
        });
    }
    next();
};

const sanitizeFeedbackContent = (req, res, next) => {
    if (req.body.message) {
        req.body.message = req.body.message
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<[^>]+>/g, '')
            .trim();
    }
    next();
};

const feedbackRateLimit = async (req, res, next) => {
    try {
        if (!req.user) return next();
        const userId = req.user._id;
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const recentFeedbacks = await Feedback.countDocuments({
            user: userId,
            createdAt: { $gte: oneDayAgo }
        });
        if (recentFeedbacks >= 10) {
            return res.status(429).json({
                success: false,
                message: 'You have reached the daily limit for feedbacks. Please try again tomorrow.'
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

module.exports = {
    validateFeedbackData,
    sanitizeFeedbackContent,
    feedbackRateLimit
};