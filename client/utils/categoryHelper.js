// Check if product belongs to special categories
export function getSpecialCategoryBadge(categories = []) {
    const categoryNames = categories.map(c => c.name || c)

    if (categoryNames.includes('Beauty under 20')) {
        return '💰 Affordable Luxury Under $20'
    }
    if (categoryNames.includes('Sale & Offers')) {
        return '🔥 Special Offer Available'
    }
    if (categoryNames.includes('MiniSize')) {
        return '✈️ Travel-Friendly Size'
    }
    if (categoryNames.includes('Gifts & GiftCards')) {
        return '🎁 Perfect Gift Option'
    }
    if (categoryNames.includes('News')) {
        return '🆕 Latest Release'
    }

    return null
}

// Filter products by category
export function filterByCategory(products, categoryId) {
    return products.filter(product => {
        if (!product.category) return false
        if (Array.isArray(product.category)) {
            return product.category.some(cat =>
                (cat._id === categoryId) || (cat === categoryId)
            )
        }
        return product.category._id === categoryId || product.category === categoryId
    })
}

// Get main category (first one)
export function getMainCategory(product) {
    if (!product.category || !Array.isArray(product.category)) return null
    return product.category[0] || null
}

// Check if product has specific category
export function hasCategory(product, categoryName) {
    if (!product.category) return false

    const categories = Array.isArray(product.category)
        ? product.category
        : [product.category]

    return categories.some(cat =>
        (cat.name === categoryName) || (cat === categoryName)
    )
}

// Get all unique categories from products array
export function getAllCategories(products) {
    const categoriesMap = new Map()

    products.forEach(product => {
        if (product.category && Array.isArray(product.category)) {
            product.category.forEach(cat => {
                if (cat._id && !categoriesMap.has(cat._id)) {
                    categoriesMap.set(cat._id, cat)
                }
            })
        }
    })

    return Array.from(categoriesMap.values())
}