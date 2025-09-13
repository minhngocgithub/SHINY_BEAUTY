const fs = require('fs');
const path = require('path');

function validateProductData(product, index) {
    const errors = [];
    
    // Kiểm tra các trường required
    if (!product.name) errors.push('Missing name');
    if (!product.brand) errors.push('Missing brand');
    if (!product.description) errors.push('Missing description');
    if (!product.price) errors.push('Missing price');
    
    // Kiểm tra kiểu dữ liệu
    if (product.name && typeof product.name !== 'string') errors.push('Name must be string');
    if (product.brand && typeof product.brand !== 'string') errors.push('Brand must be string');
    if (product.price && typeof product.price !== 'number') errors.push('Price must be number');
    if (product.countInstock && typeof product.countInstock !== 'number') errors.push('countInstock must be number');
    
    // Kiểm tra image array
    if (product.image && !Array.isArray(product.image)) {
        errors.push('Image must be array');
    } else if (product.image && product.image.length > 0) {
        product.image.forEach((img, imgIndex) => {
            if (!img.public_id || !img.url) {
                errors.push(`Image ${imgIndex}: Missing public_id or url`);
            }
        });
    }
    
    // Kiểm tra category array
    if (product.category && !Array.isArray(product.category)) {
        errors.push('Category must be array');
    }
    
    // Kiểm tra ratings
    if (product.ratings) {
        if (typeof product.ratings.average !== 'number') errors.push('Rating average must be number');
        if (typeof product.ratings.count !== 'number') errors.push('Rating count must be number');
    }
    
    return errors;
}

function testDataStructure() {
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

        console.log(`📊 Found ${products.length} products`);
        console.log('\n🔍 Validating data structure...\n');

        let validCount = 0;
        let errorCount = 0;
        const allErrors = [];

        // Kiểm tra từng product
        products.forEach((product, index) => {
            const errors = validateProductData(product, index);
            
            if (errors.length === 0) {
                validCount++;
            } else {
                errorCount++;
                allErrors.push({
                    index: index + 1,
                    name: product.name || 'Unknown',
                    errors: errors
                });
            }
        });

        // Hiển thị kết quả
        console.log(`✅ Valid products: ${validCount}`);
        console.log(`❌ Products with errors: ${errorCount}`);
        
        if (errorCount > 0) {
            console.log('\n📋 Error details:');
            allErrors.slice(0, 10).forEach(error => { // Chỉ hiển thị 10 lỗi đầu
                console.log(`\nProduct ${error.index}: ${error.name}`);
                error.errors.forEach(err => console.log(`  - ${err}`));
            });
            
            if (allErrors.length > 10) {
                console.log(`\n... and ${allErrors.length - 10} more errors`);
            }
        }

        // Hiển thị sample data
        if (products.length > 0) {
            console.log('\n📝 Sample product structure:');
            const sample = products[0];
            console.log(JSON.stringify(sample, null, 2));
        }

        // Thống kê
        console.log('\n📊 Data statistics:');
        const brands = [...new Set(products.map(p => p.brand).filter(Boolean))];
        const categories = [...new Set(products.flatMap(p => p.category || []).filter(Boolean))];
        
        console.log(`- Unique brands: ${brands.length}`);
        console.log(`- Unique category IDs: ${categories.length}`);
        console.log(`- Price range: ${Math.min(...products.map(p => p.price || 0))} - ${Math.max(...products.map(p => p.price || 0))}`);
        
        if (brands.length > 0) {
            console.log(`- Sample brands: ${brands.slice(0, 5).join(', ')}`);
        }

    } catch (error) {
        console.error('❌ Test error:', error);
    }
}

// Chạy test
if (require.main === module) {
    testDataStructure();
}

module.exports = { testDataStructure, validateProductData };
