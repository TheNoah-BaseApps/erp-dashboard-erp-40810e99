/**
 * @swagger
 * /api/stock-records/by-product/{productId}:
 *   get:
 *     summary: Get stock records by product ID
 *     tags: [Stock Records]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Stock records for product
 */

import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';
import { requireAuth } from '@/lib/auth';

export const GET = requireAuth(async (request, { params }) => {
  try {
    const result = await query(
      `SELECT sr.*, p.product_name, p.product_code
       FROM stock_records sr
       LEFT JOIN products p ON sr.product_id = p.id
       WHERE sr.product_id = $1
       ORDER BY sr.created_at DESC`,
      [params.productId]
    );

    return NextResponse.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error in GET /api/stock-records/by-product/[productId]:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stock records' },
      { status: 500 }
    );
  }
});