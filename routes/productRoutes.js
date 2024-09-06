const express = require('express');
const router = express.Router();
const { getAllCategories, getProductsByCategory, getProduct, searchProducts } = require('../controllers/productController');

router.get('/categories', getAllCategories);
router.get('/category/:category', getProductsByCategory);
router.get('/search', searchProducts);
router.get('/product/:id', getProduct);

module.exports = router;