const express = require('express');
const dotenv = require('dotenv');
const colors = require('colors');
const authRoutes = require('./routes/authRoutes');
const connectDB = require('./config/db');

dotenv.config();

const app = express();

// Middlware
app.use(express.json());

// Routes
app.use('/api', authRoutes);

// Connect to MongoDB
connectDB();

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));