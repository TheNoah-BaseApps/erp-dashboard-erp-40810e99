import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/sales-prices:
 *   get:
 *     summary: Get all sales prices
 *     description: Retrieve all sales price records with optional filtering
 *     tags: [Sales Prices]
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
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of records to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *         description: Number of records to skip
 *     responses:
 *       200:
 *         description: Successful response
 *       500:
 *         description: Server error
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const product_id = searchParams.get('product_id');
    const month = searchParams.get('month');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    let sql = 'SELECT * FROM sales_prices WHERE 1=1';
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

    sql += ` ORDER BY month DESC, created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await query(sql, params);

    return NextResponse.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching sales prices:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/sales-prices:
 *   post:
 *     summary: Create new sales price record
 *     description: Add a new sales price entry
 *     tags: [Sales Prices]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - product_id
 *               - month
 *               - sales_price
 *             properties:
 *               product_id:
 *                 type: string
 *               month:
 *                 type: string
 *                 description: Month in YYYY-MM format
 *               sales_price:
 *                 type: string
 *     responses:
 *       201:
 *         description: Sales price created successfully
 *       400:
 *         description: Invalid request data
 *       500:
 *         description: Server error
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { product_id, month, sales_price } = body;

    if (!product_id || !month || !sales_price) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: product_id, month, sales_price' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO sales_prices (product_id, month, sales_price, created_at, updated_at) 
       VALUES ($1, $2, $3, NOW(), NOW()) 
       RETURNING *`,
      [product_id, month, sales_price]
    );

    return NextResponse.json(
      { success: true, data: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating sales price:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}