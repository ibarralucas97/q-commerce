const fulfillmentScheduleAdminService = require('../../services/admin/fulfillment-schedule.admin.service');

const FULFILLMENT_TYPES = ['delivery', 'pickup', 'both'];

function normalizeSchedulePayload(body) {
  return {
    day_of_week: Number.parseInt(body.day_of_week, 10),
    start_time: body.start_time,
    end_time: body.end_time,
    fulfillment_type: body.fulfillment_type,
    is_active: typeof body.is_active === 'boolean' ? body.is_active : true
  };
}

function validateSchedulePayload(payload) {
  if (!Number.isInteger(payload.day_of_week) || payload.day_of_week < 0 || payload.day_of_week > 6) {
    return 'day_of_week must be between 0 and 6';
  }

  if (typeof payload.start_time !== 'string' || payload.start_time.trim() === '') {
    return 'start_time is required';
  }

  if (typeof payload.end_time !== 'string' || payload.end_time.trim() === '') {
    return 'end_time is required';
  }

  if (!FULFILLMENT_TYPES.includes(payload.fulfillment_type)) {
    return 'fulfillment_type is invalid';
  }

  if (payload.start_time >= payload.end_time) {
    return 'start_time must be earlier than end_time';
  }

  return null;
}

async function getSchedules(req, res) {
  try {
    const schedules = await fulfillmentScheduleAdminService.getSchedules();

    return res.json(schedules);
  } catch (error) {
    console.error('[GET /api/admin/fulfillment-schedules] Error fetching fulfillment schedules:', error.message);
    console.error(error.stack);

    return res.status(500).json({
      error: 'ADMIN_FULFILLMENT_SCHEDULES_FETCH_FAILED',
      message: 'No se pudieron cargar los horarios del panel.',
      details: error.message
    });
  }
}

async function createSchedule(req, res) {
  try {
    const payload = normalizeSchedulePayload(req.body);
    const validationError = validateSchedulePayload(payload);

    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const schedule = await fulfillmentScheduleAdminService.createSchedule(payload);

    return res.status(201).json(schedule);
  } catch (error) {
    console.error('[POST /api/admin/fulfillment-schedules] Error creating fulfillment schedule:', error.message);
    console.error(error.stack);

    return res.status(500).json({
      error: 'ADMIN_FULFILLMENT_SCHEDULE_CREATE_FAILED',
      message: 'No se pudo crear el horario.',
      details: error.message
    });
  }
}

async function updateSchedule(req, res) {
  try {
    const scheduleId = Number.parseInt(req.params.id, 10);
    const payload = normalizeSchedulePayload(req.body);

    if (Number.isNaN(scheduleId)) {
      return res.status(404).json({ error: 'schedule not found' });
    }

    const validationError = validateSchedulePayload(payload);

    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const existingSchedule = await fulfillmentScheduleAdminService.getScheduleById(scheduleId);

    if (!existingSchedule) {
      return res.status(404).json({ error: 'schedule not found' });
    }

    const schedule = await fulfillmentScheduleAdminService.updateSchedule(scheduleId, payload);

    return res.json(schedule);
  } catch (error) {
    console.error('[PUT /api/admin/fulfillment-schedules/:id] Error updating fulfillment schedule:', error.message);
    console.error(error.stack);

    return res.status(500).json({
      error: 'ADMIN_FULFILLMENT_SCHEDULE_UPDATE_FAILED',
      message: 'No se pudo actualizar el horario.',
      details: error.message
    });
  }
}

async function deleteSchedule(req, res) {
  try {
    const scheduleId = Number.parseInt(req.params.id, 10);

    if (Number.isNaN(scheduleId)) {
      return res.status(404).json({ error: 'schedule not found' });
    }

    const schedule = await fulfillmentScheduleAdminService.softDeleteSchedule(scheduleId);

    if (!schedule) {
      return res.status(404).json({ error: 'schedule not found' });
    }

    return res.json(schedule);
  } catch (error) {
    console.error('[DELETE /api/admin/fulfillment-schedules/:id] Error deleting fulfillment schedule:', error.message);
    console.error(error.stack);

    return res.status(500).json({
      error: 'ADMIN_FULFILLMENT_SCHEDULE_DELETE_FAILED',
      message: 'No se pudo desactivar el horario.',
      details: error.message
    });
  }
}

module.exports = {
  getSchedules,
  createSchedule,
  updateSchedule,
  deleteSchedule
};
