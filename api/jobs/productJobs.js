const cron = require('node-cron');
const Product = require('../models/product.models');

const initProductMaintenanceJob = () => {
    cron.schedule('0 * * * *', async () => {
        try {
            console.log('🔧 Running hourly product maintenance...');

            const now = new Date();

            // Update new product status
            await Product.updateMany(
                {
                    isNewProduct: true,
                    newUntil: { $lte: now }
                },
                { $set: { isNewProduct: false } }
            )
            const expiredProducts = await Product.find({
                featured: true,
                featuredExpiry: { $lte: now }
            })
            for (const product of expiredProducts) {
                product.removeFeatured('Auto-expired')
                await product.save();
            }
            const expiredSales = await Product.find({
                isOnSale: true,
                saleEndDate: { $lte: now }
            });

            for (const product of expiredSales) {
                product.endSale()
                await product.save()
            }
            console.log(`✓ Product maintenance completed - ${expiredProducts.length} featured, ${expiredSales.length} sales expired`);

        } catch (error) {
            console.error('❌ Hourly product maintenance error:', error);
        }
    })
}

const initAutoPromotionJob = () => {
    cron.schedule('0 2 * * *', async () => {
        try {
            console.log('🎯 Running daily auto-promotion...')

            const candidates = await Product.find({
                featured: false,
                countInstock: { $gt: 0 },
                sold: { $gte: 3 },
                'ratings.average': { $gte: 3.5 }
            }).limit(30)

            let promotedCount = 0
            const maxPromotions = 8

            for (const product of candidates) {
                if (promotedCount >= maxPromotions) break

                const trendingScore = product.calculateTrendingScore()

                if (trendingScore >= 60) {
                    let featuredType = 'homepage'
                    let duration = 15;

                    if (trendingScore >= 85) {
                        featuredType = 'banner'
                        duration = 7;
                    } else if (trendingScore >= 75) {
                        featuredType = 'trending'
                        duration = 10;
                    }
                    const expiry = new Date();
                    expiry.setDate(expiry.getDate() + duration);

                    const success = product.setFeatured({
                        type: featuredType,
                        order: trendingScore,
                        expiry,
                        reason: `Auto-promoted (score: ${trendingScore})`
                    });

                    if (success) {
                        product.trendingScore = trendingScore;
                        await product.save();
                        promotedCount++;
                    }
                }
            }

            console.log(`✓ Auto-promoted ${promotedCount} products`);

        } catch (error) {
            console.error('❌ Auto-promotion error:', error);
        }
    });
};

// Update trending scores every 6 hours
const initTrendingScoreUpdateJob = () => {
    cron.schedule('0 */6 * * *', async () => {
        try {
            console.log('📊 Updating trending scores...');

            const products = await Product.find({
                $or: [
                    { featured: true },
                    { sold: { $gt: 0 } },
                    { isNewProduct: true }
                ]
            });

            let updatedCount = 0;

            for (const product of products) {
                const newScore = product.calculateTrendingScore();
                if (Math.abs(newScore - (product.trendingScore || 0)) > 5) {
                    product.trendingScore = newScore;
                    await product.save();
                    updatedCount++;
                }
            }

            console.log(`✓ Trending scores updated for ${updatedCount} products`)

        } catch (error) {
            console.error('❌ Trending score update error:', error)
        }
    });
};

// Monthly cleanup on 1st day at 3 AM
const initMonthlyCleanupJob = () => {
    cron.schedule('0 3 1 * *', async () => {
        try {
            console.log('🧹 Running monthly product cleanup...');

            const threeMonthsAgo = new Date();
            threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

            const result = await Product.updateMany(
                {
                    featured: false,
                    featuredExpiry: { $lt: threeMonthsAgo }
                },
                {
                    $unset: {
                        'featuredMetrics.views': '',
                        'featuredMetrics.clicks': '',
                        'featuredViews': '',
                        'featuredClicks': ''
                    }
                }
            )
            console.log(`✓ Monthly cleanup completed - Cleaned ${result.modifiedCount} products`);

        } catch (error) {
            console.error('❌ Monthly cleanup error:', error);
        }
    });
};

module.exports = {
    initProductMaintenanceJob,
    initAutoPromotionJob,
    initTrendingScoreUpdateJob,
    initMonthlyCleanupJob
};