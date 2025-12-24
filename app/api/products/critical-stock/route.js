/**
 * @swagger
 * /api/products/critical-stock:
 *   get:
 *     summary: Get products with critical stock levels
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of critical stock products
 */

import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';
import { requireAuth } from '@/lib/auth';

export const GET = requireAuth(async (request) => {
  try {
    const result = await query(
      `SELECT p.*, 
        COALESCE(SUM(sr.current_amount), 0) as total_stock
      FROM products p
      LEFT JOIN stock_records sr ON p.id = sr.product_id
      GROUP BY p.id
      HAVING COALESCE(SUM(sr.current_amount), 0) <= p.critical_stock_level
      ORDER BY total_stock ASC`
    );

    return NextResponse.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error in GET /api/products/critical-stock:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch critical stock products' },
      { status: 500 }
    );
  }
});