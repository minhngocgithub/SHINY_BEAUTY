const cron = require('node-cron');
const productJobs = require('./productJobs');
const uploadCleanupJobs = require('./uploadCleanupJobs');
const saleProgramJobs = require('./saleProgramJobs');

const initializeCronJobs = () => {
    console.log('🚀 Initializing cron jobs...');

    productJobs.initProductMaintenanceJob();
    productJobs.initAutoPromotionJob();
    productJobs.initTrendingScoreUpdateJob();
    productJobs.initMonthlyCleanupJob();
    
    uploadCleanupJobs.initDailyCleanupJob();
    uploadCleanupJobs.initSixHourlyCleanupJob();
    
    saleProgramJobs.initSaleProgramMaintenanceJob();
    saleProgramJobs.initWeeklySaleProgramCleanupJob();
    
    console.log('✅ All cron jobs initialized successfully');
};

module.exports = { initializeCronJobs };