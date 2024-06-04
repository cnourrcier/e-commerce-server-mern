const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Product = require('./models/productModel');
const productData = require('./raw/products.json');
dotenv.config();

console.log('MONGO_URI:', process.env.MONGO_URI);

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('Connected to MongoDB');
        return Product.insertMany(productData);
    })
    .then(() => {
        console.log('Data inserted successfully');
        mongoose.disconnect();
    })
    .catch(err => {
        console.error('Error inserting data', err);
        mongoose.disconnect();
    });

// Load products into DB