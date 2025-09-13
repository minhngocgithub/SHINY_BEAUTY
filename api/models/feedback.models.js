const mongoose = require('mongoose')
const Schema = mongoose.Schema

const feedbackSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    message: {
        type: String,
        require: [true, 'Please enter your feedback.']
    },
    createAt: { type: Date }
    

}, { timestamps: true } )

module.exports = mongoose.model('Feedback', feedbackSchema)