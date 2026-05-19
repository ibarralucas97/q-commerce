const dashboardAdminService = require('../../services/admin/dashboard.admin.service');

async function getDashboardSummary(req, res) {
  try {
    const summary = await dashboardAdminService.getDashboardSummary();

    return res.json(summary);
  } catch (error) {
    console.error('Error fetching dashboard summary:', error);

    return res.status(500).json({ error: 'internal server error' });
  }
}

module.exports = {
  getDashboardSummary
};
