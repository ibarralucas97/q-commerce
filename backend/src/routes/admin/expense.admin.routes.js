const express = require('express');

const expenseAdminController = require('../../controllers/admin/expense.admin.controller');

const router = express.Router();

router.get('/', expenseAdminController.getExpenses);
router.get('/:id', expenseAdminController.getExpenseById);
router.post('/', expenseAdminController.createExpense);
router.put('/:id', expenseAdminController.updateExpense);
router.delete('/:id', expenseAdminController.deleteExpense);

module.exports = router;
