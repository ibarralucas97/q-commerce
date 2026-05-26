const pool = require('../../config/db');

function toNumber(value) {
  return Number.parseFloat(value) || 0;
}

async function getDashboardSummary() {
  const result = await pool.query(`
    SELECT
      COALESCE((
        SELECT COUNT(*)
        FROM orders
        WHERE DATE(created_at) = CURRENT_DATE
      ), 0) AS orders_today,
      COALESCE((
        SELECT SUM(total)
        FROM orders
        WHERE DATE(created_at) = CURRENT_DATE
          AND status <> 'cancelled'
      ), 0) AS sales_today,
      COALESCE((
        SELECT SUM(total)
        FROM orders
        WHERE created_at >= date_trunc('week', CURRENT_DATE::timestamp)
          AND status <> 'cancelled'
      ), 0) AS sales_week,
      COALESCE((
        SELECT COUNT(*)
        FROM orders
        WHERE status IN ('pending', 'confirmed', 'preparing')
      ), 0) AS pending_orders,
      COALESCE((
        SELECT COUNT(*)
        FROM products
        WHERE is_active = true
      ), 0) AS active_products,
      COALESCE((
        SELECT SUM(amount)
        FROM expenses
        WHERE expense_date >= date_trunc('week', CURRENT_DATE::timestamp)::date
      ), 0) AS expenses_week
  `);
  const row = result.rows[0];
  const salesWeek = toNumber(row.sales_week);
  const expensesWeek = toNumber(row.expenses_week);

  return {
    orders_today: Number.parseInt(row.orders_today, 10) || 0,
    sales_today: toNumber(row.sales_today),
    sales_week: salesWeek,
    pending_orders: Number.parseInt(row.pending_orders, 10) || 0,
    active_products: Number.parseInt(row.active_products, 10) || 0,
    expenses_week: expensesWeek,
    estimated_profit_week: salesWeek - expensesWeek
  };
}

module.exports = {
  getDashboardSummary
};
