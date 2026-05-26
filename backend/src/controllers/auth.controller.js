const authService = require('../services/auth.service');

async function login(req, res) {
  try {
    const result = await authService.login(req.body);

    if (result.error) {
      return res.status(result.statusCode).json({
        error: result.error
      });
    }

    return res.json(result);
  } catch (error) {
    console.error('Error during admin login:', error);

    return res.status(500).json({
      error: 'internal server error'
    });
  }
}

module.exports = {
  login
};
