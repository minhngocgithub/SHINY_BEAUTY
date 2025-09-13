const Order = require('../models/order.models')
const Product = require('../models/product.models')
const User = require('../models/user.models')

const getAnalyticData = async(req, res) => {
    const totalUsers = await User.countDocuments()
    const totalProducts = await Product.countDocuments()

    const saleData = await Order.aggregate([
        {
            $group: {
				_id: null, // it groups all documents together,
				totalSales: { $sum: 1 },
				totalRevenue: { $sum: "$totalAmount" },
			},
        }
    ])

    const { totalSale, totalRevenue } = saleData[0] || { totalSale : 0, totalRevenue : 0 }
    return {
        users: totalUsers,
        products: totalProducts,
        totalSale,
        totalRevenue
    }
}
const getDailySaleData = async(startDate, endDate) => {
    try {
        const dailySaleData = await Order.aggregate([
            {
                $match: {
					createdAt: {
						$gte: startDate,
						$lte: endDate,
					},
				},
            },
            {
                $group: {
					_id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
					sales: { $sum: 1 },
					revenue: { $sum: "$totalAmount" },
				},
            },
            { $sort: { _id: 1 } },
        ])
        const dateArray = getDateInRange(startDate, endDate)
        return dateArray.map((date) => {
            const foundData = dailySaleData.find((item) => item._id === date)
            return {
				date,
				sales: foundData?.sales || 0,
				revenue: foundData?.revenue || 0,
			};
        })
    } catch (error) {
        return error
    }

}
function getDateInRange(startDate, endDate) {
    const dates = []
    let currentDate = new Date(startDate)
    while(currentDate <= endDate) {
        dates.push(currentDate.toISOString().split["T"][0])
        currentDate.setDate(currentDate.getDate() + 1)
    }
    return dates
}
module.exports = {
    getAnalyticData,
    getDailySaleData
}