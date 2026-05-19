const express = require('express');

const dashboardAdminController = require('../../controllers/admin/dashboard.admin.controller');

const router = express.Router();

router.get('/summary', dashboardAdminController.getDashboardSummary);

module.exports = router;
