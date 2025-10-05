const cron = require('node-cron');
const SaleProgram = require('../models/saleProgram.models');

// Hourly sale program maintenance
const initSaleProgramMaintenanceJob = () => {
    cron.schedule('0 * * * *', async () => {
        try {
            console.log('🏷️ Running sale program maintenance...');

            const now = new Date();

            const expiredSalePrograms = await SaleProgram.updateMany(
                {
                    isActive: true,
                    status: 'active',
                    endDate: { $lte: now }
                },
                {
                    $set: {
                        isActive: false,
                        status: 'expired'
                    }
                }
            );

            console.log(`✓ Expired ${expiredSalePrograms.modifiedCount} sale programs`);

        } catch (error) {
            console.error('❌ Sale program maintenance error:', error);
        }
    });
};

// Weekly cleanup on Sunday at 3 AM
const initWeeklySaleProgramCleanupJob = () => {
    cron.schedule('0 3 * * 0', async () => {
        try {
            console.log('🧹 Running weekly sale program cleanup...');

            const oneMonthAgo = new Date();
            oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

            const result = await SaleProgram.updateMany(
                {
                    status: 'expired',
                    endDate: { $lt: oneMonthAgo }
                },
                {
                    $unset: {
                        'history': '',
                        'trackingCode': ''
                    }
                }
            );

            console.log(`✓ Weekly cleanup completed - Cleaned ${result.modifiedCount} old sale programs`);

        } catch (error) {
            console.error('❌ Weekly cleanup error:', error);
        }
    });
};

module.exports = {
    initSaleProgramMaintenanceJob,
    initWeeklySaleProgramCleanupJob
};