-- ==============================================================================
-- BIZCHEFS ERP: AUTOMATED DATABASE SECURITY & MULTI-TENANT ISOLATION TESTS
-- File: /supabase/tests/database_security_test.sql
-- Framework: PostgreSQL / pgTAP / Transaction-Safe Test Suite
-- Target: Supabase PostgreSQL (15+)
-- Notice: Runs entirely within a transaction and rolls back automatically.
-- ==============================================================================

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgtap;

SELECT plan(15);

-- ------------------------------------------------------------------------------
-- FIXTURE SETUP
-- ------------------------------------------------------------------------------
DO $$
DECLARE
    v_user_a_id UUID := '11111111-1111-4111-8111-111111111111';
    v_user_b_id UUID := '22222222-2222-4222-8222-222222222222';
    v_tenant_a_id UUID := 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
    v_tenant_b_id UUID := 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
    v_acc_a_cash UUID := 'a1111111-1111-4111-8111-111111111111';
    v_acc_a_rev UUID := 'a2222222-2222-4222-8222-222222222222';
    v_acc_b_cash UUID := 'b1111111-1111-4111-8111-111111111111';
BEGIN
    -- Insert test tenants
    INSERT INTO public.tenants (id, name, slug, base_currency) VALUES
    (v_tenant_a_id, 'Tenant Alpha LLC', 'tenant-alpha-test', 'USD'),
    (v_tenant_b_id, 'Tenant Beta Corp', 'tenant-beta-test', 'USD')
    ON CONFLICT (id) DO NOTHING;

    -- Insert mock auth users if auth.users table is present
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users') THEN
        INSERT INTO auth.users (id, email, raw_user_meta_data)
        VALUES 
        (v_user_a_id, 'alice@alpha.com', '{"full_name": "Alice Alpha"}'),
        (v_user_b_id, 'bob@beta.com', '{"full_name": "Bob Beta"}')
        ON CONFLICT (id) DO NOTHING;
    END IF;

    -- Associate memberships
    INSERT INTO public.tenant_users (tenant_id, user_id, email, full_name, role, is_active) VALUES
    (v_tenant_a_id, v_user_a_id, 'alice@alpha.com', 'Alice Alpha', 'accountant', TRUE),
    (v_tenant_b_id, v_user_b_id, 'bob@beta.com', 'Bob Beta', 'accountant', TRUE)
    ON CONFLICT (tenant_id, user_id) DO NOTHING;

    -- Insert Chart of Accounts
    INSERT INTO public.accounts (id, tenant_id, code, name, type) VALUES
    (v_acc_a_cash, v_tenant_a_id, '1010', 'Alpha Cash', 'asset'),
    (v_acc_a_rev, v_tenant_a_id, '4010', 'Alpha Revenue', 'income'),
    (v_acc_b_cash, v_tenant_b_id, '1010', 'Beta Cash', 'asset')
    ON CONFLICT (tenant_id, code) DO NOTHING;

    -- Insert an Invoice in Tenant Alpha
    INSERT INTO public.customers (id, tenant_id, code, name, email, phone)
    VALUES ('c1111111-1111-4111-8111-111111111111', v_tenant_a_id, 'CUST-01', 'Alpha Client', 'client@alpha.com', '123')
    ON CONFLICT (tenant_id, code) DO NOTHING;

    INSERT INTO public.sales_invoices (id, tenant_id, invoice_number, customer_id, customer_name, due_date, subtotal, grand_total, balance_due)
    VALUES ('e1111111-1111-4111-8111-111111111111', v_tenant_a_id, 'INV-0001', 'c1111111-1111-4111-8111-111111111111', 'Alpha Client', CURRENT_DATE + 30, 1000.00, 1000.00, 1000.00)
    ON CONFLICT (tenant_id, invoice_number) DO NOTHING;
END $$;

-- ------------------------------------------------------------------------------
-- TEST 1: RLS Enabled on All Tables
-- ------------------------------------------------------------------------------
SELECT ok(
    (SELECT relrowsecurity FROM pg_class WHERE relname = 'sales_invoices'),
    'Test 1: RLS is enabled on public.sales_invoices'
);

SELECT ok(
    (SELECT relrowsecurity FROM pg_class WHERE relname = 'journal_entries'),
    'Test 2: RLS is enabled on public.journal_entries'
);

SELECT ok(
    (SELECT relrowsecurity FROM pg_class WHERE relname = 'accounts'),
    'Test 3: RLS is enabled on public.accounts'
);

-- ------------------------------------------------------------------------------
-- TEST 4: Anonymous Access is Completely Revoked
-- ------------------------------------------------------------------------------
SELECT ok(
    NOT has_table_privilege('anon', 'public.sales_invoices', 'SELECT'),
    'Test 4: Anonymous user has NO SELECT privilege on sales_invoices'
);

SELECT ok(
    NOT has_table_privilege('anon', 'public.journal_entries', 'INSERT'),
    'Test 5: Anonymous user has NO INSERT privilege on journal_entries'
);

-- ------------------------------------------------------------------------------
-- TEST 6: Function Search Path Hardening
-- ------------------------------------------------------------------------------
SELECT ok(
    (SELECT proconfig FROM pg_proc WHERE proname = 'post_journal_entry' LIMIT 1) @> ARRAY['search_path='],
    'Test 6: post_journal_entry enforces search_path = '''''
);

SELECT ok(
    (SELECT proconfig FROM pg_proc WHERE proname = 'get_next_document_number' LIMIT 1) @> ARRAY['search_path='],
    'Test 7: get_next_document_number enforces search_path = '''''
);

-- ------------------------------------------------------------------------------
-- TEST 8: Audit Logs Protection (No UPDATE or DELETE privileges)
-- ------------------------------------------------------------------------------
SELECT ok(
    NOT has_table_privilege('authenticated', 'public.audit_logs', 'UPDATE'),
    'Test 8: Authenticated users CANNOT update audit_logs (Immutable)'
);

SELECT ok(
    NOT has_table_privilege('authenticated', 'public.audit_logs', 'DELETE'),
    'Test 9: Authenticated users CANNOT delete audit_logs (Immutable)'
);

-- ------------------------------------------------------------------------------
-- TEST 10: post_journal_entry Rejects Unauthenticated Callers
-- ------------------------------------------------------------------------------
SELECT throws_ok(
    $$
    SELECT public.post_journal_entry(
        'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'::UUID,
        'JV-TEST-01',
        CURRENT_DATE,
        'REF',
        'Memo',
        '[{"account_id": "a1111111-1111-4111-8111-111111111111", "debit": 100, "credit": 0}, {"account_id": "a2222222-2222-4222-8222-222222222222", "debit": 0, "credit": 100}]'::JSONB
    );
    $$,
    'Unauthenticated: Authentication required to post journal entries',
    'Test 10: post_journal_entry rejects unauthenticated callers'
);

-- ------------------------------------------------------------------------------
-- TEST 11: post_journal_entry Rejects Forged Tenant IDs
-- ------------------------------------------------------------------------------
SELECT throws_ok(
    $$
    -- Simulate authenticated User A calling RPC with Tenant B
    SET LOCAL "request.jwt.claims" = '{"sub": "11111111-1111-4111-8111-111111111111", "role": "authenticated"}';
    SELECT public.post_journal_entry(
        'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'::UUID, -- Forged Tenant B
        'JV-TEST-FORGE',
        CURRENT_DATE,
        'REF',
        'Forged Memo',
        '[{"account_id": "b1111111-1111-4111-8111-111111111111", "debit": 500, "credit": 0}, {"account_id": "b1111111-1111-4111-8111-111111111111", "debit": 0, "credit": 500}]'::JSONB
    );
    $$,
    '%Access denied: Caller is not an authorized member of tenant%',
    'Test 11: post_journal_entry rejects calls for unauthorized/forged tenant IDs'
);

-- ------------------------------------------------------------------------------
-- TEST 12: post_journal_entry Rejects Out-of-Balance Entries
-- ------------------------------------------------------------------------------
SELECT throws_ok(
    $$
    SET LOCAL "request.jwt.claims" = '{"sub": "11111111-1111-4111-8111-111111111111", "role": "authenticated"}';
    SELECT public.post_journal_entry(
        'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'::UUID,
        'JV-TEST-UNBALANCED',
        CURRENT_DATE,
        'REF',
        'Unbalanced',
        '[{"account_id": "a1111111-1111-4111-8111-111111111111", "debit": 100, "credit": 0}, {"account_id": "a2222222-2222-4222-8222-222222222222", "debit": 0, "credit": 90}]'::JSONB
    );
    $$,
    '%Unbalanced journal entry%',
    'Test 12: post_journal_entry rejects unbalanced debits and credits'
);

-- ------------------------------------------------------------------------------
-- TEST 13: post_journal_entry Rejects Cross-Tenant Account Contamination
-- ------------------------------------------------------------------------------
SELECT throws_ok(
    $$
    SET LOCAL "request.jwt.claims" = '{"sub": "11111111-1111-4111-8111-111111111111", "role": "authenticated"}';
    SELECT public.post_journal_entry(
        'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'::UUID,
        'JV-TEST-CROSS-TENANT',
        CURRENT_DATE,
        'REF',
        'Contaminated Lines',
        -- Tries to credit Tenant B's cash account inside Tenant A's journal!
        '[{"account_id": "a1111111-1111-4111-8111-111111111111", "debit": 200, "credit": 0}, {"account_id": "b1111111-1111-4111-8111-111111111111", "debit": 0, "credit": 200}]'::JSONB
    );
    $$,
    '%does not exist or does not belong to tenant%',
    'Test 13: post_journal_entry rejects accounts belonging to a different tenant'
);

-- ------------------------------------------------------------------------------
-- TEST 14: get_next_document_number Rejects Non-Members
-- ------------------------------------------------------------------------------
SELECT throws_ok(
    $$
    SET LOCAL "request.jwt.claims" = '{"sub": "11111111-1111-4111-8111-111111111111", "role": "authenticated"}';
    -- User A tries to generate a sequence number for Tenant B
    SELECT public.get_next_document_number('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'::UUID, 'sales_invoice');
    $$,
    '%Access denied: Caller is not an authorized member of tenant%',
    'Test 14: get_next_document_number rejects unauthorized tenants'
);

-- ------------------------------------------------------------------------------
-- TEST 15: Concurrency-Safe get_next_document_number Increments Sequentially
-- ------------------------------------------------------------------------------
SELECT is(
    (
        SELECT public.get_next_document_number('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'::UUID, 'sales_invoice')
        FROM (SELECT set_config('request.jwt.claims', '{"sub": "11111111-1111-4111-8111-111111111111", "role": "authenticated"}', true)) x
    ),
    'INV-0001',
    'Test 15: get_next_document_number produces correct formatted initial document number'
);

SELECT * FROM finish();

ROLLBACK;
