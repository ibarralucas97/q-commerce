const pool = require('../config/db');
const { getSchemaCapabilities } = require('./schema-capabilities.service');

async function log(entry) {
  const capabilities = await getSchemaCapabilities();

  if (!capabilities.hasAdminAuditLogsTable) {
    return null;
  }

  const values = [
    entry.actorUserId ?? null,
    entry.actorName || 'admin',
    entry.action,
    entry.entityType,
    entry.entityId ?? null,
    entry.entityLabel || null,
    capabilities.hasAdminAuditBeforeData ? JSON.stringify(entry.beforeData ?? null) : null,
    capabilities.hasAdminAuditAfterData ? JSON.stringify(entry.afterData ?? null) : null,
    capabilities.hasAdminAuditMetadata ? JSON.stringify(entry.metadata ?? null) : null
  ];

  await pool.query(`
    INSERT INTO admin_audit_logs (
      actor_user_id,
      actor_name,
      action,
      entity_type,
      entity_id,
      entity_label,
      before_data,
      after_data,
      metadata,
      created_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8::jsonb, $9::jsonb, NOW())
  `, values);

  return true;
}

async function getLogs(filters) {
  const capabilities = await getSchemaCapabilities();

  if (!capabilities.hasAdminAuditLogsTable) {
    return [];
  }

  const where = [];
  const values = [];

  if (filters && typeof filters.entity_type === 'string' && filters.entity_type.trim() !== '') {
    values.push(filters.entity_type.trim());
    where.push('entity_type = $' + values.length);
  }

  if (filters && typeof filters.action === 'string' && filters.action.trim() !== '') {
    values.push(filters.action.trim());
    where.push('action = $' + values.length);
  }

  const limit = filters && Number.isInteger(filters.limit) ? Math.max(1, Math.min(filters.limit, 200)) : 100;
  const whereClause = where.length > 0 ? 'WHERE ' + where.join(' AND ') : '';
  values.push(limit);

  const result = await pool.query(`
    SELECT
      id,
      actor_user_id,
      actor_name,
      action,
      entity_type,
      entity_id,
      entity_label,
      ${capabilities.hasAdminAuditBeforeData ? 'before_data' : 'NULL::jsonb AS before_data'},
      ${capabilities.hasAdminAuditAfterData ? 'after_data' : 'NULL::jsonb AS after_data'},
      ${capabilities.hasAdminAuditMetadata ? 'metadata' : 'NULL::jsonb AS metadata'},
      created_at
    FROM admin_audit_logs
    ${whereClause}
    ORDER BY created_at DESC, id DESC
    LIMIT $${values.length}
  `, values);

  return result.rows;
}

module.exports = {
  log,
  getLogs
};
