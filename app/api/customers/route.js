/**
 * @swagger
 * /api/customers:
 *   get:
 *     summary: Get all customers
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *   post:
 *     summary: Create a new customer
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 */

import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';
import { requireAuth } from '@/lib/auth';
import { validateCustomerData } from '@/lib/validation';
import { logAudit, AUDIT_ACTIONS, ENTITY_TYPES } from '@/lib/audit';

export const GET = requireAuth(async (request) => {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const salesRep = searchParams.get('sales_rep');

    let sql = 'SELECT * FROM customers WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (search) {
      sql += ` AND (customer_name ILIKE $${paramCount} OR customer_code ILIKE $${paramCount} OR email ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }

    if (salesRep) {
      sql += ` AND sales_rep = $${paramCount}`;
      params.push(salesRep);
      paramCount++;
    }

    sql += ' ORDER BY created_at DESC';

    const result = await query(sql, params);

    return NextResponse.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error in GET /api/customers:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch customers' },
      { status: 500 }
    );
  }
});

export const POST = requireAuth(async (request) => {
  try {
    const body = await request.json();
    const validation = validateCustomerData(body);

    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', errors: validation.errors },
        { status: 400 }
      );
    }

    const existingCustomer = await query(
      'SELECT id FROM customers WHERE customer_code = $1',
      [body.customer_code]
    );

    if (existingCustomer.rows.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Customer code already exists' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO customers (
        customer_name, customer_code, address, city_or_district,
        sales_rep, country, region_or_state, telephone_number,
        email, contact_person, payment_terms_limit, balance_risk_limit,
        created_by, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW())
      RETURNING *`,
      [
        body.customer_name,
        body.customer_code,
        body.address || null,
        body.city_or_district || null,
        body.sales_rep,
        body.country || null,
        body.region_or_state || null,
        body.telephone_number || null,
        body.email || null,
        body.contact_person || null,
        body.payment_terms_limit,
        body.balance_risk_limit,
        request.user.id
      ]
    );

    await logAudit({
      userId: request.user.id,
      action: AUDIT_ACTIONS.CREATE,
      entityType: ENTITY_TYPES.CUSTOMER,
      entityId: result.rows[0].id,
      changes: body
    });

    return NextResponse.json(
      { success: true, data: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in POST /api/customers:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create customer' },
      { status: 500 }
    );
  }
});