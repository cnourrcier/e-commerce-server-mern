const User = require('../models/userModel');

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
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

exports.updateUser = async (req, res) => {
    const { id } = req.params;
    const { firstName, lastName, email, role } = req.body;
    try {
        const user = await User.findByIdAndUpdate(id, { firstName, lastName, email, role }, { new: true, runValidators: true });
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

exports.deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        await User.findByIdAndDelete(id);
        res.status(200).json({
            success: true,
            message: 'User deleted'
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};