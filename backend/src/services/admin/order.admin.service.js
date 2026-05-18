const pool = require('../../config/db');
const { normalizeStatusForResponse, mapRequestedStatusToDb, toNumber } = require('../order.service');

const ALLOWED_STATUSES = ['new', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'];

function mapOrderRow(row) {
  return {
    id: row.id,
    customer_name: row.customer_name,
    customer_phone: row.customer_phone,
    delivery_type: row.delivery_type,
    address: row.address,
    notes: row.notes,
    status: normalizeStatusForResponse(row.status),
    subtotal: toNumber(row.subtotal),
    delivery_fee: toNumber(row.delivery_fee),
    total: toNumber(row.total),
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}

function mapOrderItemRow(row) {
  return {
    id: row.id,
    order_id: row.order_id,
    product_id: row.product_id,
    product_name: row.product_name,
    quantity: row.quantity,
    unit_price: toNumber(row.unit_price),
    subtotal: toNumber(row.subtotal),
    created_at: row.created_at
  };
}

async function getOrders() {
  const result = await pool.query(`
    SELECT
      id,
      customer_name,
      customer_phone,
      delivery_type,
      address,
      notes,
      status,
      subtotal,
      delivery_fee,
      total,
      created_at,
      updated_at
    FROM orders
    ORDER BY created_at DESC
  `);

  return result.rows.map(mapOrderRow);
}

async function getOrderById(orderId) {
  const orderResult = await pool.query(`
    SELECT
      id,
      customer_name,
      customer_phone,
      delivery_type,
      address,
      notes,
      status,
      subtotal,
      delivery_fee,
      total,
      created_at,
      updated_at
    FROM orders
    WHERE id = $1
    LIMIT 1
  `, [orderId]);

  if (orderResult.rowCount === 0) {
    return null;
  }

  const itemsResult = await pool.query(`
    SELECT
      id,
      order_id,
      product_id,
      product_name,
      quantity,
      unit_price,
      subtotal,
      created_at
    FROM order_items
    WHERE order_id = $1
    ORDER BY id ASC
  `, [orderId]);

  return {
    ...mapOrderRow(orderResult.rows[0]),
    items: itemsResult.rows.map(mapOrderItemRow)
  };
}

async function updateOrderStatus(orderId, status) {
  const result = await pool.query(`
    UPDATE orders
    SET
      status = $2,
      updated_at = NOW()
    WHERE id = $1
    RETURNING
      id,
      customer_name,
      customer_phone,
      delivery_type,
      address,
      notes,
      status,
      subtotal,
      delivery_fee,
      total,
      created_at,
      updated_at
  `, [orderId, mapRequestedStatusToDb(status)]);

  return result.rowCount === 0 ? null : mapOrderRow(result.rows[0]);
}

async function cancelOrder(orderId) {
  return updateOrderStatus(orderId, 'cancelled');
}

module.exports = {
  ALLOWED_STATUSES,
  getOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder
};
