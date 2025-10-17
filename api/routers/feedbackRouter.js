const express = require('express')
const router = express.Router()
const feedbackController = require('../controller/feedbackController')
const { authenticate, authorizeAdmin } = require('../middleware/auth.middleware')
const {
  validateFeedbackData,
  sanitizeFeedbackContent,
  feedbackRateLimit
} = require('../middleware/feedback.middleware')

router.get('/me', authenticate, feedbackController.getMyFeedbacks)

router.post(
  '/',
  authenticate,
  feedbackRateLimit,
  sanitizeFeedbackContent,
  validateFeedbackData,
  feedbackController.createFeedback
)

router.get('/', authenticate, authorizeAdmin, feedbackController.getFeedbacks)
router.get('/:id', authenticate, authorizeAdmin, feedbackController.getFeedbackById)
router.post('/:id/replies', authenticate, authorizeAdmin, feedbackController.replyFeedback)
router.patch('/:id/status', authenticate, authorizeAdmin, feedbackController.updateFeedbackStatus)
router.delete('/:id', authenticate, authorizeAdmin, feedbackController.deleteFeedback)

module.exports = router
