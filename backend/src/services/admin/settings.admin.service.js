const pool = require('../../config/db');

async function getSettings() {
  const result = await pool.query(`
    SELECT
      id,
      store_name,
      description AS store_description,
      whatsapp AS whatsapp_number,
      address,
      neighborhood AS zone,
      city,
      currency AS currency_symbol,
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
  `);

  return result.rows[0] || null;
}

async function updateSettings(payload) {
  const result = await pool.query(`
    UPDATE settings
    SET
      store_name = $1,
      description = $2,
      whatsapp = $3,
      address = $4,
      neighborhood = $5,
      city = $6,
      currency = $7,
      delivery_fee = $8,
      delivery_enabled = $9,
      pickup_enabled = $10,
      primary_color = $11,
      secondary_color = $12,
      logo_url = $13,
      banner_url = $14,
      is_active = $15,
      updated_at = NOW()
    WHERE id = (
      SELECT id
      FROM settings
      ORDER BY id ASC
      LIMIT 1
    )
    RETURNING
      id,
      store_name,
      description AS store_description,
      whatsapp AS whatsapp_number,
      address,
      neighborhood AS zone,
      city,
      currency AS currency_symbol,
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
  `, [
    payload.store_name,
    payload.store_description,
    payload.whatsapp_number,
    payload.address,
    payload.zone,
    payload.city,
    payload.currency_symbol,
    payload.delivery_fee,
    payload.delivery_enabled,
    payload.pickup_enabled,
    payload.primary_color,
    payload.secondary_color,
    payload.logo_url,
    payload.banner_url,
    payload.is_active
  ]);

  return result.rows[0] || null;
}

module.exports = {
  getSettings,
  updateSettings
};
