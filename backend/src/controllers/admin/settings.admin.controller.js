const settingsAdminService = require('../../services/admin/settings.admin.service');

function isBoolean(value) {
  return typeof value === 'boolean';
}

function normalizeSettingsPayload(body) {
  return {
    store_name: body.store_name,
    store_description: body.store_description ?? null,
    whatsapp_number: body.whatsapp_number ?? null,
    address: body.address ?? null,
    zone: body.zone ?? null,
    city: body.city ?? null,
    currency_symbol: body.currency_symbol ?? 'ARS',
    delivery_fee: body.delivery_fee,
    delivery_enabled: body.delivery_enabled,
    pickup_enabled: body.pickup_enabled,
    primary_color: body.primary_color ?? null,
    secondary_color: body.secondary_color ?? null,
    logo_url: body.logo_url ?? null,
    banner_url: body.banner_url ?? null,
    is_active: body.is_active
  };
}

async function getSettings(req, res) {
  try {
    const settings = await settingsAdminService.getSettings();

    if (!settings) {
      return res.status(404).json({
        error: 'settings not found'
      });
    }

    return res.json(settings);
  } catch (error) {
    console.error('Error fetching admin settings:', error);

    return res.status(500).json({
      error: 'internal server error'
    });
  }
}

async function updateSettings(req, res) {
  try {
    const payload = normalizeSettingsPayload(req.body);

    if (typeof payload.store_name !== 'string' || payload.store_name.trim() === '') {
      return res.status(400).json({
        error: 'store_name is required'
      });
    }

    const deliveryFee = Number(payload.delivery_fee);

    if (!Number.isFinite(deliveryFee) || deliveryFee < 0) {
      return res.status(400).json({
        error: 'delivery_fee must be a non-negative number'
      });
    }

    if (!isBoolean(payload.delivery_enabled) || !isBoolean(payload.pickup_enabled) || !isBoolean(payload.is_active)) {
      return res.status(400).json({
        error: 'boolean fields must be true or false'
      });
    }

    const existingSettings = await settingsAdminService.getSettings();

    if (!existingSettings) {
      return res.status(404).json({
        error: 'settings not found'
      });
    }

    const updatedSettings = await settingsAdminService.updateSettings({
      ...payload,
      store_name: payload.store_name.trim(),
      delivery_fee: deliveryFee
    });

    return res.json(updatedSettings);
  } catch (error) {
    console.error('Error updating admin settings:', error);

    return res.status(500).json({
      error: 'internal server error'
    });
  }
}

module.exports = {
  getSettings,
  updateSettings
};
