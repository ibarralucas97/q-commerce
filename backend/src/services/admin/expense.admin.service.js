const pool = require('../../config/db');
const { getSchemaCapabilities } = require('../schema-capabilities.service');

function mapExpenseRow(row) {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    description: row.description,
    amount: Number.parseFloat(row.amount) || 0,
    expense_date: row.expense_date,
    closure_id: row.closure_id || null,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}

async function getExpenses(options) {
  const capabilities = await getSchemaCapabilities();
  const filters = [];
  const values = [];

  if (capabilities.hasExpenseClosureId && (!options || options.scope !== 'all')) {
    filters.push('closure_id IS NULL');
  }

  if (capabilities.hasExpenseClosureId && options && Number.isInteger(options.closure_id)) {
    values.push(options.closure_id);
    filters.push('closure_id = $' + values.length);
  }

  const whereClause = filters.length > 0 ? 'WHERE ' + filters.join(' AND ') : '';
  const result = await pool.query(`
    SELECT
      id,
      title,
      ${capabilities.hasExpenseCategory ? 'category' : 'NULL::varchar AS category'},
      description,
      amount,
      expense_date,
      ${capabilities.hasExpenseClosureId ? 'closure_id' : 'NULL::integer AS closure_id'},
      created_at,
      updated_at
    FROM expenses
    ${whereClause}
    ORDER BY expense_date DESC, id DESC
  `, values);

  return result.rows.map(mapExpenseRow);
}

async function getExpenseById(expenseId) {
  const capabilities = await getSchemaCapabilities();
  const result = await pool.query(`
    SELECT
      id,
      title,
      ${capabilities.hasExpenseCategory ? 'category' : 'NULL::varchar AS category'},
      description,
      amount,
      expense_date,
      ${capabilities.hasExpenseClosureId ? 'closure_id' : 'NULL::integer AS closure_id'},
      created_at,
      updated_at
    FROM expenses
    WHERE id = $1
    LIMIT 1
  `, [expenseId]);

  return result.rowCount === 0 ? null : mapExpenseRow(result.rows[0]);
}

async function createExpense(payload) {
  const capabilities = await getSchemaCapabilities();
  const columns = ['title'];
  const values = [payload.title];
  const placeholders = ['$1'];

  if (capabilities.hasExpenseCategory) {
    columns.push('category');
    values.push(payload.category);
    placeholders.push('$' + values.length);
  }

  columns.push('description', 'amount', 'expense_date', 'created_at', 'updated_at');
  values.push(payload.description, payload.amount, payload.expense_date);
  placeholders.push('$' + (values.length - 2), '$' + (values.length - 1), '$' + values.length, 'NOW()', 'NOW()');

  const result = await pool.query(`
    INSERT INTO expenses (${columns.join(', ')})
    VALUES (${placeholders.join(', ')})
    RETURNING
      id,
      title,
      ${capabilities.hasExpenseCategory ? 'category' : 'NULL::varchar AS category'},
      description,
      amount,
      expense_date,
      ${capabilities.hasExpenseClosureId ? 'closure_id' : 'NULL::integer AS closure_id'},
      created_at,
      updated_at
  `, values);

  return mapExpenseRow(result.rows[0]);
}

async function updateExpense(expenseId, payload) {
  const capabilities = await getSchemaCapabilities();
  const assignments = ['title = $2'];
  const values = [expenseId, payload.title];
  let nextIndex = 3;

  if (capabilities.hasExpenseCategory) {
    assignments.push('category = $' + nextIndex);
    values.push(payload.category);
    nextIndex += 1;
  }

  assignments.push('description = $' + nextIndex);
  values.push(payload.description);
  nextIndex += 1;

  assignments.push('amount = $' + nextIndex);
  values.push(payload.amount);
  nextIndex += 1;

  assignments.push('expense_date = $' + nextIndex);
  values.push(payload.expense_date);

  const result = await pool.query(`
    UPDATE expenses
    SET
      ${assignments.join(',\n      ')},
      updated_at = NOW()
    WHERE id = $1
    RETURNING
      id,
      title,
      ${capabilities.hasExpenseCategory ? 'category' : 'NULL::varchar AS category'},
      description,
      amount,
      expense_date,
      ${capabilities.hasExpenseClosureId ? 'closure_id' : 'NULL::integer AS closure_id'},
      created_at,
      updated_at
  `, values);

  return result.rowCount === 0 ? null : mapExpenseRow(result.rows[0]);
}

async function deleteExpense(expenseId) {
  const capabilities = await getSchemaCapabilities();
  const result = await pool.query(`
    DELETE FROM expenses
    WHERE id = $1
    RETURNING
      id,
      title,
      ${capabilities.hasExpenseCategory ? 'category' : 'NULL::varchar AS category'},
      description,
      amount,
      expense_date,
      ${capabilities.hasExpenseClosureId ? 'closure_id' : 'NULL::integer AS closure_id'},
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
