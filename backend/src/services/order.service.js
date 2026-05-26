const pool = require('../config/db');

const DELIVERY_TYPES = ['delivery', 'pickup'];
const DAY_LABELS = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];

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
    total: toNumber(row.total),
    fulfillment_day: row.fulfillment_day || null,
    fulfillment_time_range: row.fulfillment_time_range || null
  };
}

function getDayLabel(dayOfWeek) {
  return DAY_LABELS[dayOfWeek] || '';
}

function normalizeTimeValue(value) {
  return String(value).slice(0, 5);
}

function formatTimeRange(startTime, endTime) {
  return normalizeTimeValue(startTime) + ' - ' + normalizeTimeValue(endTime);
}

function supportsFulfillmentType(scheduleType, deliveryType) {
  return scheduleType === 'both' || scheduleType === deliveryType;
}

function buildSelectionDetail(product, selectedOptions) {
  if (!selectedOptions || selectedOptions.length === 0) {
    return [];
  }

  const baseLabel = product.option_group_label && String(product.option_group_label).trim() !== ''
    ? String(product.option_group_label).trim()
    : 'Selección';

  return selectedOptions.map(function toDetail(option, index) {
    return {
      slot: index + 1,
      label: baseLabel + ' ' + (index + 1),
      option_id: option.id,
      option_name: option.name
    };
  });
}

function buildSelectionSummary(selectionDetail) {
  if (!selectionDetail || selectionDetail.length === 0) {
    return null;
  }

  return selectionDetail.map(function toText(item) {
    return item.label + ': ' + item.option_name;
  }).join(' · ');
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

    if (item.product_option_id !== undefined && item.product_option_id !== null && (!Number.isInteger(item.product_option_id) || item.product_option_id <= 0)) {
      return 'product_option_id must be a valid integer when provided';
    }

    if (item.selected_option_ids !== undefined) {
      if (!Array.isArray(item.selected_option_ids)) {
        return 'selected_option_ids must be an array when provided';
      }

      for (const optionId of item.selected_option_ids) {
        if (!Number.isInteger(optionId) || optionId <= 0) {
          return 'selected_option_ids must contain valid integers';
        }
      }
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
    const selectedOptionIds = Array.isArray(item.selected_option_ids)
      ? item.selected_option_ids.filter(function onlyOptionId(optionId) {
          return Number.isInteger(optionId) && optionId > 0;
        })
      : (item.product_option_id === null || item.product_option_id === undefined ? [] : [item.product_option_id]);
    const optionKey = selectedOptionIds.length === 0 ? 'no-option' : selectedOptionIds.join('-');
    const itemKey = item.product_id + ':' + optionKey;
    const existing = itemMap.get(itemKey);

    if (existing) {
      existing.quantity += item.quantity;
    } else {
      itemMap.set(itemKey, {
        product_id: item.product_id,
        product_option_id: item.product_option_id ?? null,
        selected_option_ids: selectedOptionIds,
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
      is_active,
      option_group_count,
      option_group_label
    FROM products
    WHERE id = ANY($1::int[])
  `, [productIds]);

  return result.rows;
}

async function getProductOptionsForOrder(client, productOptionIds) {
  if (productOptionIds.length === 0) {
    return [];
  }

  const result = await client.query(`
    SELECT
      id,
      product_id,
      name,
      price_modifier,
      is_required,
      is_active
    FROM product_options
    WHERE id = ANY($1::int[])
  `, [productOptionIds]);

  return result.rows;
}

async function getActiveProductOptionsByProductIds(client, productIds) {
  if (productIds.length === 0) {
    return [];
  }

  const result = await client.query(`
    SELECT
      id,
      product_id,
      name,
      description,
      price_modifier,
      is_required,
      is_active
    FROM product_options
    WHERE product_id = ANY($1::int[])
      AND is_active = true
  `, [productIds]);

  return result.rows;
}

async function getFulfillmentSchedules(client) {
  const result = await client.query(`
    SELECT
      id,
      day_of_week,
      start_time,
      end_time,
      fulfillment_type,
      is_active
    FROM fulfillment_schedules
    WHERE is_active = true
    ORDER BY day_of_week ASC, start_time ASC
  `);

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
    const productOptionIds = Array.from(new Set(normalizedItems.flatMap(function mapOptionIds(item) {
      return item.selected_option_ids || [];
    })));
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
    const selectedOptions = await getProductOptionsForOrder(client, productOptionIds);
    const optionMap = new Map(selectedOptions.map(function toEntry(option) {
      return [option.id, option];
    }));
    const activeProductOptions = await getActiveProductOptionsByProductIds(client, productIds);
    const schedules = await getFulfillmentSchedules(client);

    for (const item of normalizedItems) {
      const product = productMap.get(item.product_id);

      if (!product || product.is_active === false) {
        await client.query('ROLLBACK');

        return {
          error: 'one or more products are unavailable',
          statusCode: 400
        };
      }

      const productOptions = activeProductOptions.filter(function filterOption(option) {
        return option.product_id === item.product_id && option.is_active === true;
      });
      const requiredOptionExists = productOptions.some(function isRequiredOption(option) {
        return option.is_required === true;
      });
      const optionGroupCount = Number.parseInt(product.option_group_count, 10) || 1;
      const selectedOptionIds = item.selected_option_ids || [];

      if (requiredOptionExists && selectedOptionIds.length === 0) {
        await client.query('ROLLBACK');

        return {
          error: 'product option is required for one or more items',
          statusCode: 400
        };
      }

      if (productOptions.length > 0 && optionGroupCount > 1 && selectedOptionIds.length !== optionGroupCount) {
        await client.query('ROLLBACK');

        return {
          error: 'selected options count is invalid for one or more items',
          statusCode: 400
        };
      }

      if (selectedOptionIds.length > 0) {
        for (const optionId of selectedOptionIds) {
          const selectedOption = optionMap.get(optionId);

          if (!selectedOption || selectedOption.product_id !== item.product_id || selectedOption.is_active === false) {
            await client.query('ROLLBACK');

            return {
              error: 'one or more product options are invalid',
              statusCode: 400
            };
          }
        }
      }

      if (selectedOptionIds.length === 1) {
        item.product_option_id = selectedOptionIds[0];
      } else if (selectedOptionIds.length === 0) {
        item.product_option_id = null;
      } else {
        item.product_option_id = null;
      }

      if (item.product_option_id !== null) {
        const selectedOption = optionMap.get(item.product_option_id);

        if (!selectedOption || selectedOption.product_id !== item.product_id || selectedOption.is_active === false) {
          await client.query('ROLLBACK');

          return {
            error: 'one or more product options are invalid',
            statusCode: 400
          };
        }
      }
    }

    if (schedules.length > 0) {
      if (typeof payload.fulfillment_day !== 'string' || payload.fulfillment_day.trim() === '') {
        await client.query('ROLLBACK');

        return {
          error: 'fulfillment_day is required when schedules are configured',
          statusCode: 400
        };
      }

      if (typeof payload.fulfillment_time_range !== 'string' || payload.fulfillment_time_range.trim() === '') {
        await client.query('ROLLBACK');

        return {
          error: 'fulfillment_time_range is required when schedules are configured',
          statusCode: 400
        };
      }

      const normalizedFulfillmentDay = payload.fulfillment_day.trim().toLowerCase();
      const normalizedFulfillmentTimeRange = payload.fulfillment_time_range.trim();
      const validSchedule = schedules.find(function findSchedule(schedule) {
        return getDayLabel(schedule.day_of_week) === normalizedFulfillmentDay
          && formatTimeRange(schedule.start_time, schedule.end_time) === normalizedFulfillmentTimeRange
          && supportsFulfillmentType(schedule.fulfillment_type, payload.delivery_type);
      });

      if (!validSchedule) {
        await client.query('ROLLBACK');

        return {
          error: 'selected fulfillment schedule is invalid',
          statusCode: 400
        };
      }
    }

    const orderItems = normalizedItems.map(function buildItem(item) {
      const product = productMap.get(item.product_id);
      const selectedOptions = (item.selected_option_ids || []).map(function mapOption(optionId) {
        return optionMap.get(optionId);
      }).filter(Boolean);
      const selectedOption = selectedOptions.length === 1
        ? selectedOptions[0]
        : (item.product_option_id === null ? null : optionMap.get(item.product_option_id));
      const selectionDetail = buildSelectionDetail(product, selectedOptions);
      const selectionSummary = buildSelectionSummary(selectionDetail);
      const unitPrice = toNumber(product.price) + selectedOptions.reduce(function sumModifiers(accumulator, option) {
        return accumulator + toNumber(option.price_modifier);
      }, 0);
      const subtotal = unitPrice * item.quantity;

      return {
        product_id: product.id,
        product_option_id: selectedOption ? selectedOption.id : null,
        product_name: product.name,
        product_option_name: selectedOption ? selectedOption.name : null,
        selection_summary: selectionSummary,
        selection_detail: selectionDetail,
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
        customer_latitude,
        customer_longitude,
        maps_url,
        notes,
        fulfillment_day,
        fulfillment_time_range,
        status,
        subtotal,
        delivery_fee,
        total,
        created_at,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW())
      RETURNING id, status, subtotal, delivery_fee, total, fulfillment_day, fulfillment_time_range
    `, [
      payload.customer_name.trim(),
      payload.customer_phone.trim(),
      payload.delivery_type,
      payload.delivery_type === 'delivery' ? payload.address.trim() : null,
      payload.customer_latitude ?? null,
      payload.customer_longitude ?? null,
      typeof payload.maps_url === 'string' && payload.maps_url.trim() !== '' ? payload.maps_url.trim() : null,
      typeof payload.notes === 'string' && payload.notes.trim() !== '' ? payload.notes.trim() : null,
      typeof payload.fulfillment_day === 'string' && payload.fulfillment_day.trim() !== '' ? payload.fulfillment_day.trim() : null,
      typeof payload.fulfillment_time_range === 'string' && payload.fulfillment_time_range.trim() !== '' ? payload.fulfillment_time_range.trim() : null,
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
          product_option_id,
          product_name,
          product_option_name,
          selection_summary,
          selection_detail,
          quantity,
          unit_price,
          subtotal,
          created_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8, $9, $10, NOW())
      `, [
        order.id,
        item.product_id,
        item.product_option_id,
        item.product_name,
        item.product_option_name,
        item.selection_summary,
        JSON.stringify(item.selection_detail || []),
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
