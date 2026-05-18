const productService = require('../services/product.service');

async function getProducts(req, res) {
  try {
    const products = await productService.getProducts();

    return res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);

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

    const product = await productService.getProductById(productId);

    if (!product) {
      return res.status(404).json({
        error: 'product not found'
      });
    }

    return res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);

    return res.status(500).json({
      error: 'internal server error'
    });
  }
}

module.exports = {
  getProducts,
  getProductById
};
