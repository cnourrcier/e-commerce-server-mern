const rateLimit = require('express-rate-limit');

const resendVerificationLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per window (15 minutes)
    message: {
        message: 'Too many verification email requests from this IP. Please try again after 15 minutes'
    }
});

module.exports = resendVerificationLimiter;