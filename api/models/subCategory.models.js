const mongoose = require('mongoose')
const Schema = mongoose.Schema

const subCategorySchema = new Schema({
    name: {
        type: String,
        default: ""
    },
    category: {
        type: mongoose.Schema.ObjectId,
        ref: 'Category'
    }
}, {
    timestamps: true
})
module.exports = mongoose.model('subCategory', subCategorySchema)