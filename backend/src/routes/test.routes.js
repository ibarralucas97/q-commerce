const express = require('express');
const pool = require('../config/db');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');

    res.json(result.rows);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: 'database error'
    });
  }
});

module.exports = router;