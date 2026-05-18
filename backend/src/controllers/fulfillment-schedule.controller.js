const fulfillmentScheduleService = require('../services/fulfillment-schedule.service');

async function getFulfillmentSchedules(req, res) {
  try {
    const schedules = await fulfillmentScheduleService.getFulfillmentSchedules();

    return res.json(schedules);
  } catch (error) {
    console.error('Error fetching fulfillment schedules:', error);

    return res.status(500).json({
      error: 'internal server error'
    });
  }
}

module.exports = {
  getFulfillmentSchedules
};
