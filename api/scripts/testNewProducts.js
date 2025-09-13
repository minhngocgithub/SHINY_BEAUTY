const mongoose = require('mongoose');
const Product = require('../models/product.models');
require('dotenv').config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.CONNECT_DB_URL);
        console.log('MongoDB connected');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

const testNewProducts = async () => {
    try {
        // Check all products
        const allProducts = await Product.find({});
        console.log('Total products:', allProducts.length);
        
        // Check products with isNewProduct: true
        const newProducts = await Product.find({ isNewProduct: true });
        console.log('Products with isNewProduct: true:', newProducts.length);
        
        // Check products with isNewProduct: false
        const oldProducts = await Product.find({ isNewProduct: false });
        console.log('Products with isNewProduct: false:', oldProducts.length);
        
        // Check products without isNewProduct field
        const noFlagProducts = await Product.find({ isNewProduct: { $exists: false } });
        console.log('Products without isNewProduct field:', noFlagProducts.length);
        
        // Show sample products
        if (allProducts.length > 0) {
            console.log('\nSample product structure:');
            console.log(JSON.stringify(allProducts[0], null, 2));
        }
        
        // Test the query that getNewProduct uses
        const testQuery = await Product.find({ isNewProduct: true }).limit(10).sort("-createAt");
        console.log('\nTest query result count:', testQuery.length);
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        mongoose.connection.close();
    }
};

connectDB().then(() => {
    testNewProducts();
});
