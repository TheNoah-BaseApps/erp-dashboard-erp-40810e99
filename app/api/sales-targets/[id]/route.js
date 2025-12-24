import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/sales-targets/{id}:
 *   get:
 *     summary: Get sales target by ID
 *     tags: [Sales Targets]
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
    console.log('Fetching sales target with ID:', id);
    
    const result = await query(
      `SELECT st.*, p.name as product_name, p.category, p.price
       FROM sales_targets st
       LEFT JOIN products p ON st.product_id = p.id
       WHERE st.id = $1::text`,
      [id]
    );

    if (result.rows.length === 0) {
      console.error('Sales target not found for ID:', id);
      return NextResponse.json(
        { success: false, error: 'Sales target not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error fetching sales target:', error);
    console.error('Error details:', { id: params?.id, message: error.message, stack: error.stack });
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/sales-targets/{id}:
 *   put:
 *     summary: Update sales target
 *     tags: [Sales Targets]
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
    const { product_id, month, target_amount } = body;

    console.log('Updating sales target:', { id, product_id, month, target_amount });

    // Validate product exists
    const productCheck = await query('SELECT id FROM products WHERE id = $1::text', [product_id]);
    if (productCheck.rows.length === 0) {
      console.error('Product not found for ID:', product_id);
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    const result = await query(
      `UPDATE sales_targets 
       SET product_id = $1::text, month = $2, target_amount = $3, updated_at = NOW()
       WHERE id = $4::text 
       RETURNING *`,
      [product_id, month, target_amount, id]
    );

    if (result.rows.length === 0) {
      console.error('Sales target not found for update, ID:', id);
      return NextResponse.json(
        { success: false, error: 'Sales target not found' },
        { status: 404 }
      );
    }

    // Fetch updated record with product details
    const updatedResult = await query(
      `SELECT st.*, p.name as product_name, p.category, p.price
       FROM sales_targets st
       LEFT JOIN products p ON st.product_id = p.id
       WHERE st.id = $1::text`,
      [id]
    );

    return NextResponse.json({ success: true, data: updatedResult.rows[0] });
  } catch (error) {
    console.error('Error updating sales target:', error);
    console.error('Error details:', { id: params?.id, message: error.message, stack: error.stack });
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/sales-targets/{id}:
 *   delete:
 *     summary: Delete sales target
 *     tags: [Sales Targets]
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
    console.log('Deleting sales target with ID:', id);
    
    const result = await query('DELETE FROM sales_targets WHERE id = $1::text RETURNING *', [id]);

    if (result.rows.length === 0) {
      console.error('Sales target not found for deletion, ID:', id);
      return NextResponse.json(
        { success: false, error: 'Sales target not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: 'Sales target deleted' });
  } catch (error) {
    console.error('Error deleting sales target:', error);
    console.error('Error details:', { id: params?.id, message: error.message, stack: error.stack });
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}