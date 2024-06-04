const Cart = require('../models/cartModel');
const Product = require('../models/productModel');
const mongoose = require('mongoose');

exports.getCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
        }
        res.status(200).json({
            success: true,
            cart
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

exports.addToCart = async (req, res) => {
    const { productId, quantity } = req.body;

    // Validate productId and quantity
    if (!mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid product ID'
        });
    }

    if (typeof quantity !== 'number' || quantity <= 0) {
        return res.status(400).json({
            success: false,
            message: 'Invalid quantity'
        });
    }

    try {
        let cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
        }

        const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
        if (itemIndex > -1) {
            cart.items[itemIndex].quantity += quantity;
        } else {
            cart.items.push({ product: productId, quantity });
        }

        console.log('Before saving cart:', cart);

        await cart.save();

        console.log('After saving cart:', cart);

        res.status(200).json({
            success: true,
            cart
        });
    } catch (err) {
        console.error('Error saving cart', err);
        res.status(500).json({
            success: false,
            message: 'Server error'
        })
    }
};

exports.removeFromCart = async (req, res) => {
    const { productId } = req.body;
    try {
        let cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
        }

        cart.items = cart.items.filter(item => item.product.toString() !== productId);
        await cart.save();

        res.status(200).json({
            success: true,
            cart
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

exports.removeAllFromCart = async (req, res) => {
    try {
        let cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
        }

        cart.items = [];
        await cart.save();

        res.status(200).json({
            success: true,
            cart
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};
