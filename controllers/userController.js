const User = require('../models/userModel');
const bcrypt = require('bcryptjs');

exports.getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

exports.updateAccount = async (req, res) => {
    const { firstName, lastName, email, address, password, confirmPassword } = req.body;

    try {
        const user = await User.findById(req.user._id);

        user.firstName = firstName || user.firstName;
        user.lastName = lastName || user.lastName;
        user.email = email || user.email;
        user.address = address || user.address;

        if (password && confirmPassword) {
            if (password !== confirmPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'Passwords do not match'
                })
            }
            if (await user.matchPassword(password)) {
                return res.status(400).json({
                    success: false,
                    message: 'New password must not be the same as a previous password'
                })
            }
            // Check if new password is same as any of the previous passwords
            const isSameAsPrevious = await Promise.all(user.previousPasswords.map(async (hash) => { // Use Promise.all with map to handle asynchronous comparisons in parallel.
                try {
                    const isMatch = await bcrypt.compare(password, hash);
                    return isMatch;
                } catch (compareErr) {
                    console.error('Error comparing passwords:', compareErr);
                    throw compareErr;
                }
            }));

            if (isSameAsPrevious.includes(true)) {
                return res.status(400).json({
                    success: false,
                    message: 'New password cannot be the same as a previously used password'
                });
            }

            user.previousPasswords.push(user.password); // Save current password to previousPasswords
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
        console.log(err);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

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