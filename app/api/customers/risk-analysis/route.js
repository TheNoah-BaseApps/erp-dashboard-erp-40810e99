/**
 * @swagger
 * /api/customers/risk-analysis:
 *   get:
 *     summary: Get customers exceeding balance risk limits
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of high-risk customers
 */

import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';
import { requireAuth } from '@/lib/auth';

export const GET = requireAuth(async (request) => {
  try {
    const result = await query(
      `SELECT *,
        (payment_terms_limit::numeric / NULLIF(balance_risk_limit::numeric, 0) * 100) as risk_percentage
      FROM customers
      WHERE payment_terms_limit > balance_risk_limit
      ORDER BY risk_percentage DESC`
    );

    return NextResponse.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error in GET /api/customers/risk-analysis:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch risk analysis' },
      { status: 500 }
    );
  }
});