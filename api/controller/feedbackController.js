const Feedback = require('../models/feedback.models')
const User = require('../models/user.models')

const createFeedback = async (req, res) => {
    try {
        const { message, type } = req.body
        const userId = req.user ? req.user._id : null

        if (!message) {
            return res.status(400).json({
                success: false,
                message: "Feedback message is required!"
            })
        }

        if (message.trim().length < 10) {
            return res.status(400).json({
                success: false,
                message: "Feedback message must be at least 10 characters"
            })
        }

        if (message.length > 2000) {
            return res.status(400).json({
                success: false,
                message: "Feedback message must not exceed 2000 characters"
            })
        }

        const feedback = await Feedback.create({
            user: userId,
            message,
            type: type || 'suggestion',
            status: 'pending'
        })

        if (userId) {
            await feedback.populate('user', 'name email avatar')
        }

        res.status(201).json({
            success: true,
            message: 'Thank you for your feedback!',
            feedback
        })
    } catch (error) {
        console.error('Create Feedback Error:', error)
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

const getFeedbacks = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            type,
            status,
            user,
            sortBy = 'createdAt',
            order = 'desc'
        } = req.query

        const filter = {}
        if (type) filter.type = type
        if (status) filter.status = status
        if (user) filter.user = user

        const sortOptions = {
            [sortBy]: order === 'asc' ? 1 : -1
        }

        const feedbacks = await Feedback.find(filter)
            .populate('user', 'name email avatar')
            .populate('reply.admin', 'name avatar role')
            .sort(sortOptions)
            .skip((page - 1) * limit)
            .limit(Number(limit))

        const total = await Feedback.countDocuments(filter)

        const stats = await Feedback.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ])

        const typeStats = await Feedback.aggregate([
            { $group: { _id: '$type', count: { $sum: 1 } } }
        ])

        res.status(200).json({
            success: true,
            feedbacks,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / limit),
                total
            },
            statistics: {
                byStatus: stats,
                byType: typeStats
            }
        })
    } catch (error) {
        console.error('Get Feedbacks Error:', error)
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

const replyFeedback = async (req, res) => {
    try {
        const { id } = req.params
        const { message } = req.body

        if (!message) {
            return res.status(400).json({
                success: false,
                message: 'Reply message is required'
            })
        }

        if (message.trim().length < 5) {
            return res.status(400).json({
                success: false,
                message: 'Reply message must be at least 5 characters'
            })
        }

        const feedback = await Feedback.findById(id)
        if (!feedback) {
            return res.status(404).json({
                success: false,
                message: 'Feedback not found'
            })
        }

        feedback.reply.push({
            admin: req.user._id,
            message
        })

        feedback.status = 'resolved'
        await feedback.save()

        await feedback.populate('reply.admin', 'name avatar role')

        res.json({
            success: true,
            feedback,
            message: 'Reply sent successfully'
        })
    } catch (error) {
        console.error('Reply Feedback Error:', error)
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

const updateFeedbackStatus = async (req, res) => {
    try {
        const { id } = req.params
        const { status } = req.body

        if (!['pending', 'resolved'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Must be pending or resolved'
            })
        }

        const feedback = await Feedback.findById(id)
        if (!feedback) {
            return res.status(404).json({
                success: false,
                message: 'Feedback not found'
            })
        }

        feedback.status = status
        await feedback.save()

        res.json({
            success: true,
            feedback,
            message: `Feedback status updated to ${status}`
        })
    } catch (error) {
        console.error('Update Feedback Status Error:', error)
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

const deleteFeedback = async (req, res) => {
    try {
        const { id } = req.params
        const feedback = await Feedback.findById(id)
        if (!feedback) {
            return res.status(404).json({
                success: false,
                message: 'Feedback not found'
            })
        }

        await feedback.deleteOne()

        res.json({
            success: true,
            message: 'Feedback deleted successfully'
        })
    } catch (error) {
        console.error('Delete Feedback Error:', error)
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

const getFeedbackById = async (req, res) => {
    try {
        const { id } = req.params
        const feedback = await Feedback.findById(id)
            .populate('user', 'name email avatar')
            .populate('reply.admin', 'name avatar role')

        if (!feedback) {
            return res.status(404).json({
                success: false,
                message: 'Feedback not found'
            })
        }

        res.json({
            success: true,
            feedback
        })
    } catch (error) {
        console.error('Get Feedback By ID Error:', error)
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

const getMyFeedbacks = async (req, res) => {
    try {
        const userId = req.user._id
        const { page = 1, limit = 10, type, status } = req.query

        const filter = { user: userId }
        if (type) filter.type = type
        if (status) filter.status = status

        const feedbacks = await Feedback.find(filter)
            .populate('reply.admin', 'name avatar role')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit))

        const total = await Feedback.countDocuments(filter)

        res.json({
            success: true,
            feedbacks,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / limit),
                total
            }
        })
    } catch (error) {
        console.error('Get My Feedbacks Error:', error)
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

module.exports = {
    createFeedback,
    getFeedbacks,
    replyFeedback,
    updateFeedbackStatus,
    deleteFeedback,
    getFeedbackById,
    getMyFeedbacks
}
