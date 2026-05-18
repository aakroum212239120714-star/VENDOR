const express = require('express');
const router = express.Router();
const { getStore, getStoreProducts, createOrder } = require('../controllers/publicController');

router.get('/:slug', getStore);
router.get('/:slug/products', getStoreProducts);
router.post('/:slug/order', createOrder);

module.exports = router;