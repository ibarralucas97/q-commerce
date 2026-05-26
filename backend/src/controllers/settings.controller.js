const settingsService = require('../services/settings.service');

async function getSettings(req, res) {
  try {
    const settings = await settingsService.getSettings();

    if (!settings) {
      return res.status(404).json({
        error: 'settings not found'
      });
    }

    return res.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);

    return res.status(500).json({
      error: 'internal server error'
    });
  }
}

module.exports = {
  getSettings
};
