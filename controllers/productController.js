const Product = require('../models/productModel');

exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Product.distinct('category');
        res.status(200).json(categories);
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Server error'
        })
    }
};

exports.getProductsByCategory = async (req, res) => {
    const { category } = req.params;
    try {
        const products = await Product.find({ category });
        res.status(200).json({ products });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

exports.getProductById = async (req, res) => {
    const { id } = req.params;
    try {
        const product = await Product.findById(id);
        if (product) {
            res.status(200).json(product);
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

exports.searchProducts = async (req, res) => {
    console.log('hi')
    try {
        const searchTerm = req.query.q;
        console.log('searchTerm:', searchTerm);
        const products = await Product.find({
            $or: [
                { title: { $regex: searchTerm, $options: 'i' } },
                { description: { $regex: searchTerm, $options: 'i' } },
                { category: { $regex: searchTerm, $options: 'i' } },
                { brand: { $regex: searchTerm, $options: 'i' } },
            ]
        });

        if (!products) {
            console.log('Error fetching products');
        }

        console.log(products);
        res.status(200).json({
            success: true,
            products
        });
    } catch (err) {
        console.log('Error:', err);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};