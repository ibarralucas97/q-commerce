const express = require('express');

const settingsAdminController = require('../../controllers/admin/settings.admin.controller');

const router = express.Router();

router.get('/', settingsAdminController.getSettings);
router.put('/', settingsAdminController.updateSettings);

module.exports = router;
