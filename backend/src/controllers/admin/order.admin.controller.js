const orderAdminService = require('../../services/admin/order.admin.service');
const auditLogService = require('../../services/audit-log.service');

function getAuditActor(req) {
  return {
    actorUserId: req.adminUser && req.adminUser.sub ? Number(req.adminUser.sub) : null,
    actorName: req.adminUser && req.adminUser.username ? req.adminUser.username : 'admin'
  };
}

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

    const previousOrder = await orderAdminService.getOrderById(orderId);

    if (!previousOrder) {
      return res.status(404).json({
        error: 'order not found'
      });
    }

    const order = await orderAdminService.updateOrderStatus(orderId, status);

    await auditLogService.log({
      ...getAuditActor(req),
      action: status === 'cancelled' ? 'ORDER_CANCELLED' : 'ORDER_STATUS_UPDATED',
      entityType: 'order',
      entityId: order.id,
      entityLabel: '#' + order.id + ' ' + order.customer_name,
      beforeData: previousOrder,
      afterData: order,
      metadata: {
        status: status
      }
    });

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

async function cancelOrder(req, res) {
  try {
    const orderId = Number.parseInt(req.params.id, 10);

    if (Number.isNaN(orderId)) {
      return res.status(404).json({
        error: 'order not found'
      });
    }

    const existingOrder = await orderAdminService.getOrderById(orderId);

    if (!existingOrder) {
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

    await auditLogService.log({
      ...getAuditActor(req),
      action: 'ORDER_CANCELLED',
      entityType: 'order',
      entityId: order.id,
      entityLabel: '#' + order.id + ' ' + order.customer_name,
      beforeData: existingOrder,
      afterData: order,
      metadata: null
    });

    return res.json({
      message: 'Order cancelled successfully',
      order: order
    });
  } catch (error) {
    console.error('[PATCH /api/admin/orders/:id/cancel] Error cancelling admin order:', error.message);
    console.error(error.stack);

    return res.status(500).json({
      error: 'ADMIN_ORDER_CANCEL_FAILED',
      message: 'No se pudo cancelar el pedido.',
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

    const result = await orderAdminService.hardDeleteOrder(orderId);

    if (!result.order) {
      return res.status(404).json({
        error: 'order not found'
      });
    }

    if (result.error) {
      return res.status(result.statusCode).json({
        error: 'ORDER_DELETE_BLOCKED',
        message: result.error
      });
    }

    await auditLogService.log({
      ...getAuditActor(req),
      action: 'ORDER_DELETED',
      entityType: 'order',
      entityId: result.order.id,
      entityLabel: '#' + result.order.id + ' ' + result.order.customer_name,
      beforeData: result.order,
      afterData: null,
      metadata: {
        deleted: true
      }
    });

    return res.json({
      message: 'Order deleted successfully'
    });
  } catch (error) {
    console.error('[DELETE /api/admin/orders/:id] Error deleting admin order:', error.message);
    console.error(error.stack);

    return res.status(500).json({
      error: 'ADMIN_ORDER_DELETE_FAILED',
      message: 'No se pudo eliminar el pedido.',
      details: error.message
    });
  }
}

module.exports = {
  getOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  deleteOrder
};
