export const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  SALES_REP: 'sales_rep',
  INVENTORY_STAFF: 'inventory_staff',
  VIEWER: 'viewer'
};

export const PERMISSIONS = {
  // Product permissions
  CREATE_PRODUCT: [ROLES.ADMIN, ROLES.MANAGER, ROLES.INVENTORY_STAFF],
  READ_PRODUCT: [ROLES.ADMIN, ROLES.MANAGER, ROLES.SALES_REP, ROLES.INVENTORY_STAFF, ROLES.VIEWER],
  UPDATE_PRODUCT: [ROLES.ADMIN, ROLES.MANAGER, ROLES.INVENTORY_STAFF],
  DELETE_PRODUCT: [ROLES.ADMIN, ROLES.MANAGER],
  
  // Customer permissions
  CREATE_CUSTOMER: [ROLES.ADMIN, ROLES.MANAGER, ROLES.SALES_REP],
  READ_CUSTOMER: [ROLES.ADMIN, ROLES.MANAGER, ROLES.SALES_REP, ROLES.VIEWER],
  UPDATE_CUSTOMER: [ROLES.ADMIN, ROLES.MANAGER, ROLES.SALES_REP],
  DELETE_CUSTOMER: [ROLES.ADMIN, ROLES.MANAGER],
  
  // Stock permissions
  CREATE_STOCK: [ROLES.ADMIN, ROLES.MANAGER, ROLES.INVENTORY_STAFF],
  READ_STOCK: [ROLES.ADMIN, ROLES.MANAGER, ROLES.INVENTORY_STAFF, ROLES.VIEWER],
  UPDATE_STOCK: [ROLES.ADMIN, ROLES.MANAGER, ROLES.INVENTORY_STAFF],
  DELETE_STOCK: [ROLES.ADMIN, ROLES.MANAGER],
  
  // Report permissions
  VIEW_REPORTS: [ROLES.ADMIN, ROLES.MANAGER, ROLES.VIEWER],
  
  // Audit permissions
  VIEW_AUDIT_LOGS: [ROLES.ADMIN, ROLES.MANAGER]
};

export function hasPermission(userRole, permission) {
  if (!userRole || !permission) return false;
  const allowedRoles = PERMISSIONS[permission];
  return allowedRoles ? allowedRoles.includes(userRole) : false;
}

export function canAccessResource(userRole, resourceType, action) {
  const permissionKey = `${action}_${resourceType}`.toUpperCase();
  return hasPermission(userRole, permissionKey);
}

export function getRoleDisplayName(role) {
  const roleNames = {
    [ROLES.ADMIN]: 'Administrator',
    [ROLES.MANAGER]: 'Manager',
    [ROLES.SALES_REP]: 'Sales Representative',
    [ROLES.INVENTORY_STAFF]: 'Inventory Staff',
    [ROLES.VIEWER]: 'Viewer'
  };
  return roleNames[role] || role;
}

export function getAllRoles() {
  return Object.values(ROLES);
}