const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const session = require('express-session');
const cron = require('node-cron');
const {initializeCronJobs} = require('./jobs/index')
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
const saleProgramRouter = require('../api/routers/saleProgramRouter');
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
app.use('/api/v1/sale-programs', saleProgramRouter);
app.use('/api/v1/bundle', bundleProductRouter);
app.get('/test', (req, res) => {
    res.json('test ok');
})

initializeCronJobs();

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server is starting at PORT: ${PORT}`);
});