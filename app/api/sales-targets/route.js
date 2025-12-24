import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/sales-targets:
 *   get:
 *     summary: Get all sales targets
 *     description: Retrieve all sales target records by product and month
 *     tags: [Sales Targets]
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

    let sql = `
      SELECT 
        st.*,
        p.id as product_id,
        p.name as product_name,
        p.part_no as product_part_no
      FROM sales_targets st
      INNER JOIN products p ON st.product_id = p.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (product_id) {
      sql += ` AND st.product_id = $${paramCount}`;
      params.push(product_id);
      paramCount++;
    }

    if (month) {
      sql += ` AND st.month = $${paramCount}`;
      params.push(month);
      paramCount++;
    }

    sql += ' ORDER BY st.month DESC, p.name ASC';

    const result = await query(sql, params);

    return NextResponse.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching sales targets:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/sales-targets:
 *   post:
 *     summary: Create sales target
 *     tags: [Sales Targets]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - product_id
 *               - month
 *               - target_amount
 *             properties:
 *               product_id:
 *                 type: string
 *               month:
 *                 type: string
 *               target_amount:
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
    const { product_id, month, target_amount } = body;

    if (!product_id || !month || !target_amount) {
      return NextResponse.json(
        { success: false, error: 'Product ID, month, and target amount are required' },
        { status: 400 }
      );
    }

    // Validate product exists
    const productCheck = await query(
      'SELECT id, name, part_no FROM products WHERE id = $1',
      [product_id]
    );

    if (productCheck.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO sales_targets (product_id, month, target_amount, created_at, updated_at) 
       VALUES ($1, $2, $3, NOW(), NOW()) 
       RETURNING *`,
      [product_id, month, target_amount]
    );

    // Fetch complete data with product details
    const completeData = await query(
      `SELECT 
        st.*,
        p.id as product_id,
        p.name as product_name,
        p.part_no as product_part_no
      FROM sales_targets st
      INNER JOIN products p ON st.product_id = p.id
      WHERE st.id = $1`,
      [result.rows[0].id]
    );

    return NextResponse.json(
      { success: true, data: completeData.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating sales target:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}