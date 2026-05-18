const settingsService = require('../services/settings.service');

async function getSettings(req, res) {
  try {
    const settings = await settingsService.getSettings();

    res.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);

    res.status(500).json({
      error: 'internal server error'
    });
  }
}

module.exports = {
  getSettings
};
