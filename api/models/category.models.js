const mongoose = require('mongoose')
const Schema = mongoose.Schema

const categorySchema = new Schema({
	name: {
		type: String,
		required: [true, 'Category name is required'],
		trim: true
	},
	slug: {
		type: String,
		required: true,
		unique: true,
		index: true
	},
	parent: {
		type: mongoose.Schema.ObjectId,
		ref: 'Category',
		default: null,
		index: true
	},
	level: {
		type: Number,
		default: 0,
		min: 0
	},
	path: {
		type: String,
		index: true
	},
	displayOrder: {
		type: Number,
		default: 0
	},
	isActive: {
		type: Boolean,
		default: true
	},
	showInMenu: {
		type: Boolean,
		default: true
	},
	icon: String,
	image: {
		public_id: String,
		url: String
	},
	description: String,
	productCount: {
		type: Number,
		default: 0
	}
}, {
	timestamps: true
})

categorySchema.virtual('children', {
	ref: 'Category',
	localField: '_id',
	foreignField: 'parent'
})

categorySchema.index({ parent: 1, displayOrder: 1 })
categorySchema.index({ slug: 1 }, { unique: true })
categorySchema.index({ path: 1 })
categorySchema.index({ level: 1 })
categorySchema.index({ isActive: 1, showInMenu: 1 })

categorySchema.pre('save', async function(next) {
	try {
		if (this.isModified('name') && !this.slug) {
			const slugify = require('slugify')
			this.slug = slugify(this.name, { lower: true, strict: true })
		}

		if (this.isModified('parent') || this.isNew) {
			if (this.parent) {
				const parent = await this.constructor.findById(this.parent)
				if (parent) {
					this.level = (typeof parent.level === 'number' ? parent.level : 0) + 1
					this.path = parent.path ? `${parent.path}/${this._id}` : `${parent._id}/${this._id}`
				}
			} else {
				this.level = 0
				this.path = this._id ? this._id.toString() : this.path
			}
		}

		next()
	} catch (err) {
		next(err)
	}
})

categorySchema.methods.getAncestors = async function() {
	if (!this.parent) return []
	const ancestors = []
	let current = await this.constructor.findById(this.parent)
	while (current) {
		ancestors.unshift(current)
		current = current.parent ? await this.constructor.findById(current.parent) : null
	}
	return ancestors
}

categorySchema.methods.getDescendants = async function() {
	if (!this.path) return []
	const regex = new RegExp(`^${this.path}/`)
	return await this.constructor.find({ path: regex })
}

categorySchema.methods.hasChildren = async function() {
	const count = await this.constructor.countDocuments({ parent: this._id })
	return count > 0
}

categorySchema.statics.getRootCategories = function() {
	return this.find({ parent: null, isActive: true, showInMenu: true })
		.sort('displayOrder')
		.populate('children')
}

categorySchema.statics.getCategoryTree = async function() {
	const categories = await this.find({ isActive: true }).sort('displayOrder').lean()
	const buildTree = (parentId = null) => {
		return categories
			.filter(cat => String(cat.parent || null) === String(parentId))
			.map(cat => ({
				...cat,
				children: buildTree(cat._id)
			}))
	}
	return buildTree(null)
}

module.exports = mongoose.model('Category', categorySchema)