const pool = require('../config/db');
const { getSchemaCapabilities } = require('./schema-capabilities.service');

function buildBaseSelect(capabilities) {
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

async function getActiveOptionsByProductIds(productIds, capabilities) {
  if (productIds.length === 0 || !capabilities.hasProductOptionsTable) {
    return new Map();
  }

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
    WHERE product_id = ANY($1::int[])
      AND is_active = true
    ORDER BY id ASC
  `, [productIds]);

  const optionsByProductId = new Map();

  for (const option of result.rows) {
    const existing = optionsByProductId.get(option.product_id) || [];

    existing.push(option);
    optionsByProductId.set(option.product_id, existing);
  }

  return optionsByProductId;
}

function attachOptions(products, optionsByProductId) {
  return products.map(function attachProductOptions(product) {
    return {
      ...product,
      options: optionsByProductId.get(product.id) || []
    };
  });
}

async function getProducts() {
  const capabilities = await getSchemaCapabilities();
  const result = await pool.query(`
    ${buildBaseSelect(capabilities)}
    ORDER BY p.id ASC
  `);

  const optionsByProductId = await getActiveOptionsByProductIds(result.rows.map(function mapProduct(product) {
    return product.id;
  }), capabilities);

  return attachOptions(result.rows, optionsByProductId);
}

async function getProductById(productId) {
  const capabilities = await getSchemaCapabilities();
  const result = await pool.query(`
    ${buildBaseSelect(capabilities)}
    WHERE p.id = $1
    LIMIT 1
  `, [productId]);

  if (result.rows.length === 0) {
    return null;
  }

  const optionsByProductId = await getActiveOptionsByProductIds([productId], capabilities);

  return attachOptions(result.rows, optionsByProductId)[0] || null;
}

module.exports = {
  getProducts,
  getProductById
};
