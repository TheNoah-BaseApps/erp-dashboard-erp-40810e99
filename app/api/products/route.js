/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get all products
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of products
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Product created
 */

import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';
import { requireAuth } from '@/lib/auth';
import { validateProductData } from '@/lib/validation';
import { logAudit, AUDIT_ACTIONS, ENTITY_TYPES } from '@/lib/audit';

export const GET = requireAuth(async (request) => {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    let sql = 'SELECT * FROM products WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (category) {
      sql += ` AND product_category = $${paramCount}`;
      params.push(category);
      paramCount++;
    }

    if (search) {
      sql += ` AND (product_name ILIKE $${paramCount} OR product_code ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }

    sql += ' ORDER BY created_at DESC';

    const result = await query(sql, params);

    return NextResponse.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error in GET /api/products:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
});

export const POST = requireAuth(async (request) => {
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
      'SELECT id FROM products WHERE product_code = $1',
      [body.product_code]
    );

    if (existingProduct.rows.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Product code already exists' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO products (
        product_name, product_code, product_category, unit,
        critical_stock_level, brand, created_by, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      RETURNING *`,
      [
        body.product_name,
        body.product_code,
        body.product_category,
        body.unit,
        body.critical_stock_level,
        body.brand || null,
        request.user.id
      ]
    );

    await logAudit({
      userId: request.user.id,
      action: AUDIT_ACTIONS.CREATE,
      entityType: ENTITY_TYPES.PRODUCT,
      entityId: result.rows[0].id,
      changes: body
    });

    return NextResponse.json(
      { success: true, data: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in POST /api/products:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create product' },
      { status: 500 }
    );
  }
});