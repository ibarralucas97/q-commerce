const jwt = require('jsonwebtoken');

function authenticateAdmin(req, res, next) {
  const authorizationHeader = req.headers.authorization || '';

  if (!authorizationHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'authentication required'
    });
  }

  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET is not configured');

    return res.status(500).json({
      error: 'internal server error'
    });
  }

  const token = authorizationHeader.slice('Bearer '.length).trim();

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    req.adminUser = decodedToken;

    return next();
  } catch (error) {
    console.error('Invalid admin token:', error);

    return res.status(401).json({
      error: 'invalid token'
    });
  }
}

module.exports = authenticateAdmin;
