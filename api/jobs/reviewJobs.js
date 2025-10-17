const cron = require('node-cron');
const Review = require('../models/review.models');
const Product = require('../models/product.models');

const initAutoPublishReviewsJob = () => {
    cron.schedule('0 */6 * * *', async () => {
        try {
            console.log('📝 Running auto-publish pending reviews...')

            const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000)

            const pendingReviews = await Review.find({
                status: 'pending',
                createdAt: { $lte: twoDaysAgo },
                verifiedPurchase: true,
                'flaggedBy.0': { $exists: false }
            });

            let publishedCount = 0;

            for (const review of pendingReviews) {
                const userReviews = await Review.find({
                    user: review.user,
                    status: { $in: ['published', 'hidden'] }
                });

                const hiddenCount = userReviews.filter(r => r.status === 'hidden').length

                if (hiddenCount === 0) {
                    review.status = 'published'
                    await review.save()
                    publishedCount++
                }
            }

            console.log(`✔ Auto-published ${publishedCount} reviews`)

        } catch (error) {
            console.error('Auto-publish reviews error:', error)
        }
    })
};
const initUpdateProductRatingsJob = () => {
    cron.schedule('0 2 * * *', async () => {
        try {
            console.log('⭐ Running update product ratings...')

            const productsWithReviews = await Review.distinct('product', {
                status: 'published',
                reviewType: 'rating'
            });

            let updatedCount = 0;

            for (const productId of productsWithReviews) {
                await Product.updateRatingsFromReviews(productId)
                updatedCount++
            }

            console.log(`✔ Updated ratings for ${updatedCount} products`)

        } catch (error) {
            console.error('❌ Update product ratings error:', error)
        }
    })
}
const initCleanupFlaggedReviewsJob = () => {
    cron.schedule('0 3 * * *', async () => {
        try {
            console.log('🚨 Running cleanup flagged reviews...')

            const heavilyFlagged = await Review.find({
                status: { $ne: 'hidden' },
                $expr: { $gte: [{ $size: '$flaggedBy' }, 3] }
            });

            let hiddenCount = 0

            for (const review of heavilyFlagged) {
                review.status = 'hidden'
                await review.save()
                hiddenCount++
            }

            console.log(`✔ Hidden ${hiddenCount} heavily flagged reviews`)

        } catch (error) {
            console.error('❌ Cleanup flagged reviews error:', error)
        }
    });
}
const initArchiveOldReviewsJob = () => {
    cron.schedule('0 4 1 * *', async () => {
        try {
            console.log('📦 Running archive old reviews...')

            const twoYearsAgo = new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1000)

            const result = await Review.updateMany(
                {
                    createdAt: { $lte: twoYearsAgo },
                    status: 'hidden'
                },
                {
                    $set: { archived: true }
                }
            )
            console.log(`✔ Archived ${result.modifiedCount} old reviews`)
        } catch (error) {
            console.error('❌ Archive old reviews error:', error)
        }
    })
}
module.exports = {
    initAutoPublishReviewsJob,
    initUpdateProductRatingsJob,
    initCleanupFlaggedReviewsJob,
    initArchiveOldReviewsJob
};