const express = require('express');

const fulfillmentScheduleAdminController = require('../../controllers/admin/fulfillment-schedule.admin.controller');

const router = express.Router();

router.get('/', fulfillmentScheduleAdminController.getSchedules);
router.post('/', fulfillmentScheduleAdminController.createSchedule);
router.put('/:id', fulfillmentScheduleAdminController.updateSchedule);
router.patch('/:id/deactivate', fulfillmentScheduleAdminController.deactivateSchedule);
router.delete('/:id', fulfillmentScheduleAdminController.deleteSchedule);

module.exports = router;
