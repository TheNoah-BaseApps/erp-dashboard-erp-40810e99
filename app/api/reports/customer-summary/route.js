/**
 * @swagger
 * /api/reports/customer-summary:
 *   get:
 *     summary: Get customer summary report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Customer summary data
 */

import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';
import { requireAuth } from '@/lib/auth';

export const GET = requireAuth(async (request) => {
  try {
    const customersResult = await query(
      'SELECT * FROM customers ORDER BY customer_name'
    );

    const regionsResult = await query(
      'SELECT DISTINCT region_or_state FROM customers WHERE region_or_state IS NOT NULL'
    );

    const countriesResult = await query(
      'SELECT DISTINCT country FROM customers WHERE country IS NOT NULL'
    );

    return NextResponse.json({
      success: true,
      data: {
        totalCustomers: customersResult.rows.length,
        totalRegions: regionsResult.rows.length,
        totalCountries: countriesResult.rows.length,
        customers: customersResult.rows
      }
    });
  } catch (error) {
    console.error('Error in GET /api/reports/customer-summary:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch customer summary' },
      { status: 500 }
    );
  }
});