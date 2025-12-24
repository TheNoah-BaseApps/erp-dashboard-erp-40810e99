import { verifyToken, getTokenFromRequest } from './jwt';
import { query } from './database/aurora';

export async function getCurrentUser(request) {
  try {
    const token = getTokenFromRequest(request);
    if (!token) {
      return null;
    }
    
    const payload = await verifyToken(token);
    if (!payload || !payload.userId) {
      return null;
    }
    
    const result = await query(
      'SELECT id, email, name, role, created_at FROM users WHERE id = $1',
      [payload.userId]
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0];
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

export function requireAuth(handler) {
  return async (request, context) => {
    try {
      const user = await getCurrentUser(request);
      
      if (!user) {
        return Response.json(
          { success: false, error: 'Unauthorized' },
          { status: 401 }
        );
      }
      
      request.user = user;
      return handler(request, context);
    } catch (error) {
      console.error('Auth middleware error:', error);
      return Response.json(
        { success: false, error: 'Authentication failed' },
        { status: 500 }
      );
    }
  };
}

export function requireRole(roles) {
  return (handler) => {
    return requireAuth(async (request, context) => {
      const user = request.user;
      
      if (!roles.includes(user.role)) {
        return Response.json(
          { success: false, error: 'Forbidden: Insufficient permissions' },
          { status: 403 }
        );
      }
      
      return handler(request, context);
    });
  };
}