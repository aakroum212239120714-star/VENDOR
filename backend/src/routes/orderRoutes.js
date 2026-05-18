const express = require('express');
const router = express.Router();
const { getMyOrders, updateOrderStatus } = require('../controllers/orderController');
const { protect } = require('../middleware/auth');

router.get('/mine', protect, getMyOrders);
router.put('/:id/status', protect, updateOrderStatus);

module.exports = router;