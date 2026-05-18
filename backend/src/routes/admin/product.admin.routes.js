const express = require('express');

const productAdminController = require('../../controllers/admin/product.admin.controller');

const router = express.Router();

router.get('/', productAdminController.getProducts);
router.get('/:id', productAdminController.getProductById);
router.post('/', productAdminController.createProduct);
router.put('/:id', productAdminController.updateProduct);
router.delete('/:id', productAdminController.deleteProduct);

module.exports = router;
