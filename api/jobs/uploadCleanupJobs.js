const cron = require('node-cron');
const fs = require('fs');
const path = require('path');

const cleanupUploadFolder = async (daysOld = 15) => {
    try {
        const uploadDir = path.join(__dirname, '../../uploads');
        
        if (!fs.existsSync(uploadDir)) {
            console.log('Upload folder does not exist');
            return { deletedCount: 0, totalSizeMB: 0 };
        }

        const now = Date.now();
        const maxAge = daysOld * 24 * 60 * 60 * 1000;
        let deletedCount = 0;
        let totalSize = 0;

        const files = fs.readdirSync(uploadDir);

        for (const file of files) {
            const filePath = path.join(uploadDir, file);
            
            try {
                const stats = fs.statSync(filePath);
                
                if (stats.isDirectory() || file === '.gitkeep') {
                    continue;
                }

                const fileAge = now - stats.mtimeMs
                
                if (fileAge > maxAge) {
                    const fileSize = stats.size
                    fs.unlinkSync(filePath)
                    deletedCount++;
                    totalSize += fileSize
                }
            } catch (fileError) {
                console.error(`Error processing file ${file}:`, fileError.message)
            }
        }

        const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(2)
        console.log(`✓ Cleanup completed - Deleted ${deletedCount} files, freed ${totalSizeMB} MB`)
        
        return { deletedCount, totalSizeMB };
    } catch (error) {
        console.error('❌ Upload folder cleanup error:', error)
        return { deletedCount: 0, totalSizeMB: 0 }
    }
};

// Daily cleanup at 3:30 AM - Remove files older than 15 days
const initDailyCleanupJob = () => {
    cron.schedule('30 3 * * *', async () => {
        try {
            console.log('🧹 Running daily upload folder cleanup...')
            await cleanupUploadFolder(15);
        } catch (error) {
            console.error('Daily cleanup error:', error)
        }
    });
};

// Every 6 hours - Remove orphaned files older than 1 day
const initSixHourlyCleanupJob = () => {
    cron.schedule('0 */6 * * *', async () => {
        try {
            console.log('🧹 Running 6-hourly cleanup for orphaned files...')
            await cleanupUploadFolder(1);
        } catch (error) {
            console.error('6-hourly cleanup error:', error)
        }
    });
};

module.exports = {
    initDailyCleanupJob,
    initSixHourlyCleanupJob,
    cleanupUploadFolder
};