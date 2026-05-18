const pool = require('../config/db');

const baseSelect = `
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
    ${baseSelect}
    ORDER BY p.id ASC
  `);

  return result.rows;
}

async function getProductById(productId) {
  const result = await pool.query(`
    ${baseSelect}
    WHERE p.id = $1
    LIMIT 1
  `, [productId]);

  return result.rows[0] || null;
}

module.exports = {
  getProducts,
  getProductById
};
