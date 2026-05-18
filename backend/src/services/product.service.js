const pool = require('../config/db');

async function getProducts() {
  const query = `
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
    ORDER BY p.id ASC
  `;

  const result = await pool.query(query);

  return result.rows;
}

async function getProductById(productId) {
  const query = `
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
    WHERE p.id = $1
    LIMIT 1
  `;

  const result = await pool.query(query, [productId]);

  return result.rows[0] || null;
}

module.exports = {
  getProducts,
  getProductById
};
