const pool = require('../config/db');

async function getCategories() {
  const query = `
    SELECT
      id,
      name,
      description,
      is_active,
      created_at,
      updated_at
    FROM categories
    ORDER BY name ASC
  `;

  const result = await pool.query(query);

  return result.rows;
}

module.exports = {
  getCategories
};
