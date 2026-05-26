const express = require('express');

const auditLogAdminController = require('../../controllers/admin/audit-log.admin.controller');

const router = express.Router();

router.get('/', auditLogAdminController.getAuditLogs);

module.exports = router;
