import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/sales-records:
 *   get:
 *     summary: Get all sales records
 *     description: Retrieve all sales records with pagination support
 *     tags: [Sales Records]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Success
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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    const result = await query(
      `SELECT 
        id,
        invoice_date,
        due_date,
        invoice_no,
        part_no,
        customer,
        quantity,
        pricing,
        vat,
        product_id,
        created_at
       FROM sales_records
       ORDER BY invoice_date DESC 
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const countResult = await query('SELECT COUNT(*) FROM sales_records');
    const total = parseInt(countResult.rows[0].count);

    return NextResponse.json({
      success: true,
      data: result.rows,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching sales records:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/sales-records:
 *   post:
 *     summary: Create a new sales record
 *     description: Create a new sales record with invoice details
 *     tags: [Sales Records]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - invoice_date
 *               - due_date
 *               - invoice_no
 *               - customer
 *               - quantity
 *               - pricing
 *               - vat
 *               - product_id
 *             properties:
 *               invoice_date:
 *                 type: string
 *                 format: date
 *               due_date:
 *                 type: string
 *                 format: date
 *               invoice_no:
 *                 type: string
 *               product_id:
 *                 type: string
 *                 format: uuid
 *               part_no:
 *                 type: string
 *               customer:
 *                 type: string
 *               quantity:
 *                 type: integer
 *               pricing:
 *                 type: string
 *               vat:
 *                 type: string
 *     responses:
 *       201:
 *         description: Sales record created
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { invoice_date, due_date, invoice_no, product_id, part_no, customer, quantity, pricing, vat } = body;

    if (!invoice_date || !due_date || !invoice_no || !customer || !quantity || !pricing || !vat || !product_id) {
      console.error('Missing required fields:', { invoice_date, due_date, invoice_no, customer, quantity, pricing, vat, product_id });
      return NextResponse.json(
        { success: false, error: 'Required fields are missing' },
        { status: 400 }
      );
    }

    console.log('Inserting sales record:', { invoice_date, due_date, invoice_no, product_id, part_no, customer, quantity, pricing, vat });

    const result = await query(
      `INSERT INTO sales_records 
       (invoice_date, due_date, invoice_no, part_no, customer, quantity, pricing, vat, product_id, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW()) 
       RETURNING *`,
      [invoice_date, due_date, invoice_no, part_no || null, customer, quantity, pricing, vat, product_id]
    );

    console.log('Sales record created successfully:', result.rows[0]);

    return NextResponse.json(
      { success: true, data: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating sales record:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}