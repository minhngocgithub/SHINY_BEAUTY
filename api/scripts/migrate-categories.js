require('dotenv').config()
const mongoose = require('mongoose')
const Category = require('../models/category.models')
const Product = require('../models/product.models')
const slugify = require('slugify')

async function migrateExistingCategories() {
	const categories = await Category.find({})
	for (const cat of categories) {
		if (!cat.slug) cat.slug = slugify(cat.name || `cat-${cat._id}`, { lower: true, strict: true })
		if (typeof cat.level !== 'number') {
			cat.level = cat.parent ? 1 : 0
		}
		if (!cat.path) {
			cat.path = cat.parent ? `${cat.parent}/${cat._id}` : `${cat._id}`
		}
		if (typeof cat.displayOrder !== 'number') cat.displayOrder = 0
		if (typeof cat.isActive !== 'boolean') cat.isActive = true
		if (typeof cat.showInMenu !== 'boolean') cat.showInMenu = true
		await cat.save({ validateBeforeSave: false })
	}
	console.log(`✅ Migrated ${categories.length} categories`)
}

async function updateProductCounts() {
	const categories = await Category.find({})
	for (const cat of categories) {
		const count = await Product.countDocuments({ category: cat._id })
		cat.productCount = count
		await cat.save({ validateBeforeSave: false })
	}
	console.log('✅ Updated product counts')
}

async function run() {
	try {
		const uri = process.env.MONGODB_URI || process.env.MONGO_URI
		if (!uri) throw new Error('Missing MONGODB_URI')
		await mongoose.connect(uri)
		console.log('🔗 Connected to MongoDB')
		await migrateExistingCategories()
		await updateProductCounts()
		console.log('✅ Migration completed successfully!')
		process.exit(0)
	} catch (err) {
		console.error('❌ Migration failed:', err)
		process.exit(1)
	}
}

run()


