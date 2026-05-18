const productAdminService = require('../../services/admin/product.admin.service');

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
    is_active: typeof body.is_active === 'boolean' ? body.is_active : true
  };
}

async function getProducts(req, res) {
  try {
    const products = await productAdminService.getProducts();

    return res.json(products);
  } catch (error) {
    console.error('Error fetching admin products:', error);

    return res.status(500).json({
      error: 'internal server error'
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
    console.error('Error fetching admin product:', error);

    return res.status(500).json({
      error: 'internal server error'
    });
  }
}

async function createProduct(req, res) {
  try {
    const payload = normalizeProductPayload(req.body);

    if (typeof payload.name !== 'string' || payload.name.trim() === '') {
      return res.status(400).json({
        error: 'name is required'
      });
    }

    if (!Number.isFinite(payload.price) || payload.price < 0) {
      return res.status(400).json({
        error: 'price must be a non-negative number'
      });
    }

    if (Number.isNaN(payload.category_id)) {
      return res.status(400).json({
        error: 'category_id must be a valid integer or null'
      });
    }

    if (Number.isNaN(payload.stock) || (payload.stock !== null && payload.stock < 0)) {
      return res.status(400).json({
        error: 'stock must be null or a non-negative integer'
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

    if (typeof payload.name !== 'string' || payload.name.trim() === '') {
      return res.status(400).json({
        error: 'name is required'
      });
    }

    if (!Number.isFinite(payload.price) || payload.price < 0) {
      return res.status(400).json({
        error: 'price must be a non-negative number'
      });
    }

    if (Number.isNaN(payload.category_id)) {
      return res.status(400).json({
        error: 'category_id must be a valid integer or null'
      });
    }

    if (Number.isNaN(payload.stock) || (payload.stock !== null && payload.stock < 0)) {
      return res.status(400).json({
        error: 'stock must be null or a non-negative integer'
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

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
