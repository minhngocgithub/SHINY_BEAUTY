const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const feedbackSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    message: {
        type: String,
        required: [true, 'Please enter your feedback.']
    },
    type: {
        type: String,
        enum: ['suggestion', 'bug', 'question', 'other'],
        default: 'suggestion'
    },
    status: {
        type: String,
        enum: ['pending', 'resolved'],
        default: 'pending'
    },
    reply: [
        {
            admin: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            message: {
                type: String,
                required: [true, 'Please enter a reply message.']
            },
            repliedAt: {
                type: Date,
                default: Date.now
            }
        }
    ]
}, { timestamps: true });

module.exports = mongoose.model('Feedback', feedbackSchema);
