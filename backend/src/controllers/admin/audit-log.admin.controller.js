const auditLogService = require('../../services/audit-log.service');

async function getAuditLogs(req, res) {
  try {
    const limit = req.query && req.query.limit ? Number.parseInt(req.query.limit, 10) : 100;
    const logs = await auditLogService.getLogs({
      entity_type: req.query && req.query.entity_type ? req.query.entity_type : '',
      action: req.query && req.query.action ? req.query.action : '',
      limit: Number.isNaN(limit) ? 100 : limit
    });

    return res.json(logs);
  } catch (error) {
    console.error('[GET /api/admin/audit-logs] Error fetching audit logs:', error.message);
    console.error(error.stack);

    return res.status(500).json({
      error: 'ADMIN_AUDIT_LOGS_FETCH_FAILED',
      message: 'No se pudieron cargar los logs de actividad.',
      details: error.message
    });
  }
}

module.exports = {
  getAuditLogs
};
