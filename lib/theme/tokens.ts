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
    description: 'Corporate headquarters, digital architecture practice & advisory',
    badge: 'Main Site'
  },
  studio: {
    name: 'BizChefs Studio',
    shortName: 'Studio',
    url: 'https://studio.bizchefs.com',
    description: 'Creative kitchen, culinary innovation portal & client workspace',
    badge: 'Client Portal'
  },
  erp: {
    name: 'BizChefs ERP',
    shortName: 'ERP',
    url: 'https://erp.bizchefs.com',
    description: 'Commercial subscription-based enterprise resource planning platform',
    badge: 'Enterprise Platform'
  }
} as const;

export const THEME_COLORS = {
  // Official BizChefs Brand Gold
  gold: {
    subtle: '#FCF8EE',
    light: '#F8E9C9',
    DEFAULT: '#D39E36',
    hover: '#E5A83B',
    deep: '#B88022',
    dark: '#8C5E13',
  },
  // Light theme surfaces (Official bizchefs.com standard)
  light: {
    bg: '#FAFAFA',
    surface: '#FFFFFF',
    card: '#FFFFFF',
    border: '#E5E5E5',
    borderSubtle: '#F5F5F5',
    borderStrong: '#171717',
    textPrimary: '#0A0A0A',
    textSecondary: '#525252',
    textMuted: '#737373',
  },
  // Legacy fallback if referenced
  dark: {
    bg: '#FAFAFA',
    surface: '#FFFFFF',
    card: '#FFFFFF',
    border: '#E5E5E5',
    textPrimary: '#0A0A0A',
    textSecondary: '#525252',
    textMuted: '#737373',
  },
  focus: '#2563EB',
} as const;

export interface SubscriptionPlanConfig {
  id: 'starter' | 'growth' | 'enterprise';
  name: string;
  badge?: string;
  tagline: string;
  description: string;
  priceEGP: number | null; // null if custom quote
  priceUSDRef: number | null; // reference USD estimate
  billingPeriod: string;
  maxUsers: number;
  maxInvoicesPerMonth: number;
  maxWarehouses: number;
  features: string[];
  isRecommended?: boolean;
  ctaText: string;
  ctaMode: 'register' | 'contact_sales';
}

export const ERP_EXCHANGE_RATE_NOTE = {
  referenceRate: 50.0,
  referenceDate: 'October 2026',
  legalDisclaimer:
    'EGP prices represent baseline subscription rental rates. USD figures are reference estimates calculated at approximately 50.00 EGP/USD. Official billing is invoiced per the commercial master service agreement.'
};

export const ERP_SUBSCRIPTION_PLANS: SubscriptionPlanConfig[] = [
  {
    id: 'starter',
    name: 'Starter',
    tagline: 'Single Location Operations',
    description: 'Essential enterprise controls for boutique culinary ventures, cloud kitchens, and emerging food operations.',
    priceEGP: 1950,
    priceUSDRef: 39,
    billingPeriod: 'per month / billed annually',
    maxUsers: 5,
    maxInvoicesPerMonth: 500,
    maxWarehouses: 1,
    features: [
      'Up to 5 authenticated team members',
      '500 sales invoices & quotations / month',
      '1 centralized inventory warehouse',
      'Strict double-entry general ledger',
      'Supplier purchasing & PO tracking',
      'Standard document PDF printing & sequences',
      'PostgreSQL Row-Level Security isolation',
      'Standard email & portal support'
    ],
    isRecommended: false,
    ctaText: 'Select Starter Plan',
    ctaMode: 'register'
  },
  {
    id: 'growth',
    name: 'Growth (Business)',
    badge: 'Most Popular for Foodservice',
    tagline: 'Multi-Branch Commercial Foodservice',
    description: 'Complete operational power for multi-branch dining groups, commercial catering businesses, and food producers.',
    priceEGP: 4750,
    priceUSDRef: 95,
    billingPeriod: 'per month / billed annually',
    maxUsers: 15,
    maxInvoicesPerMonth: 2500,
    maxWarehouses: 5,
    features: [
      'Up to 15 authenticated team members',
      '2,500 sales invoices & orders / month',
      'Up to 5 multi-location warehouses',
      'Inter-warehouse inventory transfers',
      'HR staff directory, attendance & payroll batches',
      'Project timesheets & client milestone tracking',
      'Live Supabase cloud sync & multi-device backup',
      'Full Trial Balance & Income Statement reporting',
      'Role-based permissions (Manager, Accountant, Staff)'
    ],
    isRecommended: true,
    ctaText: 'Select Growth Plan',
    ctaMode: 'register'
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    tagline: 'Institutional Hospitality Networks',
    description: 'Bespoke multi-company architecture, high-volume transactions, and institutional financial controls.',
    priceEGP: null, // Custom quotation
    priceUSDRef: null,
    billingPeriod: 'custom enterprise agreement',
    maxUsers: 50,
    maxInvoicesPerMonth: 10000,
    maxWarehouses: 999,
    features: [
      '50+ team members with granular RBAC',
      'Unlimited monthly invoices & journal entries',
      'Unlimited warehouse locations & logistics bins',
      'Multi-tenant holding company consolidation',
      'Custom Chart of Accounts & fiscal calendar setup',
      'Custom document sequences & approval workflows',
      'Schema-qualified SECURITY DEFINER function auditing',
      'Dedicated account manager & 99.9% uptime SLA'
    ],
    isRecommended: false,
    ctaText: 'Contact Enterprise Sales',
    ctaMode: 'contact_sales'
  }
];

export const ERP_MODULE_DEFINITIONS = [
  {
    id: 'dashboard',
    name: 'Executive Dashboard',
    tagline: 'Consolidated revenue runs, cash position, and live operational KPIs',
    iconName: 'LayoutDashboard',
    description: 'Real-time multi-tenant operations telemetry tracking verified sales revenue, open purchase orders, inventory alerts, and financial balance in one pane.',
    route: '/app?module=dashboard'
  },
  {
    id: 'sales',
    name: 'CRM & Sales Orders',
    tagline: 'Quotation lifecycle, sales orders, and professional PDF invoicing',
    iconName: 'Receipt',
    description: 'Complete commercial customer management, tax calculations, credit limits, sales fulfillment, and one-click printable invoice generation.',
    route: '/app?module=sales'
  },
  {
    id: 'purchasing',
    name: 'Purchasing & Supply Chain',
    tagline: 'Supplier requisitions, purchase orders, and goods receipts',
    iconName: 'Truck',
    description: 'Strict procurement controls linking vendor catalogs, three-way purchase order reconciliation, and accounts payable entries.',
    route: '/app?module=purchasing'
  },
  {
    id: 'inventory',
    name: 'Inventory & Warehousing',
    tagline: 'Multi-location SKU tracking, unit cost valuations, and reorder points',
    iconName: 'Package',
    description: 'Warehouse stock movement logs (receipts, issues, transfers), moving-average cost valuation, and reorder point alerts to prevent stockouts.',
    route: '/app?module=inventory'
  },
  {
    id: 'accounting',
    name: 'General Ledger & Double-Entry',
    tagline: 'Strict double-entry journal postings, Trial Balance, and Income Statements',
    iconName: 'BookOpen',
    description: 'Institutional-grade accounting enforcing Debits = Credits at database and application levels. Complete Chart of Accounts and fiscal periods.',
    route: '/app?module=accounting'
  },
  {
    id: 'hr',
    name: 'HR & Personnel',
    tagline: 'Staff directory, role assignments, attendance logs, and payroll batches',
    iconName: 'Users',
    description: 'Centralized personnel management covering staff roles, department hierarchies, attendance records, leave approvals, and payroll runs.',
    route: '/app?module=hr'
  },
  {
    id: 'projects',
    name: 'Projects & Deliverables',
    tagline: 'Milestone tracking, budget burn rates, and billable timesheets',
    iconName: 'Briefcase',
    description: 'Client delivery tracking connecting billable hours, project tasks, and budget consumption directly into operational reports.',
    route: '/app?module=projects'
  },
  {
    id: 'settings',
    name: 'Company Settings & Sync',
    tagline: 'Multi-tenant fiscal configuration, document sequences, and Supabase cloud sync',
    iconName: 'Settings',
    description: 'Configure corporate profiles, base currency, tax registration numbers, automated numbering sequences, and remote database sync.',
    route: '/app?module=settings'
  },
  {
    id: 'admin',
    name: 'Super Administration',
    tagline: 'Tenant provisioning, cross-tenant RLS policy audits, and user governance',
    iconName: 'ShieldCheck',
    description: 'Privileged administration workspace to provision new tenant companies, review RLS policies, and inspect system audit logs.',
    route: '/app?module=admin'
  }
] as const;

export const ERP_FAQS = [
  {
    question: 'How is BizChefs ERP subscription priced and billed?',
    answer:
      'BizChefs ERP is offered as a commercial subscription service billed annually or monthly. Plans are sized according to team members, monthly transaction volumes, and warehouse locations. Invoicing is issued in Egyptian Pounds (EGP) with USD reference options available for international entities.'
  },
  {
    question: 'Can I change or upgrade my subscription plan later?',
    answer:
      'Yes. As your foodservice operation expands to additional branches or central production facilities, you can upgrade your plan immediately without downtime or data migration headaches.'
  },
  {
    question: 'How is tenant data isolated and protected?',
    answer:
      'Every customer organization is provisioned with a unique tenant ID. In PostgreSQL, Row-Level Security (RLS) policies enforce that queries only ever return records belonging to the authenticated tenant. Database functions run under hardened security definitions with search_path = \'\' to eliminate injection risks.'
  },
  {
    question: 'Does the system support offline operations or poor connectivity?',
    answer:
      'Yes. The ERP includes in-browser persistence, allowing frontline managers to continue logging transactions during internet hiccups. When connection restores, data synchronizes with your cloud Supabase database.'
  },
  {
    question: 'Can we request a live demonstration before subscribing?',
    answer:
      'Absolutely. Our team provides guided walkthroughs customized to your operational workflow (kitchen, warehouse, accounting, or executive). Click "Request a Demo" to schedule a session.'
  }
];
