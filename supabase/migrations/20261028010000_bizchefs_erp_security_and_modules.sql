-- ==============================================================================
-- BIZCHEFS ERP: MIGRATION 20261028010000
-- Title: Production Hardened Security, Missing ERP Modules, Atomic Procedures & Triggers
-- Compatible: Supabase PostgreSQL (15+) & Hostinger Static/SPA Architecture
-- ==============================================================================

-- 1. EXTENDED ERP MODULE TABLES

-- 1.1 SUPPLIERS & VENDORS
CREATE TABLE IF NOT EXISTS public.suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    address TEXT,
    tax_number VARCHAR(100),
    payment_terms_days INTEGER DEFAULT 30,
    outstanding_balance NUMERIC(18, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(tenant_id, code)
);

-- 1.2 PURCHASE ORDERS & LINES
CREATE TABLE IF NOT EXISTS public.purchase_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    order_number VARCHAR(100) NOT NULL,
    supplier_id UUID NOT NULL REFERENCES public.suppliers(id) ON DELETE RESTRICT,
    supplier_name VARCHAR(255) NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    expected_date DATE NOT NULL,
    warehouse_id UUID NOT NULL REFERENCES public.warehouses(id) ON DELETE RESTRICT,
    warehouse_name VARCHAR(255) NOT NULL,
    subtotal NUMERIC(18, 2) NOT NULL DEFAULT 0.00,
    tax_total NUMERIC(18, 2) NOT NULL DEFAULT 0.00,
    grand_total NUMERIC(18, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(30) NOT NULL DEFAULT 'ordered' CHECK (status IN ('draft', 'ordered', 'received', 'billed', 'canceled')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(tenant_id, order_number)
);

CREATE TABLE IF NOT EXISTS public.purchase_order_lines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    purchase_order_id UUID NOT NULL REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
    item_id UUID REFERENCES public.items(id) ON DELETE SET NULL,
    item_sku VARCHAR(100) NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    uom VARCHAR(50) DEFAULT 'pcs',
    quantity NUMERIC(14, 4) NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(18, 4) NOT NULL DEFAULT 0.0000,
    tax_rate NUMERIC(8, 4) NOT NULL DEFAULT 0.0000,
    tax_amount NUMERIC(18, 2) NOT NULL DEFAULT 0.00,
    line_total NUMERIC(18, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 1.3 QUOTATIONS & LINES
CREATE TABLE IF NOT EXISTS public.quotations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    quotation_number VARCHAR(100) NOT NULL,
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
    customer_name VARCHAR(255) NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    valid_until DATE NOT NULL,
    subtotal NUMERIC(18, 2) NOT NULL DEFAULT 0.00,
    tax_total NUMERIC(18, 2) NOT NULL DEFAULT 0.00,
    grand_total NUMERIC(18, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(30) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'accepted', 'declined', 'ordered')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(tenant_id, quotation_number)
);

CREATE TABLE IF NOT EXISTS public.quotation_lines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    quotation_id UUID NOT NULL REFERENCES public.quotations(id) ON DELETE CASCADE,
    item_id UUID REFERENCES public.items(id) ON DELETE SET NULL,
    item_sku VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    quantity NUMERIC(14, 4) NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(18, 4) NOT NULL DEFAULT 0.0000,
    tax_rate NUMERIC(8, 4) NOT NULL DEFAULT 0.0000,
    tax_amount NUMERIC(18, 2) NOT NULL DEFAULT 0.00,
    line_total NUMERIC(18, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 1.4 SALES ORDERS & LINES
CREATE TABLE IF NOT EXISTS public.sales_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    order_number VARCHAR(100) NOT NULL,
    quotation_id UUID REFERENCES public.quotations(id) ON DELETE SET NULL,
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
    customer_name VARCHAR(255) NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    expected_delivery DATE NOT NULL,
    subtotal NUMERIC(18, 2) NOT NULL DEFAULT 0.00,
    tax_total NUMERIC(18, 2) NOT NULL DEFAULT 0.00,
    grand_total NUMERIC(18, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(30) NOT NULL DEFAULT 'confirmed' CHECK (status IN ('draft', 'confirmed', 'shipped', 'delivered', 'invoiced', 'canceled')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(tenant_id, order_number)
);

CREATE TABLE IF NOT EXISTS public.sales_order_lines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    sales_order_id UUID NOT NULL REFERENCES public.sales_orders(id) ON DELETE CASCADE,
    item_id UUID REFERENCES public.items(id) ON DELETE SET NULL,
    item_sku VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    quantity NUMERIC(14, 4) NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(18, 4) NOT NULL DEFAULT 0.0000,
    tax_rate NUMERIC(8, 4) NOT NULL DEFAULT 0.0000,
    tax_amount NUMERIC(18, 2) NOT NULL DEFAULT 0.00,
    line_total NUMERIC(18, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 1.5 HUMAN RESOURCES & ATTENDANCE
CREATE TABLE IF NOT EXISTS public.employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    employee_id VARCHAR(50) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    department VARCHAR(100) NOT NULL,
    designation VARCHAR(100) NOT NULL,
    join_date DATE NOT NULL,
    monthly_salary NUMERIC(18, 2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(10) DEFAULT 'USD',
    status VARCHAR(30) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'on_leave', 'terminated')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(tenant_id, employee_id)
);

CREATE TABLE IF NOT EXISTS public.attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'present' CHECK (status IN ('present', 'absent', 'late', 'leave', 'half_day')),
    hours_worked NUMERIC(5, 2) DEFAULT 8.00,
    check_in TIMESTAMPTZ,
    check_out TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(tenant_id, employee_id, date)
);

CREATE TABLE IF NOT EXISTS public.leave_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    leave_type VARCHAR(50) NOT NULL DEFAULT 'annual' CHECK (leave_type IN ('annual', 'sick', 'unpaid', 'emergency')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    days_count INTEGER NOT NULL CHECK (days_count > 0),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    reason TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 1.6 PROJECTS & TIMESHEETS
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    budget NUMERIC(18, 2) NOT NULL DEFAULT 0.00,
    billed_amount NUMERIC(18, 2) NOT NULL DEFAULT 0.00,
    cost_amount NUMERIC(18, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(30) NOT NULL DEFAULT 'in_progress' CHECK (status IN ('planning', 'in_progress', 'on_hold', 'completed', 'canceled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(tenant_id, code)
);

CREATE TABLE IF NOT EXISTS public.project_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    assigned_to VARCHAR(255),
    due_date DATE,
    estimated_hours NUMERIC(6, 2) DEFAULT 0.00,
    actual_hours NUMERIC(6, 2) DEFAULT 0.00,
    status VARCHAR(30) NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'review', 'done')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.timesheets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
    task_id UUID REFERENCES public.project_tasks(id) ON DELETE SET NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    hours NUMERIC(5, 2) NOT NULL CHECK (hours > 0),
    description TEXT NOT NULL,
    billable BOOLEAN NOT NULL DEFAULT TRUE,
    rate_per_hour NUMERIC(18, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 2. IMMUTABLE FINANCIAL LEDGER PROTECTION TRIGGERS
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.prevent_posted_journal_mutation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        IF OLD.status = 'posted' THEN
            RAISE EXCEPTION 'Immutable ledger violation: Posted journal entries cannot be deleted. Create a reversing journal entry to adjust ledger records.';
        END IF;
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.status = 'posted' THEN
            IF NEW.total_debit <> OLD.total_debit 
               OR NEW.total_credit <> OLD.total_credit 
               OR NEW.entry_number <> OLD.entry_number 
               OR NEW.tenant_id <> OLD.tenant_id THEN
                RAISE EXCEPTION 'Immutable ledger violation: Financial amounts, entry numbers, and tenant ownership of posted journal entries cannot be modified.';
            END IF;
        END IF;
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_posted_journal ON public.journal_entries;
CREATE TRIGGER trg_protect_posted_journal
    BEFORE UPDATE OR DELETE ON public.journal_entries
    FOR EACH ROW EXECUTE FUNCTION public.prevent_posted_journal_mutation();

CREATE OR REPLACE FUNCTION public.prevent_posted_journal_lines_mutation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_status VARCHAR(20);
BEGIN
    SELECT status INTO v_status 
    FROM public.journal_entries 
    WHERE id = COALESCE(OLD.journal_entry_id, NEW.journal_entry_id);

    IF v_status = 'posted' THEN
        RAISE EXCEPTION 'Immutable ledger violation: Journal lines of a posted journal entry cannot be altered or removed.';
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_posted_journal_lines ON public.journal_lines;
CREATE TRIGGER trg_protect_posted_journal_lines
    BEFORE UPDATE OR DELETE ON public.journal_lines
    FOR EACH ROW EXECUTE FUNCTION public.prevent_posted_journal_lines_mutation();

-- ==============================================================================
-- 3. ENABLE RLS & CREATE POLICIES FOR ALL MODULE TABLES
-- ==============================================================================

ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_order_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotation_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_order_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timesheets ENABLE ROW LEVEL SECURITY;

-- Standard tenant isolation policies with explicit WITH CHECK
CREATE POLICY "suppliers_all" ON public.suppliers
    FOR ALL USING (tenant_id IN (SELECT public.current_user_tenant_ids()) OR public.is_super_admin())
    WITH CHECK (tenant_id IN (SELECT public.current_user_tenant_ids()) OR public.is_super_admin());

CREATE POLICY "po_all" ON public.purchase_orders
    FOR ALL USING (tenant_id IN (SELECT public.current_user_tenant_ids()) OR public.is_super_admin())
    WITH CHECK (tenant_id IN (SELECT public.current_user_tenant_ids()) OR public.is_super_admin());

CREATE POLICY "po_lines_all" ON public.purchase_order_lines
    FOR ALL USING (tenant_id IN (SELECT public.current_user_tenant_ids()) OR public.is_super_admin())
    WITH CHECK (tenant_id IN (SELECT public.current_user_tenant_ids()) OR public.is_super_admin());

CREATE POLICY "quotations_all" ON public.quotations
    FOR ALL USING (tenant_id IN (SELECT public.current_user_tenant_ids()) OR public.is_super_admin())
    WITH CHECK (tenant_id IN (SELECT public.current_user_tenant_ids()) OR public.is_super_admin());

CREATE POLICY "quotation_lines_all" ON public.quotation_lines
    FOR ALL USING (tenant_id IN (SELECT public.current_user_tenant_ids()) OR public.is_super_admin())
    WITH CHECK (tenant_id IN (SELECT public.current_user_tenant_ids()) OR public.is_super_admin());

CREATE POLICY "sales_orders_all" ON public.sales_orders
    FOR ALL USING (tenant_id IN (SELECT public.current_user_tenant_ids()) OR public.is_super_admin())
    WITH CHECK (tenant_id IN (SELECT public.current_user_tenant_ids()) OR public.is_super_admin());

CREATE POLICY "sales_order_lines_all" ON public.sales_order_lines
    FOR ALL USING (tenant_id IN (SELECT public.current_user_tenant_ids()) OR public.is_super_admin())
    WITH CHECK (tenant_id IN (SELECT public.current_user_tenant_ids()) OR public.is_super_admin());

CREATE POLICY "employees_all" ON public.employees
    FOR ALL USING (tenant_id IN (SELECT public.current_user_tenant_ids()) OR public.is_super_admin())
    WITH CHECK (tenant_id IN (SELECT public.current_user_tenant_ids()) OR public.is_super_admin());

CREATE POLICY "attendance_all" ON public.attendance
    FOR ALL USING (tenant_id IN (SELECT public.current_user_tenant_ids()) OR public.is_super_admin())
    WITH CHECK (tenant_id IN (SELECT public.current_user_tenant_ids()) OR public.is_super_admin());

CREATE POLICY "leave_requests_all" ON public.leave_requests
    FOR ALL USING (tenant_id IN (SELECT public.current_user_tenant_ids()) OR public.is_super_admin())
    WITH CHECK (tenant_id IN (SELECT public.current_user_tenant_ids()) OR public.is_super_admin());

CREATE POLICY "projects_all" ON public.projects
    FOR ALL USING (tenant_id IN (SELECT public.current_user_tenant_ids()) OR public.is_super_admin())
    WITH CHECK (tenant_id IN (SELECT public.current_user_tenant_ids()) OR public.is_super_admin());

CREATE POLICY "tasks_all" ON public.project_tasks
    FOR ALL USING (tenant_id IN (SELECT public.current_user_tenant_ids()) OR public.is_super_admin())
    WITH CHECK (tenant_id IN (SELECT public.current_user_tenant_ids()) OR public.is_super_admin());

CREATE POLICY "timesheets_all" ON public.timesheets
    FOR ALL USING (tenant_id IN (SELECT public.current_user_tenant_ids()) OR public.is_super_admin())
    WITH CHECK (tenant_id IN (SELECT public.current_user_tenant_ids()) OR public.is_super_admin());

-- ==============================================================================
-- 4. CONCURRENCY-SAFE DOCUMENT NUMBER GENERATOR (ATOMIC UPSERT ROW LOCKING)
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.get_next_document_number(
    p_tenant_id UUID,
    p_doc_type TEXT
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_prefix VARCHAR(20);
    v_allocated_num INT;
    v_padding INT;
    v_default_prefix VARCHAR(20);
    v_doc_num TEXT;
BEGIN
    -- 1. Authentication check
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Unauthenticated: Must be authenticated to generate document numbers';
    END IF;

    -- 2. Tenant membership check
    IF NOT public.is_tenant_member(p_tenant_id) THEN
        RAISE EXCEPTION 'Access denied: Caller is not an authorized member of tenant %', p_tenant_id;
    END IF;

    -- 3. Document type validation
    IF p_doc_type IS NULL OR length(trim(p_doc_type)) = 0 OR length(p_doc_type) > 50 THEN
        RAISE EXCEPTION 'Invalid document_type: document_type must be between 1 and 50 characters';
    END IF;

    -- 4. Determine standard prefix based on document type
    IF p_doc_type = 'sales_invoice' THEN v_default_prefix := 'INV';
    ELSIF p_doc_type = 'quotation' THEN v_default_prefix := 'QT';
    ELSIF p_doc_type = 'sales_order' THEN v_default_prefix := 'SO';
    ELSIF p_doc_type = 'purchase_order' THEN v_default_prefix := 'PO';
    ELSIF p_doc_type = 'journal_entry' THEN v_default_prefix := 'JV';
    ELSIF p_doc_type = 'payment' THEN v_default_prefix := 'RCT';
    ELSE v_default_prefix := UPPER(SUBSTRING(REGEXP_REPLACE(p_doc_type, '[^a-zA-Z0-9]', '', 'g') FROM 1 FOR 4));
    END IF;

    -- 5. Atomic Upsert with Row Lock:
    -- Guaranteed concurrency-safe even on initial sequence creation
    INSERT INTO public.document_sequences (tenant_id, document_type, prefix, next_number, number_padding)
    VALUES (p_tenant_id, p_doc_type, v_default_prefix, 2, 4)
    ON CONFLICT (tenant_id, document_type)
    DO UPDATE SET
        next_number = public.document_sequences.next_number + 1,
        updated_at = NOW()
    RETURNING prefix, next_number - 1, number_padding
    INTO v_prefix, v_allocated_num, v_padding;

    v_doc_num := v_prefix || '-' || LPAD(v_allocated_num::TEXT, v_padding, '0');
    RETURN v_doc_num;
END;
$$;

-- ==============================================================================
-- 5. ATOMIC DOUBLE-ENTRY JOURNAL POSTING PROCEDURE
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.post_journal_entry(
    p_tenant_id UUID,
    p_entry_number TEXT,
    p_date DATE,
    p_reference TEXT,
    p_memo TEXT,
    p_lines JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_caller_role VARCHAR(50);
    v_entry_id UUID;
    v_tot_debit NUMERIC(18, 4) := 0.0000;
    v_tot_credit NUMERIC(18, 4) := 0.0000;
    v_line RECORD;
    v_acc RECORD;
    v_line_debit NUMERIC(18, 4);
    v_line_credit NUMERIC(18, 4);
    v_line_count INT := 0;
BEGIN
    -- 1. Authentication check
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Unauthenticated: Authentication required to post journal entries';
    END IF;

    -- 2. Authorization check: caller must have accounting privileges in this tenant
    SELECT tu.role INTO v_caller_role
    FROM public.tenant_users tu
    WHERE tu.tenant_id = p_tenant_id 
      AND tu.user_id = auth.uid() 
      AND tu.is_active = TRUE;

    IF v_caller_role IS NULL THEN
        IF NOT public.is_super_admin() THEN
            RAISE EXCEPTION 'Access denied: Caller is not an authorized member of tenant %', p_tenant_id;
        END IF;
    ELSE
        IF v_caller_role NOT IN ('owner', 'tenant_admin', 'accountant') THEN
            RAISE EXCEPTION 'Permission denied: User role "%" lacks accounting posting privileges for tenant %', v_caller_role, p_tenant_id;
        END IF;
    END IF;

    -- 3. Header validation
    IF p_entry_number IS NULL OR trim(p_entry_number) = '' THEN
        RAISE EXCEPTION 'Invalid entry_number: Entry number cannot be empty';
    END IF;

    IF p_date IS NULL THEN
        RAISE EXCEPTION 'Invalid date: Entry date is required';
    END IF;

    IF p_lines IS NULL OR jsonb_typeof(p_lines) <> 'array' OR jsonb_array_length(p_lines) < 2 THEN
        RAISE EXCEPTION 'Invalid journal lines: Double-entry bookkeeping requires at least 2 lines';
    END IF;

    -- 4. Check for duplicate entry number
    IF EXISTS (
        SELECT 1 FROM public.journal_entries 
        WHERE tenant_id = p_tenant_id AND entry_number = p_entry_number
    ) THEN
        RAISE EXCEPTION 'Duplicate entry number: "%" already exists for tenant %', p_entry_number, p_tenant_id;
    END IF;

    -- 5. Validate every line and calculate balanced totals
    FOR v_line IN SELECT * FROM jsonb_to_recordset(p_lines) AS x(
        account_id UUID,
        account_code VARCHAR,
        account_name VARCHAR,
        debit NUMERIC,
        credit NUMERIC,
        memo TEXT
    ) LOOP
        v_line_count := v_line_count + 1;

        IF v_line.account_id IS NULL THEN
            RAISE EXCEPTION 'Line % error: Account ID is required', v_line_count;
        END IF;

        -- Verify account belongs to THIS tenant (Strict Cross-Tenant Isolation)
        SELECT id, code, name, type INTO v_acc
        FROM public.accounts
        WHERE id = v_line.account_id AND tenant_id = p_tenant_id;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Line % error: Account % does not exist or does not belong to tenant %', v_line_count, v_line.account_id, p_tenant_id;
        END IF;

        v_line_debit := COALESCE(v_line.debit, 0.0000);
        v_line_credit := COALESCE(v_line.credit, 0.0000);

        IF v_line_debit < 0 OR v_line_credit < 0 THEN
            RAISE EXCEPTION 'Line % error: Negative debit or credit is not permitted (debit: %, credit: %)', v_line_count, v_line_debit, v_line_credit;
        END IF;

        IF v_line_debit > 0 AND v_line_credit > 0 THEN
            RAISE EXCEPTION 'Line % error: Account "%" cannot contain both debit and credit amounts', v_line_count, v_acc.code;
        END IF;

        IF v_line_debit = 0 AND v_line_credit = 0 THEN
            RAISE EXCEPTION 'Line % error: Account "%" must contain either a positive debit or credit', v_line_count, v_acc.code;
        END IF;

        v_tot_debit := v_tot_debit + v_line_debit;
        v_tot_credit := v_tot_credit + v_line_credit;
    END LOOP;

    -- 6. Enforce Double-Entry Balancing
    IF ROUND(v_tot_debit, 4) <> ROUND(v_tot_credit, 4) THEN
        RAISE EXCEPTION 'Unbalanced journal entry: Total debits (%) must equal total credits (%)', v_tot_debit, v_tot_credit;
    END IF;

    IF v_tot_debit <= 0 THEN
        RAISE EXCEPTION 'Invalid journal entry: Total amount must be greater than 0.00';
    END IF;

    -- 7. Atomic Write: Insert Journal Entry Header
    INSERT INTO public.journal_entries (tenant_id, entry_number, date, reference, memo, total_debit, total_credit, status, posted_at)
    VALUES (p_tenant_id, p_entry_number, p_date, p_reference, p_memo, v_tot_debit, v_tot_credit, 'posted', NOW())
    RETURNING id INTO v_entry_id;

    -- 8. Insert Lines and Update Chart of Accounts
    FOR v_line IN SELECT * FROM jsonb_to_recordset(p_lines) AS x(
        account_id UUID,
        account_code VARCHAR,
        account_name VARCHAR,
        debit NUMERIC,
        credit NUMERIC,
        memo TEXT
    ) LOOP
        v_line_debit := COALESCE(v_line.debit, 0.0000);
        v_line_credit := COALESCE(v_line.credit, 0.0000);

        INSERT INTO public.journal_lines (tenant_id, journal_entry_id, account_id, account_code, account_name, debit, credit, memo)
        VALUES (p_tenant_id, v_entry_id, v_line.account_id, COALESCE(v_line.account_code, 'ACCT'), COALESCE(v_line.account_name, 'Account'), v_line_debit, v_line_credit, v_line.memo);

        SELECT id, type INTO v_acc
        FROM public.accounts
        WHERE id = v_line.account_id AND tenant_id = p_tenant_id;

        IF v_acc.type IN ('asset', 'expense') THEN
            UPDATE public.accounts
            SET balance = balance + v_line_debit - v_line_credit, updated_at = NOW()
            WHERE id = v_acc.id;
        ELSE
            UPDATE public.accounts
            SET balance = balance + v_line_credit - v_line_debit, updated_at = NOW()
            WHERE id = v_acc.id;
        END IF;
    END LOOP;

    -- 9. Audit Log Entry
    INSERT INTO public.audit_logs (tenant_id, user_id, user_email, action, entity_type, entity_id, details)
    VALUES (
        p_tenant_id, 
        auth.uid(), 
        COALESCE((SELECT email FROM auth.users WHERE id = auth.uid()), 'user@bizchefs.com'), 
        'JOURNAL_POSTED', 
        'JOURNAL_ENTRY', 
        v_entry_id::TEXT, 
        'Posted journal entry ' || p_entry_number || ' for ' || v_tot_debit::TEXT
    );

    RETURN v_entry_id;
END;
$$;

-- ==============================================================================
-- 6. ATOMIC TENANT ONBOARDING PROCEDURE
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.create_tenant_onboarding(
    p_name TEXT,
    p_slug TEXT,
    p_currency TEXT DEFAULT 'USD',
    p_timezone TEXT DEFAULT 'UTC',
    p_tax_number TEXT DEFAULT NULL,
    p_industry TEXT DEFAULT 'General Business'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_tenant_id UUID;
    v_user_email TEXT;
    v_user_name TEXT;
    v_wh_id UUID;
    v_clean_slug TEXT;
BEGIN
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Unauthenticated: Must be an authenticated user to register a tenant workspace';
    END IF;

    -- Look up auth user details
    SELECT email, COALESCE(raw_user_meta_data->>'full_name', split_part(email, '@', 1))
    INTO v_user_email, v_user_name
    FROM auth.users
    WHERE id = auth.uid();

    IF v_user_email IS NULL THEN
        v_user_email := 'user@bizchefs.com';
        v_user_name := 'Workspace Owner';
    END IF;

    v_clean_slug := LOWER(REGEXP_REPLACE(p_slug, '[^a-zA-Z0-9-]', '', 'g')) || '-' || floor(random()*9000 + 1000)::text;

    -- 1. Create Tenant
    INSERT INTO public.tenants (name, slug, industry, base_currency, timezone, tax_number)
    VALUES (p_name, v_clean_slug, p_industry, p_currency, p_timezone, p_tax_number)
    RETURNING id INTO v_tenant_id;

    -- 2. Add Creator as Tenant Owner (Not platform super_admin)
    INSERT INTO public.tenant_users (tenant_id, user_id, email, full_name, role)
    VALUES (v_tenant_id, auth.uid(), v_user_email, v_user_name, 'owner');

    -- 3. Seed Standard Double-Entry Chart of Accounts
    INSERT INTO public.accounts (tenant_id, code, name, type, currency, balance) VALUES
    (v_tenant_id, '1010', 'Operating Bank Account (Cash & Equivalents)', 'asset', p_currency, 0.0000),
    (v_tenant_id, '1200', 'Accounts Receivable (Trade Debtors)', 'asset', p_currency, 0.0000),
    (v_tenant_id, '1300', 'Merchandise & Finished Goods Inventory', 'asset', p_currency, 0.0000),
    (v_tenant_id, '1500', 'Computer & Hardware Equipment', 'asset', p_currency, 0.0000),
    (v_tenant_id, '2010', 'Accounts Payable (Trade Creditors)', 'liability', p_currency, 0.0000),
    (v_tenant_id, '2100', 'Sales Tax & VAT Payable (14%)', 'liability', p_currency, 0.0000),
    (v_tenant_id, '3010', 'Owner Equity & Paid-in Capital', 'equity', p_currency, 0.0000),
    (v_tenant_id, '3020', 'Retained Earnings', 'equity', p_currency, 0.0000),
    (v_tenant_id, '4010', 'Web Engineering & Custom Software Revenue', 'income', p_currency, 0.0000),
    (v_tenant_id, '4020', 'Monthly Website Care & Maintenance Plans', 'income', p_currency, 0.0000),
    (v_tenant_id, '5010', 'Cloud Infrastructure & Server Costs', 'expense', p_currency, 0.0000),
    (v_tenant_id, '6010', 'Staff Salaries & Professional Contractor Fees', 'expense', p_currency, 0.0000),
    (v_tenant_id, '6020', 'Office Rent & Commercial Utilities', 'expense', p_currency, 0.0000);

    -- 4. Seed Default Facility
    INSERT INTO public.warehouses (tenant_id, code, name, is_default)
    VALUES (v_tenant_id, 'WH-MAIN', p_name || ' Central Facility', TRUE)
    RETURNING id INTO v_wh_id;

    -- 5. Seed Initial Document Sequences
    INSERT INTO public.document_sequences (tenant_id, document_type, prefix, next_number, number_padding) VALUES
    (v_tenant_id, 'sales_invoice', 'INV', 1, 4),
    (v_tenant_id, 'quotation', 'QT', 1, 4),
    (v_tenant_id, 'sales_order', 'SO', 1, 4),
    (v_tenant_id, 'purchase_order', 'PO', 1, 4),
    (v_tenant_id, 'journal_entry', 'JV', 1, 4),
    (v_tenant_id, 'payment', 'RCT', 1, 4);

    -- 6. Audit Log
    INSERT INTO public.audit_logs (tenant_id, user_id, user_email, action, entity_type, entity_id, details)
    VALUES (v_tenant_id, auth.uid(), v_user_email, 'TENANT_ONBOARDED', 'TENANT', v_tenant_id::TEXT, 'Onboarded company workspace with initial COA, warehouse and sequences');

    RETURN v_tenant_id;
END;
$$;

-- ==============================================================================
-- 7. GRANULAR LEAST-PRIVILEGE PERMISSION GRANTS
-- ==============================================================================

-- Revoke all permissions from public and anon
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, PUBLIC;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM anon, PUBLIC;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, PUBLIC;

-- Allow authenticated users to connect and utilize the schema
GRANT USAGE ON SCHEMA public TO authenticated;

-- Operational Business Tables: Authenticated users can SELECT, INSERT, UPDATE, DELETE (governed by RLS)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tenants TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tenant_users TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.accounts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.journal_entries TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.journal_lines TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.customers TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sales_invoices TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sales_invoice_lines TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.warehouses TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.items TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.stock_movements TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.suppliers TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.purchase_orders TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.purchase_order_lines TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.quotations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.quotation_lines TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sales_orders TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sales_order_lines TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.employees TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.attendance TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.leave_requests TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.projects TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_tasks TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.timesheets TO authenticated;

-- Document Sequences: SELECT ONLY. Modifications must pass through get_next_document_number()
GRANT SELECT ON public.document_sequences TO authenticated;

-- Audit Logs: SELECT and INSERT ONLY. Updates and deletions are strictly revoked from ordinary users.
GRANT SELECT, INSERT ON public.audit_logs TO authenticated;

-- Platform Super Admins: Completely revoked from authenticated & anon. Accessible ONLY to service_role.
REVOKE ALL ON public.platform_super_admins FROM authenticated, anon, PUBLIC;

-- Stored Procedures: Grant EXECUTE exclusively to authenticated role
GRANT EXECUTE ON FUNCTION public.get_next_document_number(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.post_journal_entry(UUID, TEXT, DATE, TEXT, TEXT, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_tenant_onboarding(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.current_user_tenant_ids() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_super_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_tenant_member(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_role(UUID) TO authenticated;
