const expenseAdminService = require('../../services/admin/expense.admin.service');
const auditLogService = require('../../services/audit-log.service');

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

function getAuditActor(req) {
  return {
    actorUserId: req.adminUser && req.adminUser.sub ? Number(req.adminUser.sub) : null,
    actorName: req.adminUser && req.adminUser.username ? req.adminUser.username : 'admin'
  };
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
    console.error('[GET /api/admin/expenses] Error fetching expenses:', error.message);
    console.error(error.stack);

    return res.status(500).json({
      error: 'ADMIN_EXPENSES_FETCH_FAILED',
      message: 'No se pudieron cargar los gastos del panel.',
      details: error.message
    });
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
    console.error('[GET /api/admin/expenses/:id] Error fetching expense:', error.message);
    console.error(error.stack);

    return res.status(500).json({
      error: 'ADMIN_EXPENSE_FETCH_FAILED',
      message: 'No se pudo cargar el gasto solicitado.',
      details: error.message
    });
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

    await auditLogService.log({
      ...getAuditActor(req),
      action: 'EXPENSE_CREATED',
      entityType: 'expense',
      entityId: expense.id,
      entityLabel: expense.title,
      beforeData: null,
      afterData: expense,
      metadata: null
    });

    return res.status(201).json(expense);
  } catch (error) {
    console.error('[POST /api/admin/expenses] Error creating expense:', error.message);
    console.error(error.stack);

    return res.status(500).json({
      error: 'ADMIN_EXPENSE_CREATE_FAILED',
      message: 'No se pudo crear el gasto.',
      details: error.message
    });
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

    const existingExpense = await expenseAdminService.getExpenseById(expenseId);

    if (!existingExpense) {
      return res.status(404).json({ error: 'expense not found' });
    }

    const expense = await expenseAdminService.updateExpense(expenseId, payload);

    if (!expense) {
      return res.status(404).json({ error: 'expense not found' });
    }

    await auditLogService.log({
      ...getAuditActor(req),
      action: 'EXPENSE_UPDATED',
      entityType: 'expense',
      entityId: expense.id,
      entityLabel: expense.title,
      beforeData: existingExpense,
      afterData: expense,
      metadata: null
    });

    return res.json(expense);
  } catch (error) {
    console.error('[PUT /api/admin/expenses/:id] Error updating expense:', error.message);
    console.error(error.stack);

    return res.status(500).json({
      error: 'ADMIN_EXPENSE_UPDATE_FAILED',
      message: 'No se pudo actualizar el gasto.',
      details: error.message
    });
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

    await auditLogService.log({
      ...getAuditActor(req),
      action: 'EXPENSE_DELETED',
      entityType: 'expense',
      entityId: expense.id,
      entityLabel: expense.title,
      beforeData: expense,
      afterData: null,
      metadata: {
        deleted: true
      }
    });

    return res.json({
      message: 'Expense deleted successfully',
      expense: expense
    });
  } catch (error) {
    console.error('[DELETE /api/admin/expenses/:id] Error deleting expense:', error.message);
    console.error(error.stack);

    return res.status(500).json({
      error: 'ADMIN_EXPENSE_DELETE_FAILED',
      message: 'No se pudo eliminar el gasto.',
      details: error.message
    });
  }
}

module.exports = {
  getExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense
};
