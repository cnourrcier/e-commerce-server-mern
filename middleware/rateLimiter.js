const rateLimit = require('express-rate-limit');

const rateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per window (15 minutes)
    message: {
        message: 'Too many requests from this IP. Please try again after 15 minutes'
    }
});

module.exports = rateLimiter;