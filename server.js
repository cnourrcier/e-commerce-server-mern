const express = require('express');
const dotenv = require('dotenv');
const colors = require('colors');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const connectDB = require('./config/db');
const morgan = require('morgan');
const cors = require('cors');
const cookieParser = require('cookie-parser');

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

// Send token in http only cookie and don't store in localStorage. Figure out method to handle token in front end. 
// Create functionality so that only one user can be logged in at a time on a device. 
// If a user is logged in, disable signup functionality
// Allow users to update their account info: firstName, lastName, email, password (different from resetting password because forgot)
// Allow users to delete their account (include soft and hard delete functionality)
// Implement user role management for different levels of access control.
