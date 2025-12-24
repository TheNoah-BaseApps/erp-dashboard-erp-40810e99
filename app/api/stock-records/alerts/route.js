/**
 * @swagger
 * /api/stock-records/alerts:
 *   get:
 *     summary: Get stock alerts (low stock and expiring items)
 *     tags: [Stock Records]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Stock alerts
 */

import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';
import { requireAuth } from '@/lib/auth';

export const GET = requireAuth(async (request) => {
  try {
    const lowStockResult = await query(
      `SELECT sr.*, p.product_name, p.product_code
       FROM stock_records sr
       LEFT JOIN products p ON sr.product_id = p.id
       WHERE sr.estimated_stock_days IS NOT NULL
         AND sr.critical_level_days IS NOT NULL
         AND sr.estimated_stock_days <= sr.critical_level_days
       ORDER BY sr.estimated_stock_days ASC`
    );

    const expiringResult = await query(
      `SELECT sr.*, p.product_name, p.product_code
       FROM stock_records sr
       LEFT JOIN products p ON sr.product_id = p.id
       WHERE sr.expiry_date IS NOT NULL
         AND sr.expiry_date <= CURRENT_DATE + INTERVAL '30 days'
         AND sr.expiry_date >= CURRENT_DATE
       ORDER BY sr.expiry_date ASC`
    );

    return NextResponse.json({
      success: true,
      data: {
        lowStock: lowStockResult.rows,
        expiring: expiringResult.rows
      }
    });
  } catch (error) {
    console.error('Error in GET /api/stock-records/alerts:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stock alerts' },
      { status: 500 }
    );
  }
});