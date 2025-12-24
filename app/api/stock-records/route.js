/**
 * @swagger
 * /api/stock-records:
 *   get:
 *     summary: Get all stock records
 *     tags: [Stock Records]
 *     security:
 *       - bearerAuth: []
 *   post:
 *     summary: Create a new stock record
 *     tags: [Stock Records]
 *     security:
 *       - bearerAuth: []
 */

import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';
import { requireAuth } from '@/lib/auth';
import { validateStockRecordData } from '@/lib/validation';
import { logAudit, AUDIT_ACTIONS, ENTITY_TYPES } from '@/lib/audit';

export const GET = requireAuth(async (request) => {
  try {
    const result = await query(
      `SELECT sr.*, p.product_name, p.product_code
       FROM stock_records sr
       LEFT JOIN products p ON sr.product_id = p.id
       ORDER BY sr.created_at DESC`
    );

    return NextResponse.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error in GET /api/stock-records:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stock records' },
      { status: 500 }
    );
  }
});

export const POST = requireAuth(async (request) => {
  try {
    const body = await request.json();
    const validation = validateStockRecordData(body);

    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', errors: validation.errors },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO stock_records (
        product_id, part_number, warehouse_location, current_amount,
        unit, first_sales_date, expiry_date, consumption_rate,
        estimated_stock_days, critical_level_days, created_by,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
      RETURNING *`,
      [
        body.product_id,
        body.part_number,
        body.warehouse_location,
        body.current_amount,
        body.unit,
        body.first_sales_date || null,
        body.expiry_date || null,
        body.consumption_rate || null,
        body.estimated_stock_days || null,
        body.critical_level_days,
        request.user.id
      ]
    );

    await logAudit({
      userId: request.user.id,
      action: AUDIT_ACTIONS.CREATE,
      entityType: ENTITY_TYPES.STOCK_RECORD,
      entityId: result.rows[0].id,
      changes: body
    });

    return NextResponse.json(
      { success: true, data: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in POST /api/stock-records:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create stock record' },
      { status: 500 }
    );
  }
});