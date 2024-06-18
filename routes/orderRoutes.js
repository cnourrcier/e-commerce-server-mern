const express = require('express');
const router = express.Router();
const { createOrder, getOrders, processPayment } = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createOrder);
router.get('/', protect, getOrders);
router.post('/mock-payment', protect, processPayment);

module.exports = router;