const express = require('express');
const cors = require('cors');
const path = require('path');

const authenticateAdmin = require('./middleware/auth.middleware');
const testRoutes = require('./routes/test.routes');
const authRoutes = require('./routes/auth.routes');
const settingsRoutes = require('./routes/settings.routes');
const categoryRoutes = require('./routes/category.routes');
const productRoutes = require('./routes/product.routes');
const orderRoutes = require('./routes/order.routes');
const fulfillmentScheduleRoutes = require('./routes/fulfillment-schedule.routes');
const adminSettingsRoutes = require('./routes/admin/settings.admin.routes');
const adminCategoryRoutes = require('./routes/admin/category.admin.routes');
const adminDashboardRoutes = require('./routes/admin/dashboard.admin.routes');
const adminClosureRoutes = require('./routes/admin/closure.admin.routes');
const adminAuditLogRoutes = require('./routes/admin/audit-log.admin.routes');
const adminExpenseRoutes = require('./routes/admin/expense.admin.routes');
const adminProductRoutes = require('./routes/admin/product.admin.routes');
const adminProductOptionRoutes = require('./routes/admin/product-option.admin.routes');
const adminOrderRoutes = require('./routes/admin/order.admin.routes');
const adminFulfillmentScheduleRoutes = require('./routes/admin/fulfillment-schedule.admin.routes');
const adminUploadRoutes = require('./routes/admin/upload.admin.routes');

const app = express();
const frontendPath = path.resolve(__dirname, '../../frontend');

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok'
  });
});


app.use('/api/test-db', testRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/fulfillment-schedules', fulfillmentScheduleRoutes);
app.use('/api/admin/settings', authenticateAdmin, adminSettingsRoutes);
app.use('/api/admin/categories', authenticateAdmin, adminCategoryRoutes);
app.use('/api/admin/dashboard', authenticateAdmin, adminDashboardRoutes);
app.use('/api/admin/closures', authenticateAdmin, adminClosureRoutes);
app.use('/api/admin/audit-logs', authenticateAdmin, adminAuditLogRoutes);
app.use('/api/admin/expenses', authenticateAdmin, adminExpenseRoutes);
app.use('/api/admin/products', authenticateAdmin, adminProductRoutes);
app.use('/api/admin/product-options', authenticateAdmin, adminProductOptionRoutes);
app.use('/api/admin/orders', authenticateAdmin, adminOrderRoutes);
app.use('/api/admin/fulfillment-schedules', authenticateAdmin, adminFulfillmentScheduleRoutes);
app.use('/api/admin/uploads', authenticateAdmin, adminUploadRoutes);



app.get('/', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

app.use(express.static(frontendPath));

module.exports = app;
