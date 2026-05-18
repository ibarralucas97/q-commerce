const pool = require('../config/db');

async function getFulfillmentSchedules() {
  const result = await pool.query(`
    SELECT
      id,
      day_of_week,
      start_time,
      end_time,
      fulfillment_type,
      is_active,
      created_at,
      updated_at
    FROM fulfillment_schedules
    WHERE is_active = true
    ORDER BY day_of_week ASC, start_time ASC
  `);

  return result.rows;
}

module.exports = {
  getFulfillmentSchedules
};
