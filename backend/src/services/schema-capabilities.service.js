const pool = require('../config/db');

let cachedCapabilities = null;
let cacheExpiresAt = 0;

async function loadCapabilities() {
  const columnsResult = await pool.query(`
    SELECT
      table_name,
      column_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND (
        (table_name = 'products' AND column_name = ANY($1::text[]))
      )
  `, [[
    'option_group_count',
    'option_group_label'
  ]]);

  const relationsResult = await pool.query(`
    SELECT
      to_regclass('public.product_options') IS NOT NULL AS has_product_options
  `);

  const productColumns = new Set(
    columnsResult.rows
      .filter(function onlyProductColumns(row) {
        return row.table_name === 'products';
      })
      .map(function toColumnName(row) {
        return row.column_name;
      })
  );

  return {
    hasProductOptionGroupCount: productColumns.has('option_group_count'),
    hasProductOptionGroupLabel: productColumns.has('option_group_label'),
    hasProductOptionsTable: Boolean(relationsResult.rows[0] && relationsResult.rows[0].has_product_options)
  };
}

async function getSchemaCapabilities() {
  if (cachedCapabilities && Date.now() < cacheExpiresAt) {
    return cachedCapabilities;
  }

  cachedCapabilities = await loadCapabilities();
  cacheExpiresAt = Date.now() + 60 * 1000;

  return cachedCapabilities;
}

function invalidateSchemaCapabilities() {
  cachedCapabilities = null;
  cacheExpiresAt = 0;
}

module.exports = {
  getSchemaCapabilities,
  invalidateSchemaCapabilities
};
