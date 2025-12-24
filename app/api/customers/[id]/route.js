/**
 * @swagger
 * /api/customers/{id}:
 *   get:
 *     summary: Get customer by ID
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *   put:
 *     summary: Update customer
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *   delete:
 *     summary: Delete customer
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 */

import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';
import { requireAuth } from '@/lib/auth';
import { validateCustomerData } from '@/lib/validation';
import { logAudit, AUDIT_ACTIONS, ENTITY_TYPES } from '@/lib/audit';

export const GET = requireAuth(async (request, { params }) => {
  try {
    const result = await query(
      'SELECT * FROM customers WHERE id = $1',
      [params.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Customer not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error in GET /api/customers/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch customer' },
      { status: 500 }
    );
  }
});

export const PUT = requireAuth(async (request, { params }) => {
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
      'SELECT id FROM customers WHERE customer_code = $1 AND id != $2',
      [body.customer_code, params.id]
    );

    if (existingCustomer.rows.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Customer code already exists' },
        { status: 400 }
      );
    }

    const result = await query(
      `UPDATE customers SET
        customer_name = $1, customer_code = $2, address = $3,
        city_or_district = $4, sales_rep = $5, country = $6,
        region_or_state = $7, telephone_number = $8, email = $9,
        contact_person = $10, payment_terms_limit = $11,
        balance_risk_limit = $12, updated_at = NOW()
      WHERE id = $13
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
        params.id
      ]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Customer not found' },
        { status: 404 }
      );
    }

    await logAudit({
      userId: request.user.id,
      action: AUDIT_ACTIONS.UPDATE,
      entityType: ENTITY_TYPES.CUSTOMER,
      entityId: params.id,
      changes: body
    });

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error in PUT /api/customers/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update customer' },
      { status: 500 }
    );
  }
});

export const DELETE = requireAuth(async (request, { params }) => {
  try {
    const result = await query(
      'DELETE FROM customers WHERE id = $1 RETURNING id',
      [params.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Customer not found' },
        { status: 404 }
      );
    }

    await logAudit({
      userId: request.user.id,
      action: AUDIT_ACTIONS.DELETE,
      entityType: ENTITY_TYPES.CUSTOMER,
      entityId: params.id,
      changes: {}
    });

    return NextResponse.json({
      success: true,
      message: 'Customer deleted successfully'
    });
  } catch (error) {
    console.error('Error in DELETE /api/customers/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete customer' },
      { status: 500 }
    );
  }
});