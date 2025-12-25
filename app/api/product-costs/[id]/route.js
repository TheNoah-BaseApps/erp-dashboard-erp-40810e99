import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/product-costs/{id}:
 *   get:
 *     summary: Get product cost by ID
 *     tags: [Product Costs]
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
 *         description: Product cost not found
 *       500:
 *         description: Server error
 */
export async function GET(request, { params }) {
  try {
    const { id } = params;

    const result = await query(
      'SELECT * FROM product_costs WHERE id::uuid = $1::uuid',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Product cost not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching product cost:', error);
    console.error('Error details:', { id: params.id, message: error.message, stack: error.stack });
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/product-costs/{id}:
 *   put:
 *     summary: Update product cost
 *     tags: [Product Costs]
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
 *               unit_cost:
 *                 type: string
 *     responses:
 *       200:
 *         description: Product cost updated successfully
 *       404:
 *         description: Product cost not found
 *       500:
 *         description: Server error
 */
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { product_id, month, unit_cost } = body;

    const result = await query(
      `UPDATE product_costs 
       SET product_id = $1, month = $2, unit_cost = $3, updated_at = NOW() 
       WHERE id::uuid = $4::uuid 
       RETURNING *`,
      [product_id, month, unit_cost, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Product cost not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating product cost:', error);
    console.error('Error details:', { id: params.id, body, message: error.message, stack: error.stack });
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/product-costs/{id}:
 *   delete:
 *     summary: Delete product cost
 *     tags: [Product Costs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product cost deleted successfully
 *       404:
 *         description: Product cost not found
 *       500:
 *         description: Server error
 */
export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    const result = await query(
      'DELETE FROM product_costs WHERE id::uuid = $1::uuid RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Product cost not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Product cost deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting product cost:', error);
    console.error('Error details:', { id: params.id, message: error.message, stack: error.stack });
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}