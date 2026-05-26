const express = require('express');

const categoryAdminController = require('../../controllers/admin/category.admin.controller');

const router = express.Router();

router.get('/', categoryAdminController.getCategories);
router.get('/:id', categoryAdminController.getCategoryById);
router.post('/', categoryAdminController.createCategory);
router.put('/:id', categoryAdminController.updateCategory);
router.patch('/:id/deactivate', categoryAdminController.deactivateCategory);
router.delete('/:id', categoryAdminController.deleteCategory);

module.exports = router;
