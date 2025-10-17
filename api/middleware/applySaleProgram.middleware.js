// middleware/applySaleProgram.middleware.js
const SaleProgramUtils = require('../utils/saleProgram.utils');

const applySaleProgramToProducts = async (req, res, next) => {
    const originalJson = res.json.bind(res);
    
    res.json = async function(data) {
        const shouldApplySale = !req.query.saleProgramId;
        
        if (shouldApplySale) {
            if (data.product) {
                data.product = await applyBestSale(data.product, req.user);
            } else if (data.products) {
                data.products = await Promise.all(
                    data.products.map(p => applyBestSale(p, req.user))
                );
            }
        }
        
        return originalJson(data);
    };
    
    next();
};

async function applyBestSale(product, user) {
    const salePrograms = await SaleProgramUtils.getSaleProgramsForProduct(
        product,
        user
    );
    
    const discountInfo = SaleProgramUtils.calculateProductDiscount(
        product,
        salePrograms
    );
    
    return {
        ...product,
        originalPrice: product.price,
        salePrice: discountInfo.finalPrice,
        discount: discountInfo.amount,
        discountPercentage: ((discountInfo.amount / product.price) * 100).toFixed(2),
        hasSale: discountInfo.amount > 0,
        isOnSale: discountInfo.amount > 0,
        saleProgram: discountInfo.program ? {
            id: discountInfo.program._id,
            title: discountInfo.program.title,
            badge: discountInfo.program.displaySettings?.badge
        } : null
    };
}

module.exports = {applySaleProgramToProducts};

