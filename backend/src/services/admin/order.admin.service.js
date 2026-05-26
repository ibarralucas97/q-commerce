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
    customer_latitude: row.customer_latitude == null ? null : Number.parseFloat(row.customer_latitude),
    customer_longitude: row.customer_longitude == null ? null : Number.parseFloat(row.customer_longitude),
    maps_url: row.maps_url || null,
    closure_id: row.closure_id || null,
    fulfillment_day: row.fulfillment_day || null,
    fulfillment_time_range: row.fulfillment_time_range || null,
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
    product_option_id: row.product_option_id,
    product_name: row.product_name,
    product_option_name: row.product_option_name,
    selection_summary: row.selection_summary || null,
    selection_detail: row.selection_detail || [],
    quantity: row.quantity,
    unit_price: toNumber(row.unit_price),
    subtotal: toNumber(row.subtotal),
    created_at: row.created_at
  };
}

async function getOrders(options) {
  const filters = [];
  const values = [];

  if (!options || options.scope !== 'all') {
    filters.push('closure_id IS NULL');
  }

  if (options && Number.isInteger(options.closure_id)) {
    values.push(options.closure_id);
    filters.push('closure_id = $' + values.length);
  }

  const whereClause = filters.length > 0 ? 'WHERE ' + filters.join(' AND ') : '';
  const result = await pool.query(`
    SELECT
      id,
      customer_name,
      customer_phone,
      delivery_type,
      address,
      customer_latitude,
      customer_longitude,
      maps_url,
      closure_id,
      fulfillment_day,
      fulfillment_time_range,
      notes,
      status,
      subtotal,
      delivery_fee,
      total,
      created_at,
      updated_at
    FROM orders
    ${whereClause}
    ORDER BY created_at DESC
  `, values);

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
      customer_latitude,
      customer_longitude,
      maps_url,
      closure_id,
      fulfillment_day,
      fulfillment_time_range,
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
      product_option_id,
      product_name,
      product_option_name,
      selection_summary,
      selection_detail,
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
      fulfillment_day,
      fulfillment_time_range,
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
