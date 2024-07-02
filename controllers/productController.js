const Product = require('../models/productModel');

// Retrieve all unique product categories
exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Product.distinct('category');
        res.status(200).json({
            success: true,
            message: 'Successfully retreived product categories',
            categories
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Server error'
        })
    }
};

// Retrieve products by category
exports.getProductsByCategory = async (req, res) => {
    const { category } = req.params;
    try {
        const products = await Product.find({ category });
        res.status(200).json({
            success: true,
            message: 'Successfully retreived products',
            products
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Retrieve a single product by its ID
exports.getProductById = async (req, res) => {
    const { id } = req.params;
    try {
        const product = await Product.findById(id);
        if (product) {
            res.status(200).json({
                success: true,
                message: 'Successfully retreived product',
                product
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Search for products based on a query term
exports.searchProducts = async (req, res) => {
    try {
        const searchTerm = req.query.q;
        const products = await Product.find({
            $or: [
                { title: { $regex: searchTerm, $options: 'i' } },
                { description: { $regex: searchTerm, $options: 'i' } },
                { category: { $regex: searchTerm, $options: 'i' } },
                { brand: { $regex: searchTerm, $options: 'i' } },
            ]
        });

        if (!products) {
            res.status(200).json({
                success: false,
                message: 'No products found'
            })
        }
        res.status(200).json({
            success: true,
            message: 'Successfully retreived products',
            products
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};