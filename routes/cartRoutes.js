const express = require('express');
const { getCart, addToCart, removeFromCart, removeAllFromCart } = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/', protect, getCart);
router.post('/add', protect, addToCart);
router.post('/remove', protect, removeFromCart);
router.post('/removeAll', protect, removeAllFromCart);

module.exports = router;