const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const { getAllUsers, updateUser, deleteUser } = require('../controllers/adminController');

const router = express.Router();

router.get('/users', protect, authorize('admin'), getAllUsers);
router.put('/users/:id', protect, authorize('admin'), updateUser)
router.delete('/users/:id', protect, authorize('admin'), deleteUser);

module.exports = router;