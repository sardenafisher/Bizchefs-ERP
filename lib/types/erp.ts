// BizChefs ERP - Enterprise Data Types & Interfaces

export type UserRole = 'super_admin' | 'tenant_admin' | 'accountant' | 'sales_manager' | 'inventory_manager' | 'hr_manager' | 'staff' | 'viewer';

export interface TenantSubscription {
  plan: 'starter' | 'growth' | 'enterprise';
  status: 'active' | 'trialing' | 'past_due' | 'canceled';
  validUntil: string;
  maxUsers: number;
  maxInvoicesPerMonth: number;
}

export interface TenantSettings {
  baseCurrency: string;
  dateFormat: string;
  timezone: string;
  fiscalYearStartMonth: number; // 1 = January
  taxNumber?: string;
  address?: string;
  city?: string;
  country?: string;
  phone?: string;
  email?: string;
  website?: string;
  logoUrl?: string;
}

export interface DocumentSequence {
  id: string;
  tenantId: string;
  documentType: 'sales_invoice' | 'quotation' | 'sales_order' | 'purchase_order' | 'goods_receipt' | 'journal_entry' | 'payment';
  prefix: string;
  nextNumber: number;
  numberPadding: number;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  industry: string;
  settings: TenantSettings;
  subscription: TenantSubscription;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  isPlatformAdmin: boolean;
  tenantMemberships: {
    tenantId: string;
    tenantName: string;
    role: UserRole;
  }[];
}

export interface AuditLog {
  id: string;
  tenantId: string;
  userId: string;
  userEmail: string;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
  createdAt: string;
}

// ==================== ACCOUNTING ====================
export type AccountType = 'asset' | 'liability' | 'equity' | 'income' | 'expense';

export interface Account {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  type: AccountType;
  parentCode?: string;
  currency: string;
  balance: number;
  isHeader?: boolean;
}

export interface JournalLine {
  id: string;
  accountId: string;
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
  memo?: string;
}

export interface JournalEntry {
  id: string;
  tenantId: string;
  entryNumber: string;
  date: string;
  reference?: string;
  memo: string;
  lines: JournalLine[];
  totalDebit: number;
  totalCredit: number;
  status: 'draft' | 'posted' | 'reversed';
  createdAt: string;
  postedAt?: string;
}

// ==================== INVENTORY ====================
export interface Warehouse {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  location?: string;
  isDefault?: boolean;
}

export interface ItemCategory {
  id: string;
  tenantId: string;
  name: string;
}

export interface Item {
  id: string;
  tenantId: string;
  sku: string;
  name: string;
  category: string;
  uom: string; // kg, pcs, box, liter, hour
  unitPrice: number;
  costPrice: number;
  taxRate: number; // percentage (e.g. 14 for 14%)
  reorderPoint: number;
  barcode?: string;
  description?: string;
  incomeAccountId?: string;
  expenseAccountId?: string;
}

export interface StockMovement {
  id: string;
  tenantId: string;
  date: string;
  itemId: string;
  itemSku: string;
  itemName: string;
  warehouseId: string;
  warehouseName: string;
  toWarehouseId?: string;
  toWarehouseName?: string;
  movementType: 'receipt' | 'issue' | 'transfer' | 'adjustment';
  quantity: number;
  unitCost: number;
  totalValue: number;
  referenceType?: 'sales_invoice' | 'purchase_order' | 'manual_adjustment';
  referenceId?: string;
  notes?: string;
  createdAt: string;
}

// ==================== CRM & SALES ====================
export interface Customer {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  contactPerson?: string;
  email: string;
  phone: string;
  address?: string;
  taxNumber?: string;
  creditLimit: number;
  paymentTermsDays: number;
  outstandingBalance: number;
  createdAt: string;
}

export interface SalesLineItem {
  id: string;
  itemId: string;
  itemSku: string;
  itemName: string;
  uom: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  taxAmount: number;
  lineTotal: number;
}

export interface Quotation {
  id: string;
  tenantId: string;
  quotationNumber: string;
  customerId: string;
  customerName: string;
  date: string;
  validUntil: string;
  items: SalesLineItem[];
  subtotal: number;
  taxTotal: number;
  grandTotal: number;
  status: 'draft' | 'sent' | 'accepted' | 'declined' | 'ordered';
  notes?: string;
  createdAt: string;
}

export interface SalesOrder {
  id: string;
  tenantId: string;
  orderNumber: string;
  quotationId?: string;
  customerId: string;
  customerName: string;
  date: string;
  deliveryDate: string;
  items: SalesLineItem[];
  subtotal: number;
  taxTotal: number;
  grandTotal: number;
  status: 'draft' | 'confirmed' | 'delivered' | 'invoiced' | 'canceled';
  createdAt: string;
}

export interface SalesInvoice {
  id: string;
  tenantId: string;
  invoiceNumber: string;
  orderId?: string;
  customerId: string;
  customerName: string;
  date: string;
  dueDate: string;
  items: SalesLineItem[];
  subtotal: number;
  taxTotal: number;
  grandTotal: number;
  amountPaid: number;
  balanceDue: number;
  status: 'draft' | 'posted' | 'partially_paid' | 'paid' | 'overdue' | 'voided';
  notes?: string;
  createdAt: string;
}

export interface PaymentReceipt {
  id: string;
  tenantId: string;
  paymentNumber: string;
  date: string;
  customerId?: string;
  customerName?: string;
  supplierId?: string;
  supplierName?: string;
  type: 'incoming' | 'outgoing';
  invoiceId?: string;
  invoiceNumber?: string;
  amount: number;
  paymentMethod: 'bank_transfer' | 'cash' | 'credit_card' | 'cheque';
  reference?: string;
  memo?: string;
  createdAt: string;
}

// ==================== PURCHASING ====================
export interface Supplier {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  contactPerson?: string;
  email: string;
  phone: string;
  address?: string;
  taxNumber?: string;
  paymentTermsDays: number;
  outstandingBalance: number;
  createdAt: string;
}

export interface PurchaseOrder {
  id: string;
  tenantId: string;
  orderNumber: string;
  supplierId: string;
  supplierName: string;
  date: string;
  expectedDate: string;
  warehouseId: string;
  warehouseName: string;
  items: SalesLineItem[];
  subtotal: number;
  taxTotal: number;
  grandTotal: number;
  status: 'draft' | 'ordered' | 'received' | 'billed' | 'canceled';
  createdAt: string;
}

// ==================== HUMAN RESOURCES ====================
export interface Employee {
  id: string;
  tenantId: string;
  employeeCode: string;
  fullName: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  joiningDate: string;
  salary: number;
  status: 'active' | 'on_leave' | 'terminated';
}

export interface AttendanceRecord {
  id: string;
  tenantId: string;
  employeeId: string;
  employeeName: string;
  date: string;
  status: 'present' | 'absent' | 'leave' | 'half_day';
  checkIn?: string;
  checkOut?: string;
}

export interface LeaveRequest {
  id: string;
  tenantId: string;
  employeeId: string;
  employeeName: string;
  leaveType: 'annual' | 'sick' | 'unpaid' | 'emergency';
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  appliedAt: string;
}

// ==================== PROJECTS ====================
export interface Project {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  customerId?: string;
  customerName?: string;
  status: 'planning' | 'in_progress' | 'completed' | 'on_hold';
  startDate: string;
  deadline?: string;
  budget: number;
  actualCost: number;
}

export interface ProjectTask {
  id: string;
  tenantId: string;
  projectId: string;
  title: string;
  assignedTo?: string;
  status: 'todo' | 'in_progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
}

export interface Timesheet {
  id: string;
  tenantId: string;
  projectId: string;
  projectName: string;
  employeeName: string;
  date: string;
  hours: number;
  activity: string;
  billable: boolean;
  ratePerHour: number;
}
