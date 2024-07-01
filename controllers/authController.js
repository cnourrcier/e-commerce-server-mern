const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const sendEmail = require('../utils/sendEmail');
const Cart = require('../models/cartModel');
const { validatePassword } = require('../utils/passwordValidator');

// Generate a JWT token for user authentication
const generateToken = (id) => {
    return jwt.sign(
        { id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.LOGIN_EXPIRES }
    );
};

// User signup function
exports.signup = async (req, res) => {
    const { firstName, lastName, email, password, confirmPassword } = req.body;

    // Check if passwords match
    if (password !== confirmPassword) {
        return res.status(400).json({
            success: false,
            message: 'Passwords do not match'
        });
    }

    try {
        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({
                success: false,
                message: 'User already exists'
            });
        }

        // Create a new user
        const user = new User({ firstName, lastName, email, password });

        // Generate verification token
        const verificationToken = user.getVerificationToken();
        console.log('Generated verification token:', verificationToken);

        await user.save();
        console.log('Saved user:', user);

        // Create a cart for the new user
        const cart = new Cart({ user: user._id });
        await cart.save();

        // Send verification email
        const verificationUrl = process.env.NODE_ENV === 'development'
            ? `${req.protocol}://${req.get('host')}/api/verify-email/${verificationToken}`
            : `${req.protocol}://${process.env.PROD_URL}/api/verify-email/${verificationToken}`;

        const message = `Please verify your email by clicking the link: \n\n ${verificationUrl}`;

        await sendEmail({
            email: user.email,
            subject: 'Email Verification',
            message
        });

        // Generate JWT token
        const token = generateToken(user._id);

        // Set authentication cookie
        res.cookie('authToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
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
        // Handle mongoose validation errors
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

function hashToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
}

// Verify user email
exports.verifyEmail = async (req, res) => {
    // Log the raw token received from the URL
    console.log('Received token:', req.params.token);

    const verificationToken = hashToken(req.params.token);

    // Log the hashed token
    console.log('Hashed token:', verificationToken);

    try {
        const user = await User.findOne({ verificationToken });
        if (!user) {
            console.log('Invalid token - user not found')
            return res.status(400).json({ message: 'Invalid token' });
        }

        if (user.isVerified) {
            console.log('User is already verified')
            return res.status(400).json({ message: 'User is already verified' });
        }

        // Mark user as verified
        user.isVerified = true;
        user.verificationToken = undefined;
        console.log('verificationToken set to undefined')
        await user.save();

        const redirectUrl = process.env.NODE_ENV === 'development'
            ? `${req.protocol}://${process.env.FRONTEND_URL_DEV}/login`
            : `${req.protocol}://${process.env.PROD_URL}/login`;

        // Log the URL to verify correctness
        console.log(`Redirecting to: ${redirectUrl}`);

        // Send a 302 status code with the Location header to redirect the user
        return res.status(302).redirect(redirectUrl);

    } catch (err) {
        console.error('Server error during email verification:', err)
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Resend verification email
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
        const verificationUrl = process.env.NODE_ENV === 'development'
            ? `${req.protocol}://${req.get('host')}/api/verify-email/${verificationToken}`
            : `${req.protocol}://${process.env.PROD_URL}/api/verify-email/${verificationToken}`;

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

// Check authentication status
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
        // Verify JWT token
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

// User login function
exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });

        // Check if user is verified and password matches
        if (user?.isVerified && await bcrypt.compare(password, user.password)) {
            const token = generateToken(user._id);

            res.cookie('authToken', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
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

            // Handle unverified user login attempt
        } else if (user && !user.isVerified) {
            return res.status(401).json({
                success: false,
                message: 'Login failed. Please verify your account first.'
            })
            // Handle invalid login credentials
        } else {
            return res.status(401).json({
                success: false,
                message: 'Login failed. Invalid email or password'
            });
        }
    } catch (err) {
        return res.status(400).json({
            success: false,
            message: 'Invalid login credentials'
        });
    }
};

// User logout function
exports.logout = (req, res) => {
    res.cookie('authToken', '', {
        httpOnly: true,
        expires: new Date(0), // Expire cookie immediately
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    });

    res.status(200).json({
        success: true,
        message: 'Logged out successfully'
    });
}

// Request password reset
exports.requestPasswordReset = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Construct password reset email
        const resetToken = user.getResetPasswordToken();
        await user.save();

        const resetUrl = process.env.NODE_ENV === 'development'
            ? `${process.env.FRONTEND_URL_DEV}/reset-password/${resetToken}`
            : `${req.protocol}://${process.env.PROD_URL}/reset-password/${resetToken}`

        const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please use the below link to reset your password: \n\n ${resetUrl} \n\n This reset password link will only be valid for 10 minutes.`;

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

// Reset password function
exports.resetPassword = async (req, res) => {
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    try {
        // Find user with valid reset token and expiration
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

        const { password, confirmPassword } = req.body;

        // Custom password validations
        const validationError = await validatePassword(password, confirmPassword, user.password, user.previousPasswords);
        if (validationError) {
            return res.status(400).json({
                success: false,
                message: validationError
            });
        }

        // Store current password to previousPasswords array
        user.previousPasswords.push(user.password);
        if (user.previousPasswords.length > 5) { // Keep only the last 5 passwords
            user.previousPasswords.shift();
        }

        // Update user password
        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password reset successful'
        });
    } catch (err) {
        // Handle mongoose validation errors
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