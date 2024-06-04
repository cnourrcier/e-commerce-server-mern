const express = require('express');
const router = express.Router();
const { getAllCategories, getProductsByCategory, getProductById } = require('../controllers/productController');

router.get('/categories', getAllCategories);
router.get('/category/:category', getProductsByCategory);
router.get('/:id', getProductById);

module.exports = router;