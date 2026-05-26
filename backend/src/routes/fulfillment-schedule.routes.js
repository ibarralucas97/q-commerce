const express = require('express');

const fulfillmentScheduleController = require('../controllers/fulfillment-schedule.controller');

const router = express.Router();

router.get('/', fulfillmentScheduleController.getFulfillmentSchedules);

module.exports = router;
