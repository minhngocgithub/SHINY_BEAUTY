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

const updateNewProducts = async () => {
    try {
        console.log('\n🔧 Updating products to isNewProduct: true...\n');
        
        const db = mongoose.connection.db;
        const productsCollection = db.collection('products');
        
        // Update the 10 most recent products to isNewProduct: true
        const result = await productsCollection.updateMany(
            {}, // Update all products
            { 
                $set: { 
                    isNewProduct: true,
                    newUntil: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000) // 15 days from now
                } 
            }
        );
        
        console.log(`✅ Updated ${result.modifiedCount} products to isNewProduct: true`);
        
        // Verify the update
        const newProductsCount = await productsCollection.countDocuments({ isNewProduct: true });
        console.log(`🆕 Products with isNewProduct: true: ${newProductsCount}`);
        
        // Show sample updated product
        const sampleProduct = await productsCollection.findOne({ isNewProduct: true });
        if (sampleProduct) {
            console.log('\n📋 Sample updated product:');
            console.log('- Name:', sampleProduct.name);
            console.log('- isNewProduct:', sampleProduct.isNewProduct);
            console.log('- newUntil:', sampleProduct.newUntil);
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 Database connection closed');
    }
};

connectDB().then(() => {
    updateNewProducts();
});
