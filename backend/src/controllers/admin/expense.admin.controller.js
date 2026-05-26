const expenseAdminService = require('../../services/admin/expense.admin.service');

function normalizeExpensePayload(body) {
  return {
    title: typeof body.title === 'string' ? body.title.trim() : '',
    category: typeof body.category === 'string' && body.category.trim() !== '' ? body.category.trim() : null,
    description: typeof body.description === 'string' && body.description.trim() !== '' ? body.description.trim() : null,
    amount: Number(body.amount),
    expense_date: typeof body.expense_date === 'string' && body.expense_date.trim() !== '' ? body.expense_date : null
  };
}

function validateExpensePayload(payload) {
  if (payload.title === '') {
    return 'title is required';
  }

  if (!Number.isFinite(payload.amount) || payload.amount < 0) {
    return 'amount must be a non-negative number';
  }

  if (!payload.expense_date) {
    return 'expense_date is required';
  }

  return null;
}

async function getExpenses(req, res) {
  try {
    const closureId = req.query && req.query.closure_id ? Number.parseInt(req.query.closure_id, 10) : null;
    const expenses = await expenseAdminService.getExpenses({
      scope: req.query && req.query.scope === 'all' ? 'all' : 'active',
      closure_id: Number.isNaN(closureId) ? null : closureId
    });

    return res.json(expenses);
  } catch (error) {
    console.error('Error fetching expenses:', error);

    return res.status(500).json({ error: 'internal server error' });
  }
}

async function getExpenseById(req, res) {
  try {
    const expenseId = Number.parseInt(req.params.id, 10);

    if (Number.isNaN(expenseId)) {
      return res.status(404).json({ error: 'expense not found' });
    }

    const expense = await expenseAdminService.getExpenseById(expenseId);

    if (!expense) {
      return res.status(404).json({ error: 'expense not found' });
    }

    return res.json(expense);
  } catch (error) {
    console.error('Error fetching expense:', error);

    return res.status(500).json({ error: 'internal server error' });
  }
}

async function createExpense(req, res) {
  try {
    const payload = normalizeExpensePayload(req.body);
    const validationError = validateExpensePayload(payload);

    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const expense = await expenseAdminService.createExpense(payload);

    return res.status(201).json(expense);
  } catch (error) {
    console.error('Error creating expense:', error);

    return res.status(500).json({ error: 'internal server error' });
  }
}

async function updateExpense(req, res) {
  try {
    const expenseId = Number.parseInt(req.params.id, 10);
    const payload = normalizeExpensePayload(req.body);

    if (Number.isNaN(expenseId)) {
      return res.status(404).json({ error: 'expense not found' });
    }

    const validationError = validateExpensePayload(payload);

    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const expense = await expenseAdminService.updateExpense(expenseId, payload);

    if (!expense) {
      return res.status(404).json({ error: 'expense not found' });
    }

    return res.json(expense);
  } catch (error) {
    console.error('Error updating expense:', error);

    return res.status(500).json({ error: 'internal server error' });
  }
}

async function deleteExpense(req, res) {
  try {
    const expenseId = Number.parseInt(req.params.id, 10);

    if (Number.isNaN(expenseId)) {
      return res.status(404).json({ error: 'expense not found' });
    }

    const expense = await expenseAdminService.deleteExpense(expenseId);

    if (!expense) {
      return res.status(404).json({ error: 'expense not found' });
    }

    return res.json({
      message: 'Expense deleted successfully',
      expense: expense
    });
  } catch (error) {
    console.error('Error deleting expense:', error);

    return res.status(500).json({ error: 'internal server error' });
  }
}

module.exports = {
  getExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense
};
