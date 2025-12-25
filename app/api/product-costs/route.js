import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/product-costs:
 *   get:
 *     summary: Get all product costs
 *     description: Retrieve all product cost records with optional filtering
 *     tags: [Product Costs]
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
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

    let sql = 'SELECT pc.*, p.name as product_name, p.part_no FROM product_costs pc LEFT JOIN products p ON pc.product_id = p.id WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (product_id) {
      sql += ` AND pc.product_id = $${paramCount}`;
      params.push(product_id);
      paramCount++;
    }

    if (month) {
      sql += ` AND pc.month = $${paramCount}`;
      params.push(month);
      paramCount++;
    }

    sql += ` ORDER BY pc.month DESC, pc.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await query(sql, params);

    return NextResponse.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching product costs:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/product-costs:
 *   post:
 *     summary: Create new product cost record
 *     description: Add a new product cost entry
 *     tags: [Product Costs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - product_id
 *               - month
 *               - unit_cost
 *             properties:
 *               product_id:
 *                 type: string
 *               month:
 *                 type: string
 *                 description: Month in YYYY-MM format
 *               unit_cost:
 *                 type: string
 *     responses:
 *       201:
 *         description: Product cost created successfully
 *       400:
 *         description: Invalid request data
 *       500:
 *         description: Server error
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { product_id, month, unit_cost } = body;

    if (!product_id || !month || !unit_cost) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: product_id, month, unit_cost' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO product_costs (product_id, month, unit_cost, created_at, updated_at) 
       VALUES ($1, $2, $3, NOW(), NOW()) 
       RETURNING *`,
      [product_id, month, unit_cost]
    );

    return NextResponse.json(
      { success: true, data: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating product cost:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}