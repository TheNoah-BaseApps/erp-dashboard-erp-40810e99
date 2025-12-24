/**
 * @swagger
 * /api/reports/stock-movement:
 *   get:
 *     summary: Get stock movement analytics
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Stock movement data
 */

import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';
import { requireAuth } from '@/lib/auth';

export const GET = requireAuth(async (request) => {
  try {
    const stockResult = await query(
      `SELECT sr.*, p.product_name, p.product_code
       FROM stock_records sr
       LEFT JOIN products p ON sr.product_id = p.id
       ORDER BY sr.created_at DESC`
    );

    const lowStockCount = stockResult.rows.filter(
      s => s.estimated_stock_days && s.critical_level_days && 
           s.estimated_stock_days <= s.critical_level_days
    ).length;

    const expiringCount = stockResult.rows.filter(
      s => s.expiry_date && 
           new Date(s.expiry_date) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    ).length;

    return NextResponse.json({
      success: true,
      data: {
        totalItems: stockResult.rows.length,
        lowStockItems: lowStockCount,
        expiringItems: expiringCount,
        stockRecords: stockResult.rows
      }
    });
  } catch (error) {
    console.error('Error in GET /api/reports/stock-movement:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stock movement' },
      { status: 500 }
    );
  }
});