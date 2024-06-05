const express = require('express');
const router = express.Router();
const { getUserProfile, updateAccount, deleteAccount } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// Protected route to get user profile
router.get('/profile', protect, getUserProfile);
router.put('/account/update', protect, updateAccount);
router.delete('/account/delete', protect, deleteAccount);


module.exports = router;