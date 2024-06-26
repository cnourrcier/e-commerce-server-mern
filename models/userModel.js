const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// Schema definition for User model
const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        minLength: [3, 'First name must be at least 3 characters long'],
        maxLength: [20, 'First name must not exceed 20 characters'],
        required: [true, 'First name is required']
    },
    lastName: {
        type: String,
        minLength: [3, 'Last name must be at least 3 characters long'],
        maxLength: [20, 'Last name must not exceed 20 characters'],
        required: [true, 'Last name is required']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        match: [
            /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email address'
        ]
    },
    password: {
        type: String,
        minlength: [8, 'Password must be at least 8 characters long'],
        required: [true, 'Password is required']
    },
    role: {
        type: String,
        enum: ['admin', 'manager', 'customer'],
        default: 'customer'
    },
    previousPasswords: [{ type: String }], // Store previous password hashes
    isVerified: {
        type: Boolean,
        default: false
    },
    verificationToken: String,
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    createdAt: {
        type: Date,
        default: Date.now
    },
    cart: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cart'
    },
    address: {
        type: String
    }
});

// Pre-save middleware to hash passwords
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Method to generate a password reset token
userSchema.methods.getResetPasswordToken = function () {
    const resetToken = crypto.randomBytes(20).toString('hex');
    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    return resetToken;
};

// Method to generate an email verification token
userSchema.methods.getVerificationToken = function () {
    const verificationToken = crypto.randomBytes(20).toString('hex');
    this.verificationToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
    return verificationToken;
}

// Create User model from schema
const User = mongoose.model('User', userSchema);

module.exports = User;