const orderAdminService = require('../../services/admin/order.admin.service');

async function getOrders(req, res) {
  try {
    const closureId = req.query && req.query.closure_id ? Number.parseInt(req.query.closure_id, 10) : null;
    const orders = await orderAdminService.getOrders({
      scope: req.query && req.query.scope === 'all' ? 'all' : 'active',
      closure_id: Number.isNaN(closureId) ? null : closureId
    });

    return res.json(orders);
  } catch (error) {
    console.error('[GET /api/admin/orders] Error fetching admin orders:', error.message);
    console.error(error.stack);

    return res.status(500).json({
      error: 'ADMIN_ORDERS_FETCH_FAILED',
      message: 'No se pudieron cargar los pedidos del panel.',
      details: error.message
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
    console.error('[GET /api/admin/orders/:id] Error fetching admin order:', error.message);
    console.error(error.stack);

    return res.status(500).json({
      error: 'ADMIN_ORDER_FETCH_FAILED',
      message: 'No se pudo cargar el pedido solicitado.',
      details: error.message
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
    console.error('[PUT /api/admin/orders/:id/status] Error updating admin order status:', error.message);
    console.error(error.stack);

    return res.status(500).json({
      error: 'ADMIN_ORDER_STATUS_UPDATE_FAILED',
      message: 'No se pudo actualizar el estado del pedido.',
      details: error.message
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
    console.error('[DELETE /api/admin/orders/:id] Error cancelling admin order:', error.message);
    console.error(error.stack);

    return res.status(500).json({
      error: 'ADMIN_ORDER_CANCEL_FAILED',
      message: 'No se pudo cancelar el pedido.',
      details: error.message
    });
  }
}

module.exports = {
  getOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder
};
