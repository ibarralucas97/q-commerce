const pool = require('../config/db');

const DELIVERY_TYPES = ['delivery', 'pickup'];

function toNumber(value) {
  const parsed = Number.parseFloat(value);

  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeStatusForResponse(status) {
  return status === 'pending' ? 'new' : status;
}

function mapRequestedStatusToDb(status) {
  return status === 'new' ? 'pending' : status;
}

function formatOrderSummary(row) {
  return {
    id: row.id,
    status: normalizeStatusForResponse(row.status),
    subtotal: toNumber(row.subtotal),
    delivery_fee: toNumber(row.delivery_fee),
    total: toNumber(row.total)
  };
}

function validateOrderPayload(payload) {
  if (typeof payload.customer_name !== 'string' || payload.customer_name.trim() === '') {
    return 'customer_name is required';
  }

  if (typeof payload.customer_phone !== 'string' || payload.customer_phone.trim() === '') {
    return 'customer_phone is required';
  }

  if (!DELIVERY_TYPES.includes(payload.delivery_type)) {
    return 'delivery_type must be delivery or pickup';
  }

  if (payload.delivery_type === 'delivery' && (typeof payload.address !== 'string' || payload.address.trim() === '')) {
    return 'address is required for delivery';
  }

  if (!Array.isArray(payload.items) || payload.items.length === 0) {
    return 'items must be a non-empty array';
  }

  for (const item of payload.items) {
    if (!Number.isInteger(item.product_id) || item.product_id <= 0) {
      return 'each item must include a valid product_id';
    }

    if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
      return 'each item quantity must be an integer greater than 0';
    }
  }

  return null;
}

function normalizeItems(items) {
  const itemMap = new Map();

  for (const item of items) {
    const existing = itemMap.get(item.product_id);

    if (existing) {
      existing.quantity += item.quantity;
    } else {
      itemMap.set(item.product_id, {
        product_id: item.product_id,
        quantity: item.quantity
      });
    }
  }

  return Array.from(itemMap.values());
}

async function getStoreSettings(client) {
  const result = await client.query(`
    SELECT
      id,
      delivery_fee,
      delivery_enabled,
      pickup_enabled
    FROM settings
    ORDER BY id ASC
    LIMIT 1
  `);

  return result.rows[0] || null;
}

async function getProductsForOrder(client, productIds) {
  const result = await client.query(`
    SELECT
      id,
      name,
      price,
      is_active
    FROM products
    WHERE id = ANY($1::int[])
  `, [productIds]);

  return result.rows;
}

async function createOrder(payload) {
  const validationError = validateOrderPayload(payload);

  if (validationError) {
    return {
      error: validationError,
      statusCode: 400
    };
  }

  const normalizedItems = normalizeItems(payload.items);
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const settings = await getStoreSettings(client);

    if (!settings) {
      await client.query('ROLLBACK');

      return {
        error: 'settings not found',
        statusCode: 404
      };
    }

    if (payload.delivery_type === 'delivery' && !settings.delivery_enabled) {
      await client.query('ROLLBACK');

      return {
        error: 'delivery is currently unavailable',
        statusCode: 400
      };
    }

    if (payload.delivery_type === 'pickup' && !settings.pickup_enabled) {
      await client.query('ROLLBACK');

      return {
        error: 'pickup is currently unavailable',
        statusCode: 400
      };
    }

    const productIds = normalizedItems.map(function mapProductId(item) {
      return item.product_id;
    });
    const products = await getProductsForOrder(client, productIds);

    if (products.length !== productIds.length) {
      await client.query('ROLLBACK');

      return {
        error: 'one or more products do not exist',
        statusCode: 400
      };
    }

    const productMap = new Map(products.map(function toEntry(product) {
      return [product.id, product];
    }));

    for (const item of normalizedItems) {
      const product = productMap.get(item.product_id);

      if (!product || product.is_active === false) {
        await client.query('ROLLBACK');

        return {
          error: 'one or more products are unavailable',
          statusCode: 400
        };
      }
    }

    const orderItems = normalizedItems.map(function buildItem(item) {
      const product = productMap.get(item.product_id);
      const unitPrice = toNumber(product.price);
      const subtotal = unitPrice * item.quantity;

      return {
        product_id: product.id,
        product_name: product.name,
        quantity: item.quantity,
        unit_price: unitPrice,
        subtotal: subtotal
      };
    });

    const subtotal = orderItems.reduce(function sum(currentTotal, item) {
      return currentTotal + item.subtotal;
    }, 0);
    const deliveryFee = payload.delivery_type === 'delivery' ? toNumber(settings.delivery_fee) : 0;
    const total = subtotal + deliveryFee;

    const orderInsertResult = await client.query(`
      INSERT INTO orders (
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
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
      RETURNING id, status, subtotal, delivery_fee, total
    `, [
      payload.customer_name.trim(),
      payload.customer_phone.trim(),
      payload.delivery_type,
      payload.delivery_type === 'delivery' ? payload.address.trim() : null,
      typeof payload.notes === 'string' && payload.notes.trim() !== '' ? payload.notes.trim() : null,
      mapRequestedStatusToDb('new'),
      subtotal,
      deliveryFee,
      total
    ]);

    const order = orderInsertResult.rows[0];

    for (const item of orderItems) {
      await client.query(`
        INSERT INTO order_items (
          order_id,
          product_id,
          product_name,
          quantity,
          unit_price,
          subtotal,
          created_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, NOW())
      `, [
        order.id,
        item.product_id,
        item.product_name,
        item.quantity,
        item.unit_price,
        item.subtotal
      ]);
    }

    await client.query('COMMIT');

    return {
      message: 'Order created successfully',
      order: formatOrderSummary(order)
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

module.exports = {
  createOrder,
  normalizeStatusForResponse,
  mapRequestedStatusToDb,
  toNumber
};
