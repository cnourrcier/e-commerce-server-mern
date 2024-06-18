const Order = require('../models/orderModel');
const Cart = require('../models/cartModel');

exports.createOrder = async (req, res) => {
    try {
        const { address, cart } = req.body;
        const user = req.user._id;
        const totalAmount = cart.reduce((total, item) => total + item.product.price * item.quantity, 0);

        const order = new Order({
            user,
            items: cart,
            totalAmount,
            address
        });

        await orders.save();

        // Clear the user's cart after creating the order
        await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });

        res.status(201).json({
            success: true,
            order
        });
    } catch (err) {
        console.error('Error creating order:', err);
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