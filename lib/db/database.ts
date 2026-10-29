// BizChefs ERP - Relational Engine & Multi-Tenant Data Store
import {
  Tenant,
  UserProfile,
  Account,
  JournalEntry,
  Customer,
  SalesInvoice,
  PaymentReceipt,
  Warehouse,
  Item,
  StockMovement,
  Supplier,
  PurchaseOrder,
  Employee,
  AttendanceRecord,
  LeaveRequest,
  Project,
  ProjectTask,
  Timesheet,
  AuditLog,
  DocumentSequence,
  Quotation,
  SalesOrder
} from '../types/erp';
import { validateJournalEntryBalance, roundCurrency } from '../erp/accounting-rules';
import { formatDocumentNumber } from '../erp/numbering-rules';

const STORAGE_KEY = 'bizchefs_erp_database_v1';

export interface ERPDatabaseState {
  activeTenantId: string;
  currentUser: UserProfile;
  tenants: Tenant[];
  sequences: DocumentSequence[];
  accounts: Account[];
  journalEntries: JournalEntry[];
  customers: Customer[];
  quotations: Quotation[];
  salesOrders: SalesOrder[];
  salesInvoices: SalesInvoice[];
  payments: PaymentReceipt[];
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  warehouses: Warehouse[];
  items: Item[];
  stockMovements: StockMovement[];
  employees: Employee[];
  attendance: AttendanceRecord[];
  leaveRequests: LeaveRequest[];
  projects: Project[];
  tasks: ProjectTask[];
  timesheets: Timesheet[];
  auditLogs: AuditLog[];
}

const DEFAULT_TENANTS: Tenant[] = [
  {
    id: 'tenant-bizchefs-primary',
    name: 'BizChefs Digital & Technology Practice',
    slug: 'bizchefs-primary',
    industry: 'Technology & Enterprise Software',
    settings: {
      baseCurrency: 'USD',
      dateFormat: 'YYYY-MM-DD',
      timezone: 'Africa/Cairo',
      fiscalYearStartMonth: 1,
      taxNumber: 'EG-TR-8941029',
      address: '22 Tech Boulevard, Maadi',
      city: 'Cairo',
      country: 'Egypt',
      phone: '+20 128 171 9903',
      email: 'contact@bizchefs.com',
      website: 'https://bizchefs.com',
      logoUrl: '/BizChefs-emblem-transparent.png'
    },
    subscription: {
      plan: 'enterprise',
      status: 'active',
      validUntil: '2027-12-31T23:59:59Z',
      maxUsers: 50,
      maxInvoicesPerMonth: 5000
    },
    createdAt: '2026-01-01T08:00:00Z'
  },
  {
    id: 'tenant-culinary-venture',
    name: 'Vance Artisanal Food & Culinary Studio',
    slug: 'vance-culinary',
    industry: 'Food & Beverage',
    settings: {
      baseCurrency: 'USD',
      dateFormat: 'YYYY-MM-DD',
      timezone: 'America/New_York',
      fiscalYearStartMonth: 1,
      taxNumber: 'US-EIN-4491028',
      address: '450 Lexington Ave, Suite 1200',
      city: 'New York',
      country: 'United States',
      phone: '+1 212 555 0198',
      email: 'finance@vancestudios.com',
      website: 'https://vancestudios.com'
    },
    subscription: {
      plan: 'growth',
      status: 'active',
      validUntil: '2027-06-30T23:59:59Z',
      maxUsers: 15,
      maxInvoicesPerMonth: 1000
    },
    createdAt: '2026-02-15T10:00:00Z'
  }
];

const DEFAULT_USER: UserProfile = {
  id: 'usr-admin-01',
  email: 'sardenafisher@gmail.com',
  fullName: 'Sardena Fisher (Lead Architect)',
  isPlatformAdmin: true,
  tenantMemberships: [
    { tenantId: 'tenant-bizchefs-primary', tenantName: 'BizChefs Digital & Technology Practice', role: 'super_admin' },
    { tenantId: 'tenant-culinary-venture', tenantName: 'Vance Artisanal Food & Culinary Studio', role: 'tenant_admin' }
  ]
};

const DEFAULT_ACCOUNTS_SEED: Omit<Account, 'id' | 'tenantId'>[] = [
  { code: '1010', name: 'Operating Bank Account (Cash & Equivalents)', type: 'asset', currency: 'USD', balance: 48500 },
  { code: '1200', name: 'Accounts Receivable (Trade Debtors)', type: 'asset', currency: 'USD', balance: 14200 },
  { code: '1300', name: 'Merchandise & Finished Goods Inventory', type: 'asset', currency: 'USD', balance: 18400 },
  { code: '1500', name: 'Computer & Hardware Equipment', type: 'asset', currency: 'USD', balance: 12000 },
  { code: '2010', name: 'Accounts Payable (Trade Creditors)', type: 'liability', currency: 'USD', balance: 8600 },
  { code: '2100', name: 'Sales Tax & VAT Payable (14%)', type: 'liability', currency: 'USD', balance: 2450 },
  { code: '3010', name: 'Owner Equity & Paid-in Capital', type: 'equity', currency: 'USD', balance: 60000 },
  { code: '3020', name: 'Retained Earnings', type: 'equity', currency: 'USD', balance: 12050 },
  { code: '4010', name: 'Web Engineering & Custom Software Revenue', type: 'income', currency: 'USD', balance: 34800 },
  { code: '4020', name: 'Monthly Website Care & Maintenance Plans', type: 'income', currency: 'USD', balance: 9600 },
  { code: '5010', name: 'Cloud Infrastructure & Server Costs', type: 'expense', currency: 'USD', balance: 4100 },
  { code: '6010', name: 'Staff Salaries & Professional Contractor Fees', type: 'expense', currency: 'USD', balance: 18200 },
  { code: '6020', name: 'Office Rent & Commercial Utilities', type: 'expense', currency: 'USD', balance: 2500 }
];

function createInitialState(): ERPDatabaseState {
  const tenantId = DEFAULT_TENANTS[0].id;
  const t2Id = DEFAULT_TENANTS[1].id;

  const accounts: Account[] = [
    ...DEFAULT_ACCOUNTS_SEED.map((a, idx) => ({ ...a, id: `acc-t1-${idx}`, tenantId })),
    ...DEFAULT_ACCOUNTS_SEED.map((a, idx) => ({ ...a, id: `acc-t2-${idx}`, tenantId: t2Id }))
  ];

  const sequences: DocumentSequence[] = [
    { id: 'seq-inv-t1', tenantId, documentType: 'sales_invoice', prefix: 'INV', nextNumber: 104, numberPadding: 4 },
    { id: 'seq-quot-t1', tenantId, documentType: 'quotation', prefix: 'QT', nextNumber: 105, numberPadding: 4 },
    { id: 'seq-so-t1', tenantId, documentType: 'sales_order', prefix: 'SO', nextNumber: 102, numberPadding: 4 },
    { id: 'seq-po-t1', tenantId, documentType: 'purchase_order', prefix: 'PO', nextNumber: 103, numberPadding: 4 },
    { id: 'seq-jv-t1', tenantId, documentType: 'journal_entry', prefix: 'JV', nextNumber: 201, numberPadding: 4 },
    { id: 'seq-pay-t1', tenantId, documentType: 'payment', prefix: 'RCT', nextNumber: 105, numberPadding: 4 },
    // Tenant 2 sequences
    { id: 'seq-inv-t2', tenantId: t2Id, documentType: 'sales_invoice', prefix: 'VNC-INV', nextNumber: 1, numberPadding: 4 },
    { id: 'seq-jv-t2', tenantId: t2Id, documentType: 'journal_entry', prefix: 'VNC-JV', nextNumber: 1, numberPadding: 4 }
  ];

  const warehouses: Warehouse[] = [
    { id: 'wh-main', tenantId, code: 'WH-MAIN', name: 'Cairo Central Technology Depot', location: 'Maadi Tech Zone, Cairo', isDefault: true },
    { id: 'wh-alex', tenantId, code: 'WH-ALX', name: 'Alexandria Logistics Hub', location: 'Smouha Industrial District', isDefault: false },
    { id: 'wh-nyc', tenantId: t2Id, code: 'WH-NYC', name: 'Manhattan Commissary Kitchen', location: 'Chelsea, New York', isDefault: true }
  ];

  const items: Item[] = [
    {
      id: 'item-web-sprint',
      tenantId,
      sku: 'SRV-WEB-DEV',
      name: 'Custom Web Application Design & Dev Sprint',
      category: 'Software Services',
      uom: 'sprint',
      unitPrice: 2400,
      costPrice: 900,
      taxRate: 14,
      reorderPoint: 0,
      description: 'Full-stack responsive web development with React, TypeScript and database integration'
    },
    {
      id: 'item-care-monthly',
      tenantId,
      sku: 'SRV-CARE-MO',
      name: 'Monthly Dedicated Website Care & Security',
      category: 'Care Plans',
      uom: 'month',
      unitPrice: 350,
      costPrice: 80,
      taxRate: 14,
      reorderPoint: 0,
      description: 'Continuous uptime monitoring, backups, vulnerability patching, and minor iterations'
    },
    {
      id: 'item-tablet-pos',
      tenantId,
      sku: 'HW-TAB-POS',
      name: 'BizChefs POS Touchscreen Terminal (10.1")',
      category: 'Hardware',
      uom: 'pcs',
      unitPrice: 480,
      costPrice: 290,
      taxRate: 14,
      reorderPoint: 5,
      barcode: '6221049281029',
      description: 'High-durability commercial touchscreen terminal for kitchen and order operations'
    },
    {
      id: 'item-kitchen-printer',
      tenantId,
      sku: 'HW-PRN-KITCHEN',
      name: 'Heavy-Duty Thermal Ticket Printer',
      category: 'Hardware',
      uom: 'pcs',
      unitPrice: 220,
      costPrice: 130,
      taxRate: 14,
      reorderPoint: 4,
      barcode: '6221049281036',
      description: 'High-speed ethernet and USB thermal kitchen ticket printer with buzzer'
    }
  ];

  const stockMovements: StockMovement[] = [
    {
      id: 'sm-01',
      tenantId,
      date: '2026-10-01',
      itemId: 'item-tablet-pos',
      itemSku: 'HW-TAB-POS',
      itemName: 'BizChefs POS Touchscreen Terminal (10.1")',
      warehouseId: 'wh-main',
      warehouseName: 'Cairo Central Technology Depot',
      movementType: 'receipt',
      quantity: 35,
      unitCost: 290,
      totalValue: 10150,
      notes: 'Initial production shipment received from manufacturing',
      createdAt: '2026-10-01T09:00:00Z'
    },
    {
      id: 'sm-02',
      tenantId,
      date: '2026-10-02',
      itemId: 'item-kitchen-printer',
      itemSku: 'HW-PRN-KITCHEN',
      itemName: 'Heavy-Duty Thermal Ticket Printer',
      warehouseId: 'wh-main',
      warehouseName: 'Cairo Central Technology Depot',
      movementType: 'receipt',
      quantity: 40,
      unitCost: 130,
      totalValue: 5200,
      notes: 'Initial warehouse stocking order',
      createdAt: '2026-10-02T10:00:00Z'
    },
    {
      id: 'sm-03',
      tenantId,
      date: '2026-10-10',
      itemId: 'item-tablet-pos',
      itemSku: 'HW-TAB-POS',
      itemName: 'BizChefs POS Touchscreen Terminal (10.1")',
      warehouseId: 'wh-main',
      warehouseName: 'Cairo Central Technology Depot',
      toWarehouseId: 'wh-alex',
      toWarehouseName: 'Alexandria Logistics Hub',
      movementType: 'transfer',
      quantity: 10,
      unitCost: 290,
      totalValue: 2900,
      notes: 'Replenishment transfer to Alexandria Hub',
      createdAt: '2026-10-10T14:30:00Z'
    }
  ];

  const customers: Customer[] = [
    {
      id: 'cust-01',
      tenantId,
      code: 'CUST-001',
      name: 'Artisan Kitchens & Cafe Group',
      contactPerson: 'Chef Tarek Nour',
      email: 'tarek@artisankitchens.com',
      phone: '+20 100 456 7890',
      address: '15 El-Gezira St, Zamalek, Cairo',
      taxNumber: 'EG-TX-399182',
      creditLimit: 15000,
      paymentTermsDays: 30,
      outstandingBalance: 3200,
      createdAt: '2026-03-01T10:00:00Z'
    },
    {
      id: 'cust-02',
      tenantId,
      code: 'CUST-002',
      name: 'Nile Hospitality Ventures',
      contactPerson: 'Laila Mostafa',
      email: 'laila@nilehospitality.com',
      phone: '+20 122 345 6789',
      address: 'Corniche El Nile, Maadi, Cairo',
      taxNumber: 'EG-TX-882710',
      creditLimit: 30000,
      paymentTermsDays: 45,
      outstandingBalance: 6400,
      createdAt: '2026-04-12T11:00:00Z'
    },
    {
      id: 'cust-03',
      tenantId,
      code: 'CUST-003',
      name: 'Red Sea Gourmet Bistro',
      contactPerson: 'Karim Mansour',
      email: 'karim@redseabistro.com',
      phone: '+20 106 789 0123',
      address: 'Sheraton Road, Hurghada',
      taxNumber: 'EG-TX-551029',
      creditLimit: 10000,
      paymentTermsDays: 15,
      outstandingBalance: 0,
      createdAt: '2026-05-20T14:00:00Z'
    }
  ];

  const quotations: Quotation[] = [
    {
      id: 'qt-101',
      tenantId,
      quotationNumber: 'QT-0101',
      customerId: 'cust-01',
      customerName: 'Artisan Kitchens & Cafe Group',
      date: '2026-10-15',
      validUntil: '2026-11-15',
      items: [
        {
          id: 'qli-01',
          itemId: 'item-web-sprint',
          itemSku: 'SRV-WEB-DEV',
          itemName: 'Custom Web Application Design & Dev Sprint',
          uom: 'sprint',
          quantity: 2,
          unitPrice: 2400,
          taxRate: 14,
          taxAmount: 672,
          lineTotal: 5472
        }
      ],
      subtotal: 4800,
      taxTotal: 672,
      grandTotal: 5472,
      status: 'accepted',
      notes: 'Customer approved quotation for Q4 digital expansion',
      createdAt: '2026-10-15T10:00:00Z'
    }
  ];

  const salesOrders: SalesOrder[] = [
    {
      id: 'so-101',
      tenantId,
      orderNumber: 'SO-0101',
      quotationId: 'qt-101',
      customerId: 'cust-01',
      customerName: 'Artisan Kitchens & Cafe Group',
      date: '2026-10-16',
      deliveryDate: '2026-11-10',
      items: [
        {
          id: 'sli-01',
          itemId: 'item-web-sprint',
          itemSku: 'SRV-WEB-DEV',
          itemName: 'Custom Web Application Design & Dev Sprint',
          uom: 'sprint',
          quantity: 2,
          unitPrice: 2400,
          taxRate: 14,
          taxAmount: 672,
          lineTotal: 5472
        }
      ],
      subtotal: 4800,
      taxTotal: 672,
      grandTotal: 5472,
      status: 'confirmed',
      createdAt: '2026-10-16T11:00:00Z'
    }
  ];

  const salesInvoices: SalesInvoice[] = [
    {
      id: 'inv-101',
      tenantId,
      invoiceNumber: 'INV-0101',
      orderId: 'so-101',
      customerId: 'cust-01',
      customerName: 'Artisan Kitchens & Cafe Group',
      date: '2026-10-18',
      dueDate: '2026-11-18',
      items: [
        {
          id: 'ili-01',
          itemId: 'item-web-sprint',
          itemSku: 'SRV-WEB-DEV',
          itemName: 'Custom Web Application Design & Dev Sprint',
          uom: 'sprint',
          quantity: 1,
          unitPrice: 2400,
          taxRate: 14,
          taxAmount: 336,
          lineTotal: 2736
        },
        {
          id: 'ili-02',
          itemId: 'item-tablet-pos',
          itemSku: 'HW-TAB-POS',
          itemName: 'BizChefs POS Touchscreen Terminal (10.1")',
          uom: 'pcs',
          quantity: 1,
          unitPrice: 480,
          taxRate: 14,
          taxAmount: 67.2,
          lineTotal: 547.2
        }
      ],
      subtotal: 2880,
      taxTotal: 403.2,
      grandTotal: 3283.2,
      amountPaid: 1000,
      balanceDue: 2283.2,
      status: 'partially_paid',
      notes: 'Initial 30% milestone deposit received.',
      createdAt: '2026-10-18T12:00:00Z'
    },
    {
      id: 'inv-102',
      tenantId,
      invoiceNumber: 'INV-0102',
      customerId: 'cust-02',
      customerName: 'Nile Hospitality Ventures',
      date: '2026-10-20',
      dueDate: '2026-11-20',
      items: [
        {
          id: 'ili-03',
          itemId: 'item-care-monthly',
          itemSku: 'SRV-CARE-MO',
          itemName: 'Monthly Dedicated Website Care & Security',
          uom: 'month',
          quantity: 2,
          unitPrice: 350,
          taxRate: 14,
          taxAmount: 98,
          lineTotal: 798
        }
      ],
      subtotal: 700,
      taxTotal: 98,
      grandTotal: 798,
      amountPaid: 798,
      balanceDue: 0,
      status: 'paid',
      notes: 'Paid in full via online bank transfer.',
      createdAt: '2026-10-20T15:30:00Z'
    }
  ];

  const payments: PaymentReceipt[] = [
    {
      id: 'pay-01',
      tenantId,
      paymentNumber: 'RCT-0101',
      date: '2026-10-19',
      customerId: 'cust-01',
      customerName: 'Artisan Kitchens & Cafe Group',
      type: 'incoming',
      invoiceId: 'inv-101',
      invoiceNumber: 'INV-0101',
      amount: 1000,
      paymentMethod: 'bank_transfer',
      reference: 'TXN-EGP-994012',
      memo: 'Deposit for INV-0101',
      createdAt: '2026-10-19T09:00:00Z'
    },
    {
      id: 'pay-02',
      tenantId,
      paymentNumber: 'RCT-0102',
      date: '2026-10-21',
      customerId: 'cust-02',
      customerName: 'Nile Hospitality Ventures',
      type: 'incoming',
      invoiceId: 'inv-102',
      invoiceNumber: 'INV-0102',
      amount: 798,
      paymentMethod: 'bank_transfer',
      reference: 'TXN-EGP-995182',
      memo: 'Full settlement for INV-0102',
      createdAt: '2026-10-21T16:00:00Z'
    }
  ];

  const suppliers: Supplier[] = [
    {
      id: 'sup-01',
      tenantId,
      code: 'SUP-001',
      name: 'Omni Hardware & Touchscreen Displays Ltd',
      contactPerson: 'David Chen',
      email: 'orders@omnihw.com',
      phone: '+86 755 8891 0023',
      address: 'Futian High-Tech Park, Shenzhen',
      taxNumber: 'CN-SZ-9918239',
      paymentTermsDays: 30,
      outstandingBalance: 4200,
      createdAt: '2026-02-01T09:00:00Z'
    },
    {
      id: 'sup-02',
      tenantId,
      code: 'SUP-002',
      name: 'Global Cloud Network Infrastructure',
      contactPerson: 'Sarah Jenkins',
      email: 'billing@globalcloudnet.io',
      phone: '+1 415 555 0142',
      address: '100 Market St, San Francisco, CA',
      paymentTermsDays: 15,
      outstandingBalance: 1400,
      createdAt: '2026-02-10T10:00:00Z'
    }
  ];

  const purchaseOrders: PurchaseOrder[] = [
    {
      id: 'po-101',
      tenantId,
      orderNumber: 'PO-0101',
      supplierId: 'sup-01',
      supplierName: 'Omni Hardware & Touchscreen Displays Ltd',
      date: '2026-10-05',
      expectedDate: '2026-10-28',
      warehouseId: 'wh-main',
      warehouseName: 'Cairo Central Technology Depot',
      items: [
        {
          id: 'pli-01',
          itemId: 'item-tablet-pos',
          itemSku: 'HW-TAB-POS',
          itemName: 'BizChefs POS Touchscreen Terminal (10.1")',
          uom: 'pcs',
          quantity: 20,
          unitPrice: 290,
          taxRate: 14,
          taxAmount: 812,
          lineTotal: 6612
        }
      ],
      subtotal: 5800,
      taxTotal: 812,
      grandTotal: 6612,
      status: 'received',
      createdAt: '2026-10-05T09:00:00Z'
    }
  ];

  const journalEntries: JournalEntry[] = [
    {
      id: 'jv-101',
      tenantId,
      entryNumber: 'JV-0201',
      date: '2026-10-01',
      reference: 'INIT-CAPITAL',
      memo: 'Initial business operations capitalization',
      lines: [
        { id: 'jl-01', accountId: 'acc-t1-0', accountCode: '1010', accountName: 'Operating Bank Account (Cash & Equivalents)', debit: 50000, credit: 0, memo: 'Capital deposit' },
        { id: 'jl-02', accountId: 'acc-t1-6', accountCode: '3010', accountName: "Owner Equity & Paid-in Capital", debit: 0, credit: 50000, memo: 'Capital contribution' }
      ],
      totalDebit: 50000,
      totalCredit: 50000,
      status: 'posted',
      createdAt: '2026-10-01T08:00:00Z',
      postedAt: '2026-10-01T08:05:00Z'
    },
    {
      id: 'jv-102',
      tenantId,
      entryNumber: 'JV-0202',
      date: '2026-10-18',
      reference: 'INV-0101',
      memo: 'Sales Invoice INV-0101 revenue and tax recognition',
      lines: [
        { id: 'jl-03', accountId: 'acc-t1-1', accountCode: '1200', accountName: 'Accounts Receivable (Trade Debtors)', debit: 3283.2, credit: 0, memo: 'Invoice receivable' },
        { id: 'jl-04', accountId: 'acc-t1-8', accountCode: '4010', accountName: 'Web Engineering & Custom Software Revenue', debit: 0, credit: 2880, memo: 'Revenue recognition' },
        { id: 'jl-05', accountId: 'acc-t1-5', accountCode: '2100', accountName: 'Sales Tax & VAT Payable (14%)', debit: 0, credit: 403.2, memo: 'VAT liability' }
      ],
      totalDebit: 3283.2,
      totalCredit: 3283.2,
      status: 'posted',
      createdAt: '2026-10-18T12:05:00Z',
      postedAt: '2026-10-18T12:05:00Z'
    }
  ];

  const employees: Employee[] = [
    {
      id: 'emp-01',
      tenantId,
      employeeCode: 'EMP-001',
      fullName: 'Youssef El-Sayed',
      email: 'youssef@bizchefs.com',
      phone: '+20 111 234 5678',
      department: 'Engineering & Development',
      position: 'Senior Full-Stack Engineer',
      joiningDate: '2025-06-01',
      salary: 3200,
      status: 'active'
    },
    {
      id: 'emp-02',
      tenantId,
      employeeCode: 'EMP-002',
      fullName: 'Nouran Halim',
      email: 'nouran@bizchefs.com',
      phone: '+20 122 890 1234',
      department: 'Finance & Accounting',
      position: 'Senior Financial Controller',
      joiningDate: '2025-08-15',
      salary: 2800,
      status: 'active'
    },
    {
      id: 'emp-03',
      tenantId,
      employeeCode: 'EMP-003',
      fullName: 'Omar El-Gohary',
      email: 'omar@bizchefs.com',
      phone: '+20 100 998 7766',
      department: 'Operations & Logistics',
      position: 'Warehouse & Inventory Lead',
      joiningDate: '2025-11-01',
      salary: 2100,
      status: 'active'
    }
  ];

  const attendance: AttendanceRecord[] = [
    { id: 'att-01', tenantId, employeeId: 'emp-01', employeeName: 'Youssef El-Sayed', date: '2026-10-28', status: 'present', checkIn: '09:02 AM', checkOut: '06:10 PM' },
    { id: 'att-02', tenantId, employeeId: 'emp-02', employeeName: 'Nouran Halim', date: '2026-10-28', status: 'present', checkIn: '08:55 AM', checkOut: '05:30 PM' },
    { id: 'att-03', tenantId, employeeId: 'emp-03', employeeName: 'Omar El-Gohary', date: '2026-10-28', status: 'present', checkIn: '08:45 AM', checkOut: '05:00 PM' }
  ];

  const leaveRequests: LeaveRequest[] = [
    {
      id: 'lvr-01',
      tenantId,
      employeeId: 'emp-01',
      employeeName: 'Youssef El-Sayed',
      leaveType: 'annual',
      startDate: '2026-11-14',
      endDate: '2026-11-18',
      days: 5,
      reason: 'Annual family holiday',
      status: 'approved',
      appliedAt: '2026-10-22T10:00:00Z'
    }
  ];

  const projects: Project[] = [
    {
      id: 'prj-01',
      tenantId,
      code: 'PRJ-2026-01',
      name: 'Artisan Kitchens Omni-Channel Portal',
      customerId: 'cust-01',
      customerName: 'Artisan Kitchens & Cafe Group',
      status: 'in_progress',
      startDate: '2026-10-15',
      deadline: '2026-12-15',
      budget: 8500,
      actualCost: 2600
    },
    {
      id: 'prj-02',
      tenantId,
      code: 'PRJ-2026-02',
      name: 'Nile Hospitality POS Hardware Rollout',
      customerId: 'cust-02',
      customerName: 'Nile Hospitality Ventures',
      status: 'planning',
      startDate: '2026-11-01',
      deadline: '2026-12-01',
      budget: 12000,
      actualCost: 950
    }
  ];

  const tasks: ProjectTask[] = [
    { id: 'tsk-01', tenantId, projectId: 'prj-01', title: 'Connect Supabase Auth & Multi-branch RBAC', status: 'done', priority: 'high', assignedTo: 'Youssef El-Sayed', dueDate: '2026-10-25' },
    { id: 'tsk-02', tenantId, projectId: 'prj-01', title: 'Implement Kitchen Display System (KDS) live sync', status: 'in_progress', priority: 'high', assignedTo: 'Youssef El-Sayed', dueDate: '2026-11-05' },
    { id: 'tsk-03', tenantId, projectId: 'prj-02', title: 'Hardware staging and barcode scanner calibration', status: 'todo', priority: 'medium', assignedTo: 'Omar El-Gohary', dueDate: '2026-11-02' }
  ];

  const timesheets: Timesheet[] = [
    { id: 'ts-01', tenantId, projectId: 'prj-01', projectName: 'Artisan Kitchens Omni-Channel Portal', employeeName: 'Youssef El-Sayed', date: '2026-10-27', hours: 7.5, activity: 'Frontend architecture and database schema integration', billable: true, ratePerHour: 75 }
  ];

  const auditLogs: AuditLog[] = [
    {
      id: 'log-01',
      tenantId,
      userId: DEFAULT_USER.id,
      userEmail: DEFAULT_USER.email,
      action: 'SYSTEM_INITIALIZED',
      entityType: 'TENANT',
      entityId: tenantId,
      details: 'BizChefs ERP database established with multi-tenant architecture and RLS security policies.',
      createdAt: '2026-10-01T08:00:00Z'
    },
    {
      id: 'log-02',
      tenantId,
      userId: DEFAULT_USER.id,
      userEmail: DEFAULT_USER.email,
      action: 'INVOICE_POSTED',
      entityType: 'SALES_INVOICE',
      entityId: 'inv-101',
      details: 'Posted sales invoice INV-0101 and generated balanced journal entry JV-0202.',
      createdAt: '2026-10-18T12:05:00Z'
    }
  ];

  return {
    activeTenantId: tenantId,
    currentUser: DEFAULT_USER,
    tenants: DEFAULT_TENANTS,
    sequences,
    accounts,
    journalEntries,
    customers,
    quotations,
    salesOrders,
    salesInvoices,
    payments,
    suppliers,
    purchaseOrders,
    warehouses,
    items,
    stockMovements,
    employees,
    attendance,
    leaveRequests,
    projects,
    tasks,
    timesheets,
    auditLogs
  };
}

class ERPDatabase {
  private state: ERPDatabaseState;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.state = this.loadState();
  }

  private loadState(): ERPDatabaseState {
    if (typeof window === 'undefined') {
      return createInitialState();
    }

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.tenants && parsed.accounts && parsed.activeTenantId) {
          return parsed;
        }
      }
    } catch {
      // In case of parsing error, return pristine state
    }

    const initial = createInitialState();
    this.persist(initial);
    return initial;
  }

  private persist(state: ERPDatabaseState = this.state): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch (err) {
        console.error('Failed to persist ERP database to storage:', err);
      }
    }
    this.notify();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach(fn => fn());
  }

  // ==================== TENANT & SESSION ====================
  public getState(): ERPDatabaseState {
    return this.state;
  }

  public getActiveTenant(): Tenant {
    const tenant = this.state.tenants.find(t => t.id === this.state.activeTenantId);
    return tenant || this.state.tenants[0];
  }

  public switchTenant(tenantId: string): boolean {
    const exists = this.state.tenants.some(t => t.id === tenantId);
    if (!exists) return false;
    this.state.activeTenantId = tenantId;
    this.logAudit('TENANT_SWITCHED', 'TENANT', tenantId, `Active company switched to ${tenantId}`);
    this.persist();
    return true;
  }

  public registerNewTenant(name: string, currency: string, timezone: string, taxNumber: string, industry: string): Tenant {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const newTenant: Tenant = {
      id: `tenant-${Date.now()}`,
      name,
      slug: `${slug}-${Math.floor(Math.random() * 1000)}`,
      industry: industry || 'General Business',
      settings: {
        baseCurrency: currency || 'USD',
        dateFormat: 'YYYY-MM-DD',
        timezone: timezone || 'UTC',
        fiscalYearStartMonth: 1,
        taxNumber
      },
      subscription: {
        plan: 'starter',
        status: 'active',
        validUntil: '2027-12-31T23:59:59Z',
        maxUsers: 5,
        maxInvoicesPerMonth: 200
      },
      createdAt: new Date().toISOString()
    };

    this.state.tenants.push(newTenant);

    // Initialize Chart of Accounts for new tenant
    const newAccounts: Account[] = DEFAULT_ACCOUNTS_SEED.map((a, idx) => ({
      ...a,
      id: `acc-${newTenant.id}-${idx}`,
      tenantId: newTenant.id,
      currency,
      balance: 0
    }));
    this.state.accounts.push(...newAccounts);

    // Initialize default warehouse
    const newWh: Warehouse = {
      id: `wh-${newTenant.id}-1`,
      tenantId: newTenant.id,
      code: 'WH-MAIN',
      name: `${name} Main Facility`,
      isDefault: true
    };
    this.state.warehouses.push(newWh);

    // Initialize default sequences
    const seqs: DocumentSequence[] = [
      { id: `seq-inv-${newTenant.id}`, tenantId: newTenant.id, documentType: 'sales_invoice', prefix: 'INV', nextNumber: 1, numberPadding: 4 },
      { id: `seq-qt-${newTenant.id}`, tenantId: newTenant.id, documentType: 'quotation', prefix: 'QT', nextNumber: 1, numberPadding: 4 },
      { id: `seq-so-${newTenant.id}`, tenantId: newTenant.id, documentType: 'sales_order', prefix: 'SO', nextNumber: 1, numberPadding: 4 },
      { id: `seq-po-${newTenant.id}`, tenantId: newTenant.id, documentType: 'purchase_order', prefix: 'PO', nextNumber: 1, numberPadding: 4 },
      { id: `seq-jv-${newTenant.id}`, tenantId: newTenant.id, documentType: 'journal_entry', prefix: 'JV', nextNumber: 1, numberPadding: 4 },
      { id: `seq-pay-${newTenant.id}`, tenantId: newTenant.id, documentType: 'payment', prefix: 'RCT', nextNumber: 1, numberPadding: 4 }
    ];
    this.state.sequences.push(...seqs);

    // Add membership to current user
    this.state.currentUser.tenantMemberships.push({
      tenantId: newTenant.id,
      tenantName: newTenant.name,
      role: 'tenant_admin'
    });

    this.state.activeTenantId = newTenant.id;
    this.logAudit('TENANT_CREATED', 'TENANT', newTenant.id, `Created company "${name}" with isolated COA and sequences`);
    this.persist();
    return newTenant;
  }

  public getNextDocumentNumber(documentType: DocumentSequence['documentType']): string {
    const tenantId = this.state.activeTenantId;
    let seq = this.state.sequences.find(s => s.tenantId === tenantId && s.documentType === documentType);

    if (!seq) {
      seq = {
        id: `seq-${documentType}-${tenantId}`,
        tenantId,
        documentType,
        prefix: documentType.toUpperCase().slice(0, 3),
        nextNumber: 1,
        numberPadding: 4
      };
      this.state.sequences.push(seq);
    }

    const docNum = formatDocumentNumber(seq.prefix, seq.nextNumber, seq.numberPadding);
    seq.nextNumber += 1;
    this.persist();
    return docNum;
  }

  // ==================== AUDIT TRAIL ====================
  public logAudit(action: string, entityType: string, entityId: string, details: string): void {
    const log: AuditLog = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      tenantId: this.state.activeTenantId,
      userId: this.state.currentUser.id,
      userEmail: this.state.currentUser.email,
      action,
      entityType,
      entityId,
      details,
      createdAt: new Date().toISOString()
    };
    this.state.auditLogs.unshift(log);
  }

  // ==================== ACCOUNTING ====================
  public getAccounts(): Account[] {
    return this.state.accounts.filter(a => a.tenantId === this.state.activeTenantId);
  }

  public getJournalEntries(): JournalEntry[] {
    return this.state.journalEntries.filter(j => j.tenantId === this.state.activeTenantId);
  }

  public postJournalEntry(entry: Omit<JournalEntry, 'id' | 'tenantId' | 'status' | 'createdAt' | 'postedAt' | 'totalDebit' | 'totalCredit'>): { success: boolean; error?: string; entry?: JournalEntry } {
    const validation = validateJournalEntryBalance(entry.lines);
    if (!validation.isValid) {
      return { success: false, error: validation.error };
    }

    const newEntry: JournalEntry = {
      id: `jv-${Date.now()}`,
      tenantId: this.state.activeTenantId,
      entryNumber: entry.entryNumber || this.getNextDocumentNumber('journal_entry'),
      date: entry.date,
      reference: entry.reference,
      memo: entry.memo,
      lines: entry.lines,
      totalDebit: validation.totalDebit,
      totalCredit: validation.totalCredit,
      status: 'posted',
      createdAt: new Date().toISOString(),
      postedAt: new Date().toISOString()
    };

    // Update account balances
    for (const line of newEntry.lines) {
      const acc = this.state.accounts.find(a => a.id === line.accountId || a.code === line.accountCode);
      if (acc) {
        if (acc.type === 'asset' || acc.type === 'expense') {
          acc.balance = roundCurrency(acc.balance + line.debit - line.credit);
        } else {
          // Liabilities, Equity, Income increase with Credit
          acc.balance = roundCurrency(acc.balance + line.credit - line.debit);
        }
      }
    }

    this.state.journalEntries.unshift(newEntry);
    this.logAudit('JOURNAL_POSTED', 'JOURNAL_ENTRY', newEntry.entryNumber, `Posted entry for ${newEntry.memo} with total ${validation.totalDebit}`);
    this.persist();
    return { success: true, entry: newEntry };
  }

  // ==================== SALES & CRM ====================
  public getCustomers(): Customer[] {
    return this.state.customers.filter(c => c.tenantId === this.state.activeTenantId);
  }

  public addCustomer(data: Omit<Customer, 'id' | 'tenantId' | 'outstandingBalance' | 'createdAt'>): Customer {
    const customer: Customer = {
      ...data,
      id: `cust-${Date.now()}`,
      tenantId: this.state.activeTenantId,
      outstandingBalance: 0,
      createdAt: new Date().toISOString()
    };
    this.state.customers.push(customer);
    this.logAudit('CUSTOMER_CREATED', 'CUSTOMER', customer.id, `Created customer ${customer.name}`);
    this.persist();
    return customer;
  }

  public getQuotations(): Quotation[] {
    return this.state.quotations.filter(q => q.tenantId === this.state.activeTenantId);
  }

  public addQuotation(data: Omit<Quotation, 'id' | 'tenantId' | 'quotationNumber' | 'createdAt'>): Quotation {
    const quotation: Quotation = {
      ...data,
      id: `qt-${Date.now()}`,
      tenantId: this.state.activeTenantId,
      quotationNumber: this.getNextDocumentNumber('quotation'),
      createdAt: new Date().toISOString()
    };
    this.state.quotations.unshift(quotation);
    this.logAudit('QUOTATION_CREATED', 'QUOTATION', quotation.quotationNumber, `Created quotation for ${quotation.customerName}`);
    this.persist();
    return quotation;
  }

  public convertQuotationToInvoice(quotationId: string): SalesInvoice | null {
    const q = this.state.quotations.find(item => item.id === quotationId);
    if (!q) return null;

    const invoice: SalesInvoice = {
      id: `inv-${Date.now()}`,
      tenantId: this.state.activeTenantId,
      invoiceNumber: this.getNextDocumentNumber('sales_invoice'),
      customerId: q.customerId,
      customerName: q.customerName,
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0],
      items: q.items,
      subtotal: q.subtotal,
      taxTotal: q.taxTotal,
      grandTotal: q.grandTotal,
      amountPaid: 0,
      balanceDue: q.grandTotal,
      status: 'posted',
      notes: `Converted from quotation ${q.quotationNumber}`,
      createdAt: new Date().toISOString()
    };

    q.status = 'ordered';
    this.state.salesInvoices.unshift(invoice);

    // Update customer outstanding balance
    const cust = this.state.customers.find(c => c.id === invoice.customerId);
    if (cust) {
      cust.outstandingBalance = roundCurrency(cust.outstandingBalance + invoice.grandTotal);
    }

    // Auto-create balanced journal entry
    const accounts = this.getAccounts();
    const arAcc = accounts.find(a => a.code === '1200') || accounts.find(a => a.type === 'asset');
    const revAcc = accounts.find(a => a.code === '4010') || accounts.find(a => a.type === 'income');
    const taxAcc = accounts.find(a => a.code === '2100') || accounts.find(a => a.type === 'liability');

    if (arAcc && revAcc) {
      const lines = [
        {
          id: `jl-${Date.now()}-1`,
          accountId: arAcc.id,
          accountCode: arAcc.code,
          accountName: arAcc.name,
          debit: invoice.grandTotal,
          credit: 0,
          memo: `Receivable from ${invoice.customerName}`
        },
        {
          id: `jl-${Date.now()}-2`,
          accountId: revAcc.id,
          accountCode: revAcc.code,
          accountName: revAcc.name,
          debit: 0,
          credit: invoice.subtotal,
          memo: `Sales revenue for ${invoice.invoiceNumber}`
        }
      ];

      if (invoice.taxTotal > 0 && taxAcc) {
        lines.push({
          id: `jl-${Date.now()}-3`,
          accountId: taxAcc.id,
          accountCode: taxAcc.code,
          accountName: taxAcc.name,
          debit: 0,
          credit: invoice.taxTotal,
          memo: `Output VAT on ${invoice.invoiceNumber}`
        });
      }

      this.postJournalEntry({
        entryNumber: this.getNextDocumentNumber('journal_entry'),
        date: invoice.date,
        reference: invoice.invoiceNumber,
        memo: `Auto-posting for Sales Invoice ${invoice.invoiceNumber}`,
        lines
      });
    }

    this.logAudit('INVOICE_CREATED', 'SALES_INVOICE', invoice.invoiceNumber, `Generated from quotation ${q.quotationNumber}`);
    this.persist();
    return invoice;
  }

  public getSalesInvoices(): SalesInvoice[] {
    return this.state.salesInvoices.filter(i => i.tenantId === this.state.activeTenantId);
  }

  public createSalesInvoice(data: Omit<SalesInvoice, 'id' | 'tenantId' | 'invoiceNumber' | 'createdAt' | 'amountPaid' | 'balanceDue' | 'status'>): SalesInvoice {
    const invoiceNumber = this.getNextDocumentNumber('sales_invoice');
    const invoice: SalesInvoice = {
      ...data,
      id: `inv-${Date.now()}`,
      tenantId: this.state.activeTenantId,
      invoiceNumber,
      amountPaid: 0,
      balanceDue: data.grandTotal,
      status: 'posted',
      createdAt: new Date().toISOString()
    };

    this.state.salesInvoices.unshift(invoice);

    // Update customer outstanding balance
    const cust = this.state.customers.find(c => c.id === invoice.customerId);
    if (cust) {
      cust.outstandingBalance = roundCurrency(cust.outstandingBalance + invoice.grandTotal);
    }

    // Auto-create balanced journal entry
    const accounts = this.getAccounts();
    const arAcc = accounts.find(a => a.code === '1200') || accounts.find(a => a.type === 'asset');
    const revAcc = accounts.find(a => a.code === '4010') || accounts.find(a => a.type === 'income');
    const taxAcc = accounts.find(a => a.code === '2100') || accounts.find(a => a.type === 'liability');

    if (arAcc && revAcc) {
      const lines = [
        {
          id: `jl-${Date.now()}-1`,
          accountId: arAcc.id,
          accountCode: arAcc.code,
          accountName: arAcc.name,
          debit: invoice.grandTotal,
          credit: 0,
          memo: `Receivable from ${invoice.customerName}`
        },
        {
          id: `jl-${Date.now()}-2`,
          accountId: revAcc.id,
          accountCode: revAcc.code,
          accountName: revAcc.name,
          debit: 0,
          credit: invoice.subtotal,
          memo: `Sales revenue for ${invoice.invoiceNumber}`
        }
      ];

      if (invoice.taxTotal > 0 && taxAcc) {
        lines.push({
          id: `jl-${Date.now()}-3`,
          accountId: taxAcc.id,
          accountCode: taxAcc.code,
          accountName: taxAcc.name,
          debit: 0,
          credit: invoice.taxTotal,
          memo: `Output VAT on ${invoice.invoiceNumber}`
        });
      }

      this.postJournalEntry({
        entryNumber: this.getNextDocumentNumber('journal_entry'),
        date: invoice.date,
        reference: invoice.invoiceNumber,
        memo: `Auto-posting for Sales Invoice ${invoice.invoiceNumber}`,
        lines
      });
    }

    this.logAudit('INVOICE_CREATED', 'SALES_INVOICE', invoice.invoiceNumber, `Created invoice for ${invoice.customerName} total ${invoice.grandTotal}`);
    this.persist();
    return invoice;
  }

  public recordInvoicePayment(invoiceId: string, amount: number, paymentMethod: PaymentReceipt['paymentMethod'], reference?: string): PaymentReceipt | null {
    const inv = this.state.salesInvoices.find(i => i.id === invoiceId);
    if (!inv || amount <= 0) return null;

    const actualAmount = Math.min(amount, inv.balanceDue);
    inv.amountPaid = roundCurrency(inv.amountPaid + actualAmount);
    inv.balanceDue = roundCurrency(Math.max(0, inv.grandTotal - inv.amountPaid));
    inv.status = inv.balanceDue === 0 ? 'paid' : 'partially_paid';

    // Update customer outstanding balance
    const cust = this.state.customers.find(c => c.id === inv.customerId);
    if (cust) {
      cust.outstandingBalance = roundCurrency(Math.max(0, cust.outstandingBalance - actualAmount));
    }

    const payment: PaymentReceipt = {
      id: `pay-${Date.now()}`,
      tenantId: this.state.activeTenantId,
      paymentNumber: this.getNextDocumentNumber('payment'),
      date: new Date().toISOString().split('T')[0],
      customerId: inv.customerId,
      customerName: inv.customerName,
      type: 'incoming',
      invoiceId: inv.id,
      invoiceNumber: inv.invoiceNumber,
      amount: actualAmount,
      paymentMethod,
      reference,
      memo: `Payment received for ${inv.invoiceNumber}`,
      createdAt: new Date().toISOString()
    };

    this.state.payments.unshift(payment);

    // Auto-create balanced journal entry (Debit Bank 1010, Credit AR 1200)
    const accounts = this.getAccounts();
    const bankAcc = accounts.find(a => a.code === '1010');
    const arAcc = accounts.find(a => a.code === '1200');

    if (bankAcc && arAcc) {
      this.postJournalEntry({
        entryNumber: this.getNextDocumentNumber('journal_entry'),
        date: payment.date,
        reference: payment.paymentNumber,
        memo: `Payment collection for ${inv.invoiceNumber} (${payment.paymentMethod})`,
        lines: [
          {
            id: `jl-p1-${Date.now()}`,
            accountId: bankAcc.id,
            accountCode: bankAcc.code,
            accountName: bankAcc.name,
            debit: actualAmount,
            credit: 0,
            memo: `Receipt into operating bank`
          },
          {
            id: `jl-p2-${Date.now()}`,
            accountId: arAcc.id,
            accountCode: arAcc.code,
            accountName: arAcc.name,
            debit: 0,
            credit: actualAmount,
            memo: `Clear AR for ${inv.customerName}`
          }
        ]
      });
    }

    this.logAudit('PAYMENT_RECEIVED', 'PAYMENT', payment.paymentNumber, `Received payment ${actualAmount} for invoice ${inv.invoiceNumber}`);
    this.persist();
    return payment;
  }

  // ==================== PURCHASING ====================
  public getSuppliers(): Supplier[] {
    return this.state.suppliers.filter(s => s.tenantId === this.state.activeTenantId);
  }

  public addSupplier(data: Omit<Supplier, 'id' | 'tenantId' | 'outstandingBalance' | 'createdAt'>): Supplier {
    const supplier: Supplier = {
      ...data,
      id: `sup-${Date.now()}`,
      tenantId: this.state.activeTenantId,
      outstandingBalance: 0,
      createdAt: new Date().toISOString()
    };
    this.state.suppliers.push(supplier);
    this.logAudit('SUPPLIER_CREATED', 'SUPPLIER', supplier.id, `Created supplier ${supplier.name}`);
    this.persist();
    return supplier;
  }

  public getPurchaseOrders(): PurchaseOrder[] {
    return this.state.purchaseOrders.filter(p => p.tenantId === this.state.activeTenantId);
  }

  public createPurchaseOrder(data: Omit<PurchaseOrder, 'id' | 'tenantId' | 'orderNumber' | 'createdAt'>): PurchaseOrder {
    const po: PurchaseOrder = {
      ...data,
      id: `po-${Date.now()}`,
      tenantId: this.state.activeTenantId,
      orderNumber: this.getNextDocumentNumber('purchase_order'),
      createdAt: new Date().toISOString()
    };
    this.state.purchaseOrders.unshift(po);
    this.logAudit('PURCHASE_ORDER_CREATED', 'PURCHASE_ORDER', po.orderNumber, `Created PO for ${po.supplierName}`);
    this.persist();
    return po;
  }

  public receivePurchaseOrder(poId: string): boolean {
    const po = this.state.purchaseOrders.find(p => p.id === poId);
    if (!po || po.status === 'received') return false;

    po.status = 'received';

    // Record stock movements into specified warehouse
    for (const line of po.items) {
      const item = this.state.items.find(i => i.id === line.itemId || i.sku === line.itemSku);
      if (item) {
        this.addStockMovement({
          date: new Date().toISOString().split('T')[0],
          itemId: item.id,
          itemSku: item.sku,
          itemName: item.name,
          warehouseId: po.warehouseId,
          warehouseName: po.warehouseName,
          movementType: 'receipt',
          quantity: line.quantity,
          unitCost: line.unitPrice,
          totalValue: roundCurrency(line.quantity * line.unitPrice),
          referenceType: 'purchase_order',
          referenceId: po.orderNumber,
          notes: `Goods receipt from PO ${po.orderNumber}`
        });
      }
    }

    // Auto-create balanced journal entry (Debit Inventory 1300, Credit Accounts Payable 2010)
    const accounts = this.getAccounts();
    const invAcc = accounts.find(a => a.code === '1300');
    const apAcc = accounts.find(a => a.code === '2010');

    if (invAcc && apAcc) {
      this.postJournalEntry({
        entryNumber: this.getNextDocumentNumber('journal_entry'),
        date: new Date().toISOString().split('T')[0],
        reference: po.orderNumber,
        memo: `Goods receipt stocking for PO ${po.orderNumber}`,
        lines: [
          {
            id: `jl-po1-${Date.now()}`,
            accountId: invAcc.id,
            accountCode: invAcc.code,
            accountName: invAcc.name,
            debit: po.subtotal,
            credit: 0,
            memo: `Inventory asset receipt`
          },
          {
            id: `jl-po2-${Date.now()}`,
            accountId: apAcc.id,
            accountCode: apAcc.code,
            accountName: apAcc.name,
            debit: 0,
            credit: po.subtotal,
            memo: `Accounts Payable liability to ${po.supplierName}`
          }
        ]
      });
    }

    this.logAudit('PURCHASE_ORDER_RECEIVED', 'PURCHASE_ORDER', po.orderNumber, `Goods received into ${po.warehouseName}`);
    this.persist();
    return true;
  }

  // ==================== INVENTORY ====================
  public getWarehouses(): Warehouse[] {
    return this.state.warehouses.filter(w => w.tenantId === this.state.activeTenantId);
  }

  public addWarehouse(code: string, name: string, location?: string): Warehouse {
    const wh: Warehouse = {
      id: `wh-${Date.now()}`,
      tenantId: this.state.activeTenantId,
      code,
      name,
      location,
      isDefault: false
    };
    this.state.warehouses.push(wh);
    this.logAudit('WAREHOUSE_CREATED', 'WAREHOUSE', wh.code, `Created warehouse ${wh.name}`);
    this.persist();
    return wh;
  }

  public getItems(): Item[] {
    return this.state.items.filter(i => i.tenantId === this.state.activeTenantId);
  }

  public addItem(data: Omit<Item, 'id' | 'tenantId'>): Item {
    const item: Item = {
      ...data,
      id: `item-${Date.now()}`,
      tenantId: this.state.activeTenantId
    };
    this.state.items.push(item);
    this.logAudit('ITEM_CREATED', 'ITEM', item.sku, `Created catalog item ${item.name}`);
    this.persist();
    return item;
  }

  public getStockMovements(): StockMovement[] {
    return this.state.stockMovements.filter(m => m.tenantId === this.state.activeTenantId);
  }

  public addStockMovement(data: Omit<StockMovement, 'id' | 'tenantId' | 'createdAt'>): StockMovement {
    const movement: StockMovement = {
      ...data,
      id: `sm-${Date.now()}`,
      tenantId: this.state.activeTenantId,
      createdAt: new Date().toISOString()
    };
    this.state.stockMovements.unshift(movement);
    this.persist();
    return movement;
  }

  public recordStockTransfer(itemId: string, fromWarehouseId: string, toWarehouseId: string, quantity: number, notes?: string): boolean {
    const item = this.state.items.find(i => i.id === itemId);
    const fromWh = this.state.warehouses.find(w => w.id === fromWarehouseId);
    const toWh = this.state.warehouses.find(w => w.id === toWarehouseId);

    if (!item || !fromWh || !toWh || quantity <= 0) return false;

    this.addStockMovement({
      date: new Date().toISOString().split('T')[0],
      itemId: item.id,
      itemSku: item.sku,
      itemName: item.name,
      warehouseId: fromWh.id,
      warehouseName: fromWh.name,
      toWarehouseId: toWh.id,
      toWarehouseName: toWh.name,
      movementType: 'transfer',
      quantity,
      unitCost: item.costPrice,
      totalValue: roundCurrency(quantity * item.costPrice),
      notes: notes || `Internal stock transfer from ${fromWh.name} to ${toWh.name}`
    });

    this.logAudit('STOCK_TRANSFERRED', 'STOCK', item.sku, `Transferred ${quantity} ${item.uom} from ${fromWh.name} to ${toWh.name}`);
    this.persist();
    return true;
  }

  public recordStockAdjustment(itemId: string, warehouseId: string, quantityDiff: number, reason: string): boolean {
    const item = this.state.items.find(i => i.id === itemId);
    const wh = this.state.warehouses.find(w => w.id === warehouseId);

    if (!item || !wh || quantityDiff === 0) return false;

    this.addStockMovement({
      date: new Date().toISOString().split('T')[0],
      itemId: item.id,
      itemSku: item.sku,
      itemName: item.name,
      warehouseId: wh.id,
      warehouseName: wh.name,
      movementType: 'adjustment',
      quantity: quantityDiff,
      unitCost: item.costPrice,
      totalValue: roundCurrency(Math.abs(quantityDiff) * item.costPrice),
      notes: `Adjustment: ${reason}`
    });

    this.logAudit('STOCK_ADJUSTED', 'STOCK', item.sku, `Adjusted ${quantityDiff} in ${wh.name}. Reason: ${reason}`);
    this.persist();
    return true;
  }

  // ==================== HR & PAYROLL FOUNDATIONS ====================
  public getEmployees(): Employee[] {
    return this.state.employees.filter(e => e.tenantId === this.state.activeTenantId);
  }

  public addEmployee(data: Omit<Employee, 'id' | 'tenantId'>): Employee {
    const emp: Employee = {
      ...data,
      id: `emp-${Date.now()}`,
      tenantId: this.state.activeTenantId
    };
    this.state.employees.push(emp);
    this.logAudit('EMPLOYEE_CREATED', 'EMPLOYEE', emp.employeeCode, `Created employee record for ${emp.fullName}`);
    this.persist();
    return emp;
  }

  public getAttendance(): AttendanceRecord[] {
    return this.state.attendance.filter(a => a.tenantId === this.state.activeTenantId);
  }

  public recordAttendance(employeeId: string, status: AttendanceRecord['status'], checkIn?: string, checkOut?: string): AttendanceRecord | null {
    const emp = this.state.employees.find(e => e.id === employeeId);
    if (!emp) return null;

    const record: AttendanceRecord = {
      id: `att-${Date.now()}`,
      tenantId: this.state.activeTenantId,
      employeeId: emp.id,
      employeeName: emp.fullName,
      date: new Date().toISOString().split('T')[0],
      status,
      checkIn,
      checkOut
    };
    this.state.attendance.unshift(record);
    this.persist();
    return record;
  }

  public getLeaveRequests(): LeaveRequest[] {
    return this.state.leaveRequests.filter(l => l.tenantId === this.state.activeTenantId);
  }

  public submitLeaveRequest(data: Omit<LeaveRequest, 'id' | 'tenantId' | 'status' | 'appliedAt'>): LeaveRequest {
    const req: LeaveRequest = {
      ...data,
      id: `lvr-${Date.now()}`,
      tenantId: this.state.activeTenantId,
      status: 'pending',
      appliedAt: new Date().toISOString()
    };
    this.state.leaveRequests.unshift(req);
    this.logAudit('LEAVE_REQUESTED', 'HR', req.id, `Leave requested by ${req.employeeName}`);
    this.persist();
    return req;
  }

  public updateLeaveStatus(leaveId: string, status: 'approved' | 'rejected'): boolean {
    const req = this.state.leaveRequests.find(l => l.id === leaveId);
    if (!req) return false;
    req.status = status;
    this.logAudit('LEAVE_STATUS_UPDATED', 'HR', req.id, `Leave ${status} for ${req.employeeName}`);
    this.persist();
    return true;
  }

  // ==================== PROJECTS ====================
  public getProjects(): Project[] {
    return this.state.projects.filter(p => p.tenantId === this.state.activeTenantId);
  }

  public addProject(data: Omit<Project, 'id' | 'tenantId' | 'actualCost'>): Project {
    const prj: Project = {
      ...data,
      id: `prj-${Date.now()}`,
      tenantId: this.state.activeTenantId,
      actualCost: 0
    };
    this.state.projects.push(prj);
    this.logAudit('PROJECT_CREATED', 'PROJECT', prj.code, `Created project ${prj.name}`);
    this.persist();
    return prj;
  }

  public getTasks(): ProjectTask[] {
    return this.state.tasks.filter(t => t.tenantId === this.state.activeTenantId);
  }

  public addTask(data: Omit<ProjectTask, 'id' | 'tenantId'>): ProjectTask {
    const tsk: ProjectTask = {
      ...data,
      id: `tsk-${Date.now()}`,
      tenantId: this.state.activeTenantId
    };
    this.state.tasks.push(tsk);
    this.persist();
    return tsk;
  }

  public updateTaskStatus(taskId: string, status: ProjectTask['status']): boolean {
    const task = this.state.tasks.find(t => t.id === taskId);
    if (!task) return false;
    task.status = status;
    this.persist();
    return true;
  }

  // ==================== AUDIT & EXPORT ====================
  public getAuditLogs(): AuditLog[] {
    return this.state.auditLogs.filter(l => l.tenantId === this.state.activeTenantId);
  }

  public exportTenantDataJSON(): string {
    const tId = this.state.activeTenantId;
    const exportData = {
      tenant: this.getActiveTenant(),
      exportedAt: new Date().toISOString(),
      accounts: this.getAccounts(),
      journalEntries: this.getJournalEntries(),
      customers: this.getCustomers(),
      salesInvoices: this.getSalesInvoices(),
      payments: this.state.payments.filter(p => p.tenantId === tId),
      suppliers: this.getSuppliers(),
      purchaseOrders: this.getPurchaseOrders(),
      warehouses: this.getWarehouses(),
      items: this.getItems(),
      stockMovements: this.getStockMovements(),
      employees: this.getEmployees(),
      projects: this.getProjects(),
      auditLogs: this.getAuditLogs()
    };
    return JSON.stringify(exportData, null, 2);
  }
}

// Singleton database instance
export const erpDb = new ERPDatabase();
