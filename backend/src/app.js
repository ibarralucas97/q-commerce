const express = require('express');
const cors = require('cors');

const testRoutes = require('./routes/test.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/test-db', testRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok'
  });
});

module.exports = app;