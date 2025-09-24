const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const session = require('express-session');
const cron = require('node-cron');

dotenv.config();

const passport = require('./config/passport');
const Product = require('./models/product.models');

const app = express();

// Import routers
const authsRouter = require('../api/routers/authsRouter');
const otpRouter = require('../api/routers/otpRouter');
const adminRouter = require('../api/routers/adminRouter');
const productRouter = require('../api/routers/productRouter');
const orderRouter = require('../api/routers/orderRouter');
const couponRouter = require('../api/routers/couponRouter');
const paymentRouter = require('../api/routers/paymentRouter');
const cartRouter = require('../api/routers/cartRouter');
const categoryRouter = require('../api/routers/categoryRouter');
const subCategoryRouter = require('../api/routers/subCategoryRouter');
const oauthRouter = require('../api/routers/oauthRouter');
const bundleProductRouter = require('../api/routers/bundleProductRouter');
// Connect DB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.CONNECT_DB_URL, {
            autoIndex: false,
        });
        console.log('Mongoose DB connected');
    } catch(error) {
        console.log(error.message);
        process.exit(1);
    }
};
connectDB();

// Middleware
app.use(cors({
    credentials: true,
    origin: 'http://localhost:5173'
}));

app.use(cookieParser());
app.use(bodyParser.json({limit: "50MB"}));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000
    }
}));

app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api/v1/users', authsRouter);
app.use('/api/v1/otp', otpRouter);
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/product', productRouter);
app.use('/api/v1/orders', orderRouter);
app.use('/api/v1/cart', cartRouter);
app.use('/api/v1/coupon', couponRouter);
app.use('/api/v1/payment', paymentRouter);
app.use('/api/v1/category', categoryRouter);
app.use('/api/v1/subCategory', subCategoryRouter);
app.use('/api/v1/auth/oauth', oauthRouter);

app.use('/api/v1/bundle', bundleProductRouter);
app.get('/test', (req, res) => {
    res.json('test ok');
});

// Cron Jobs
cron.schedule('0 * * * *', async () => {
    try {
        console.log('Running hourly maintenance...');
        
        const now = new Date();
        
        // Update new product status
        await Product.updateMany(
            {
                isNewProduct: true,
                newUntil: { $lte: now }
            },
            { $set: { isNewProduct: false } }
        );

        const expiredProducts = await Product.find({
            featured: true,
            featuredExpiry: { $lte: now }
        });

        for (const product of expiredProducts) {
            product.removeFeatured('Auto-expired');
            await product.save();
        }
        
        // End expired sales - FIX: Sử dụng method có sẵn
        const expiredSales = await Product.find({
            isOnSale: true,
            saleEndDate: { $lte: now }
        });
        
        for (const product of expiredSales) {
            product.endSale();
            await product.save();
        }
        
        console.log(`Hourly maintenance completed - Updated ${expiredProducts.length} featured products, ${expiredSales.length} expired sales`);
        
    } catch (error) {
        console.error('Hourly maintenance error:', error);
    }
});

cron.schedule('0 2 * * *', async () => {
    try {
        console.log('Running daily auto-promotion...');
        
        const candidates = await Product.find({
            featured: false,
            countInstock: { $gt: 0 },
            sold: { $gte: 3 },
            'ratings.average': { $gte: 3.5 }
        }).limit(30);
        
        let promotedCount = 0;
        const maxPromotions = 8;
        
        for (const product of candidates) {
            if (promotedCount >= maxPromotions) break;
            
            const trendingScore = product.calculateTrendingScore();
            
            if (trendingScore >= 60) {
                let featuredType = 'homepage';
                let duration = 15;
                
                if (trendingScore >= 85) {
                    featuredType = 'banner';
                    duration = 7;
                } else if (trendingScore >= 75) {
                    featuredType = 'trending';
                    duration = 10;
                }
                
                const expiry = new Date();
                expiry.setDate(expiry.getDate() + duration);
                
                // FIX: Sử dụng method có sẵn
                const success = product.setFeatured({
                    type: featuredType,
                    order: trendingScore,
                    expiry,
                    reason: `Auto-promoted (score: ${trendingScore})`
                });
                
                if (success) {
                    product.trendingScore = trendingScore;
                    await product.save();
                    promotedCount++;
                }
            }
        }
        
        console.log(`Auto-promoted ${promotedCount} products`);
        
    } catch (error) {
        console.error('Auto-promotion error:', error);
    }
});

cron.schedule('0 */6 * * *', async () => {
    try {
        console.log('Updating trending scores...');
        
        const products = await Product.find({
            $or: [
                { featured: true },
                { sold: { $gt: 0 } },
                { isNewProduct: true }
            ]
        });
        
        let updatedCount = 0;
        
        for (const product of products) {
            const newScore = product.calculateTrendingScore();
            if (Math.abs(newScore - (product.trendingScore || 0)) > 5) {
                product.trendingScore = newScore;
                await product.save();
                updatedCount++;
            }
        }
        
        console.log(`Trending scores updated for ${updatedCount} products`);
        
    } catch (error) {
        console.error('Trending score update error:', error);
    }
});

cron.schedule('0 3 1 * *', async () => {
    try {
        console.log('Monthly cleanup...');
        
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        
        const result = await Product.updateMany(
            {
                featured: false,
                featuredExpiry: { $lt: threeMonthsAgo }
            },
            {
                $unset: {
                    'featuredMetrics.views': '',
                    'featuredMetrics.clicks': '',
                    'featuredViews': '',
                    'featuredClicks': ''
                }
            }
        );
        
        console.log(`Monthly cleanup completed - Cleaned ${result.modifiedCount} products`);
        
    } catch (error) {
        console.error('Monthly cleanup error:', error);
    }
});

console.log('All cron jobs initialized');

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server is starting at PORT: ${PORT}`);
});