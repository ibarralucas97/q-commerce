const pool = require('../../config/db');

async function getOptionsByProductId(productId) {
  const result = await pool.query(`
    SELECT
      id,
      product_id,
      name,
      description,
      price_modifier,
      is_required,
      is_active,
      created_at,
      updated_at
    FROM product_options
    WHERE product_id = $1
    ORDER BY id ASC
  `, [productId]);

  return result.rows;
}

async function createProductOption(productId, payload) {
  const result = await pool.query(`
    INSERT INTO product_options (
      product_id,
      name,
      description,
      price_modifier,
      is_required,
      is_active,
      created_at,
      updated_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
    RETURNING
      id,
      product_id,
      name,
      description,
      price_modifier,
      is_required,
      is_active,
      created_at,
      updated_at
  `, [
    productId,
    payload.name,
    payload.description,
    payload.price_modifier,
    payload.is_required,
    payload.is_active
  ]);

  return result.rows[0];
}

async function getProductOptionById(optionId) {
  const result = await pool.query(`
    SELECT
      id,
      product_id,
      name,
      description,
      price_modifier,
      is_required,
      is_active,
      created_at,
      updated_at
    FROM product_options
    WHERE id = $1
    LIMIT 1
  `, [optionId]);

  return result.rows[0] || null;
}

async function updateProductOption(optionId, payload) {
  const result = await pool.query(`
    UPDATE product_options
    SET
      name = $2,
      description = $3,
      price_modifier = $4,
      is_required = $5,
      is_active = $6,
      updated_at = NOW()
    WHERE id = $1
    RETURNING
      id,
      product_id,
      name,
      description,
      price_modifier,
      is_required,
      is_active,
      created_at,
      updated_at
  `, [
    optionId,
    payload.name,
    payload.description,
    payload.price_modifier,
    payload.is_required,
    payload.is_active
  ]);

  return result.rows[0] || null;
}

async function softDeleteProductOption(optionId) {
  const result = await pool.query(`
    UPDATE product_options
    SET
      is_active = false,
      updated_at = NOW()
    WHERE id = $1
    RETURNING
      id,
      product_id,
      name,
      description,
      price_modifier,
      is_required,
      is_active,
      created_at,
      updated_at
  `, [optionId]);

  return result.rows[0] || null;
}

module.exports = {
  getOptionsByProductId,
  createProductOption,
  getProductOptionById,
  updateProductOption,
  softDeleteProductOption
};
