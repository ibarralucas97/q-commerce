const pool = require('../../config/db');
const { getSchemaCapabilities } = require('../schema-capabilities.service');

function toNumber(value) {
  return Number.parseFloat(value) || 0;
}

function mapClosureRow(row) {
  return {
    id: row.id,
    closure_code: row.closure_code,
    notes: row.notes || null,
    total_orders: Number.parseInt(row.total_orders, 10) || 0,
    valid_orders: Number.parseInt(row.valid_orders, 10) || 0,
    cancelled_orders: Number.parseInt(row.cancelled_orders, 10) || 0,
    total_sales: toNumber(row.total_sales),
    total_expenses: toNumber(row.total_expenses),
    net_profit: toNumber(row.net_profit),
    products_summary: Array.isArray(row.products_summary) ? row.products_summary : [],
    closed_at: row.closed_at,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}

function buildClosureCode() {
  const now = new Date();
  const pad = function pad(value) {
    return String(value).padStart(2, '0');
  };

  return 'LOT-' + now.getFullYear()
    + pad(now.getMonth() + 1)
    + pad(now.getDate())
    + '-'
    + pad(now.getHours())
    + pad(now.getMinutes())
    + pad(now.getSeconds());
}

async function getClosures() {
  const capabilities = await getSchemaCapabilities();

  if (!capabilities.hasOrderClosuresTable) {
    return [];
  }

  const result = await pool.query(`
    SELECT
      id,
      closure_code,
      notes,
      total_orders,
      valid_orders,
      cancelled_orders,
      total_sales,
      total_expenses,
      net_profit,
      products_summary,
      closed_at,
      created_at,
      updated_at
    FROM order_closures
    ORDER BY closed_at DESC, id DESC
  `);

  return result.rows.map(mapClosureRow);
}

async function getClosureById(closureId) {
  const capabilities = await getSchemaCapabilities();

  if (!capabilities.hasOrderClosuresTable) {
    return null;
  }

  const closureResult = await pool.query(`
    SELECT
      id,
      closure_code,
      notes,
      total_orders,
      valid_orders,
      cancelled_orders,
      total_sales,
      total_expenses,
      net_profit,
      products_summary,
      closed_at,
      created_at,
      updated_at
    FROM order_closures
    WHERE id = $1
    LIMIT 1
  `, [closureId]);

  if (closureResult.rowCount === 0) {
    return null;
  }

  const ordersResult = await pool.query(`
    SELECT
      id,
      customer_name,
      customer_phone,
      delivery_type,
      address,
      status,
      total,
      created_at
    FROM orders
    WHERE ${capabilities.hasOrderClosureId ? 'closure_id = $1' : '1 = 0'}
    ORDER BY created_at DESC, id DESC
  `, [closureId]);

  const expensesResult = await pool.query(`
    SELECT
      id,
      title,
      ${capabilities.hasExpenseCategory ? 'category' : 'NULL::varchar AS category'},
      amount,
      expense_date,
      created_at
    FROM expenses
    WHERE ${capabilities.hasExpenseClosureId ? 'closure_id = $1' : '1 = 0'}
    ORDER BY expense_date DESC, id DESC
  `, [closureId]);

  return {
    ...mapClosureRow(closureResult.rows[0]),
    orders: ordersResult.rows,
    expenses: expensesResult.rows
  };
}

async function closeActiveBatch(notes) {
  const capabilities = await getSchemaCapabilities();

  if (!capabilities.hasOrderClosuresTable || !capabilities.hasOrderClosureId || !capabilities.hasExpenseClosureId) {
    return {
      error: 'La base actual no tiene habilitado el cierre de caja. Ejecutá la migración 005_add_order_closures.sql.',
      statusCode: 400
    };
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const ordersResult = await client.query(`
      SELECT
        id,
        status,
        total
      FROM orders
      WHERE closure_id IS NULL
      ORDER BY id ASC
    `);

    const expensesResult = await client.query(`
      SELECT
        id,
        amount
      FROM expenses
      WHERE closure_id IS NULL
      ORDER BY id ASC
    `);

    if (ordersResult.rowCount === 0 && expensesResult.rowCount === 0) {
      await client.query('ROLLBACK');

      return {
        error: 'there are no active orders or expenses to close',
        statusCode: 400
      };
    }

    const sales = ordersResult.rows
      .filter(function onlyValid(order) {
        return order.status !== 'cancelled';
      })
      .reduce(function sum(accumulator, order) {
        return accumulator + toNumber(order.total);
      }, 0);

    const totalExpenses = expensesResult.rows.reduce(function sum(accumulator, expense) {
      return accumulator + toNumber(expense.amount);
    }, 0);

    const productsSummaryResult = await client.query(`
      SELECT
        oi.product_name,
        COALESCE(
          ${capabilities.hasOrderItemSelectionSummary ? 'oi.selection_summary' : 'NULL'},
          ${capabilities.hasOrderItemProductOptionName ? 'oi.product_option_name' : 'NULL'}
        ) AS selection_label,
        SUM(oi.quantity)::int AS total_quantity,
        SUM(oi.subtotal) AS total_amount
      FROM order_items oi
      INNER JOIN orders o ON o.id = oi.order_id
      WHERE o.closure_id IS NULL
        AND o.status <> 'cancelled'
      GROUP BY oi.product_name, COALESCE(oi.selection_summary, oi.product_option_name)
      ORDER BY oi.product_name ASC
    `);

    const closureInsert = await client.query(`
      INSERT INTO order_closures (
        closure_code,
        notes,
        total_orders,
        valid_orders,
        cancelled_orders,
        total_sales,
        total_expenses,
        net_profit,
        products_summary,
        closed_at,
        created_at,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, NOW(), NOW(), NOW())
      RETURNING
        id,
        closure_code,
        notes,
        total_orders,
        valid_orders,
        cancelled_orders,
        total_sales,
        total_expenses,
        net_profit,
        products_summary,
        closed_at,
        created_at,
        updated_at
    `, [
      buildClosureCode(),
      notes,
      ordersResult.rowCount,
      ordersResult.rows.filter(function onlyValid(order) {
        return order.status !== 'cancelled';
      }).length,
      ordersResult.rows.filter(function onlyCancelled(order) {
        return order.status === 'cancelled';
      }).length,
      sales,
      totalExpenses,
      sales - totalExpenses,
      JSON.stringify(productsSummaryResult.rows.map(function mapSummary(row) {
        return {
          product_name: row.product_name,
          selection_label: row.selection_label || null,
          total_quantity: Number.parseInt(row.total_quantity, 10) || 0,
          total_amount: toNumber(row.total_amount)
        };
      }))
    ]);

    const closure = closureInsert.rows[0];

    await client.query(`
      UPDATE orders
      SET
        closure_id = $1,
        updated_at = NOW()
      WHERE closure_id IS NULL
    `, [closure.id]);

    await client.query(`
      UPDATE expenses
      SET
        closure_id = $1,
        updated_at = NOW()
      WHERE closure_id IS NULL
    `, [closure.id]);

    await client.query('COMMIT');

    return {
      message: 'Closure created successfully',
      closure: mapClosureRow(closure)
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

module.exports = {
  getClosures,
  getClosureById,
  closeActiveBatch
};
