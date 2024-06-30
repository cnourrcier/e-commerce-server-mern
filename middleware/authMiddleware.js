const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

// Middleware to protect routes and ensure the user is authenticated
const protect = async (req, res, next) => {
    let token;

    // Check for token in cookies
    if (req.cookies && req.cookies.authToken) {
        token = req.cookies.authToken;
    }

    // If no token, deny access
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized, no token'
        });
    }

    try {
        // Verify token and attach user to request object
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select('-password');
        next();
    } catch (err) {
        // Handle invalid token
        res.status(401).json({
            success: false,
            message: 'Not authorized, token failed'
        });
    }
};

// Middleware to authorize users based on roles
const authorize = (...roles) => {
    return (req, res, next) => {
        // Check if user's role is in the allowed roles
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'User role not authorized'
            });
        }
        next();
    };
};

module.exports = { protect, authorize };