const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const sendEmail = require('../utils/sendEmail');
const Cart = require('../models/cartModel');

const generateToken = (id) => {
    return jwt.sign(
        { id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.LOGIN_EXPIRES }
    );
};

exports.signup = async (req, res) => {
    const { firstName, lastName, email, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
        return res.status(400).json({
            success: false,
            message: 'Passwords do not match'
        });
    }

    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({
                success: false,
                message: 'User already exists'
            });
        }

        const user = new User({ firstName, lastName, email, password });

        // Generate verification token
        const verificationToken = user.getVerificationToken();
        await user.save();

        const cart = new Cart({ user: user._id });
        await cart.save();

        // Send verification email
        const verificationUrl = `${req.protocol}://${req.get('host')}/api/verify-email/${verificationToken}`;
        const message = `Please verify your email by clicking the link: \n\n ${verificationUrl}`;
        await sendEmail({
            email: user.email,
            subject: 'Email Verification',
            message
        });

        const token = generateToken(user._id);

        res.cookie('authToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Set to true in production
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        });

        res.status(201).json({
            success: true,
            message: 'Verification email sent',
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email
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

exports.verifyEmail = async (req, res) => {
    const verificationToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    console.log('Verification Token:', verificationToken); // Logging the token for debugging

    try {
        const user = await User.findOne({ verificationToken });
        if (!user) {
            return res.status(400).json({ message: 'Invalid token' });
        }

        if (user.isVerified) {
            return res.status(400).json({ message: 'User is already verified' });
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        await user.save();

        res.redirect(`${process.env.FRONTEND_URL_PROD}/login`);
    } catch (err) {
        console.error('Error during email verification:', err); // Log the error for debugging
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

exports.resendVerificationEmail = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.isVerified) {
            return res.status(400).json({ message: 'User is already verified' });
        }

        // Generate a new verification token
        const verificationToken = user.getVerificationToken();
        await user.save();

        // Send verification email
        const verificationUrl = `${req.protocol}://${req.get('host')}/api/verify-email/${verificationToken}`;
        const message = `Please verify your email by clicking the link: \n\n ${verificationUrl}`;

        await sendEmail({
            email: user.email,
            subject: 'Email Verification',
            message,
        });

        res.status(200).json({
            success: true,
            message: 'Verification email sent'
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
}

exports.authStatus = async (req, res) => {
    let token;

    if (req.cookies && req.cookies.authToken) {
        token = req.cookies.authToken;
    }

    if (!token) {
        return res.status(200).json({
            success: false,
            message: 'Not authenticated'
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            return res.status(200).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            user
        });
    } catch (err) {
        res.status(200).json({
            success: false,
            message: 'Token verification failed'
        });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });

        if (user?.isVerified && (await user.matchPassword(password))) {
            const token = generateToken(user._id);

            res.cookie('authToken', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production', // Set to true in production
                sameSite: 'strict',
                maxAge: 24 * 60 * 60 * 1000 // 1 day
            });

            res.json({
                success: true,
                isVerified: user.isVerified,
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role
            });

        } else if (!user.isVerified) {
            res.status(401).json({ message: 'Login failed. Please verify your account first.' })
        } else {
            res.status(401).json({ message: 'Login failed. Invalid email or password' });
        }
    } catch (err) {
        res.status(400).json({
            success: false,
            message: 'Invalid login credentials'
        });
    }
};

exports.logout = (req, res) => {
    res.cookie('authToken', '', {
        httpOnly: true,
        expires: new Date(0), // Set the cookie to expire immediately
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    });

    res.status(200).json({
        success: true,
        message: 'Logged out successfully'
    });
}

exports.requestPasswordReset = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const resetToken = user.getResetPasswordToken();
        await user.save();

        const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
        const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please use the below link to reset your password: \n\n ${resetUrl}. \n\n This reset password link will only be valid for 10 minutes.`;

        await sendEmail({
            email: user.email,
            subject: 'Password reset token',
            message
        });

        res.status(200).json({
            success: true,
            message: 'An email has been sent with instructions to reset your password.'
        });
    } catch (err) {
        res.status(500).json({
            success: true,
            message: err.message
        });
    }
};

exports.resetPassword = async (req, res) => {
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    try {
        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid token'
            });
        }

        const newPassword = req.body.password;
        const confirmPassword = req.body.confirmPassword;

        if (newPassword === user.password) {
            res.status(400).json('New password must not be the same as a previous password')
        }

        if (newPassword !== confirmPassword) {
            res.status(400).json('Passwords do not match')
        }

        // Check if new password is same as any of the previous passwords
        const isSameAsPrevious = await Promise.all(user.previousPasswords.map(async (hash) => { // Use Promise.all with map to handle asynchronous comparisons in parallel.
            try {
                const isMatch = await bcrypt.compare(newPassword, hash);
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

        user.password = newPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password reset successful'
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};