const express = require('express');
const router = express.Router();
const { signup, login, requestPasswordReset, resetPassword, verifyEmail, resendVerificationEmail } = require('../controllers/authController');
const { getUserProfile } = require('../controllers/userController');
const protect = require('../middleware/authMiddleware');
const resendVerificationLimiter = require('../middleware/rateLimiter');

router.post('/signup', signup);
router.post('/login', login);
router.post('/request-password-reset', requestPasswordReset);
router.put('/reset-password/:token', resetPassword);
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification-email', resendVerificationLimiter, resendVerificationEmail);

// Protected route to get user profile
router.get('/profile', protect, getUserProfile);

module.exports = router;