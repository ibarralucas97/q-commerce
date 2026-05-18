const pool = require('../../config/db');

const selectFields = `
  SELECT
    p.id,
    p.category_id,
    c.name AS category_name,
    p.name,
    p.description,
    p.price,
    p.image_url,
    p.stock,
    p.is_active,
    p.created_at,
    p.updated_at
  FROM products p
  LEFT JOIN categories c ON c.id = p.category_id
`;

async function getProducts() {
  const result = await pool.query(`
    ${selectFields}
    ORDER BY p.id ASC
  `);

  return result.rows;
}

async function getProductById(productId) {
  const result = await pool.query(`
    ${selectFields}
    WHERE p.id = $1
    LIMIT 1
  `, [productId]);

  return result.rows[0] || null;
}

async function productExists(productId) {
  const result = await pool.query(`
    SELECT id
    FROM products
    WHERE id = $1
    LIMIT 1
  `, [productId]);

  return result.rowCount > 0;
}

async function categoryExists(categoryId) {
  if (categoryId === null) {
    return true;
  }

  const result = await pool.query(`
    SELECT id
    FROM categories
    WHERE id = $1
    LIMIT 1
  `, [categoryId]);

  return result.rowCount > 0;
}

async function createProduct(payload) {
  const result = await pool.query(`
    INSERT INTO products (
      category_id,
      name,
      description,
      price,
      image_url,
      stock,
      is_active,
      created_at,
      updated_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
    RETURNING id
  `, [
    payload.category_id,
    payload.name,
    payload.description,
    payload.price,
    payload.image_url,
    payload.stock,
    payload.is_active
  ]);

  return getProductById(result.rows[0].id);
}

async function updateProduct(productId, payload) {
  const result = await pool.query(`
    UPDATE products
    SET
      category_id = $2,
      name = $3,
      description = $4,
      price = $5,
      image_url = $6,
      stock = $7,
      is_active = $8,
      updated_at = NOW()
    WHERE id = $1
    RETURNING id
  `, [
    productId,
    payload.category_id,
    payload.name,
    payload.description,
    payload.price,
    payload.image_url,
    payload.stock,
    payload.is_active
  ]);

  if (result.rowCount === 0) {
    return null;
  }

  return getProductById(result.rows[0].id);
}

async function softDeleteProduct(productId) {
  const result = await pool.query(`
    UPDATE products
    SET
      is_active = false,
      updated_at = NOW()
    WHERE id = $1
    RETURNING id
  `, [productId]);

  if (result.rowCount === 0) {
    return null;
  }

  return getProductById(result.rows[0].id);
}

module.exports = {
  getProducts,
  getProductById,
  productExists,
  categoryExists,
  createProduct,
  updateProduct,
  softDeleteProduct
};
