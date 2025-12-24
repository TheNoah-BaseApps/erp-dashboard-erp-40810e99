import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/actual-sales:
 *   get:
 *     summary: Get all actual sales
 *     description: Retrieve all actual sales records by product and month
 *     tags: [Actual Sales]
 *     parameters:
 *       - in: query
 *         name: product_id
 *         schema:
 *           type: string
 *         description: Filter by product ID
 *       - in: query
 *         name: month
 *         schema:
 *           type: string
 *         description: Filter by month (YYYY-MM format)
 *     responses:
 *       200:
 *         description: Success
 *       500:
 *         description: Server error
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const product_id = searchParams.get('product_id');
    const month = searchParams.get('month');

    let sql = 'SELECT * FROM actual_sales WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (product_id) {
      sql += ` AND product_id = $${paramCount}`;
      params.push(product_id);
      paramCount++;
    }

    if (month) {
      sql += ` AND month = $${paramCount}`;
      params.push(month);
      paramCount++;
    }

    sql += ' ORDER BY month DESC, product_id ASC';

    const result = await query(sql, params);

    return NextResponse.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching actual sales:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/actual-sales:
 *   post:
 *     summary: Create actual sales record
 *     tags: [Actual Sales]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - product_id
 *               - month
 *               - actual_sales_amount
 *             properties:
 *               product_id:
 *                 type: string
 *               month:
 *                 type: string
 *               actual_sales_amount:
 *                 type: string
 *     responses:
 *       201:
 *         description: Created
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { product_id, month, actual_sales_amount } = body;

    if (!product_id || !month || !actual_sales_amount) {
      return NextResponse.json(
        { success: false, error: 'Product ID, month, and actual sales amount are required' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO actual_sales (product_id, month, actual_sales_amount, created_at, updated_at) 
       VALUES ($1, $2, $3, NOW(), NOW()) 
       RETURNING *`,
      [product_id, month, actual_sales_amount]
    );

    return NextResponse.json(
      { success: true, data: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating actual sales:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}