const express = require('express');

const orderAdminController = require('../../controllers/admin/order.admin.controller');

const router = express.Router();

router.get('/', orderAdminController.getOrders);
router.get('/:id', orderAdminController.getOrderById);
router.patch('/:id/cancel', orderAdminController.cancelOrder);
router.put('/:id/status', orderAdminController.updateOrderStatus);
router.delete('/:id', orderAdminController.deleteOrder);

module.exports = router;
