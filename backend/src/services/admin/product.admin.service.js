const pool = require('../../config/db');
const { getSchemaCapabilities } = require('../schema-capabilities.service');

function buildSelectFields(capabilities) {
  return `
    SELECT
      p.id,
      p.category_id,
      c.name AS category_name,
      p.name,
      p.description,
      p.price,
      p.image_url,
      p.stock,
      ${capabilities.hasProductOptionGroupCount ? 'p.option_group_count' : '1::integer AS option_group_count'},
      ${capabilities.hasProductOptionGroupLabel ? 'p.option_group_label' : 'NULL::varchar AS option_group_label'},
      p.is_active,
      p.created_at,
      p.updated_at
    FROM products p
    LEFT JOIN categories c ON c.id = p.category_id
  `;
}

async function getProducts() {
  const capabilities = await getSchemaCapabilities();
  const result = await pool.query(`
    ${buildSelectFields(capabilities)}
    ORDER BY p.id ASC
  `);

  return result.rows;
}

async function getProductById(productId) {
  const capabilities = await getSchemaCapabilities();
  const result = await pool.query(`
    ${buildSelectFields(capabilities)}
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
  const capabilities = await getSchemaCapabilities();
  const columns = [
    'category_id',
    'name',
    'description',
    'price',
    'image_url',
    'stock'
  ];
  const values = [
    payload.category_id,
    payload.name,
    payload.description,
    payload.price,
    payload.image_url,
    payload.stock
  ];

  if (capabilities.hasProductOptionGroupCount) {
    columns.push('option_group_count');
    values.push(payload.option_group_count);
  }

  if (capabilities.hasProductOptionGroupLabel) {
    columns.push('option_group_label');
    values.push(payload.option_group_label);
  }

  columns.push('is_active');
  values.push(payload.is_active);

  const placeholders = values.map(function toPlaceholder(_, index) {
    return '$' + (index + 1);
  }).join(', ');

  const result = await pool.query(`
    INSERT INTO products (
      ${columns.join(', ')},
      created_at,
      updated_at
    )
    VALUES (${placeholders}, NOW(), NOW())
    RETURNING id
  `, values);

  return getProductById(result.rows[0].id);
}

async function updateProduct(productId, payload) {
  const capabilities = await getSchemaCapabilities();
  const updates = [
    'category_id = $2',
    'name = $3',
    'description = $4',
    'price = $5',
    'image_url = $6',
    'stock = $7'
  ];
  const values = [
    productId,
    payload.category_id,
    payload.name,
    payload.description,
    payload.price,
    payload.image_url,
    payload.stock
  ];
  let nextIndex = 8;

  if (capabilities.hasProductOptionGroupCount) {
    updates.push('option_group_count = $' + nextIndex);
    values.push(payload.option_group_count);
    nextIndex += 1;
  }

  if (capabilities.hasProductOptionGroupLabel) {
    updates.push('option_group_label = $' + nextIndex);
    values.push(payload.option_group_label);
    nextIndex += 1;
  }

  updates.push('is_active = $' + nextIndex);
  values.push(payload.is_active);

  const result = await pool.query(`
    UPDATE products
    SET
      ${updates.join(',\n      ')},
      updated_at = NOW()
    WHERE id = $1
    RETURNING id
  `, values);

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
