const express = require('express')
const router = express.Router()
const upload = require('../config/multer')
const reviewController = require('../controller/reviewController')
const { authenticate, authorizeAdmin } = require('../middleware/auth.middleware')
const {
  validateReviewData,
  canReviewProduct,
  checkDuplicateReview,
  sanitizeReviewContent,
  reviewRateLimit,
  validateProductExists,
  isReviewOwner,
  canEditReview
} = require('../middleware/review.middleware')

router.get('/product/:productId', reviewController.getReviewsByProduct)
router.get('/products/:productId/reviews', reviewController.getReviewsByProduct)

router.get('/product/:productId/summary', reviewController.getProductReviewSummary)
router.get('/products/:productId/reviews/summary', reviewController.getProductReviewSummary)

router.get('/product/:productId/can-review', authenticate, reviewController.canUserReview)
router.get('/products/:productId/can-review', authenticate, reviewController.canUserReview)

router.get('/me', authenticate, reviewController.getUserReviews)
router.get('/my-reviews', authenticate, reviewController.getUserReviews)

router.post(
  '/',
  authenticate,
  upload.array('images', 5),
  reviewRateLimit,
  sanitizeReviewContent,
  validateReviewData,
  validateProductExists,
  canReviewProduct,
  checkDuplicateReview,
  reviewController.createReview
)

router.post(
  '/reviews',
  authenticate,
  upload.array('images', 5),
  reviewRateLimit,
  sanitizeReviewContent,
  validateReviewData,
  validateProductExists,
  canReviewProduct,
  checkDuplicateReview,
  reviewController.createReview
)

router.post('/:id/helpful', authenticate, reviewController.markHelpful)
router.post('/reviews/:id/helpful', authenticate, reviewController.markHelpful)

router.put(
  '/:id',
  authenticate,
  isReviewOwner,
  canEditReview,
  sanitizeReviewContent,
  reviewController.updateReview
)
router.put(
  '/reviews/:id',
  authenticate,
  isReviewOwner,
  canEditReview,
  sanitizeReviewContent,
  reviewController.updateReview
)

router.delete('/:id', authenticate, reviewController.deleteReview)
router.delete('/reviews/:id', authenticate, reviewController.deleteReview)

router.post('/:id/flag', authenticate, reviewController.flagReview)
router.post('/reviews/:id/flag', authenticate, reviewController.flagReview)

router.post('/:id/reply', authenticate, authorizeAdmin, reviewController.replyReview)
router.post('/reviews/:id/reply', authenticate, authorizeAdmin, reviewController.replyReview)
router.post('/:id/replies', authenticate, authorizeAdmin, reviewController.replyReview)
router.post('/reviews/:id/replies', authenticate, authorizeAdmin, reviewController.replyReview)

router.patch('/:id/moderate', authenticate, authorizeAdmin, reviewController.moderateReview)
router.patch('/reviews/:id/moderate', authenticate, authorizeAdmin, reviewController.moderateReview)
router.patch('/:id/moderation', authenticate, authorizeAdmin, reviewController.moderateReview)
router.patch('/reviews/:id/moderation', authenticate, authorizeAdmin, reviewController.moderateReview)

router.delete('/:id/admin', authenticate, authorizeAdmin, reviewController.deleteReview)
router.delete('/reviews/:id/admin', authenticate, authorizeAdmin, reviewController.deleteReview)

module.exports = router
