const User = require('../models/userModel');
const { validatePassword } = require('../utils/passwordValidator');
const bcrypt = require('bcryptjs');

// Update user account information
exports.updateAccount = async (req, res) => {
    const { firstName, lastName, email, address, password, confirmPassword } = req.body;

    try {
        const user = await User.findById(req.user._id);

        // Update user details
        user.firstName = firstName || user.firstName;
        user.lastName = lastName || user.lastName;
        user.email = email || user.email;
        user.address = address || user.address;

        // Validate and update password if provided
        if (password || confirmPassword) {
            const validationError = await validatePassword(password, confirmPassword, user.password, user.previousPasswords);
            if (validationError) {
                return res.status(400).json({
                    success: false,
                    message: validationError
                });
            }
            // Store the current password in the previousPasswords array
            user.previousPasswords.push(user.password);
            if (user.previousPasswords.length > 5) { // Keep only the last 5 passwords
                user.previousPasswords.shift();
            }

            user.password = password;
        }

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Account updated successfully',
            user: {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                address: user.address
            }
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

        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Delete user account
exports.deleteAccount = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.user._id);
        res.status(200).json({
            success: true,
            message: 'Account deleted successfully'
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};