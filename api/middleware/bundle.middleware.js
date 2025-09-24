const bundleProduct = require('../models/productBundle.models');
const bundleUtils = require('../utils/bundle.utils')

const validateBundleExist = async (req, res, next) => {
    try {
        const bundle = await bundleProduct.findById(req.params.id);
        if (!bundle) {
            return next(new ErrorHandler('Bundle not found', 404));
        }
        if (!bundle.isActive) {
            return next(new ErrorHandler('Bundle is not available', 400));
        }
        req.bundle = bundle
        next(); 

    } catch (error) {
        return res.status(400).json({ message: 'Invalid bundle items' });
    }
}
const validateBundleItems = async (req, res, next) => {
    try {
        const { items } = req.body;
        
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: 'Bundle must contain at least one item'})
        }
        const productIds = items.map(item => item.product.toString());
        const uniqueProductIds = [...new Set(productIds)];
        
        if (productIds.length !== uniqueProductIds.length) {
            return next(new ErrorHandler('Bundle cannot contain duplicate products', 400));
        }
        for (const item of items) {
            if (!item.product || !item.quantity || item.quantity <= 0) {
                return res.status(400).json({ message: 'Each item must have a valid product ID and quantity greater than 0' });
            }
        }
        next();
    } catch (error) {
        return res.status(400).json({ message: 'Invalid bundle items' })
    }
}
const validateBundlePricing = async (req, res, next) => {
    try {
        const { bundlePrice, items } = req.body;
        
        if (!bundlePrice || bundlePrice <= 0) {
            return res.status(400).json({ message: 'Bundle price must be greater than 0' })
        }
        const pricingValidation = await bundleUtils.validateBundlePricing(bundlePrice, items)
        req.pricingInfo = pricingValidation;
        
        next();
    } catch (error) {
        return res.status(400).json({ message: 'Error validating bundle pricing' })
    }
};
const checkBundleStock = async (req, res, next) => {
    try {
        const { quantity = 1 } = req.body;
        const bundle = req.bundle || await bundleProduct.findById(req.params.id);
        if (!bundle) {
            return res.status(404).json({ message: 'Bundle not found' });
        }
        const stockCheck = await bundle.checkStock();
        if (!stockCheck.available) {
            return res.status(400).json({ message: stockCheck.reason });
        }
        const availableQuantity = await bundle.getAvailableQuantity();
        if (quantity > availableQuantity) {
            return res.status(400).json({ message: `Only ${availableQuantity} bundles available in stock` });
        }
        req.stockInfo = {
            available: stockCheck.available,
            maxQuantity: availableQuantity
        }
        next()
    } catch (error) {
        return res.status(400).json({ message: 'Error checking bundle stock' });
    }
}
const validateBundleCompatibility = (compatibilityRules = {}) => {
    return async (req, res, next) => {
        try {
            const { items } = req.body
            
            if (!items) {
                return next();
            }
            
            const compatibility = bundleUtils.validateBundleCompatibility(items, compatibilityRules)
            
            if (!compatibility.isCompatible) {
                return res.status(400).json({ message: `Bundle compatibility issues: ${compatibility.issues.join(', ')}` })
            }
            next();
        } catch (error) {
            return res.status(400).json({ message: 'Error validating bundle compatibility' })
        }
    }
}
const checkSeasonalRelevance = async (req, res, next) => {
    try {
        if (req.query.seasonal === 'true') {
            const bundle = req.bundle || await bundleProduct.findById(req.params.id).populate('items.product')
            
            if (bundle) {
                const seasonalInfo = bundleUtils.checkSeasonalEligibility(bundle)
                req.seasonalInfo = seasonalInfo
            }
        }
        next();
    } catch (error) {
        return res.status(400).json({ message: 'Error checking seasonal relevance' })
    }
}
const trackBundleViews = async (req, res, next) => {
    try {
        const bundleId = req.params.id
        if (req.method === 'GET' && bundleId) {
            await bundleProduct.findByIdAndUpdate(
                bundleId,
                { $inc: { views: 1 } },
                { new: false }
            );
        }
        next();
    } catch (error) {
        return res.status(400).json({ message: 'Error tracking bundle views' });
    }
}
const validateAdminBundleOperation = async (req, res, next) => {
    try {
        const { featured, featuredType } = req.body
        if (featured && (!featuredType || !['homepage', 'category', 'deal'].includes(featuredType))) {
            return res.status(400).json({ message: 'Invalid featured type' });
        }
        if (featured) {
            const featuredCount = await bundleProduct.countDocuments({
                featured: true,
                featuredType,
                isActive: true
            });
            
            const maxFeatured = {
                homepage: 8,
                category: 12,
                deal: 6
            };
            
            if (featuredCount >= maxFeatured[featuredType]) {
                return res.status(400).json({ message: `Cannot feature more than ${maxFeatured[featuredType]} bundles on ${featuredType}` });
            }
        }
        next();
    } catch (error) {
        
    }
}
const formatBundleResponse = (req, res, next) => {
    const originalJson = res.json;
    
    res.json = function(data) {
        if (data.bundle) {
            data.bundle = bundleUtils.formatBundleForCart(data.bundle);
        }
        
        if (data.bundles && Array.isArray(data.bundles)) {
            data.bundles = data.bundles.map(bundle => bundleUtils.formatBundleForCart(bundle));
        }
        return originalJson.call(this, data);
    };
    next();
};

module.exports = { 
    validateBundleExist,
    validateBundleItems,
    validateBundlePricing,
    checkBundleStock,
    validateBundleCompatibility,
    checkSeasonalRelevance,
    trackBundleViews,
    validateAdminBundleOperation,
    formatBundleResponse,

}