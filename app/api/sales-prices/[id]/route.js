import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/sales-prices/{id}:
 *   get:
 *     summary: Get sales price by ID
 *     tags: [Sales Prices]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response
 *       404:
 *         description: Sales price not found
 *       500:
 *         description: Server error
 */
export async function GET(request, { params }) {
  try {
    const { id } = params;

    const result = await query(
      'SELECT * FROM sales_prices WHERE id::uuid = $1::uuid',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Sales price not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching sales price:', error);
    console.error('Error details:', { id: params.id, message: error.message, stack: error.stack });
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/sales-prices/{id}:
 *   put:
 *     summary: Update sales price
 *     tags: [Sales Prices]
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
 *             properties:
 *               product_id:
 *                 type: string
 *               month:
 *                 type: string
 *               sales_price:
 *                 type: string
 *     responses:
 *       200:
 *         description: Sales price updated successfully
 *       404:
 *         description: Sales price not found
 *       500:
 *         description: Server error
 */
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { product_id, month, sales_price } = body;

    const result = await query(
      `UPDATE sales_prices 
       SET product_id = $1, month = $2, sales_price = $3, updated_at = NOW() 
       WHERE id::uuid = $4::uuid 
       RETURNING *`,
      [product_id, month, sales_price, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Sales price not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating sales price:', error);
    console.error('Error details:', { id: params.id, message: error.message, stack: error.stack });
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/sales-prices/{id}:
 *   delete:
 *     summary: Delete sales price
 *     tags: [Sales Prices]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Sales price deleted successfully
 *       404:
 *         description: Sales price not found
 *       500:
 *         description: Server error
 */
export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    const result = await query(
      'DELETE FROM sales_prices WHERE id::uuid = $1::uuid RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Sales price not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Sales price deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting sales price:', error);
    console.error('Error details:', { id: params.id, message: error.message, stack: error.stack });
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}