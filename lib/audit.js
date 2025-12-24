import { query } from './database/aurora';

export async function logAudit({
  userId,
  action,
  entityType,
  entityId,
  changes
}) {
  try {
    const result = await query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, changes, timestamp)
       VALUES ($1, $2, $3, $4, $5, NOW())
       RETURNING id`,
      [userId, action, entityType, entityId, JSON.stringify(changes)]
    );
    
    return result.rows[0];
  } catch (error) {
    console.error('Error logging audit:', error);
    throw error;
  }
}

export const AUDIT_ACTIONS = {
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  EXPORT: 'EXPORT'
};

export const ENTITY_TYPES = {
  USER: 'user',
  PRODUCT: 'product',
  CUSTOMER: 'customer',
  STOCK_RECORD: 'stock_record'
};

export async function getAuditLogs(filters = {}) {
  try {
    let sql = `
      SELECT 
        al.*,
        u.name as user_name,
        u.email as user_email
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;
    
    if (filters.userId) {
      sql += ` AND al.user_id = $${paramCount}`;
      params.push(filters.userId);
      paramCount++;
    }
    
    if (filters.entityType) {
      sql += ` AND al.entity_type = $${paramCount}`;
      params.push(filters.entityType);
      paramCount++;
    }
    
    if (filters.action) {
      sql += ` AND al.action = $${paramCount}`;
      params.push(filters.action);
      paramCount++;
    }
    
    if (filters.startDate) {
      sql += ` AND al.timestamp >= $${paramCount}`;
      params.push(filters.startDate);
      paramCount++;
    }
    
    if (filters.endDate) {
      sql += ` AND al.timestamp <= $${paramCount}`;
      params.push(filters.endDate);
      paramCount++;
    }
    
    sql += ' ORDER BY al.timestamp DESC';
    
    if (filters.limit) {
      sql += ` LIMIT $${paramCount}`;
      params.push(filters.limit);
      paramCount++;
    }
    
    if (filters.offset) {
      sql += ` OFFSET $${paramCount}`;
      params.push(filters.offset);
    }
    
    const result = await query(sql, params);
    return result.rows;
  } catch (error) {
    console.error('Error getting audit logs:', error);
    throw error;
  }
}