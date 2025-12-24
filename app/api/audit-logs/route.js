/**
 * @swagger
 * /api/audit-logs:
 *   get:
 *     summary: Get audit logs with filters
 *     tags: [Audit Logs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of audit logs
 */

import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getAuditLogs } from '@/lib/audit';

export const GET = requireAuth(async (request) => {
  try {
    const { searchParams } = new URL(request.url);
    
    const filters = {
      userId: searchParams.get('user_id'),
      entityType: searchParams.get('entity_type'),
      action: searchParams.get('action'),
      startDate: searchParams.get('start_date'),
      endDate: searchParams.get('end_date'),
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')) : 50,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')) : 0
    };

    const logs = await getAuditLogs(filters);

    return NextResponse.json({
      success: true,
      data: logs
    });
  } catch (error) {
    console.error('Error in GET /api/audit-logs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch audit logs' },
      { status: 500 }
    );
  }
});