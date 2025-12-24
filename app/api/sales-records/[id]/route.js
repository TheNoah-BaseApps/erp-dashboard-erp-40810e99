import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/sales-records/{id}:
 *   get:
 *     summary: Get sales record by ID
 *     tags: [Sales Records]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Not found
 *       500:
 *         description: Server error
 */
export async function GET(request, { params }) {
  try {
    const { id } = params;
    const result = await query(
      `SELECT sr.*, 
              p.name as product_name,
              p.part_no as product_part_no,
              p.description as product_description,
              p.category as product_category,
              p.unit_price as product_unit_price
       FROM sales_records sr
       LEFT JOIN products p ON sr.product_id = p.id
       WHERE sr.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Sales record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error fetching sales record:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/sales-records/{id}:
 *   put:
 *     summary: Update sales record
 *     tags: [Sales Records]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Not found
 *       500:
 *         description: Server error
 */
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { invoice_date, due_date, invoice_no, product_id, customer, quantity, pricing, vat } = body;

    // Validate product_id exists if provided
    if (product_id) {
      const productCheck = await query('SELECT id FROM products WHERE id = $1', [product_id]);
      if (productCheck.rows.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Product not found' },
          { status: 400 }
        );
      }
    }

    const result = await query(
      `UPDATE sales_records 
       SET invoice_date = $1, due_date = $2, invoice_no = $3, product_id = $4, 
           customer = $5, quantity = $6, pricing = $7, vat = $8, updated_at = NOW()
       WHERE id = $9 
       RETURNING *`,
      [invoice_date, due_date, invoice_no, product_id, customer, quantity, pricing, vat, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Sales record not found' },
        { status: 404 }
      );
    }

    // Fetch the updated record with product details
    const updatedResult = await query(
      `SELECT sr.*, 
              p.name as product_name,
              p.part_no as product_part_no,
              p.description as product_description,
              p.category as product_category,
              p.unit_price as product_unit_price
       FROM sales_records sr
       LEFT JOIN products p ON sr.product_id = p.id
       WHERE sr.id = $1`,
      [id]
    );

    return NextResponse.json({ success: true, data: updatedResult.rows[0] });
  } catch (error) {
    console.error('Error updating sales record:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/sales-records/{id}:
 *   delete:
 *     summary: Delete sales record
 *     tags: [Sales Records]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Not found
 *       500:
 *         description: Server error
 */
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const result = await query('DELETE FROM sales_records WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Sales record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: 'Sales record deleted' });
  } catch (error) {
    console.error('Error deleting sales record:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}