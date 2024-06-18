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

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

app.use(cookieParser());
app.use(cors({
    origin: process.env.FRONTEND_URL, // Allow frontend origin
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
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// When user clicks on button to checkout from the shopping cart, check if the user has a stored address. If not, prompt the user to enter a shipping address. Then show Review Your Order.
// During checkout process, when user inputs their address, store the address in the user collection. Update user model to store user address.

// Clear shopping cart page when user logs out

// Maybe disable checkout link in shopping cart when there are no items in cart
// Front end: calculate shipping and handling and tax on checkout page only if there is at least one item in the cart

// Implement payment page
// Integrate a payment gateway (e.g., Stripe, PayPal) to handle payments securely.
// Ensure sensitive information (e.g., credit card details) is never handled by server directly.

// Allow users to track the status of their orders (Pending, Shipped, Delivered, etc.).

// Send email notifications to users upon order placement, order updates, and delivery.
