/**
 * @swagger
 * /api/reports/inventory-summary:
 *   get:
 *     summary: Get inventory summary report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Inventory summary data
 */

import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';
import { requireAuth } from '@/lib/auth';

export const GET = requireAuth(async (request) => {
  try {
    const productsResult = await query(
      `SELECT p.*,
        COALESCE(SUM(sr.current_amount), 0) as total_stock
      FROM products p
      LEFT JOIN stock_records sr ON p.id = sr.product_id
      GROUP BY p.id
      ORDER BY p.product_name`
    );

    const categoriesResult = await query(
      'SELECT DISTINCT product_category FROM products WHERE product_category IS NOT NULL'
    );

    const criticalCount = productsResult.rows.filter(
      p => p.total_stock <= p.critical_stock_level
    ).length;

    return NextResponse.json({
      success: true,
      data: {
        totalProducts: productsResult.rows.length,
        totalCategories: categoriesResult.rows.length,
        criticalItems: criticalCount,
        products: productsResult.rows
      }
    });
  } catch (error) {
    console.error('Error in GET /api/reports/inventory-summary:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch inventory summary' },
      { status: 500 }
    );
  }
});