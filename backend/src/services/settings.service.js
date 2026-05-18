const pool = require('../config/db');

async function getSettings() {
  const query = `
    SELECT
      id,
      store_name,
      description,
      whatsapp,
      address,
      neighborhood,
      city,
      currency,
      delivery_fee,
      delivery_enabled,
      pickup_enabled,
      primary_color,
      secondary_color,
      logo_url,
      banner_url,
      is_active,
      created_at,
      updated_at
    FROM settings
    ORDER BY id ASC
    LIMIT 1
  `;

  const result = await pool.query(query);

  return result.rows[0] || null;
}

module.exports = {
  getSettings
};
