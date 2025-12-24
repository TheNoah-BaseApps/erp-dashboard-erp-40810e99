import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/actual-sales/{id}:
 *   get:
 *     summary: Get actual sales by ID
 *     tags: [Actual Sales]
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
      `SELECT 
        a.*,
        p.product_name,
        p.category,
        p.price,
        p.description
       FROM actual_sales a
       LEFT JOIN products p ON a.product_id = p.id
       WHERE a.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Actual sales record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: result.rows[0] });
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
 * /api/actual-sales/{id}:
 *   put:
 *     summary: Update actual sales
 *     tags: [Actual Sales]
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
    const { product_id, month, actual_sales_amount } = body;

    // Validate product exists
    const productCheck = await query(
      'SELECT id FROM products WHERE id = $1',
      [product_id]
    );

    if (productCheck.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 400 }
      );
    }

    const result = await query(
      `UPDATE actual_sales 
       SET product_id = $1, month = $2, actual_sales_amount = $3, updated_at = NOW()
       WHERE id = $4 
       RETURNING *`,
      [product_id, month, actual_sales_amount, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Actual sales record not found' },
        { status: 404 }
      );
    }

    // Fetch updated record with product details
    const updatedResult = await query(
      `SELECT 
        a.*,
        p.product_name,
        p.category,
        p.price,
        p.description
       FROM actual_sales a
       LEFT JOIN products p ON a.product_id = p.id
       WHERE a.id = $1`,
      [id]
    );

    return NextResponse.json({ success: true, data: updatedResult.rows[0] });
  } catch (error) {
    console.error('Error updating actual sales:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/actual-sales/{id}:
 *   delete:
 *     summary: Delete actual sales
 *     tags: [Actual Sales]
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
    const result = await query('DELETE FROM actual_sales WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Actual sales record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: 'Actual sales deleted' });
  } catch (error) {
    console.error('Error deleting actual sales:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}