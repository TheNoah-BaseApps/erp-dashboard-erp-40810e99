import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/fixed-costs:
 *   get:
 *     summary: Get all fixed costs
 *     description: Retrieve all fixed cost records with optional filtering
 *     tags: [Fixed Costs]
 *     parameters:
 *       - in: query
 *         name: cost_name
 *         schema:
 *           type: string
 *         description: Filter by cost name
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
    const cost_name = searchParams.get('cost_name');
    const month = searchParams.get('month');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    let sql = 'SELECT * FROM fixed_costs WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (cost_name) {
      sql += ` AND cost_name ILIKE $${paramCount}`;
      params.push(`%${cost_name}%`);
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
    console.error('Error fetching fixed costs:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/fixed-costs:
 *   post:
 *     summary: Create new fixed cost record
 *     description: Add a new fixed cost entry
 *     tags: [Fixed Costs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cost_name
 *               - month
 *               - amount
 *             properties:
 *               cost_name:
 *                 type: string
 *               month:
 *                 type: string
 *                 description: Month in YYYY-MM format
 *               amount:
 *                 type: string
 *     responses:
 *       201:
 *         description: Fixed cost created successfully
 *       400:
 *         description: Invalid request data
 *       500:
 *         description: Server error
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { cost_name, month, amount } = body;

    if (!cost_name || !month || !amount) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: cost_name, month, amount' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO fixed_costs (cost_name, month, amount, created_at, updated_at) 
       VALUES ($1, $2, $3, NOW(), NOW()) 
       RETURNING *`,
      [cost_name, month, amount]
    );

    return NextResponse.json(
      { success: true, data: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating fixed cost:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}