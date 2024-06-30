const mongoose = require('mongoose');

// Order schema
const OrderSchema = new mongoose.Schema({
    user: {
        // Reference to the User model
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [
        {
            product: {
                // Reference to the Product model
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },
            quantity: {
                // Quantity of the product ordered
                type: Number,
                required: true
            }
        }
    ],
    totalAmount: {
        // Total cost of the order
        type: Number,
        required: true
    },
    address: {
        // Shipping address for the order
        type: String,
        required: true
    },
    status: {
        // Status of the order
        type: String,
        enum: ['Pending', 'Completed', 'Cancelled'],
        default: 'Pending'
    },
    createdAt: {
        // timestamp of when the order was created
        type: Date,
        default: Date.now
    }
});

// Create the Order model using the schema
const Order = mongoose.model('Order', OrderSchema);
module.exports = Order;