const productService = require('../services/product.service');

function buildProductsErrorResponse(code, message, error) {
  return {
    error: code,
    message: message,
    details: error && error.message ? error.message : null
  };
}

async function getProducts(req, res) {
  try {
    const products = await productService.getProducts();

    return res.json(products);
  } catch (error) {
    console.error('[GET /api/products] Error fetching products:', error.message);
    console.error(error.stack);

    return res.status(500).json({
      ...buildProductsErrorResponse(
        'PRODUCTS_FETCH_FAILED',
        'No se pudieron cargar los productos.',
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

    const product = await productService.getProductById(productId);

    if (!product) {
      return res.status(404).json({
        error: 'product not found'
      });
    }

    return res.json(product);
  } catch (error) {
    console.error('[GET /api/products/:id] Error fetching product:', error.message);
    console.error(error.stack);

    return res.status(500).json({
      error: 'PRODUCT_FETCH_FAILED',
      message: 'No se pudo cargar el producto.',
      details: error && error.message ? error.message : null
    });
  }
}

module.exports = {
  getProducts,
  getProductById
};
