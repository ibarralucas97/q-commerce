const fulfillmentScheduleAdminService = require('../../services/admin/fulfillment-schedule.admin.service');
const auditLogService = require('../../services/audit-log.service');

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

function getAuditActor(req) {
  return {
    actorUserId: req.adminUser && req.adminUser.sub ? Number(req.adminUser.sub) : null,
    actorName: req.adminUser && req.adminUser.username ? req.adminUser.username : 'admin'
  };
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

    await auditLogService.log({
      ...getAuditActor(req),
      action: 'SCHEDULE_CREATED',
      entityType: 'schedule',
      entityId: schedule.id,
      entityLabel: String(schedule.day_of_week) + ' ' + String(schedule.start_time).slice(0, 5),
      beforeData: null,
      afterData: schedule,
      metadata: null
    });

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

    await auditLogService.log({
      ...getAuditActor(req),
      action: 'SCHEDULE_UPDATED',
      entityType: 'schedule',
      entityId: schedule.id,
      entityLabel: String(schedule.day_of_week) + ' ' + String(schedule.start_time).slice(0, 5),
      beforeData: existingSchedule,
      afterData: schedule,
      metadata: null
    });

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

async function deactivateSchedule(req, res) {
  try {
    const scheduleId = Number.parseInt(req.params.id, 10);

    if (Number.isNaN(scheduleId)) {
      return res.status(404).json({ error: 'schedule not found' });
    }

    const existingSchedule = await fulfillmentScheduleAdminService.getScheduleById(scheduleId);

    if (!existingSchedule) {
      return res.status(404).json({ error: 'schedule not found' });
    }

    const schedule = await fulfillmentScheduleAdminService.softDeleteSchedule(scheduleId);

    if (!schedule) {
      return res.status(404).json({ error: 'schedule not found' });
    }

    await auditLogService.log({
      ...getAuditActor(req),
      action: 'SCHEDULE_DISABLED',
      entityType: 'schedule',
      entityId: schedule.id,
      entityLabel: String(schedule.day_of_week) + ' ' + String(schedule.start_time).slice(0, 5),
      beforeData: existingSchedule,
      afterData: schedule,
      metadata: null
    });

    return res.json(schedule);
  } catch (error) {
    console.error('[PATCH /api/admin/fulfillment-schedules/:id/deactivate] Error deactivating fulfillment schedule:', error.message);
    console.error(error.stack);

    return res.status(500).json({
      error: 'ADMIN_FULFILLMENT_SCHEDULE_DEACTIVATE_FAILED',
      message: 'No se pudo desactivar el horario.',
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

    const existingSchedule = await fulfillmentScheduleAdminService.getScheduleById(scheduleId);

    if (!existingSchedule) {
      return res.status(404).json({ error: 'schedule not found' });
    }

    const schedule = await fulfillmentScheduleAdminService.hardDeleteSchedule(scheduleId);

    if (!schedule) {
      return res.status(404).json({ error: 'schedule not found' });
    }

    await auditLogService.log({
      ...getAuditActor(req),
      action: 'SCHEDULE_DELETED',
      entityType: 'schedule',
      entityId: existingSchedule.id,
      entityLabel: String(existingSchedule.day_of_week) + ' ' + String(existingSchedule.start_time).slice(0, 5),
      beforeData: existingSchedule,
      afterData: null,
      metadata: {
        deleted: true
      }
    });

    return res.json({
      message: 'Schedule deleted successfully'
    });
  } catch (error) {
    console.error('[DELETE /api/admin/fulfillment-schedules/:id] Error deleting fulfillment schedule:', error.message);
    console.error(error.stack);

    return res.status(500).json({
      error: 'ADMIN_FULFILLMENT_SCHEDULE_DELETE_FAILED',
      message: 'No se pudo eliminar el horario.',
      details: error.message
    });
  }
}

module.exports = {
  getSchedules,
  createSchedule,
  updateSchedule,
  deactivateSchedule,
  deleteSchedule
};
