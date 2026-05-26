const pool = require('../../config/db');
const { getSchemaCapabilities } = require('../schema-capabilities.service');

async function getSchedules() {
  const capabilities = await getSchemaCapabilities();

  if (!capabilities.hasFulfillmentSchedulesTable) {
    return [];
  }

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
    ORDER BY day_of_week ASC, start_time ASC
  `);

  return result.rows;
}

async function getScheduleById(scheduleId) {
  const capabilities = await getSchemaCapabilities();

  if (!capabilities.hasFulfillmentSchedulesTable) {
    return null;
  }

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
    WHERE id = $1
    LIMIT 1
  `, [scheduleId]);

  return result.rows[0] || null;
}

async function createSchedule(payload) {
  const capabilities = await getSchemaCapabilities();

  if (!capabilities.hasFulfillmentSchedulesTable) {
    throw new Error('La tabla fulfillment_schedules no existe en la base actual. Ejecutá la migración 002_add_fulfillment_schedules.sql.');
  }

  const result = await pool.query(`
    INSERT INTO fulfillment_schedules (
      day_of_week,
      start_time,
      end_time,
      fulfillment_type,
      is_active,
      created_at,
      updated_at
    )
    VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
    RETURNING
      id,
      day_of_week,
      start_time,
      end_time,
      fulfillment_type,
      is_active,
      created_at,
      updated_at
  `, [
    payload.day_of_week,
    payload.start_time,
    payload.end_time,
    payload.fulfillment_type,
    payload.is_active
  ]);

  return result.rows[0];
}

async function updateSchedule(scheduleId, payload) {
  const capabilities = await getSchemaCapabilities();

  if (!capabilities.hasFulfillmentSchedulesTable) {
    throw new Error('La tabla fulfillment_schedules no existe en la base actual. Ejecutá la migración 002_add_fulfillment_schedules.sql.');
  }

  const result = await pool.query(`
    UPDATE fulfillment_schedules
    SET
      day_of_week = $2,
      start_time = $3,
      end_time = $4,
      fulfillment_type = $5,
      is_active = $6,
      updated_at = NOW()
    WHERE id = $1
    RETURNING
      id,
      day_of_week,
      start_time,
      end_time,
      fulfillment_type,
      is_active,
      created_at,
      updated_at
  `, [
    scheduleId,
    payload.day_of_week,
    payload.start_time,
    payload.end_time,
    payload.fulfillment_type,
    payload.is_active
  ]);

  return result.rows[0] || null;
}

async function softDeleteSchedule(scheduleId) {
  const capabilities = await getSchemaCapabilities();

  if (!capabilities.hasFulfillmentSchedulesTable) {
    throw new Error('La tabla fulfillment_schedules no existe en la base actual. Ejecutá la migración 002_add_fulfillment_schedules.sql.');
  }

  const result = await pool.query(`
    UPDATE fulfillment_schedules
    SET
      is_active = false,
      updated_at = NOW()
    WHERE id = $1
    RETURNING
      id,
      day_of_week,
      start_time,
      end_time,
      fulfillment_type,
      is_active,
      created_at,
      updated_at
  `, [scheduleId]);

  return result.rows[0] || null;
}

async function hardDeleteSchedule(scheduleId) {
  const capabilities = await getSchemaCapabilities();

  if (!capabilities.hasFulfillmentSchedulesTable) {
    throw new Error('La tabla fulfillment_schedules no existe en la base actual. EjecutÃ¡ la migraciÃ³n 002_add_fulfillment_schedules.sql.');
  }

  const result = await pool.query(`
    DELETE FROM fulfillment_schedules
    WHERE id = $1
    RETURNING
      id,
      day_of_week,
      start_time,
      end_time,
      fulfillment_type,
      is_active,
      created_at,
      updated_at
  `, [scheduleId]);

  return result.rows[0] || null;
}

module.exports = {
  getSchedules,
  getScheduleById,
  createSchedule,
  updateSchedule,
  softDeleteSchedule,
  hardDeleteSchedule
};
