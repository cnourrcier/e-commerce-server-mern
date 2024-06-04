const Cart = require('../models/cartModel');
const Product = require('../models/productModel');

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

        await cart.save();

        cart = await cart.populate('items.product');

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
    const { productId, quantity } = req.body;
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
            if (cart.items[itemIndex].quantity > quantity) {
                cart.items[itemIndex].quantity -= quantity;
            } else {
                cart.items.splice(itemIndex, 1);
            }
        }
        await cart.save();
        cart = await cart.populate('items.product');

        res.status(200).json({
            success: true,
            cart
        });
    } catch (err) {
        console.log('Error saving cart:', err);
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
        console.log('Error saving cart:', err);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};
