const pool = require('../../config/db');

function mapExpenseRow(row) {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    description: row.description,
    amount: Number.parseFloat(row.amount) || 0,
    expense_date: row.expense_date,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}

async function getExpenses() {
  const result = await pool.query(`
    SELECT
      id,
      title,
      category,
      description,
      amount,
      expense_date,
      created_at,
      updated_at
    FROM expenses
    ORDER BY expense_date DESC, id DESC
  `);

  return result.rows.map(mapExpenseRow);
}

async function getExpenseById(expenseId) {
  const result = await pool.query(`
    SELECT
      id,
      title,
      category,
      description,
      amount,
      expense_date,
      created_at,
      updated_at
    FROM expenses
    WHERE id = $1
    LIMIT 1
  `, [expenseId]);

  return result.rowCount === 0 ? null : mapExpenseRow(result.rows[0]);
}

async function createExpense(payload) {
  const result = await pool.query(`
    INSERT INTO expenses (
      title,
      category,
      description,
      amount,
      expense_date,
      created_at,
      updated_at
    )
    VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
    RETURNING
      id,
      title,
      category,
      description,
      amount,
      expense_date,
      created_at,
      updated_at
  `, [
    payload.title,
    payload.category,
    payload.description,
    payload.amount,
    payload.expense_date
  ]);

  return mapExpenseRow(result.rows[0]);
}

async function updateExpense(expenseId, payload) {
  const result = await pool.query(`
    UPDATE expenses
    SET
      title = $2,
      category = $3,
      description = $4,
      amount = $5,
      expense_date = $6,
      updated_at = NOW()
    WHERE id = $1
    RETURNING
      id,
      title,
      category,
      description,
      amount,
      expense_date,
      created_at,
      updated_at
  `, [
    expenseId,
    payload.title,
    payload.category,
    payload.description,
    payload.amount,
    payload.expense_date
  ]);

  return result.rowCount === 0 ? null : mapExpenseRow(result.rows[0]);
}

async function deleteExpense(expenseId) {
  const result = await pool.query(`
    DELETE FROM expenses
    WHERE id = $1
    RETURNING
      id,
      title,
      category,
      description,
      amount,
      expense_date,
      created_at,
      updated_at
  `, [expenseId]);

  return result.rowCount === 0 ? null : mapExpenseRow(result.rows[0]);
}

module.exports = {
  getExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense
};
