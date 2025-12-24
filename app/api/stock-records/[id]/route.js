/**
 * @swagger
 * /api/stock-records/{id}:
 *   get:
 *     summary: Get stock record by ID
 *     tags: [Stock Records]
 *     security:
 *       - bearerAuth: []
 *   put:
 *     summary: Update stock record
 *     tags: [Stock Records]
 *     security:
 *       - bearerAuth: []
 *   delete:
 *     summary: Delete stock record
 *     tags: [Stock Records]
 *     security:
 *       - bearerAuth: []
 */

import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';
import { requireAuth } from '@/lib/auth';
import { validateStockRecordData } from '@/lib/validation';
import { logAudit, AUDIT_ACTIONS, ENTITY_TYPES } from '@/lib/audit';

export const GET = requireAuth(async (request, { params }) => {
  try {
    const result = await query(
      `SELECT sr.*, p.product_name, p.product_code
       FROM stock_records sr
       LEFT JOIN products p ON sr.product_id = p.id
       WHERE sr.id = $1`,
      [params.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Stock record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error in GET /api/stock-records/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stock record' },
      { status: 500 }
    );
  }
});

export const PUT = requireAuth(async (request, { params }) => {
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
      `UPDATE stock_records SET
        product_id = $1, part_number = $2, warehouse_location = $3,
        current_amount = $4, unit = $5, first_sales_date = $6,
        expiry_date = $7, consumption_rate = $8, estimated_stock_days = $9,
        critical_level_days = $10, updated_at = NOW()
      WHERE id = $11
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
        params.id
      ]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Stock record not found' },
        { status: 404 }
      );
    }

    await logAudit({
      userId: request.user.id,
      action: AUDIT_ACTIONS.UPDATE,
      entityType: ENTITY_TYPES.STOCK_RECORD,
      entityId: params.id,
      changes: body
    });

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error in PUT /api/stock-records/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update stock record' },
      { status: 500 }
    );
  }
});

export const DELETE = requireAuth(async (request, { params }) => {
  try {
    const result = await query(
      'DELETE FROM stock_records WHERE id = $1 RETURNING id',
      [params.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Stock record not found' },
        { status: 404 }
      );
    }

    await logAudit({
      userId: request.user.id,
      action: AUDIT_ACTIONS.DELETE,
      entityType: ENTITY_TYPES.STOCK_RECORD,
      entityId: params.id,
      changes: {}
    });

    return NextResponse.json({
      success: true,
      message: 'Stock record deleted successfully'
    });
  } catch (error) {
    console.error('Error in DELETE /api/stock-records/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete stock record' },
      { status: 500 }
    );
  }
});