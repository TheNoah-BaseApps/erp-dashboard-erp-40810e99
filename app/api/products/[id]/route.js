/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get product by ID
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *   put:
 *     summary: Update product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *   delete:
 *     summary: Delete product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 */

import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';
import { requireAuth } from '@/lib/auth';
import { validateProductData } from '@/lib/validation';
import { logAudit, AUDIT_ACTIONS, ENTITY_TYPES } from '@/lib/audit';

export const GET = requireAuth(async (request, { params }) => {
  try {
    const result = await query(
      'SELECT * FROM products WHERE id = $1',
      [params.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error in GET /api/products/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
});

export const PUT = requireAuth(async (request, { params }) => {
  try {
    const body = await request.json();
    const validation = validateProductData(body);

    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', errors: validation.errors },
        { status: 400 }
      );
    }

    const existingProduct = await query(
      'SELECT id FROM products WHERE product_code = $1 AND id != $2',
      [body.product_code, params.id]
    );

    if (existingProduct.rows.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Product code already exists' },
        { status: 400 }
      );
    }

    const result = await query(
      `UPDATE products SET
        product_name = $1, product_code = $2, product_category = $3,
        unit = $4, critical_stock_level = $5, brand = $6, updated_at = NOW()
      WHERE id = $7
      RETURNING *`,
      [
        body.product_name,
        body.product_code,
        body.product_category,
        body.unit,
        body.critical_stock_level,
        body.brand || null,
        params.id
      ]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    await logAudit({
      userId: request.user.id,
      action: AUDIT_ACTIONS.UPDATE,
      entityType: ENTITY_TYPES.PRODUCT,
      entityId: params.id,
      changes: body
    });

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error in PUT /api/products/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update product' },
      { status: 500 }
    );
  }
});

export const DELETE = requireAuth(async (request, { params }) => {
  try {
    const result = await query(
      'DELETE FROM products WHERE id = $1 RETURNING id',
      [params.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    await logAudit({
      userId: request.user.id,
      action: AUDIT_ACTIONS.DELETE,
      entityType: ENTITY_TYPES.PRODUCT,
      entityId: params.id,
      changes: {}
    });

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Error in DELETE /api/products/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete product' },
      { status: 500 }
    );
  }
});