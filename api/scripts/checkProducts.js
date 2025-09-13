const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.CONNECT_DB_URL);
        console.log('✅ MongoDB connected');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
};

const checkProducts = async () => {
    try {
        console.log('\n🔍 Checking products in database...\n');
        
        // Get the raw MongoDB connection to avoid Mongoose middleware
        const db = mongoose.connection.db;
        const productsCollection = db.collection('products');
        
        // Check total products
        const totalProducts = await productsCollection.countDocuments();
        console.log(`📊 Total products: ${totalProducts}`);
        
        if (totalProducts === 0) {
            console.log('❌ No products found in database!');
            return;
        }
        
        // Check products with isNewProduct: true
        const newProducts = await productsCollection.find({ isNewProduct: true }).toArray();
        console.log(`🆕 Products with isNewProduct: true: ${newProducts.length}`);
        
        // Check products with isNewProduct: false
        const oldProducts = await productsCollection.find({ isNewProduct: false }).toArray();
        console.log(`📦 Products with isNewProduct: false: ${oldProducts.length}`);
        
        // Check products without isNewProduct field
        const noFlagProducts = await productsCollection.find({ isNewProduct: { $exists: false } }).toArray();
        console.log(`❓ Products without isNewProduct field: ${noFlagProducts.length}`);
        
        // Show sample product structure
        const sampleProduct = await productsCollection.findOne();
        if (sampleProduct) {
            console.log('\n📋 Sample product structure:');
            console.log('Fields:', Object.keys(sampleProduct));
            console.log('isNewProduct:', sampleProduct.isNewProduct);
            console.log('createAt:', sampleProduct.createAt);
            console.log('newUntil:', sampleProduct.newUntil);
        }
        
        // Test the exact query used in getNewProduct
        console.log('\n🧪 Testing getNewProduct query...');
        const testQuery = await productsCollection.find({ isNewProduct: true }).limit(10).sort({ createAt: -1 }).toArray();
        console.log(`Query result count: ${testQuery.length}`);
        
        if (testQuery.length > 0) {
            console.log('First product from query:');
            console.log('- Name:', testQuery[0].name);
            console.log('- isNewProduct:', testQuery[0].isNewProduct);
            console.log('- createAt:', testQuery[0].createAt);
        }
        
        // Check if products exist but have different field names
        console.log('\n🔍 Checking for alternative field names...');
        const firstProduct = await productsCollection.findOne();
        if (firstProduct) {
            const possibleFields = ['isNewProduct', 'isNew', 'newProduct', 'new'];
            possibleFields.forEach(field => {
                if (firstProduct.hasOwnProperty(field)) {
                    console.log(`Found field "${field}":`, firstProduct[field]);
                }
            });
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 Database connection closed');
    }
};

connectDB().then(() => {
    checkProducts();
});
