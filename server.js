const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const colors = require('colors');
const connectDB = require('./config/db');
const morgan = require('morgan');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const cartRoutes = require('./routes/cartRoutes');
const productRoutes = require('./routes/productRoutes');
const adminRoutes = require('./routes/adminRoutes');
const orderRoutes = require('./routes/orderRoutes');

// Enable use of env variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Set 'trust proxy' setting in Express to true for express-rate-limit
app.set('trust proxy', 1);

app.use(cookieParser());
app.use(cors({
    credentials: true // Allow credentials
}));

// Middlware
app.use(express.json());

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Routes
app.use('/api', authRoutes);
app.use('/api', userRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/products', productRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/orders', orderRoutes);

if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../e-commerce-front-end-mern', 'dist')));
    app.use('/img', express.static(path.join(__dirname, '../e-commerce-front-end-mern', '/img')));

    app.get('*', (req, res) => res.sendFile(path.resolve(__dirname, '../e-commerce-front-end-mern', 'dist', 'index.html')));
}


// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Server Error'
    });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`));

// update classNames in navBar component
// Fix background to match navBar color
// Add comments to front end code
// Update name to Cardinal Finds
// Error handling and validations in admin dashboard


