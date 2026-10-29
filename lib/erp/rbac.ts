/**
 * BizChefs ERP Role-Based Access Control (RBAC) System
 *
 * Implements granular enterprise role and permission mapping.
 * Enforces least-privilege authorization for multi-tenant ERP operations.
 */

export type ErpRole =
  | 'platform_super_admin'
  | 'owner'
  | 'tenant_admin'
  | 'accountant'
  | 'sales_manager'
  | 'sales_staff'
  | 'purchasing_manager'
  | 'purchasing_staff'
  | 'inventory_manager'
  | 'warehouse_staff'
  | 'hr_manager'
  | 'hr_staff'
  | 'project_manager'
  | 'project_staff'
  | 'auditor';

export type ErpModule =
  | 'sales'
  | 'purchasing'
  | 'inventory'
  | 'accounting'
  | 'hr'
  | 'projects'
  | 'settings'
  | 'audit';

export type ErpAction =
  | 'read'
  | 'create'
  | 'update'
  | 'delete'
  | 'approve'
  | 'post'
  | 'export'
  | 'manage';

export type ErpPermission =
  // Sales Module
  | 'sales.customer.read'
  | 'sales.customer.write'
  | 'sales.quote.read'
  | 'sales.quote.create'
  | 'sales.quote.approve'
  | 'sales.order.read'
  | 'sales.order.create'
  | 'sales.order.approve'
  | 'sales.invoice.read'
  | 'sales.invoice.create'
  | 'sales.invoice.post'

  // Purchasing Module
  | 'purchasing.supplier.read'
  | 'purchasing.supplier.write'
  | 'purchasing.order.read'
  | 'purchasing.order.create'
  | 'purchasing.order.approve'
  | 'purchasing.bill.read'
  | 'purchasing.bill.create'
  | 'purchasing.bill.post'

  // Inventory Module
  | 'inventory.item.read'
  | 'inventory.item.write'
  | 'inventory.stock.read'
  | 'inventory.stock.adjust'
  | 'inventory.stock.transfer'
  | 'inventory.warehouse.manage'

  // Accounting Module
  | 'accounting.account.read'
  | 'accounting.account.manage'
  | 'accounting.journal.read'
  | 'accounting.journal.create'
  | 'accounting.journal.post'
  | 'accounting.reports.read'
  | 'accounting.period.close'

  // HR Module
  | 'hr.employee.read'
  | 'hr.employee.write'
  | 'hr.attendance.read'
  | 'hr.attendance.write'
  | 'hr.leave.read'
  | 'hr.leave.apply'
  | 'hr.leave.approve'
  | 'hr.payroll.read'
  | 'hr.payroll.process'

  // Projects Module
  | 'projects.project.read'
  | 'projects.project.write'
  | 'projects.timesheet.read'
  | 'projects.timesheet.log'
  | 'projects.timesheet.approve'

  // Settings & Tenant Management
  | 'settings.tenant.read'
  | 'settings.tenant.update'
  | 'settings.users.manage'
  | 'settings.billing.manage'

  // Audit
  | 'audit.logs.read';

/**
 * Static Role to Permission Mapping
 */
export const ROLE_PERMISSIONS: Record<ErpRole, ReadonlySet<ErpPermission>> = {
  platform_super_admin: new Set<ErpPermission>([
    'sales.customer.read', 'sales.customer.write', 'sales.quote.read', 'sales.quote.create', 'sales.quote.approve',
    'sales.order.read', 'sales.order.create', 'sales.order.approve', 'sales.invoice.read', 'sales.invoice.create', 'sales.invoice.post',
    'purchasing.supplier.read', 'purchasing.supplier.write', 'purchasing.order.read', 'purchasing.order.create', 'purchasing.order.approve',
    'purchasing.bill.read', 'purchasing.bill.create', 'purchasing.bill.post',
    'inventory.item.read', 'inventory.item.write', 'inventory.stock.read', 'inventory.stock.adjust', 'inventory.stock.transfer', 'inventory.warehouse.manage',
    'accounting.account.read', 'accounting.account.manage', 'accounting.journal.read', 'accounting.journal.create', 'accounting.journal.post', 'accounting.reports.read', 'accounting.period.close',
    'hr.employee.read', 'hr.employee.write', 'hr.attendance.read', 'hr.attendance.write', 'hr.leave.read', 'hr.leave.apply', 'hr.leave.approve', 'hr.payroll.read', 'hr.payroll.process',
    'projects.project.read', 'projects.project.write', 'projects.timesheet.read', 'projects.timesheet.log', 'projects.timesheet.approve',
    'settings.tenant.read', 'settings.tenant.update', 'settings.users.manage', 'settings.billing.manage', 'audit.logs.read'
  ]),

  owner: new Set<ErpPermission>([
    'sales.customer.read', 'sales.customer.write', 'sales.quote.read', 'sales.quote.create', 'sales.quote.approve',
    'sales.order.read', 'sales.order.create', 'sales.order.approve', 'sales.invoice.read', 'sales.invoice.create', 'sales.invoice.post',
    'purchasing.supplier.read', 'purchasing.supplier.write', 'purchasing.order.read', 'purchasing.order.create', 'purchasing.order.approve',
    'purchasing.bill.read', 'purchasing.bill.create', 'purchasing.bill.post',
    'inventory.item.read', 'inventory.item.write', 'inventory.stock.read', 'inventory.stock.adjust', 'inventory.stock.transfer', 'inventory.warehouse.manage',
    'accounting.account.read', 'accounting.account.manage', 'accounting.journal.read', 'accounting.journal.create', 'accounting.journal.post', 'accounting.reports.read', 'accounting.period.close',
    'hr.employee.read', 'hr.employee.write', 'hr.attendance.read', 'hr.attendance.write', 'hr.leave.read', 'hr.leave.apply', 'hr.leave.approve', 'hr.payroll.read', 'hr.payroll.process',
    'projects.project.read', 'projects.project.write', 'projects.timesheet.read', 'projects.timesheet.log', 'projects.timesheet.approve',
    'settings.tenant.read', 'settings.tenant.update', 'settings.users.manage', 'settings.billing.manage', 'audit.logs.read'
  ]),

  tenant_admin: new Set<ErpPermission>([
    'sales.customer.read', 'sales.quote.read', 'sales.order.read', 'sales.invoice.read',
    'purchasing.supplier.read', 'purchasing.order.read', 'purchasing.bill.read',
    'inventory.item.read', 'inventory.stock.read',
    'accounting.account.read', 'accounting.journal.read', 'accounting.reports.read',
    'hr.employee.read', 'hr.attendance.read', 'hr.leave.read',
    'projects.project.read', 'projects.timesheet.read',
    'settings.tenant.read', 'settings.tenant.update', 'settings.users.manage', 'audit.logs.read'
  ]),

  accountant: new Set<ErpPermission>([
    'sales.customer.read', 'sales.invoice.read', 'sales.invoice.create', 'sales.invoice.post',
    'purchasing.supplier.read', 'purchasing.bill.read', 'purchasing.bill.create', 'purchasing.bill.post',
    'inventory.item.read', 'inventory.stock.read',
    'accounting.account.read', 'accounting.account.manage', 'accounting.journal.read', 'accounting.journal.create', 'accounting.journal.post', 'accounting.reports.read', 'accounting.period.close',
    'audit.logs.read'
  ]),

  sales_manager: new Set<ErpPermission>([
    'sales.customer.read', 'sales.customer.write',
    'sales.quote.read', 'sales.quote.create', 'sales.quote.approve',
    'sales.order.read', 'sales.order.create', 'sales.order.approve',
    'sales.invoice.read', 'sales.invoice.create',
    'inventory.item.read', 'inventory.stock.read'
  ]),

  sales_staff: new Set<ErpPermission>([
    'sales.customer.read', 'sales.customer.write',
    'sales.quote.read', 'sales.quote.create',
    'sales.order.read', 'sales.order.create',
    'sales.invoice.read',
    'inventory.item.read'
  ]),

  purchasing_manager: new Set<ErpPermission>([
    'purchasing.supplier.read', 'purchasing.supplier.write',
    'purchasing.order.read', 'purchasing.order.create', 'purchasing.order.approve',
    'purchasing.bill.read', 'purchasing.bill.create',
    'inventory.item.read', 'inventory.stock.read'
  ]),

  purchasing_staff: new Set<ErpPermission>([
    'purchasing.supplier.read',
    'purchasing.order.read', 'purchasing.order.create',
    'inventory.item.read'
  ]),

  inventory_manager: new Set<ErpPermission>([
    'inventory.item.read', 'inventory.item.write',
    'inventory.stock.read', 'inventory.stock.adjust', 'inventory.stock.transfer', 'inventory.warehouse.manage',
    'purchasing.order.read', 'sales.order.read'
  ]),

  warehouse_staff: new Set<ErpPermission>([
    'inventory.item.read',
    'inventory.stock.read', 'inventory.stock.transfer',
    'purchasing.order.read', 'sales.order.read'
  ]),

  hr_manager: new Set<ErpPermission>([
    'hr.employee.read', 'hr.employee.write',
    'hr.attendance.read', 'hr.attendance.write',
    'hr.leave.read', 'hr.leave.apply', 'hr.leave.approve',
    'hr.payroll.read', 'hr.payroll.process'
  ]),

  hr_staff: new Set<ErpPermission>([
    'hr.employee.read',
    'hr.attendance.read', 'hr.attendance.write',
    'hr.leave.read', 'hr.leave.apply'
  ]),

  project_manager: new Set<ErpPermission>([
    'projects.project.read', 'projects.project.write',
    'projects.timesheet.read', 'projects.timesheet.log', 'projects.timesheet.approve'
  ]),

  project_staff: new Set<ErpPermission>([
    'projects.project.read',
    'projects.timesheet.read', 'projects.timesheet.log'
  ]),

  auditor: new Set<ErpPermission>([
    'sales.customer.read', 'sales.quote.read', 'sales.order.read', 'sales.invoice.read',
    'purchasing.supplier.read', 'purchasing.order.read', 'purchasing.bill.read',
    'inventory.item.read', 'inventory.stock.read',
    'accounting.account.read', 'accounting.journal.read', 'accounting.reports.read',
    'hr.employee.read', 'hr.attendance.read', 'hr.leave.read', 'hr.payroll.read',
    'projects.project.read', 'projects.timesheet.read',
    'audit.logs.read'
  ])
};

/**
 * Checks if a given role has a specific permission.
 */
export function hasPermission(role: ErpRole | null | undefined, permission: ErpPermission): boolean {
  if (!role) return false;
  const permissions = ROLE_PERMISSIONS[role];
  return permissions ? permissions.has(permission) : false;
}

/**
 * Checks if a role has ANY of the specified permissions.
 */
export function hasAnyPermission(role: ErpRole | null | undefined, permissions: ErpPermission[]): boolean {
  if (!role) return false;
  return permissions.some(perm => hasPermission(role, perm));
}

/**
 * Checks if a role has ALL of the specified permissions.
 */
export function hasAllPermissions(role: ErpRole | null | undefined, permissions: ErpPermission[]): boolean {
  if (!role) return false;
  return permissions.every(perm => hasPermission(role, perm));
}

/**
 * Validates whether a tenant user can execute a specific module action.
 */
export function canAccessModule(role: ErpRole | null | undefined, module: ErpModule): boolean {
  if (!role) return false;
  const prefix = module === 'audit' ? 'audit.' : `${module}.`;
  const permissions = ROLE_PERMISSIONS[role];
  if (!permissions) return false;

  for (const perm of permissions) {
    if (perm.startsWith(prefix)) return true;
  }
  return false;
}
