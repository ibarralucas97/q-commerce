const productAdminService = require('../../services/admin/product.admin.service');
const productOptionAdminService = require('../../services/admin/product-option.admin.service');

function normalizeOptionPayload(body) {
  return {
    name: body.name,
    description: body.description ?? null,
    price_modifier: Number(body.price_modifier || 0),
    is_required: typeof body.is_required === 'boolean' ? body.is_required : false,
    is_active: typeof body.is_active === 'boolean' ? body.is_active : true
  };
}

async function getOptionsByProductId(req, res) {
  try {
    const productId = Number.parseInt(req.params.productId, 10);

    if (Number.isNaN(productId)) {
      return res.status(404).json({ error: 'product not found' });
    }

    const product = await productAdminService.getProductById(productId);

    if (!product) {
      return res.status(404).json({ error: 'product not found' });
    }

    const options = await productOptionAdminService.getOptionsByProductId(productId);

    return res.json(options);
  } catch (error) {
    console.error('Error fetching product options:', error);

    return res.status(500).json({ error: 'internal server error' });
  }
}

async function createProductOption(req, res) {
  try {
    const productId = Number.parseInt(req.params.productId, 10);
    const payload = normalizeOptionPayload(req.body);

    if (Number.isNaN(productId)) {
      return res.status(404).json({ error: 'product not found' });
    }

    if (typeof payload.name !== 'string' || payload.name.trim() === '') {
      return res.status(400).json({ error: 'name is required' });
    }

    if (!Number.isFinite(payload.price_modifier)) {
      return res.status(400).json({ error: 'price_modifier must be a valid number' });
    }

    const product = await productAdminService.getProductById(productId);

    if (!product) {
      return res.status(404).json({ error: 'product not found' });
    }

    const option = await productOptionAdminService.createProductOption(productId, {
      ...payload,
      name: payload.name.trim()
    });

    return res.status(201).json(option);
  } catch (error) {
    console.error('Error creating product option:', error);

    return res.status(500).json({ error: 'internal server error' });
  }
}

async function updateProductOption(req, res) {
  try {
    const optionId = Number.parseInt(req.params.id, 10);
    const payload = normalizeOptionPayload(req.body);

    if (Number.isNaN(optionId)) {
      return res.status(404).json({ error: 'product option not found' });
    }

    if (typeof payload.name !== 'string' || payload.name.trim() === '') {
      return res.status(400).json({ error: 'name is required' });
    }

    if (!Number.isFinite(payload.price_modifier)) {
      return res.status(400).json({ error: 'price_modifier must be a valid number' });
    }

    const existingOption = await productOptionAdminService.getProductOptionById(optionId);

    if (!existingOption) {
      return res.status(404).json({ error: 'product option not found' });
    }

    const option = await productOptionAdminService.updateProductOption(optionId, {
      ...payload,
      name: payload.name.trim()
    });

    return res.json(option);
  } catch (error) {
    console.error('Error updating product option:', error);

    return res.status(500).json({ error: 'internal server error' });
  }
}

async function deleteProductOption(req, res) {
  try {
    const optionId = Number.parseInt(req.params.id, 10);

    if (Number.isNaN(optionId)) {
      return res.status(404).json({ error: 'product option not found' });
    }

    const option = await productOptionAdminService.softDeleteProductOption(optionId);

    if (!option) {
      return res.status(404).json({ error: 'product option not found' });
    }

    return res.json(option);
  } catch (error) {
    console.error('Error deleting product option:', error);

    return res.status(500).json({ error: 'internal server error' });
  }
}

module.exports = {
  getOptionsByProductId,
  createProductOption,
  updateProductOption,
  deleteProductOption
};
