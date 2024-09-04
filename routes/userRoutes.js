const express = require('express');
const router = express.Router();
const { updateAccount, deleteAccount } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// Protected route to get user profile
router.put('/account/update', protect, updateAccount);
router.delete('/account/delete', protect, deleteAccount);


module.exports = router;