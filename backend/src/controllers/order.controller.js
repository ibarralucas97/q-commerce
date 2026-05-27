const orderService = require('../services/order.service');

function maskPhone(value) {
  const digits = String(value || '').replace(/\D/g, '');

  if (digits.length <= 4) {
    return digits ? '****' : null;
  }

  return '****' + digits.slice(-4);
}

function summarizeOrderBody(body) {
  const payload = body && typeof body === 'object' ? body : {};

  return {
    customer_name_present: typeof payload.customer_name === 'string' && payload.customer_name.trim() !== '',
    customer_phone: maskPhone(payload.customer_phone),
    delivery_type: payload.delivery_type || null,
    address_present: typeof payload.address === 'string' && payload.address.trim() !== '',
    maps_url_present: typeof payload.maps_url === 'string' && payload.maps_url.trim() !== '',
    notes_present: typeof payload.notes === 'string' && payload.notes.trim() !== '',
    fulfillment_day: payload.fulfillment_day || null,
    fulfillment_time_range: payload.fulfillment_time_range || null,
    item_count: Array.isArray(payload.items) ? payload.items.length : 0,
    items: Array.isArray(payload.items) ? payload.items.map(function summarizeItem(item) {
      return {
        product_id: item && item.product_id,
        product_option_id: item && item.product_option_id,
        selected_option_ids_count: Array.isArray(item && item.selected_option_ids) ? item.selected_option_ids.length : 0,
        quantity: item && item.quantity
      };
    }) : []
  };
}

async function createOrder(req, res) {
  try {
    console.info('[POST /api/orders] Creating order from payload:', summarizeOrderBody(req.body));

    const result = await orderService.createOrder(req.body);

    if (result.error) {
      console.warn('[POST /api/orders] Order validation failed:', {
        error: result.error,
        payload: summarizeOrderBody(req.body)
      });

      return res.status(result.statusCode).json({
        error: result.error
      });
    }

    return res.status(201).json(result);
  } catch (error) {
    console.error('[POST /api/orders] Error creating order:', {
      message: error.message,
      code: error.code,
      detail: error.detail,
      constraint: error.constraint,
      stack: error.stack,
      payload: summarizeOrderBody(req.body)
    });

    return res.status(500).json({
      error: 'No pudimos registrar el pedido. Revisá los datos e intentá nuevamente.'
    });
  }
}

module.exports = {
  createOrder
};
