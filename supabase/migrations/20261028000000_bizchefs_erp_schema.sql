-- ==============================================================================
-- BIZCHEFS ERP: PRODUCTION MULTI-TENANT POSTGRESQL SCHEMA WITH ROW LEVEL SECURITY
-- Platform: Supabase PostgreSQL (Version 15+)
-- Deployment: Compatible with Supabase cloud & Hostinger static SPA frontend
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. TENANTS TABLE (Each company registered in BizChefs ERP)
CREATE TABLE IF NOT EXISTS public.tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    industry VARCHAR(100) DEFAULT 'Services',
    base_currency VARCHAR(10) DEFAULT 'USD',
    timezone VARCHAR(50) DEFAULT 'UTC',
    fiscal_year_start_month INTEGER DEFAULT 1 CHECK (fiscal_year_start_month BETWEEN 1 AND 12),
    tax_number VARCHAR(100),
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(100),
    phone VARCHAR(50),
    email VARCHAR(255),
    website VARCHAR(255),
    logo_url TEXT,
    subscription_plan VARCHAR(50) DEFAULT 'growth',
    subscription_status VARCHAR(50) DEFAULT 'active',
    subscription_valid_until TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '365 days'),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TENANT USERS & MEMBERSHIP (Associates Supabase auth.users with Tenants and Roles)
CREATE TABLE IF NOT EXISTS public.tenant_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'staff' CHECK (
        role IN ('super_admin', 'tenant_admin', 'accountant', 'sales_manager', 'inventory_manager', 'hr_manager', 'staff', 'viewer')
    ),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, user_id)
);

-- Helper function to check tenant membership in RLS policies
CREATE OR REPLACE FUNCTION public.current_user_tenant_ids()
RETURNS TABLE (tenant_id UUID) SECURITY DEFINER STABLE AS $$
BEGIN
    RETURN QUERY
    SELECT tu.tenant_id
    FROM public.tenant_users tu
    WHERE tu.user_id = auth.uid() AND tu.is_active = TRUE;
END;
$$ LANGUAGE plpgsql;

-- Helper function to check if current user is platform super admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN SECURITY DEFINER STABLE AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.tenant_users
        WHERE user_id = auth.uid() AND role = 'super_admin' AND is_active = TRUE
    );
END;
$$ LANGUAGE plpgsql;

-- 4. DOCUMENT SEQUENCES (Tenant-scoped automated reference numbering)
CREATE TABLE IF NOT EXISTS public.document_sequences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL,
    prefix VARCHAR(20) NOT NULL,
    next_number INTEGER NOT NULL DEFAULT 1,
    number_padding INTEGER NOT NULL DEFAULT 4,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, document_type)
);

-- 5. CHART OF ACCOUNTS
CREATE TABLE IF NOT EXISTS public.accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('asset', 'liability', 'equity', 'income', 'expense')),
    parent_code VARCHAR(50),
    currency VARCHAR(10) DEFAULT 'USD',
    balance NUMERIC(18, 4) DEFAULT 0.0000,
    is_header BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, code)
);

-- 6. JOURNAL ENTRIES & LINES (Double-entry accounting foundation)
CREATE TABLE IF NOT EXISTS public.journal_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    entry_number VARCHAR(100) NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    reference VARCHAR(255),
    memo TEXT NOT NULL,
    total_debit NUMERIC(18, 4) NOT NULL DEFAULT 0.0000,
    total_credit NUMERIC(18, 4) NOT NULL DEFAULT 0.0000,
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'posted', 'reversed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    posted_at TIMESTAMPTZ,
    UNIQUE(tenant_id, entry_number)
);

CREATE TABLE IF NOT EXISTS public.journal_lines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    journal_entry_id UUID NOT NULL REFERENCES public.journal_entries(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE RESTRICT,
    account_code VARCHAR(50) NOT NULL,
    account_name VARCHAR(255) NOT NULL,
    debit NUMERIC(18, 4) NOT NULL DEFAULT 0.0000 CHECK (debit >= 0),
    credit NUMERIC(18, 4) NOT NULL DEFAULT 0.0000 CHECK (credit >= 0),
    memo TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. CUSTOMERS & CRM
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    address TEXT,
    tax_number VARCHAR(100),
    credit_limit NUMERIC(18, 2) DEFAULT 0.00,
    payment_terms_days INTEGER DEFAULT 30,
    outstanding_balance NUMERIC(18, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, code)
);

-- 8. QUOTATIONS, SALES ORDERS & SALES INVOICES
CREATE TABLE IF NOT EXISTS public.sales_invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    invoice_number VARCHAR(100) NOT NULL,
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
    customer_name VARCHAR(255) NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    subtotal NUMERIC(18, 2) NOT NULL DEFAULT 0.00,
    tax_total NUMERIC(18, 2) NOT NULL DEFAULT 0.00,
    grand_total NUMERIC(18, 2) NOT NULL DEFAULT 0.00,
    amount_paid NUMERIC(18, 2) NOT NULL DEFAULT 0.00,
    balance_due NUMERIC(18, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(30) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'posted', 'partially_paid', 'paid', 'overdue', 'voided')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, invoice_number)
);

CREATE TABLE IF NOT EXISTS public.sales_invoice_lines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    invoice_id UUID NOT NULL REFERENCES public.sales_invoices(id) ON DELETE CASCADE,
    item_id UUID,
    item_sku VARCHAR(50) NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    uom VARCHAR(20) DEFAULT 'pcs',
    quantity NUMERIC(14, 4) NOT NULL DEFAULT 1.0000 CHECK (quantity > 0),
    unit_price NUMERIC(18, 4) NOT NULL DEFAULT 0.0000,
    tax_rate NUMERIC(8, 4) NOT NULL DEFAULT 0.0000,
    tax_amount NUMERIC(18, 2) NOT NULL DEFAULT 0.00,
    line_total NUMERIC(18, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. PAYMENTS & RECEIPT RECORDS
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    payment_number VARCHAR(100) NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('incoming', 'outgoing')),
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    customer_name VARCHAR(255),
    invoice_id UUID REFERENCES public.sales_invoices(id) ON DELETE SET NULL,
    invoice_number VARCHAR(100),
    amount NUMERIC(18, 2) NOT NULL CHECK (amount > 0),
    payment_method VARCHAR(50) DEFAULT 'bank_transfer',
    reference VARCHAR(255),
    memo TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, payment_number)
);

-- 10. WAREHOUSES, ITEMS & STOCK LEDGER
CREATE TABLE IF NOT EXISTS public.warehouses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    location TEXT,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, code)
);

CREATE TABLE IF NOT EXISTS public.items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    sku VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) DEFAULT 'General',
    uom VARCHAR(50) DEFAULT 'pcs',
    unit_price NUMERIC(18, 2) DEFAULT 0.00,
    cost_price NUMERIC(18, 2) DEFAULT 0.00,
    tax_rate NUMERIC(8, 4) DEFAULT 0.0000,
    reorder_point NUMERIC(14, 4) DEFAULT 0.0000,
    barcode VARCHAR(100),
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, sku)
);

CREATE TABLE IF NOT EXISTS public.stock_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    item_id UUID NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
    item_sku VARCHAR(100) NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    warehouse_id UUID NOT NULL REFERENCES public.warehouses(id) ON DELETE CASCADE,
    warehouse_name VARCHAR(255) NOT NULL,
    to_warehouse_id UUID REFERENCES public.warehouses(id) ON DELETE SET NULL,
    movement_type VARCHAR(30) NOT NULL CHECK (movement_type IN ('receipt', 'issue', 'transfer', 'adjustment')),
    quantity NUMERIC(14, 4) NOT NULL,
    unit_cost NUMERIC(18, 4) NOT NULL DEFAULT 0.0000,
    total_value NUMERIC(18, 4) NOT NULL DEFAULT 0.0000,
    reference_type VARCHAR(50),
    reference_id VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    user_id UUID,
    user_email VARCHAR(255) NOT NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(100) NOT NULL,
    details TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 12. ROW LEVEL SECURITY (RLS) POLICIES
-- Enforce strict multi-tenant data boundary at the PostgreSQL engine level
-- ==============================================================================

ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_invoice_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Tenants policy: users can only select and update their own authorized tenant(s)
CREATE POLICY "Tenant isolation for tenants select" ON public.tenants
    FOR SELECT USING (id IN (SELECT current_user_tenant_ids()) OR public.is_super_admin());

CREATE POLICY "Tenant isolation for tenants update" ON public.tenants
    FOR UPDATE USING (id IN (SELECT current_user_tenant_ids()) OR public.is_super_admin());

-- Generic macro-like tenant security policy pattern for all tenant-scoped tables:
CREATE POLICY "Tenant isolation for accounts" ON public.accounts
    FOR ALL USING (tenant_id IN (SELECT current_user_tenant_ids()) OR public.is_super_admin());

CREATE POLICY "Tenant isolation for journal_entries" ON public.journal_entries
    FOR ALL USING (tenant_id IN (SELECT current_user_tenant_ids()) OR public.is_super_admin());

CREATE POLICY "Tenant isolation for journal_lines" ON public.journal_lines
    FOR ALL USING (tenant_id IN (SELECT current_user_tenant_ids()) OR public.is_super_admin());

CREATE POLICY "Tenant isolation for customers" ON public.customers
    FOR ALL USING (tenant_id IN (SELECT current_user_tenant_ids()) OR public.is_super_admin());

CREATE POLICY "Tenant isolation for sales_invoices" ON public.sales_invoices
    FOR ALL USING (tenant_id IN (SELECT current_user_tenant_ids()) OR public.is_super_admin());

CREATE POLICY "Tenant isolation for sales_invoice_lines" ON public.sales_invoice_lines
    FOR ALL USING (tenant_id IN (SELECT current_user_tenant_ids()) OR public.is_super_admin());

CREATE POLICY "Tenant isolation for payments" ON public.payments
    FOR ALL USING (tenant_id IN (SELECT current_user_tenant_ids()) OR public.is_super_admin());

CREATE POLICY "Tenant isolation for warehouses" ON public.warehouses
    FOR ALL USING (tenant_id IN (SELECT current_user_tenant_ids()) OR public.is_super_admin());

CREATE POLICY "Tenant isolation for items" ON public.items
    FOR ALL USING (tenant_id IN (SELECT current_user_tenant_ids()) OR public.is_super_admin());

CREATE POLICY "Tenant isolation for stock_movements" ON public.stock_movements
    FOR ALL USING (tenant_id IN (SELECT current_user_tenant_ids()) OR public.is_super_admin());

CREATE POLICY "Tenant isolation for audit_logs" ON public.audit_logs
    FOR ALL USING (tenant_id IN (SELECT current_user_tenant_ids()) OR public.is_super_admin());

-- 13. INDEXES FOR HIGH-PERFORMANCE MULTI-TENANT QUERIES
CREATE INDEX IF NOT EXISTS idx_accounts_tenant ON public.accounts(tenant_id, code);
CREATE INDEX IF NOT EXISTS idx_journal_tenant_date ON public.journal_entries(tenant_id, date);
CREATE INDEX IF NOT EXISTS idx_invoices_tenant_status ON public.sales_invoices(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_customers_tenant ON public.customers(tenant_id, code);
CREATE INDEX IF NOT EXISTS idx_items_tenant_sku ON public.items(tenant_id, sku);
CREATE INDEX IF NOT EXISTS idx_stock_movements_tenant_item ON public.stock_movements(tenant_id, item_id, warehouse_id);
