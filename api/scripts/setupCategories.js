const mongoose = require('mongoose');
const Category = require('../models/category.models');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/booking-app';

async function connectDB() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
}

async function setupCategories() {
    try {
        // Danh sách category mẫu cho makeup
        const defaultCategories = [
            'Makeup',
            'Skincare',
            'Hair Care',
            'Fragrance',
            'Tools & Brushes',
            'Nail Care',
            'Bath & Body',
            'Men\'s Grooming',
            'Natural & Organic',
            'Luxury & Premium'
        ];

        console.log('📝 Setting up default categories...');

        let createdCount = 0;
        let existingCount = 0;

        for (const categoryName of defaultCategories) {
            try {
                // Kiểm tra category đã tồn tại chưa
                const existingCategory = await Category.findOne({ 
                    name: { $regex: new RegExp(`^${categoryName}$`, 'i') } 
                });

                if (existingCategory) {
                    console.log(`⚠️  Category already exists: ${categoryName}`);
                    existingCount++;
                } else {
                    // Tạo category mới
                    await Category.create({ name: categoryName });
                    console.log(`✅ Created category: ${categoryName}`);
                    createdCount++;
                }
            } catch (error) {
                console.error(`❌ Error creating category ${categoryName}:`, error.message);
            }
        }

        console.log('\n🎉 Category setup completed!');
        console.log(`✅ New categories created: ${createdCount}`);
        console.log(`⚠️  Existing categories: ${existingCount}`);

        // Hiển thị tất cả categories
        const allCategories = await Category.find().sort({ name: 1 });
        console.log('\n📋 All categories:');
        allCategories.forEach(cat => {
            console.log(`  - ${cat.name} (ID: ${cat._id})`);
        });

    } catch (error) {
        console.error('❌ Setup error:', error);
    }
}

async function main() {
    try {
        await connectDB();
        await setupCategories();
    } catch (error) {
        console.error('❌ Main error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
        process.exit(0);
    }
}

// Chạy script
if (require.main === module) {
    main();
}

module.exports = { setupCategories };
