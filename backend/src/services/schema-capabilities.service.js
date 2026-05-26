const pool = require('../config/db');

let cachedCapabilities = null;
let cacheExpiresAt = 0;

async function loadCapabilities() {
  const columnsResult = await pool.query(`
    SELECT
      table_name,
      column_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND (
        (table_name = 'products' AND column_name = ANY($1::text[]))
        OR (table_name = 'orders' AND column_name = ANY($2::text[]))
        OR (table_name = 'order_items' AND column_name = ANY($3::text[]))
        OR (table_name = 'expenses' AND column_name = ANY($4::text[]))
        OR (table_name = 'admin_audit_logs' AND column_name = ANY($5::text[]))
      )
  `, [[
    'option_group_count',
    'option_group_label'
  ], [
    'customer_latitude',
    'customer_longitude',
    'maps_url',
    'closure_id',
    'fulfillment_day',
    'fulfillment_time_range'
  ], [
    'product_option_id',
    'product_option_name',
    'selection_summary',
    'selection_detail'
  ], [
    'category',
    'closure_id'
  ], [
    'actor_user_id',
    'actor_name',
    'action',
    'entity_type',
    'entity_id',
    'entity_label',
    'before_data',
    'after_data',
    'metadata'
  ]]);

  const relationsResult = await pool.query(`
    SELECT
      to_regclass('public.product_options') IS NOT NULL AS has_product_options,
      to_regclass('public.fulfillment_schedules') IS NOT NULL AS has_fulfillment_schedules,
      to_regclass('public.order_closures') IS NOT NULL AS has_order_closures,
      to_regclass('public.admin_audit_logs') IS NOT NULL AS has_admin_audit_logs
  `);

  const productColumns = new Set(
    columnsResult.rows
      .filter(function onlyProductColumns(row) {
        return row.table_name === 'products';
      })
      .map(function toColumnName(row) {
        return row.column_name;
      })
  );
  const orderColumns = new Set(
    columnsResult.rows
      .filter(function onlyOrderColumns(row) {
        return row.table_name === 'orders';
      })
      .map(function toColumnName(row) {
        return row.column_name;
      })
  );
  const orderItemColumns = new Set(
    columnsResult.rows
      .filter(function onlyOrderItemColumns(row) {
        return row.table_name === 'order_items';
      })
      .map(function toColumnName(row) {
        return row.column_name;
      })
  );
  const expenseColumns = new Set(
    columnsResult.rows
      .filter(function onlyExpenseColumns(row) {
        return row.table_name === 'expenses';
      })
      .map(function toColumnName(row) {
        return row.column_name;
      })
  );
  const auditLogColumns = new Set(
    columnsResult.rows
      .filter(function onlyAuditColumns(row) {
        return row.table_name === 'admin_audit_logs';
      })
      .map(function toColumnName(row) {
        return row.column_name;
      })
  );
  const relationRow = relationsResult.rows[0] || {};

  return {
    hasProductOptionGroupCount: productColumns.has('option_group_count'),
    hasProductOptionGroupLabel: productColumns.has('option_group_label'),
    hasProductOptionsTable: Boolean(relationRow.has_product_options),
    hasFulfillmentSchedulesTable: Boolean(relationRow.has_fulfillment_schedules),
    hasOrderClosuresTable: Boolean(relationRow.has_order_closures),
    hasOrderCustomerLatitude: orderColumns.has('customer_latitude'),
    hasOrderCustomerLongitude: orderColumns.has('customer_longitude'),
    hasOrderMapsUrl: orderColumns.has('maps_url'),
    hasOrderClosureId: orderColumns.has('closure_id'),
    hasOrderFulfillmentDay: orderColumns.has('fulfillment_day'),
    hasOrderFulfillmentTimeRange: orderColumns.has('fulfillment_time_range'),
    hasOrderItemProductOptionId: orderItemColumns.has('product_option_id'),
    hasOrderItemProductOptionName: orderItemColumns.has('product_option_name'),
    hasOrderItemSelectionSummary: orderItemColumns.has('selection_summary'),
    hasOrderItemSelectionDetail: orderItemColumns.has('selection_detail'),
    hasExpenseCategory: expenseColumns.has('category'),
    hasExpenseClosureId: expenseColumns.has('closure_id'),
    hasAdminAuditLogsTable: Boolean(relationRow.has_admin_audit_logs),
    hasAdminAuditBeforeData: auditLogColumns.has('before_data'),
    hasAdminAuditAfterData: auditLogColumns.has('after_data'),
    hasAdminAuditMetadata: auditLogColumns.has('metadata')
  };
}

async function getSchemaCapabilities() {
  if (cachedCapabilities && Date.now() < cacheExpiresAt) {
    return cachedCapabilities;
  }

  cachedCapabilities = await loadCapabilities();
  cacheExpiresAt = Date.now() + 60 * 1000;

  return cachedCapabilities;
}

function invalidateSchemaCapabilities() {
  cachedCapabilities = null;
  cacheExpiresAt = 0;
}

module.exports = {
  getSchemaCapabilities,
  invalidateSchemaCapabilities
};
