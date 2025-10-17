const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
    },
    rating: {
        type: Number,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        required: true
    },
    images: [
        {
            public_id: String,
            url: String
        }
    ],
    reviewType: {
        type: String,
        enum: ['rating', 'question', 'feedback'],
        default: 'rating'
    },
    verifiedPurchase: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ['pending', 'published', 'hidden', 'flagged'],
        default: 'pending'
    },
    helpful: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    notHelpful: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    flaggedBy: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            reason: {
                type: String,
                required: true
            },
            flaggedAt: {
                type: Date,
                default: Date.now
            }
        }
    ],
    reply: [
        {
            admin: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            message: {
                type: String,
                required: true
            },
            repliedAt: {
                type: Date,
                default: Date.now
            }
        }
    ],
    isAnswered: {
        type: Boolean,
        default: false
    },
    archived: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

reviewSchema.index({ product: 1, status: 1, createdAt: -1 });
reviewSchema.index({ product: 1, reviewType: 1, status: 1 });
reviewSchema.index({ user: 1, product: 1, reviewType: 1 });
reviewSchema.index({ status: 1, createdAt: -1 });

reviewSchema.virtual('helpfulCount').get(function () {
    return this.helpful.length;
})

reviewSchema.virtual('notHelpfulCount').get(function () {
    return this.notHelpful.length;
})

reviewSchema.virtual('helpfulScore').get(function () {
    return this.helpful.length - this.notHelpful.length;
})

reviewSchema.virtual('isFlagged').get(function () {
    return this.flaggedBy.length >= 3 || this.status === 'flagged';
})

reviewSchema.statics.hasUserReviewed = async function (userId, productId, reviewType = 'rating') {
    const review = await this.findOne({
        user: userId,
        product: mongoose.Types.ObjectId(productId),
        reviewType: reviewType
    });
    return !!review;
}

reviewSchema.statics.getProductStats = async function(productId) {
  try {
    const stats = await this.aggregate([
      {
        $match: {
          product: new mongoose.Types.ObjectId(productId),
          status: 'published',
          reviewType: 'rating'
        }
      },
      {
        $group: {
          _id: '$product',
          avgRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          totalVerified: { $sum: { $cond: ['$verifiedPurchase', 1, 0] } },
          ratingDistribution: {
            $push: '$rating'
          }
        }
      }
    ])

    return stats[0] || {
      avgRating: 0,
      totalReviews: 0,
      totalVerified: 0,
      ratingDistribution: []
    }
  } catch (error) {
    console.error('Get Product Stats Error:', error)
    throw error
  }
}

reviewSchema.statics.getFeaturedReviews = async function(productId, limit = 3) {
  try {
    const reviews = await this.find({
      product: new mongoose.Types.ObjectId(productId),
      status: 'published',
      reviewType: 'rating',
      images: { $exists: true, $ne: [] }
    })
      .populate('user', 'name avatar')
      .sort({ rating: -1, helpful: -1, createdAt: -1 })
      .limit(limit)
      .lean()

    return reviews
  } catch (error) {
    console.error('Get Featured Reviews Error:', error)
    throw error
  }
}


reviewSchema.statics.getFilteredReviews = async function (productId, filters = {}) {
    const {
        type = 'all',
        minRating,
        hasImage = false,
        verifiedOnly = false,
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        order = 'desc'
    } = filters;

    const query = {
        product: productId,
        status: 'published'
    };

    if (type !== 'all') query.reviewType = type;
    if (hasImage) query.images = { $exists: true, $not: { $size: 0 } };
    if (verifiedOnly) query.verifiedPurchase = true;
    if (minRating) query.rating = { $gte: Number(minRating) };

    let sortOptions = {};
    if (sortBy === 'helpful') {
        sortOptions = { 'helpful.length': order === 'asc' ? 1 : -1 };
    } else if (sortBy === 'rating') {
        sortOptions = { rating: order === 'asc' ? 1 : -1 };
    } else {
        sortOptions = { [sortBy]: order === 'asc' ? 1 : -1 };
    }

    const reviews = await this.find(query)
        .populate('user', 'name avatar email')
        .populate('reply.admin', 'name avatar role')
        .sort(sortOptions)
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .lean();

    const total = await this.countDocuments(query);

    return {
        reviews,
        pagination: {
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(total / limit),
            total
        }
    };
}

reviewSchema.methods.isMarkedHelpfulBy = function (userId) {
    return this.helpful.some(id => id.toString() === userId.toString());
}

reviewSchema.methods.isMarkedNotHelpfulBy = function (userId) {
    return this.notHelpful.some(id => id.toString() === userId.toString());
}

reviewSchema.methods.isFlaggedBy = function (userId) {
    return this.flaggedBy.some(flag => flag.user.toString() === userId.toString());
};

reviewSchema.post('save', async function (doc) {
    if (doc.reviewType === 'rating' && doc.status === 'published') {
        try {
            const Product = mongoose.model('Product');
            await Product.updateRatingsFromReviews(doc.product);
        } catch (error) {
            console.error('Error updating product ratings after review save:', error);
        }
    }
})

reviewSchema.post('remove', async function (doc) {
    if (doc.reviewType === 'rating') {
        try {
            const Product = mongoose.model('Product');
            await Product.updateRatingsFromReviews(doc.product);
        } catch (error) {
            console.error('Error updating product ratings after review remove:', error);
        }
    }
})

reviewSchema.post('findOneAndUpdate', async function (doc) {
    if (doc && doc.reviewType === 'rating') {
        try {
            const Product = mongoose.model('Product');
            await Product.updateRatingsFromReviews(doc.product);
        } catch (error) {
            console.error('Error updating product ratings after review update:', error);
        }
    }
})

module.exports = mongoose.model('Review', reviewSchema);
