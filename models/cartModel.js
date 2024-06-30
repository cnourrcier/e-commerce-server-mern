const mongoose = require('mongoose');

// Shopping cart schema
const cartSchema = new mongoose.Schema({
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
                // Quantity of the product in the cart
                type: Number,
                required: true,
                default: 1
            }
        }
    ]
}, { timestamps: true }); // Automatically manage createdAt and updatedAt fields

// Create the Cart model using the schema
const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;