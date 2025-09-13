const express = require('express')
const router = express.Router()
const adminController = require('../controller/adminController')
const analyticController = require('../controller/analyticController')
const saledController = require('../controller/saleProductController')
const featuredController = require('../controller/featuredController')
const { authenticate, authorizeAdmin } = require('../middleware/auth.middleware')

// User management routes
router.get('/allUser', authenticate, authorizeAdmin, adminController.getUsers)
router.get('/:id', authenticate, authorizeAdmin, adminController.getUser)
router.put('/update/:id', authenticate, authorizeAdmin, adminController.updateUser)
router.delete('/delete/:id', authenticate, authorizeAdmin, adminController.deleteUser)

// Analytics routes
router.get('/anatylic', authenticate, authorizeAdmin, async (req, res) => {
    try {
        const analyticData = await analyticController.getAnalyticData()
        const endDate = new Date();
        const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
        const dailySaleData = await analyticController.getDailySaleData(startDate, endDate)
        res.json({
            analyticData,
            dailySaleData
        })
    } catch (error) {
        console.log("Error in analytics route", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
})
router.get('/analytic-turnover', authenticate, authorizeAdmin, analyticController.getAnalyticData)
router.get('/daily-sales', authenticate, authorizeAdmin, analyticController.getDailySaleData)
// Feature product route
module.exports = router