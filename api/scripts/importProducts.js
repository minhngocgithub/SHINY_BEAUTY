const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Product = require('../models/product.models');
const Category = require('../models/category.models');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/booking-app';

// Category mapping - bạn cần thay đổi các ID này theo category thực tế trong database
const CATEGORY_MAPPING = {
    '67bb2f2e81e544809ef8e1b5': 'Makeup', // Thay bằng ObjectId thực tế
    // Thêm các mapping khác nếu cần
};

async function connectDB() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
}

async function getCategoryId(categoryName) {
    try {
        // Tìm category theo tên
        let category = await Category.findOne({ name: { $regex: new RegExp(categoryName, 'i') } });
        
        if (!category) {
            // Nếu không tìm thấy, tạo mới
            category = await Category.create({ name: categoryName });
            console.log(`📝 Created new category: ${categoryName}`);
        }
        
        return category._id;
    } catch (error) {
        console.error(`❌ Error getting category for ${categoryName}:`, error);
        return null;
    }
}

function transformProductData(rawProduct) {
    return {
        name: rawProduct.name,
        image: rawProduct.image || [],
        brand: rawProduct.brand,
        category: rawProduct.category || [], // Sẽ được xử lý sau
        description: rawProduct.description,
        featured: rawProduct.featured || false,
        isNewProduct: rawProduct.isNewProduct || true,
        isBestSeller: rawProduct.isBestSeller || false,
        price: rawProduct.price || 0,
        countInstock: rawProduct.countInstock || 0,
        sold: rawProduct.sold || 0,
        ratings: {
            average: rawProduct.ratings?.average || 0,
            count: rawProduct.ratings?.count || 0,
            postedBy: null // Để null vì không có user thực tế
        },
        totalRating: rawProduct.ratings?.count || 0, // Tính từ ratings.count
        createAt: new Date(),
        updatedAt: new Date()
    };
}

async function importProducts() {
    try {
        // Đọc file JSON
        const jsonFilePath = path.join(__dirname, '../../../../makeup_data.json');
        
        if (!fs.existsSync(jsonFilePath)) {
            console.error('❌ File makeup_data.json not found');
            console.log('📁 Please place the file in the project root directory');
            return;
        }

        console.log('📖 Reading JSON file...');
        const jsonData = fs.readFileSync(jsonFilePath, 'utf8');
        const products = JSON.parse(jsonData);

        if (!Array.isArray(products)) {
            console.error('❌ Invalid JSON format - expected array of products');
            return;
        }

        console.log(`📊 Found ${products.length} products to import`);

        let successCount = 0;
        let errorCount = 0;

        // Xử lý từng product
        for (let i = 0; i < products.length; i++) {
            const rawProduct = products[i];
            
            try {
                // Transform data
                const transformedProduct = transformProductData(rawProduct);

                // Xử lý category
                if (rawProduct.category && Array.isArray(rawProduct.category)) {
                    const categoryIds = [];
                    for (const categoryId of rawProduct.category) {
                        // Nếu là string ID, tìm category tương ứng
                        if (typeof categoryId === 'string') {
                            const category = await Category.findById(categoryId);
                            if (category) {
                                categoryIds.push(category._id);
                            } else {
                                // Tạo category mới nếu không tìm thấy
                                const newCategory = await Category.create({ name: `Category_${categoryId}` });
                                categoryIds.push(newCategory._id);
                                console.log(`📝 Created new category: Category_${categoryId}`);
                            }
                        }
                    }
                    transformedProduct.category = categoryIds;
                }

                // Kiểm tra product đã tồn tại chưa
                const existingProduct = await Product.findOne({ 
                    name: transformedProduct.name,
                    brand: transformedProduct.brand 
                });

                if (existingProduct) {
                    console.log(`⚠️  Product already exists: ${transformedProduct.name}`);
                    continue;
                }

                // Tạo product mới
                const newProduct = await Product.create(transformedProduct);
                successCount++;
                
                if (successCount % 10 === 0) {
                    console.log(`✅ Imported ${successCount} products...`);
                }

            } catch (error) {
                errorCount++;
                console.error(`❌ Error importing product ${rawProduct.name}:`, error.message);
            }
        }

        console.log('\n🎉 Import completed!');
        console.log(`✅ Successfully imported: ${successCount} products`);
        console.log(`❌ Failed to import: ${errorCount} products`);

    } catch (error) {
        console.error('❌ Import error:', error);
    }
}

async function main() {
    try {
        await connectDB();
        await importProducts();
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

module.exports = { importProducts, transformProductData };
