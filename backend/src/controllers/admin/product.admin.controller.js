const productAdminService = require('../../services/admin/product.admin.service');
const productOptionAdminService = require('../../services/admin/product-option.admin.service');

function buildProductsErrorResponse(code, message, error) {
  return {
    error: code,
    message: message,
    details: error && error.message ? error.message : null
  };
}

function normalizeCategoryId(categoryId) {
  if (categoryId === null || categoryId === undefined || categoryId === '') {
    return null;
  }

  const parsedCategoryId = Number.parseInt(categoryId, 10);

  return Number.isNaN(parsedCategoryId) ? Number.NaN : parsedCategoryId;
}

function normalizeStock(stock) {
  if (stock === null || stock === undefined || stock === '') {
    return null;
  }

  const parsedStock = Number.parseInt(stock, 10);

  return Number.isNaN(parsedStock) ? Number.NaN : parsedStock;
}

function normalizeProductPayload(body) {
  return {
    category_id: normalizeCategoryId(body.category_id),
    name: body.name,
    description: body.description ?? null,
    price: Number(body.price),
    image_url: body.image_url ?? null,
    stock: normalizeStock(body.stock),
    option_group_count: Number.parseInt(body.option_group_count === undefined || body.option_group_count === null || body.option_group_count === '' ? 1 : body.option_group_count, 10),
    option_group_label: typeof body.option_group_label === 'string' && body.option_group_label.trim() !== '' ? body.option_group_label.trim() : null,
    is_active: typeof body.is_active === 'boolean' ? body.is_active : true
  };
}

function validateNormalizedPayload(payload) {
  if (typeof payload.name !== 'string' || payload.name.trim() === '') {
    return 'name is required';
  }

  if (!Number.isFinite(payload.price) || payload.price < 0) {
    return 'price must be a non-negative number';
  }

  if (Number.isNaN(payload.category_id)) {
    return 'category_id must be a valid integer or null';
  }

  if (Number.isNaN(payload.stock) || (payload.stock !== null && payload.stock < 0)) {
    return 'stock must be null or a non-negative integer';
  }

  if (!Number.isInteger(payload.option_group_count) || payload.option_group_count < 1) {
    return 'option_group_count must be an integer greater than or equal to 1';
  }

  return null;
}

async function getProducts(req, res) {
  try {
    const products = await productAdminService.getProducts();

    return res.json(products);
  } catch (error) {
    console.error('[GET /api/admin/products] Error fetching admin products:', error.message);
    console.error(error.stack);

    return res.status(500).json({
      ...buildProductsErrorResponse(
        'ADMIN_PRODUCTS_FETCH_FAILED',
        'No se pudieron cargar los productos del panel.',
        error
      )
    });
  }
}

async function getProductById(req, res) {
  try {
    const productId = Number.parseInt(req.params.id, 10);

    if (Number.isNaN(productId)) {
      return res.status(404).json({
        error: 'product not found'
      });
    }

    const product = await productAdminService.getProductById(productId);

    if (!product) {
      return res.status(404).json({
        error: 'product not found'
      });
    }

    return res.json(product);
  } catch (error) {
    console.error('[GET /api/admin/products/:id] Error fetching admin product:', error.message);
    console.error(error.stack);

    return res.status(500).json({
      error: 'ADMIN_PRODUCT_FETCH_FAILED',
      message: 'No se pudo cargar el producto del panel.',
      details: error && error.message ? error.message : null
    });
  }
}

async function createProduct(req, res) {
  try {
    const payload = normalizeProductPayload(req.body);
    const validationError = validateNormalizedPayload(payload);

    if (validationError) {
      return res.status(400).json({
        error: validationError
      });
    }

    const categoryExists = await productAdminService.categoryExists(payload.category_id);

    if (!categoryExists) {
      return res.status(400).json({
        error: 'category_id does not exist'
      });
    }

    const product = await productAdminService.createProduct({
      ...payload,
      name: payload.name.trim()
    });

    return res.status(201).json(product);
  } catch (error) {
    console.error('Error creating admin product:', error);

    return res.status(500).json({
      error: 'internal server error'
    });
  }
}

async function updateProduct(req, res) {
  try {
    const productId = Number.parseInt(req.params.id, 10);
    const payload = normalizeProductPayload(req.body);

    if (Number.isNaN(productId)) {
      return res.status(404).json({
        error: 'product not found'
      });
    }

    const validationError = validateNormalizedPayload(payload);

    if (validationError) {
      return res.status(400).json({
        error: validationError
      });
    }

    const existingProduct = await productAdminService.getProductById(productId);

    if (!existingProduct) {
      return res.status(404).json({
        error: 'product not found'
      });
    }

    const categoryExists = await productAdminService.categoryExists(payload.category_id);

    if (!categoryExists) {
      return res.status(400).json({
        error: 'category_id does not exist'
      });
    }

    const product = await productAdminService.updateProduct(productId, {
      ...payload,
      name: payload.name.trim()
    });

    return res.json(product);
  } catch (error) {
    console.error('Error updating admin product:', error);

    return res.status(500).json({
      error: 'internal server error'
    });
  }
}

async function deleteProduct(req, res) {
  try {
    const productId = Number.parseInt(req.params.id, 10);

    if (Number.isNaN(productId)) {
      return res.status(404).json({
        error: 'product not found'
      });
    }

    const product = await productAdminService.softDeleteProduct(productId);

    if (!product) {
      return res.status(404).json({
        error: 'product not found'
      });
    }

    return res.json(product);
  } catch (error) {
    console.error('Error deleting admin product:', error);

    return res.status(500).json({
      error: 'internal server error'
    });
  }
}

async function getProductOptions(req, res) {
  try {
    const productId = Number.parseInt(req.params.productId, 10);

    if (Number.isNaN(productId)) {
      return res.status(404).json({
        error: 'product not found'
      });
    }

    const product = await productAdminService.getProductById(productId);

    if (!product) {
      return res.status(404).json({
        error: 'product not found'
      });
    }

    const options = await productOptionAdminService.getOptionsByProductId(productId);

    return res.json(options);
  } catch (error) {
    console.error('Error fetching admin product options:', error);

    return res.status(500).json({
      error: 'internal server error'
    });
  }
}

async function createProductOption(req, res) {
  try {
    const productId = Number.parseInt(req.params.productId, 10);
    const name = req.body && typeof req.body.name === 'string' ? req.body.name.trim() : '';
    const description = req.body && typeof req.body.description === 'string' ? req.body.description.trim() : null;
    const priceModifier = Number(req.body && req.body.price_modifier !== undefined ? req.body.price_modifier : 0);
    const isRequired = req.body && typeof req.body.is_required === 'boolean' ? req.body.is_required : false;
    const isActive = req.body && typeof req.body.is_active === 'boolean' ? req.body.is_active : true;

    if (Number.isNaN(productId)) {
      return res.status(404).json({
        error: 'product not found'
      });
    }

    if (name === '') {
      return res.status(400).json({
        error: 'name is required'
      });
    }

    if (!Number.isFinite(priceModifier)) {
      return res.status(400).json({
        error: 'price_modifier must be a valid number'
      });
    }

    const product = await productAdminService.getProductById(productId);

    if (!product) {
      return res.status(404).json({
        error: 'product not found'
      });
    }

    const option = await productOptionAdminService.createProductOption(productId, {
      name: name,
      description: description,
      price_modifier: priceModifier,
      is_required: isRequired,
      is_active: isActive
    });

    return res.status(201).json(option);
  } catch (error) {
    console.error('Error creating admin product option:', error);

    return res.status(500).json({
      error: 'internal server error'
    });
  }
}

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductOptions,
  createProductOption
};
