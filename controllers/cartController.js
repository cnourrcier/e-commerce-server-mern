const Cart = require('../models/cartModel');
const Product = require('../models/productModel');

// Get the current user's cart
exports.getCart = async (req, res) => {
    try {
        // Find the cart and populate product details
        const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
        }
        // Return the cart details
        res.status(200).json({
            success: true,
            cart
        });
    } catch (err) {
        // Handle server errors
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Add a product to the cart
exports.addToCart = async (req, res) => {
    const { productId, quantity } = req.body;
    try {
        // Retrieve the user's cart
        let cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
        }

        // Check if the product already exists in the cart
        const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
        if (itemIndex > -1) {
            // Update the quantity if product exists
            cart.items[itemIndex].quantity += quantity;
        } else {
            // Add the product if it does not exist
            cart.items.push({ product: productId, quantity });
        }

        await cart.save();
        cart = await cart.populate('items.product');

        // Return the updated cart
        res.status(200).json({
            success: true,
            cart
        });
    } catch (err) {
        // Handle server errors
        res.status(500).json({
            success: false,
            message: 'Server error'
        })
    }
};

// Remove a product from the cart
exports.removeFromCart = async (req, res) => {
    const { productId, quantity } = req.body;
    try {
        // Retrieve the user's cart
        let cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
        }

        // Find the product in the cart
        const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
        if (itemIndex > -1) {
            if (cart.items[itemIndex].quantity > quantity) {
                // Reduce the quantity if more than requested
                cart.items[itemIndex].quantity -= quantity;
            } else {
                // Remove the product if quantity is less or equal
                cart.items.splice(itemIndex, 1);
            }
        }
        await cart.save();
        cart = await cart.populate('items.product');

        // Return the updated cart
        res.status(200).json({
            success: true,
            cart
        });
    } catch (err) {
        // Handle server errors
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Remove all items from the cart
exports.removeAllFromCart = async (req, res) => {
    try {
        // Retrieve the user's cart
        let cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
        }

        // Clear all items from the cart
        cart.items = [];
        await cart.save();

        // Return the empty cart
        res.status(200).json({
            success: true,
            cart
        });
    } catch (err) {
        // Handle server errors
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};
