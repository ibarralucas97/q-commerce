const express = require('express');
const cors = require('cors');

const testRoutes = require('./routes/test.routes');
const settingsRoutes = require('./routes/settings.routes');
const categoryRoutes = require('./routes/category.routes');
const productRoutes = require('./routes/product.routes');
const adminSettingsRoutes = require('./routes/admin/settings.admin.routes');
const adminCategoryRoutes = require('./routes/admin/category.admin.routes');
const adminProductRoutes = require('./routes/admin/product.admin.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/test-db', testRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/admin/settings', adminSettingsRoutes);
app.use('/api/admin/categories', adminCategoryRoutes);
app.use('/api/admin/products', adminProductRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok'
  });
});

module.exports = app;
