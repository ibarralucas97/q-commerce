const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

async function hasUsernameColumn() {
  const result = await pool.query(`
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'admin_users'
      AND column_name = 'username'
    LIMIT 1
  `);

  return result.rowCount > 0;
}

async function login(payload) {
  const username = payload && typeof payload.username === 'string' ? payload.username.trim() : '';
  const password = payload && typeof payload.password === 'string' ? payload.password : '';

  if (username === '') {
    return {
      error: 'username is required',
      statusCode: 400
    };
  }

  if (password === '') {
    return {
      error: 'password is required',
      statusCode: 400
    };
  }

  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }

  const usernameColumnExists = await hasUsernameColumn();
  const query = usernameColumnExists
    ? `
        SELECT id, username, email, password_hash, is_active
        FROM admin_users
        WHERE username = $1
        LIMIT 1
      `
    : `
        SELECT id, NULL::varchar AS username, email, password_hash, is_active
        FROM admin_users
        WHERE email = $1
        LIMIT 1
      `;
  const result = await pool.query(query, [username]);
  const adminUser = result.rows[0];

  if (!adminUser || adminUser.is_active === false) {
    return {
      error: 'invalid credentials',
      statusCode: 401
    };
  }

  const passwordMatches = await bcrypt.compare(password, adminUser.password_hash);

  if (!passwordMatches) {
    return {
      error: 'invalid credentials',
      statusCode: 401
    };
  }

  const token = jwt.sign(
    {
      sub: adminUser.id,
      username: adminUser.username || adminUser.email,
      role: 'admin'
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '7d'
    }
  );

  return {
    message: 'Login successful',
    token: token,
    user: {
      id: adminUser.id,
      username: adminUser.username || adminUser.email
    }
  };
}

module.exports = {
  login
};
