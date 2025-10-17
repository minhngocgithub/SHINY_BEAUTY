const Category = require("../models/category.models");
const Product = require("../models/product.models");
const slugify = require('slugify')

// New unified create
const createCategory = async (req, res) => {
	try {
		const { name, parent = null, displayOrder = 0, icon, image, isActive = true, showInMenu = true, description } = req.body
		if (!name) {
			return res.status(400).json({ success: false, message: 'Name is required' })
		}
		const slug = slugify(name, { lower: true, strict: true })
		const existing = await Category.findOne({ slug })
		if (existing) {
			return res.status(409).json({ success: false, message: 'Category with same slug already exists' })
		}
		const category = await Category.create({ name, slug, parent, displayOrder, icon, image, isActive, showInMenu, description })
		return res.status(201).json({ success: true, message: 'Category created', data: category })
	} catch (error) {
		return res.status(500).json({ success: false, message: error.message || error })
	}
}

// Backward-compatible: addNewCategory -> createCategory
const addNewCategory = createCategory

const getAllCategories = async (req, res) => {
	try {
		const { active, inMenu } = req.query
		const filter = {}
		if (active !== undefined) filter.isActive = active === 'true'
		if (inMenu !== undefined) filter.showInMenu = inMenu === 'true'
		const data = await Category.find(filter).sort('displayOrder')
		return res.status(200).json({ success: true, data })
	} catch (error) {
		return res.status(500).json({ success: false, message: error.message || error })
	}
}

// Backward-compatible name
const getListCategory = getAllCategories

const updateCategory = async (req, res) => {
	try {
		const { id, name, isActive, showInMenu, displayOrder, icon, image, description } = req.body
		if (!id) return res.status(400).json({ success: false, message: 'id is required' })
		const update = {}
		if (name) {
			update.name = name
			update.slug = slugify(name, { lower: true, strict: true })
		}
		if (isActive !== undefined) update.isActive = isActive
		if (showInMenu !== undefined) update.showInMenu = showInMenu
		if (displayOrder !== undefined) update.displayOrder = displayOrder
		if (icon !== undefined) update.icon = icon
		if (image !== undefined) update.image = image
		if (description !== undefined) update.description = description
		const updated = await Category.findByIdAndUpdate(id, update, { new: true })
		if (!updated) return res.status(404).json({ success: false, message: 'Category not found' })
		return res.status(200).json({ success: true, message: 'Updated Category successfully', data: updated })
	} catch (error) {
		return res.status(500).json({ success: false, message: error.message || error })
	}
}

// Backward-compatible name
const updateCategoryName = updateCategory

const updateCategoryHierarchy = async (req, res) => {
	try {
		const { id, parentId, displayOrder } = req.body
		if (!id) return res.status(400).json({ success: false, message: 'id is required' })
		const category = await Category.findById(id)
		if (!category) return res.status(404).json({ success: false, message: 'Category not found' })
		if (parentId) {
			// block circular reference
			const parent = await Category.findById(parentId)
			if (!parent) return res.status(404).json({ success: false, message: 'Parent category not found' })
			const descendants = await category.getDescendants()
			if (descendants.some(d => String(d._id) === String(parentId))) {
				return res.status(400).json({ success: false, message: 'Cannot set descendant as parent' })
			}
		}
		category.parent = parentId || null
		if (displayOrder !== undefined) category.displayOrder = displayOrder
		await category.save()
		return res.status(200).json({ success: true, message: 'Category hierarchy updated', data: category })
	} catch (error) {
		return res.status(500).json({ success: false, message: error.message || error })
	}
}

const getCategoryTree = async (req, res) => {
	try {
		const tree = await Category.getCategoryTree()
		return res.status(200).json({ success: true, categories: tree })
	} catch (error) {
		return res.status(500).json({ success: false, message: error.message || error })
	}
}

const getRootCategoriesWithChildren = async (req, res) => {
	try {
		const roots = await Category.find({ parent: null, isActive: true, showInMenu: true }).sort('displayOrder').lean()
		const populateChildren = async (categoryId) => {
			const children = await Category.find({ parent: categoryId, isActive: true }).sort('displayOrder').lean()
			for (const child of children) {
				child.children = await populateChildren(child._id)
			}
			return children
		}
		for (const root of roots) {
			root.children = await populateChildren(root._id)
		}
		return res.status(200).json({ success: true, categories: roots })
	} catch (error) {
		return res.status(500).json({ success: false, message: error.message || error })
	}
}

const getCategoryWithBreadcrumb = async (req, res) => {
	try {
		const { slug } = req.params
		const category = await Category.findOne({ slug }).populate('children')
		if (!category) return res.status(404).json({ success: false, message: 'Category not found' })
		const breadcrumb = await category.getAncestors()
		breadcrumb.push(category)
		return res.status(200).json({ success: true, category, breadcrumb })
	} catch (error) {
		return res.status(500).json({ success: false, message: error.message || error })
	}
}

const getCategoryBySlug = async (req, res) => {
	try {
		const { slug } = req.params
		const category = await Category.findOne({ slug })
		if (!category) return res.status(404).json({ success: false, message: 'Category not found' })
		return res.status(200).json({ success: true, data: category })
	} catch (error) {
		return res.status(500).json({ success: false, message: error.message || error })
	}
}

const deleteCategory = async (req, res) => {
	try {
		const { id } = req.body.id ? req.body : req.params // support both old and new
		if (!id) return res.status(400).json({ success: false, message: 'id is required' })
		const category = await Category.findById(id)
		if (!category) return res.status(404).json({ success: false, message: 'Category not found' })
		const hasChildren = await category.hasChildren()
		if (hasChildren) return res.status(400).json({ success: false, message: 'Cannot delete category with subcategories' })
		const productCount = await Product.countDocuments({ category: { $in: [id] } })
		if (productCount > 0) return res.status(400).json({ success: false, message: 'Cannot delete category with products' })
		await Category.deleteOne({ _id: id })
		return res.status(200).json({ success: true, message: 'Delete category successfully' })
	} catch (error) {
		return res.status(500).json({ success: false, message: error.message || error })
	}
}

module.exports = {
	// New
	createCategory,
	getAllCategories,
	updateCategory,
	updateCategoryHierarchy,
	getCategoryTree,
	getRootCategoriesWithChildren,
	getCategoryWithBreadcrumb,
	getCategoryBySlug,
	deleteCategory,
	// Backward-compatible exports
	addNewCategory,
	getListCategory,
	updateCategoryName
}