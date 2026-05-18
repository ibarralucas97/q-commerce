const orderAdminService = require('../../services/admin/order.admin.service');

async function getOrders(req, res) {
  try {
    const orders = await orderAdminService.getOrders();

    return res.json(orders);
  } catch (error) {
    console.error('Error fetching admin orders:', error);

    return res.status(500).json({
      error: 'internal server error'
    });
  }
}

async function getOrderById(req, res) {
  try {
    const orderId = Number.parseInt(req.params.id, 10);

    if (Number.isNaN(orderId)) {
      return res.status(404).json({
        error: 'order not found'
      });
    }

    const order = await orderAdminService.getOrderById(orderId);

    if (!order) {
      return res.status(404).json({
        error: 'order not found'
      });
    }

    return res.json(order);
  } catch (error) {
    console.error('Error fetching admin order:', error);

    return res.status(500).json({
      error: 'internal server error'
    });
  }
}

async function updateOrderStatus(req, res) {
  try {
    const orderId = Number.parseInt(req.params.id, 10);
    const status = req.body && req.body.status;

    if (Number.isNaN(orderId)) {
      return res.status(404).json({
        error: 'order not found'
      });
    }

    if (typeof status !== 'string' || status.trim() === '') {
      return res.status(400).json({
        error: 'status is required'
      });
    }

    if (!orderAdminService.ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({
        error: 'status is invalid'
      });
    }

    const order = await orderAdminService.updateOrderStatus(orderId, status);

    if (!order) {
      return res.status(404).json({
        error: 'order not found'
      });
    }

    return res.json({
      message: 'Order status updated successfully',
      order: order
    });
  } catch (error) {
    console.error('Error updating admin order status:', error);

    return res.status(500).json({
      error: 'internal server error'
    });
  }
}

async function deleteOrder(req, res) {
  try {
    const orderId = Number.parseInt(req.params.id, 10);

    if (Number.isNaN(orderId)) {
      return res.status(404).json({
        error: 'order not found'
      });
    }

    const order = await orderAdminService.cancelOrder(orderId);

    if (!order) {
      return res.status(404).json({
        error: 'order not found'
      });
    }

    return res.json({
      message: 'Order cancelled successfully',
      order: order
    });
  } catch (error) {
    console.error('Error cancelling admin order:', error);

    return res.status(500).json({
      error: 'internal server error'
    });
  }
}

module.exports = {
  getOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder
};
