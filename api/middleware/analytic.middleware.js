const analyticController = require('../controller/analyticController')

const analyticMiddleware = async(req, res) => {
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
}

module.exports = analyticMiddleware