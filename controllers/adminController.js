const User = require('../models/userModel');

// Fetch all users, excluding passwords, and return as JSON
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password'); // Select all users, omit password field
        res.status(200).json({
            success: true,
            users
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Update a user by ID with new data and return updated user
exports.updateUser = async (req, res) => {
    const { id } = req.params;
    const { firstName, lastName, email, role } = req.body;
    try {
        const user = await User.findByIdAndUpdate(
            id,
            { firstName, lastName, email, role }, // Fields to update
            { new: true, runValidators: true } // Return updated document and run validators
        );
        res.status(200).json({
            success: true,
            user
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Delete a user by ID and return a success message
exports.deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        await User.findByIdAndDelete(id); // Delete user from database
        res.status(200).json({
            success: true,
            message: 'User deleted' // Confirmation of deletion
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};