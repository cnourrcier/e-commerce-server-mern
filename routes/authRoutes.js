const express = require('express');
const router = express.Router();
const { authStatus, login, logout, requestPasswordReset, resendVerificationEmail, resetPassword, signup, verifyEmail } = require('../controllers/authController');
const rateLimiter = require('../middleware/rateLimiter');

router.post('/signup', rateLimiter, signup);
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification-email', rateLimiter, resendVerificationEmail);
router.get('/auth-status', authStatus);
router.post('/login', login);
router.post('/logout', logout)
router.post('/request-password-reset', rateLimiter, requestPasswordReset);
router.put('/reset-password/:token', resetPassword);

module.exports = router;