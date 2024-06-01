const express = require('express');
const dotenv = require('dotenv');
const colors = require('colors');
const authRoutes = require('./routes/authRoutes');
const connectDB = require('./config/db');
const morgan = require('morgan');
const cors = require('cors');

dotenv.config();

const app = express();
app.use(cors());


// Middlware
app.use(express.json());

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Routes
app.use('/api', authRoutes);

// Connect to MongoDB
connectDB();

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Add createdAt field in user model that defaults to current date when account is created.
// Send token in http only cookie and don't store in localStorage. Figure out method to handle token in front end. 
// Implement user role management for different levels of access control.
