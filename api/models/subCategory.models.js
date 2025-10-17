const mongoose = require('mongoose')
const Schema = mongoose.Schema

// Deprecated in favor of hierarchical Category
const subCategorySchema = new Schema({
	name: {
		type: String,
		required: [true, 'SubCategory name is required']
	},
	slug: {
		type: String,
		unique: true,
		index: true
	},
	category: {
		type: mongoose.Schema.ObjectId,
		ref: 'Category',
		required: true
	},
	isActive: {
		type: Boolean,
		default: true
	}
}, {
	timestamps: true
})

module.exports = mongoose.model('subCategory', subCategorySchema)