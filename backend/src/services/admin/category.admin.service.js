const pool = require('../../config/db');

async function getCategories() {
  const result = await pool.query(`
    SELECT
      id,
      name,
      description,
      is_active,
      created_at,
      updated_at
    FROM categories
    ORDER BY id ASC
  `);

  return result.rows;
}

async function getCategoryById(categoryId) {
  const result = await pool.query(`
    SELECT
      id,
      name,
      description,
      is_active,
      created_at,
      updated_at
    FROM categories
    WHERE id = $1
    LIMIT 1
  `, [categoryId]);

  return result.rows[0] || null;
}

async function createCategory(payload) {
  const result = await pool.query(`
    INSERT INTO categories (
      name,
      description,
      is_active,
      created_at,
      updated_at
    )
    VALUES ($1, $2, $3, NOW(), NOW())
    RETURNING
      id,
      name,
      description,
      is_active,
      created_at,
      updated_at
  `, [payload.name, payload.description, payload.is_active]);

  return result.rows[0];
}

async function updateCategory(categoryId, payload) {
  const result = await pool.query(`
    UPDATE categories
    SET
      name = $2,
      description = $3,
      is_active = $4,
      updated_at = NOW()
    WHERE id = $1
    RETURNING
      id,
      name,
      description,
      is_active,
      created_at,
      updated_at
  `, [categoryId, payload.name, payload.description, payload.is_active]);

  return result.rows[0] || null;
}

async function softDeleteCategory(categoryId) {
  const result = await pool.query(`
    UPDATE categories
    SET
      is_active = false,
      updated_at = NOW()
    WHERE id = $1
    RETURNING
      id,
      name,
      description,
      is_active,
      created_at,
      updated_at
  `, [categoryId]);

  return result.rows[0] || null;
}

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  softDeleteCategory
};
