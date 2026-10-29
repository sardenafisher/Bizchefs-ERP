-- ==============================================================================
-- BIZCHEFS ERP: PRODUCTION MULTI-TENANT POSTGRESQL SCHEMA WITH ROW LEVEL SECURITY
-- Platform: Supabase PostgreSQL (Version 15+)
-- File: /supabase/migrations/20261028000000_bizchefs_erp_schema.sql
-- Compatible: Supabase cloud & Hostinger static SPA frontend (public_html)
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. PLATFORM SUPER ADMINISTRATORS (Dedicated Security Partition)
-- Never assign platform super admin inside tenant_users table to prevent tenant cross-contamination.
CREATE TABLE IF NOT EXISTS public.platform_super_admins (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. TENANTS TABLE (Each company workspace registered in BizChefs ERP)
CREATE TABLE IF NOT EXISTS public.tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- 4. TENANT USERS & MEMBERSHIP (Associates Supabase auth.users with specific Tenants and Roles)
CREATE TABLE IF NOT EXISTS public.tenant_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'staff' CHECK (
        role IN ('owner', 'tenant_admin', 'accountant', 'sales_manager', 'inventory_manager', 'hr_manager', 'staff', 'viewer')
    ),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(tenant_id, user_id)
);

-- 5. HARDENED SECURITY DEFINER FUNCTIONS (Explicit search_path = '')
CREATE OR REPLACE FUNCTION public.current_user_tenant_ids()
RETURNS TABLE (tenant_id UUID)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
BEGIN
    RETURN QUERY
    SELECT tu.tenant_id
    FROM public.tenant_users tu
    WHERE tu.user_id = auth.uid()
      AND tu.is_active = TRUE;
END;
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.platform_super_admins psa
        WHERE psa.user_id = auth.uid()
          AND psa.is_active = TRUE
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.is_tenant_member(p_tenant_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.tenant_users tu
        WHERE tu.user_id = auth.uid() 
          AND tu.tenant_id = p_tenant_id 
          AND tu.is_active = TRUE
    ) OR public.is_super_admin();
END;
$$;

CREATE OR REPLACE FUNCTION public.get_user_role(p_tenant_id UUID)
RETURNS VARCHAR
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
DECLARE
    v_role VARCHAR;
BEGIN
    SELECT tu.role INTO v_role
    FROM public.tenant_users tu
    WHERE tu.user_id = auth.uid() 
      AND tu.tenant_id = p_tenant_id 
      AND tu.is_active = TRUE;
    RETURN v_role;
END;
$$;

-- 6. DOCUMENT SEQUENCES (Tenant-scoped automated reference numbering)
CREATE TABLE IF NOT EXISTS public.document_sequences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL,
    prefix VARCHAR(20) NOT NULL,
    next_number INTEGER NOT NULL DEFAULT 1,
    number_padding INTEGER NOT NULL DEFAULT 4,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(tenant_id, document_type)
);

-- 7. CHART OF ACCOUNTS
CREATE TABLE IF NOT EXISTS public.accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('asset', 'liability', 'equity', 'income', 'expense')),
    parent_code VARCHAR(50),
    currency VARCHAR(10) DEFAULT 'USD',
    balance NUMERIC(18, 4) NOT NULL DEFAULT 0.0000,
    is_header BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(tenant_id, code)
);

-- 8. JOURNAL ENTRIES & LINES (Double-entry accounting foundation)
CREATE TABLE IF NOT EXISTS public.journal_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    entry_number VARCHAR(100) NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    reference VARCHAR(255),
    memo TEXT NOT NULL,
    total_debit NUMERIC(18, 4) NOT NULL DEFAULT 0.0000 CHECK (total_debit >= 0),
    total_credit NUMERIC(18, 4) NOT NULL DEFAULT 0.0000 CHECK (total_credit >= 0),
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'posted', 'reversed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    posted_at TIMESTAMPTZ,
    UNIQUE(tenant_id, entry_number)
);

CREATE TABLE IF NOT EXISTS public.journal_lines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    journal_entry_id UUID NOT NULL REFERENCES public.journal_entries(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE RESTRICT,
    account_code VARCHAR(50) NOT NULL,
    account_name VARCHAR(255) NOT NULL,
    debit NUMERIC(18, 4) NOT NULL DEFAULT 0.0000 CHECK (debit >= 0),
    credit NUMERIC(18, 4) NOT NULL DEFAULT 0.0000 CHECK (credit >= 0),
    memo TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- Database-level check: A line must have debit or credit, never both, never neither
    CONSTRAINT chk_journal_line_debit_xor_credit CHECK (
        (debit > 0 AND credit = 0) OR (debit = 0 AND credit > 0)
    )
);

-- 9. CUSTOMERS & CRM
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(tenant_id, code)
);

-- 10. SALES INVOICES & LINES
CREATE TABLE IF NOT EXISTS public.sales_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(tenant_id, invoice_number)
);

CREATE TABLE IF NOT EXISTS public.sales_invoice_lines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    invoice_id UUID NOT NULL REFERENCES public.sales_invoices(id) ON DELETE CASCADE,
    item_id UUID,
    item_sku VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    quantity NUMERIC(14, 4) NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(18, 4) NOT NULL DEFAULT 0.0000,
    tax_rate NUMERIC(8, 4) NOT NULL DEFAULT 0.0000,
    tax_amount NUMERIC(18, 2) NOT NULL DEFAULT 0.00,
    line_total NUMERIC(18, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. PAYMENTS / RECEIPTS
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    receipt_number VARCHAR(100) NOT NULL,
    invoice_id UUID REFERENCES public.sales_invoices(id) ON DELETE SET NULL,
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
    customer_name VARCHAR(255) NOT NULL,
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    amount NUMERIC(18, 2) NOT NULL CHECK (amount > 0),
    payment_method VARCHAR(50) NOT NULL DEFAULT 'bank_transfer',
    deposit_account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL,
    reference VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(tenant_id, receipt_number)
);

-- 12. INVENTORY & WAREHOUSES
CREATE TABLE IF NOT EXISTS public.warehouses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(tenant_id, code)
);

CREATE TABLE IF NOT EXISTS public.items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    sku VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL DEFAULT 'General',
    uom VARCHAR(50) NOT NULL DEFAULT 'pcs',
    sales_price NUMERIC(18, 4) NOT NULL DEFAULT 0.0000,
    cost_price NUMERIC(18, 4) NOT NULL DEFAULT 0.0000,
    current_stock NUMERIC(14, 4) NOT NULL DEFAULT 0.0000,
    reorder_level NUMERIC(14, 4) NOT NULL DEFAULT 10.0000,
    tax_rate NUMERIC(8, 4) NOT NULL DEFAULT 0.1400,
    income_account_id UUID REFERENCES public.accounts(id),
    expense_account_id UUID REFERENCES public.accounts(id),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(tenant_id, sku)
);

CREATE TABLE IF NOT EXISTS public.stock_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES public.items(id) ON DELETE RESTRICT,
    warehouse_id UUID NOT NULL REFERENCES public.warehouses(id) ON DELETE RESTRICT,
    date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    movement_type VARCHAR(30) NOT NULL CHECK (movement_type IN ('receipt', 'issue', 'transfer', 'adjustment')),
    quantity NUMERIC(14, 4) NOT NULL,
    unit_cost NUMERIC(18, 4) NOT NULL DEFAULT 0.0000,
    total_value NUMERIC(18, 4) NOT NULL DEFAULT 0.0000,
    reference_type VARCHAR(50),
    reference_id VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. AUDIT LOGS (Immutable Log of System & Financial Actions)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    user_id UUID,
    user_email VARCHAR(255) NOT NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(100) NOT NULL,
    details TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 14. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.platform_super_admins ENABLE ROW LEVEL SECURITY;
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

-- Platform Super Admins Table: Only platform super admins can view; nobody can insert via public client
CREATE POLICY "psa_select" ON public.platform_super_admins
    FOR SELECT USING (public.is_super_admin());

-- Tenants Table
CREATE POLICY "tenants_select" ON public.tenants
    FOR SELECT USING (id IN (SELECT public.current_user_tenant_ids()) OR public.is_super_admin());

CREATE POLICY "tenants_update" ON public.tenants
    FOR UPDATE USING (id IN (SELECT public.current_user_tenant_ids()) OR public.is_super_admin())
    WITH CHECK (id IN (SELECT public.current_user_tenant_ids()) OR public.is_super_admin());

-- Tenant Users Table: Granular authorization
CREATE POLICY "tenant_users_select" ON public.tenant_users
    FOR SELECT USING (tenant_id IN (SELECT public.current_user_tenant_ids()) OR public.is_super_admin());

CREATE POLICY "tenant_users_insert" ON public.tenant_users
    FOR INSERT WITH CHECK (
        (tenant_id IN (
            SELECT tu.tenant_id FROM public.tenant_users tu 
            WHERE tu.user_id = auth.uid() AND tu.role IN ('owner', 'tenant_admin') AND tu.is_active = TRUE
        ) OR public.is_super_admin())
        AND role IN ('owner', 'tenant_admin', 'accountant', 'sales_manager', 'inventory_manager', 'hr_manager', 'staff', 'viewer')
    );

CREATE POLICY "tenant_users_update" ON public.tenant_users
    FOR UPDATE USING (
        tenant_id IN (
            SELECT tu.tenant_id FROM public.tenant_users tu 
            WHERE tu.user_id = auth.uid() AND tu.role IN ('owner', 'tenant_admin') AND tu.is_active = TRUE
        ) OR public.is_super_admin()
    )
    WITH CHECK (
        (tenant_id IN (
            SELECT tu.tenant_id FROM public.tenant_users tu 
            WHERE tu.user_id = auth.uid() AND tu.role IN ('owner', 'tenant_admin') AND tu.is_active = TRUE
        ) OR public.is_super_admin())
        AND role IN ('owner', 'tenant_admin', 'accountant', 'sales_manager', 'inventory_manager', 'hr_manager', 'staff', 'viewer')
    );

CREATE POLICY "tenant_users_delete" ON public.tenant_users
    FOR DELETE USING (
        tenant_id IN (
            SELECT tu.tenant_id FROM public.tenant_users tu 
            WHERE tu.user_id = auth.uid() AND tu.role IN ('owner', 'tenant_admin') AND tu.is_active = TRUE
        ) OR public.is_super_admin()
    );

-- Accounts Table
CREATE POLICY "accounts_select" ON public.accounts
    FOR SELECT USING (tenant_id IN (SELECT public.current_user_tenant_ids()) OR public.is_super_admin());
CREATE POLICY "accounts_insert" ON public.accounts
    FOR INSERT WITH CHECK (tenant_id IN (SELECT public.current_user_tenant_ids()) OR public.is_super_admin());
CREATE POLICY "accounts_update" ON public.accounts
    FOR UPDATE USING (tenant_id IN (SELECT public.current_user_tenant_ids()) OR public.is_super_admin())
    WITH CHECK (tenant_id IN (SELECT public.current_user_tenant_ids()) OR public.is_super_admin());

-- Journal Entries & Lines
CREATE POLICY "journal_entries_select" ON public.journal_entries
    FOR SELECT USING (tenant_id IN (SELECT public.current_user_tenant_ids()) OR public.is_super_admin());
CREATE POLICY "journal_entries_insert" ON public.journal_entries
    FOR INSERT WITH CHECK (tenant_id IN (SELECT public.current_user_tenant_ids()) OR public.is_super_admin());
CREATE POLICY "journal_entries_update" ON public.journal_entries
    FOR UPDATE USING (tenant_id IN (SELECT public.current_user_tenant_ids()) OR public.is_super_admin())
    WITH CHECK (tenant_id IN (SELECT public.current_user_tenant_ids()) OR public.is_super_admin());

CREATE POLICY "journal_lines_select" ON public.journal_lines
    FOR SELECT USING (tenant_id IN (SELECT public.current_user_tenant_ids()) OR public.is_super_admin());
CREATE POLICY "journal_lines_insert" ON public.journal_lines
    FOR INSERT WITH CHECK (tenant_id IN (SELECT public.current_user_tenant_ids()) OR public.is_super_admin());

-- Document Sequences: SELECT allowed for tenant members; mutation through get_next_document_number RPC
CREATE POLICY "sequences_select" ON public.document_sequences
    FOR SELECT USING (tenant_id IN (SELECT public.current_user_tenant_ids()) OR public.is_super_admin());

-- Customers
CREATE POLICY "customers_all" ON public.customers
    FOR ALL USING (tenant_id IN (SELECT public.current_user_tenant_ids()) OR public.is_super_admin())
    WITH CHECK (tenant_id IN (SELECT public.current_user_tenant_ids()) OR public.is_super_admin());

-- Sales Invoices & Lines
CREATE POLICY "invoices_all" ON public.sales_invoices
    FOR ALL USING (tenant_id IN (SELECT public.current_user_tenant_ids()) OR public.is_super_admin())
    WITH CHECK (tenant_id IN (SELECT public.current_user_tenant_ids()) OR public.is_super_admin());

CREATE POLICY "invoice_lines_all" ON public.sales_invoice_lines
    FOR ALL USING (tenant_id IN (SELECT public.current_user_tenant_ids()) OR public.is_super_admin())
    WITH CHECK (tenant_id IN (SELECT public.current_user_tenant_ids()) OR public.is_super_admin());

-- Payments
CREATE POLICY "payments_all" ON public.payments
    FOR ALL USING (tenant_id IN (SELECT public.current_user_tenant_ids()) OR public.is_super_admin())
    WITH CHECK (tenant_id IN (SELECT public.current_user_tenant_ids()) OR public.is_super_admin());

-- Warehouses, Items, Stock Movements
CREATE POLICY "warehouses_all" ON public.warehouses
    FOR ALL USING (tenant_id IN (SELECT public.current_user_tenant_ids()) OR public.is_super_admin())
    WITH CHECK (tenant_id IN (SELECT public.current_user_tenant_ids()) OR public.is_super_admin());

CREATE POLICY "items_all" ON public.items
    FOR ALL USING (tenant_id IN (SELECT public.current_user_tenant_ids()) OR public.is_super_admin())
    WITH CHECK (tenant_id IN (SELECT public.current_user_tenant_ids()) OR public.is_super_admin());

CREATE POLICY "stock_movements_all" ON public.stock_movements
    FOR ALL USING (tenant_id IN (SELECT public.current_user_tenant_ids()) OR public.is_super_admin())
    WITH CHECK (tenant_id IN (SELECT public.current_user_tenant_ids()) OR public.is_super_admin());

-- Audit Logs: Insert & Select only; NO UPDATE OR DELETE ALLOWED
CREATE POLICY "audit_logs_select" ON public.audit_logs
    FOR SELECT USING (tenant_id IN (SELECT public.current_user_tenant_ids()) OR public.is_super_admin());

CREATE POLICY "audit_logs_insert" ON public.audit_logs
    FOR INSERT WITH CHECK (
        (tenant_id IN (SELECT public.current_user_tenant_ids()) OR public.is_super_admin())
        AND (user_id IS NULL OR user_id = auth.uid())
    );

-- 15. INDEXES FOR MULTI-TENANT QUERY OPTIMIZATION
CREATE INDEX IF NOT EXISTS idx_accounts_tenant ON public.accounts(tenant_id, code);
CREATE INDEX IF NOT EXISTS idx_journal_tenant_date ON public.journal_entries(tenant_id, date);
CREATE INDEX IF NOT EXISTS idx_invoices_tenant_status ON public.sales_invoices(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_customers_tenant ON public.customers(tenant_id, code);
CREATE INDEX IF NOT EXISTS idx_items_tenant_sku ON public.items(tenant_id, sku);
CREATE INDEX IF NOT EXISTS idx_stock_movements_tenant_item ON public.stock_movements(tenant_id, item_id, warehouse_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_created ON public.audit_logs(tenant_id, created_at DESC);
