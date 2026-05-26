const express = require('express');

const productOptionAdminController = require('../../controllers/admin/product-option.admin.controller');

const router = express.Router();

router.put('/:id', productOptionAdminController.updateProductOption);
router.delete('/:id', productOptionAdminController.deleteProductOption);

module.exports = router;
