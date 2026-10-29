/**
 * Official BizChefs Brand Design Tokens & System Constants
 * Synchronized with:
 * - https://bizchefs.com (Corporate)
 * - https://studio.bizchefs.com (Client Portal & Design Studio)
 * - https://erp.bizchefs.com (Enterprise Operations Platform)
 */

export const BIZCHEFS_ECOSYSTEM = {
  corporate: {
    name: 'BizChefs Corporate',
    shortName: 'BizChefs',
    url: 'https://bizchefs.com',
    description: 'Corporate headquarters, solutions, hospitality advisory and venture ecosystem',
    badge: 'Main Site'
  },
  studio: {
    name: 'BizChefs Studio',
    shortName: 'Studio',
    url: 'https://studio.bizchefs.com',
    description: 'Creative kitchen, culinary innovation portal, and client workspace',
    badge: 'Client Portal'
  },
  erp: {
    name: 'BizChefs ERP',
    shortName: 'ERP',
    url: 'https://erp.bizchefs.com',
    description: 'Mission-critical commercial multi-tenant enterprise resource planning system',
    badge: 'Enterprise Platform'
  }
} as const;

export const THEME_COLORS = {
  // Brand Gold
  gold: {
    subtle: '#FCF8EE',
    light: '#F8E9C9',
    DEFAULT: '#D39E36',
    hover: '#E5A83B',
    deep: '#B88022',
    dark: '#8C5E13',
    glow: 'rgba(211, 158, 54, 0.25)',
  },
  // Dark theme surfaces
  dark: {
    void: '#090A0D',
    bg: '#0C0E12',
    surface: '#121316',
    card: '#18191E',
    elevated: '#202228',
    border: '#27272A',
    borderSubtle: '#1F2024',
    borderGold: 'rgba(211, 158, 54, 0.35)',
    textPrimary: '#FFFFFF',
    textSecondary: '#A1A1AA',
    textMuted: '#71717A',
  },
  // Light theme surfaces
  light: {
    bg: '#FAFAFA',
    surface: '#FFFFFF',
    card: '#FFFFFF',
    elevated: '#F4F4F5',
    border: '#E4E4E7',
    borderSubtle: '#F4F4F5',
    borderGold: 'rgba(211, 158, 54, 0.4)',
    textPrimary: '#09090B',
    textSecondary: '#52525B',
    textMuted: '#71717A',
  },
  status: {
    success: '#10B981',
    successBg: '#ECFDF5',
    warning: '#F59E0B',
    warningBg: '#FFFBEB',
    danger: '#EF4444',
    dangerBg: '#FEF2F2',
    info: '#3B82F6',
    infoBg: '#EFF6FF',
  }
} as const;

export const ERP_MODULE_DEFINITIONS = [
  {
    id: 'dashboard',
    name: 'Executive Dashboard',
    tagline: 'Real-time KPIs, cross-tenant telemetry, and consolidated cash positions',
    badge: 'Core Analytics',
    iconName: 'LayoutDashboard',
    metrics: '$284,500 Monthly Volume • 99.8% On-Time Fulfillment',
    description: 'High-level executive overview tracking live revenue runs, accounts receivable aging, inventory velocity, and multi-tenant operational status in a single pane.',
    route: '/app?module=dashboard'
  },
  {
    id: 'sales',
    name: 'CRM & Sales Orders',
    tagline: 'End-to-end quotation, sales order lifecycle, and automated invoice posting',
    badge: 'Revenue Operations',
    iconName: 'Receipt',
    metrics: 'SO-1001 to SO-1004 • Real-time PDF Print & Verification',
    description: 'Complete commercial sales cycle management with multi-currency pricing, line-item tax calculations, client credit verification, and one-click PDF invoices.',
    route: '/app?module=sales'
  },
  {
    id: 'purchasing',
    name: 'Purchasing & Supply Chain',
    tagline: 'Supplier requisitions, three-way matching, and purchase order tracking',
    badge: 'Procurement',
    iconName: 'Truck',
    metrics: 'PO-2001 to PO-2003 • 3-Way Match Verification',
    description: 'Strict procurement control linking purchase orders, goods receipt notes (GRN), and vendor bills with automated accounts payable journal entries.',
    route: '/app?module=purchasing'
  },
  {
    id: 'inventory',
    name: 'Inventory & Warehousing',
    tagline: 'Real-time SKU stock levels, batch tracking, reorder thresholds, and bin locations',
    badge: 'Supply Chain',
    iconName: 'Package',
    metrics: 'SKU-001 to SKU-008 • Stock Valuation & Low Stock Alerts',
    description: 'Multi-warehouse stock control with moving-average valuation, reorder alerts, stock movement audit trails, and physical count reconciliations.',
    route: '/app?module=inventory'
  },
  {
    id: 'accounting',
    name: 'General Ledger & Double-Entry',
    tagline: 'Strict double-entry journal postings, trial balance, and financial statement generation',
    badge: 'Compliance & Audit',
    iconName: 'BookOpen',
    metrics: 'Debits = Credits Enforcement • Atomic Postgres RPC',
    description: 'Strict double-entry bookkeeping architecture preventing unbalanced ledger commits. Includes Chart of Accounts, Trial Balance, Balance Sheet, and Income Statement.',
    route: '/app?module=accounting'
  },
  {
    id: 'hr',
    name: 'HR & Personnel',
    tagline: 'Staff directory, role assignments, department allocation, and payroll batches',
    badge: 'People Ops',
    iconName: 'Users',
    metrics: 'Role-Based Access • Payroll Batch Allocation',
    description: 'Centralized human capital management covering department hierarchies, compensation logs, emergency contacts, and integration with project timesheets.',
    route: '/app?module=hr'
  },
  {
    id: 'projects',
    name: 'Projects & Deliverables',
    tagline: 'Milestone tracking, budget consumption, billable hours, and client sign-offs',
    badge: 'Delivery & Services',
    iconName: 'Briefcase',
    metrics: 'Active Milestones • Budget Burn Rate Tracking',
    description: 'Project delivery governance connecting time logs, expense receipts, milestone completion gates, and client billing triggers directly into General Ledger.',
    route: '/app?module=projects'
  },
  {
    id: 'settings',
    name: 'Company Settings & Migrations',
    tagline: 'Multi-tenant fiscal year configuration, Supabase sync, and tax definitions',
    badge: 'System Governance',
    iconName: 'Settings',
    metrics: 'Hostinger Static Export • Supabase Cloud Sync Engine',
    description: 'Fiscal calendars, tax registration matrices, currency exchange tables, and bidirectional Supabase synchronization tools for total data sovereignty.',
    route: '/app?module=settings'
  },
  {
    id: 'admin',
    name: 'Platform Super Administration',
    tagline: 'Multi-tenant provisioning, RLS policy audit, and security isolation controls',
    badge: 'Zero-Trust Security',
    iconName: 'ShieldCheck',
    metrics: 'Postgres RLS Enforced • Zero-Leakage Guarantee',
    description: 'Super-admin workspace managing tenant creation, database migration versions, RLS policy health checks, and privileged security function audits.',
    route: '/app?module=admin'
  }
] as const;
