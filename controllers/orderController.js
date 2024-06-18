const Order = require('../models/orderModel');
const Cart = require('../models/cartModel');
const User = require('../models/userModel');

exports.createOrder = async (req, res) => {
    try {
        const { address, cart, totalAmount, firstName, lastName, email } = req.body;
        const user = req.user._id;
        if (!address || !cart || !totalAmount || !firstName || !lastName || !email) {
            return res.status(400).json({
                success: false,
                message: 'Error: Missing fields'
            });
        }

        if (cart.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Error: Cart is empty'
            })
        }

        const order = new Order({
            user,
            items: cart.map(item => ({ product: item.product._id, quantity: item.quantity })),
            totalAmount,
            address
        });

        await order.save();
        console.log('Order saved:', order);

        // Update user information if changed
        try {
            await User.findByIdAndUpdate(user, { firstName, lastName, email, address });
            console.log('User updated:', user);
        } catch (err) {
            console.error('Error updating user:', err);
            return res.status(500).json({
                success: false,
                message: 'Error updating user information'
            });
        }

        res.status(201).json({
            success: true,
            message: 'Order placed successfully',
            order
        });
    } catch (err) {
        // Extract mongoose validation error messages
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(val => val.message);
            return res.status(400).json({
                success: false,
                message: messages.join(', ')
            });
        }
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

exports.getOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id }).populate('items.product');
        res.status(200).json({
            success: true,
            orders
        });
    } catch (err) {
        console.error('Error fetching orders:', err);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

exports.processPayment = (req, res) => {
    const { amount } = req.body;

    if (amount <= 0) {
        return res.status(400).json({
            success: false,
            message: 'Invalid amount'
        });
    }

    // Simulate a payment process delay
    setTimeout(async () => {
        try {
            // Clear the user's cart after processing the payment
            await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });
            console.log('Cart cleared for user:', req.user._id);

            res.status(200).json({
                success: true,
                message: 'Payment processed successfully'
            });
        } catch (err) {
            console.error('Error clearing cart:', err);
            return res.status(500).json({
                success: false,
                message: 'Error clearing cart after payment'
            });
        }
    }, 2000);
}