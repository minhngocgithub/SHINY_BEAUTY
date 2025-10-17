const Category = require('../models/category.models')
const slugify = require('slugify')

// Proxy subcategory to hierarchical Category (children of a parent)
const addSubCategory = async (req, res) => {
	try {
		const { name, category } = req.body
		if (!name || !category) {
			return res.status(400).json({ success: false, message: 'Provide name and category (parentId)' })
		}
		const parent = await Category.findById(category)
		if (!parent) return res.status(404).json({ success: false, message: 'Parent category not found' })
		const slug = slugify(name, { lower: true, strict: true })
		const exists = await Category.findOne({ slug })
		if (exists) return res.status(409).json({ success: false, message: 'SubCategory with slug exists' })
		const sub = await Category.create({ name, slug, parent: category, level: (parent.level || 0) + 1, isActive: true, showInMenu: true })
		return res.status(200).json({ success: true, message: 'Sub Category Created', data: sub })
	} catch (error) {
		return res.status(500).json({ success: false, message: error.message || error })
	}
}

const getSubCategory = async (req, res) => {
	try {
		const { categoryId } = req.query
		const filter = categoryId ? { parent: categoryId } : { level: { $gte: 1 } }
		const data = await Category.find(filter).sort('displayOrder')
		return res.status(200).json({ success: true, message: 'SubCategory data', data })
	} catch (error) {
		return res.status(500).json({ success: false, message: error.message || error })
	}
}

const updateSubCategory = async (req, res) => {
	try {
		const { id, name, category } = req.body
		const sub = await Category.findById(id)
		if (!sub) return res.status(400).json({ success: false, message: 'Check your _id' })
		if (sub.level === 0) return res.status(400).json({ success: false, message: 'This is a root category, not a subcategory' })
		const update = {}
		if (name) {
			update.name = name
			update.slug = slugify(name, { lower: true, strict: true })
		}
		if (category) update.parent = category
		const updated = await Category.findByIdAndUpdate(id, update, { new: true })
		return res.status(200).json({ success: true, message: 'Updated Successfully', data: updated })
	} catch (error) {
		return res.status(500).json({ success: false, message: error.message || error })
	}
}

const deleteSubCategory = async (req, res) => {
	try {
		const { id } = req.body
		const sub = await Category.findById(id)
		if (!sub) return res.status(404).json({ success: false, message: 'Subcategory not found' })
		if (sub.level === 0) return res.status(400).json({ success: false, message: 'This is a root category, not a subcategory' })
		const hasChildren = await Category.countDocuments({ parent: id })
		if (hasChildren > 0) return res.status(400).json({ success: false, message: 'Cannot delete subcategory with children' })
		// Optional: check products using this category
		await Category.deleteOne({ _id: id })
		return res.status(200).json({ success: true, message: 'Delete successfully' })
	} catch (error) {
		return res.status(500).json({ success: false, message: error.message || error })
	}
}

module.exports = {
	addSubCategory,
	getSubCategory,
	updateSubCategory,
	deleteSubCategory
}