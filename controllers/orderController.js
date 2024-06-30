const Order = require('../models/orderModel');
const Cart = require('../models/cartModel');
const User = require('../models/userModel');

// Create a new order
exports.createOrder = async (req, res) => {
    try {
        const { address, cart, totalAmount, firstName, lastName, email } = req.body;
        const user = req.user._id;

        // Validate user input and check for missing fields
        const missingUserInput = [];
        if (!address) missingUserInput.push('address');
        if (!cart) missingUserInput.push('cart');
        if (!totalAmount) missingUserInput.push('totalAmount');
        if (!firstName) missingUserInput.push('firstName');
        if (!lastName) missingUserInput.push('lastName');
        if (!email) missingUserInput.push('email');

        if (missingUserInput.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Missing fields: ${missingUserInput.join(', ')}`
            });
        }

        // Ensure cart is not empty
        if (cart.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Error: Cart is empty'
            })
        }

        // Create new order with the provided information
        const order = new Order({
            user,
            items: cart.map(item => ({ product: item.product._id, quantity: item.quantity })),
            totalAmount,
            address
        });

        await order.save();
        console.log('Order saved:', order);

        // Respond with success message and order details
        res.status(201).json({
            success: true,
            message: 'Order placed successfully',
            order
        });
    } catch (err) {
        // Handle Mongoose validation errors
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(val => val.message);
            return res.status(400).json({
                success: false,
                message: messages.join(', ')
            });
        }
        // Handle server errors
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Retrieve all orders for the logged-in user
exports.getOrders = async (req, res) => {
    try {
        // Find orders for the user and populate product details
        const orders = await Order.find({ user: req.user._id }).populate('items.product');
        // Respond with the user's orders
        res.status(200).json({
            success: true,
            orders
        });
    } catch (err) {
        // Handle server errors
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Simulate processing a payment
exports.processPayment = (req, res) => {
    const { amount } = req.body;

    // Validate the payment amount
    if (amount <= 0) {
        return res.status(400).json({
            success: false,
            message: 'Invalid amount'
        });
    }

    // Simulate payment process with a delay
    setTimeout(async () => {
        try {
            // Clear the user's cart after the payment is processed
            await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });
            console.log('Cart cleared for user:', req.user._id);

            // Respond with success message after payment
            res.status(200).json({
                success: true,
                message: 'Payment processed successfully'
            });
        } catch (err) {
            // Handle server errors
            return res.status(500).json({
                success: false,
                message: 'Error clearing cart after payment'
            });
        }
    }, 2000);
}