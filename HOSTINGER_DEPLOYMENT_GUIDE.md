# BizChefs ERP — Hostinger Premium Web Hosting Deployment & Security Runbook

This runbook provides end-to-end instructions for deploying BizChefs ERP to **Hostinger Premium Web Hosting** (`public_html`) using **Supabase PostgreSQL** with Row Level Security (RLS) as the multi-tenant database and authentication engine.

---

## 1. Hosting Architecture Overview

Hostinger Premium Web Hosting is an optimized shared Apache/LiteSpeed web hosting environment.
- **Frontend Architecture**: Static Single-Page Application (HTML5 / JavaScript / CSS) generated via Next.js static export (`output: 'export'`).
- **Target Folder**: All files inside `out/` are uploaded to Hostinger's `public_html/`.
- **Backend Architecture**: Serverless PostgreSQL 15+, Supabase Auth, Storage, and Edge Functions hosted on Supabase Cloud.
- **Client Routing**: Managed by `.htaccess` which rewrites all frontend URLs to `/index.html` without 404 errors.
- **Zero Server Daemon**: No persistent Node.js process, PM2 daemon, or background Express server is required on Hostinger.
- **Secrets Boundary**: Only the public publishable anon key (`NEXT_PUBLIC_SUPABASE_ANON_KEY`) is shipped to the browser. The `service_role` secret key is never embedded in the frontend bundle.

---

## 2. Prerequisites & Credentials

1. **Hostinger Account**: Access to Hostinger hPanel for your domain (e.g. `bizchefs.com` or `erp.bizchefs.com`).
2. **Supabase Cloud Project**:
   - Project URL (e.g., `https://[PROJECT-ID].supabase.co`)
   - Anon / Publishable Public API Key (`NEXT_PUBLIC_SUPABASE_ANON_KEY`)
   - Project Database Settings > SQL Editor access.

> ⚠️ **CRITICAL SECURITY RULE**: NEVER upload or place your `service_role` key in any frontend file, `.env`, or `.htaccess`. Only the `anon` public key is permitted in browser code.

---

## 3. Database Migration Deployment to Supabase

Before deploying the frontend, execute the SQL migrations in order in your Supabase SQL Editor:

### Step 1: Execute Migration 1
Run `/supabase/migrations/20261028000000_bizchefs_erp_schema.sql`:
- Creates `platform_super_admins` table (isolated platform security partition).
- Creates `tenants`, `tenant_users`, `document_sequences`.
- Creates `accounts` (Chart of Accounts), `journal_entries`, `journal_lines` (with debit/credit XOR check constraints).
- Creates `customers`, `sales_invoices`, `sales_invoice_lines`, `payments`.
- Creates `warehouses`, `items`, `stock_movements`, `audit_logs`.
- Enables Row Level Security (RLS) on all tables with explicit `WITH CHECK` clauses.
- Establishes `SET search_path = ''` on `current_user_tenant_ids()`, `is_super_admin()`, and `is_tenant_member()`.

### Step 2: Execute Migration 2
Run `/supabase/migrations/20261028010000_bizchefs_erp_security_and_modules.sql`:
- Adds remaining enterprise modules: `suppliers`, `purchase_orders`, `quotations`, `sales_orders`, `employees`, `attendance`, `leave_requests`, `projects`, `timesheets`.
- Deploys immutable financial ledger triggers (`trg_protect_posted_journal` and `trg_protect_posted_journal_lines`) preventing mutation or deletion of posted journal entries.
- Deploys atomic concurrency-safe stored procedure `get_next_document_number` using atomic `INSERT ... ON CONFLICT DO UPDATE RETURNING` row-locking.
- Deploys atomic double-entry accounting procedure `post_journal_entry` enforcing caller authorization, cross-tenant account isolation, debit=credit balance, and audit logging.
- Deploys atomic tenant onboarding procedure `create_tenant_onboarding`.
- Establishes granular least-privilege grants (revokes all from `anon`/`PUBLIC`; grants least-privilege to `authenticated`).

### Step 3: Run Database Security Verification
Run `/supabase/tests/database_security_test.sql` in the SQL Editor. It runs 15 automated security tests inside a transaction and rolls back automatically, verifying:
- RLS enabled on all tables
- Anonymous role has zero read/write privilege
- Security definer functions have `search_path = ''`
- Audit logs are immutable (no update/delete)
- `post_journal_entry` rejects unauthenticated callers
- `post_journal_entry` rejects forged tenant IDs
- `post_journal_entry` rejects out-of-balance debits/credits
- `post_journal_entry` rejects cross-tenant account contamination
- `get_next_document_number` rejects non-members and increments sequentially without duplicates.

---

## 4. Initial Platform Administrator Provisioning (Dedicated & Safe)

To provision your initial platform super administrator, do **NOT** use public client self-assignment. Instead, execute this single query directly in the **Supabase Dashboard SQL Editor** after signing up your user account:

```sql
-- Replace with your actual user's UUID from Supabase Dashboard > Authentication > Users
INSERT INTO public.platform_super_admins (user_id, email, is_active)
VALUES (
    '[YOUR-USER-UUID-FROM-AUTH-USERS]',
    'sardenafisher@gmail.com',
    TRUE
)
ON CONFLICT (user_id) DO UPDATE SET is_active = TRUE;
```

This table is completely inaccessible to `anon` and `authenticated` roles from the client; it can only be modified via direct SQL or `service_role`.

---

## 5. Configure Supabase Authentication & Security for Hostinger

In your Supabase Dashboard:

### A. URL Configuration
1. Navigate to **Authentication** > **URL Configuration**.
2. Set **Site URL** to:
   ```
   https://erp.bizchefs.com
   ```
3. Add to **Redirect URLs**:
   ```
   https://erp.bizchefs.com/**
   https://bizchefs.com/**
   http://localhost:3000/**
   ```

### B. Email Templates & Recovery Links
1. Navigate to **Authentication** > **Email Templates**.
2. **Confirm signup**:
   - Subject: `Confirm your BizChefs ERP account`
   - Body should contain: `{{ .ConfirmationURL }}`
3. **Reset password**:
   - Subject: `Reset your BizChefs ERP password`
   - Body should contain: `{{ .ConfirmationURL }}`
   - The link will redirect the user to `https://erp.bizchefs.com/#access_token=...&type=recovery` which our client-side router intercepts automatically into the secure Password Reset view.

### C. Rate Limiting & Abuse Prevention
1. In **Authentication** > **Rate Limits**:
   - Email sending rate limit: Default is 3 emails per hour per recipient (protects against spamming).
   - Signup rate limit: Default is 30 signups per hour per IP.
2. In **Authentication** > **Bot Protection**:
   - Enable Cloudflare Turnstile or hCaptcha if your public registration is receiving automated bot traffic.

### D. Private Storage Buckets
The database migration (`20261028010000_bizchefs_erp_security_and_modules.sql`) automatically provisions:
- `erp-documents`: Private bucket (25 MB max file size) for invoices, receipts, and PO attachments.
- `company-assets`: Private bucket (10 MB max file size) for company logos and signatures.
- Both buckets enforce tenant-isolated RLS on `storage.objects` requiring `(storage.foldername(name))[1]` to match an authorized tenant ID.

---

## 6. Building the Production Static Frontend

On your build machine or CI/CD runner:

1. Configure `.env.production` (or inject environment variables):
   ```bash
   NEXT_PUBLIC_SUPABASE_URL="https://your-project-id.supabase.co"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-publishable-key-here"
   ```

2. Run the Next.js static production build:
   ```bash
   npm run build
   ```

3. Verification of build output:
   The build command compiles the static assets into the `out/` directory:
   ```
   out/
   ├── .htaccess        <-- Apache/LiteSpeed SPA rewrite & security headers
   ├── 404.html         <-- Static 404 page
   ├── index.html       <-- Primary SPA application shell
   └── _next/           <-- Versioned, cache-optimized JS/CSS assets
   ```

---

## 7. Uploading to Hostinger `public_html`

### Option A: Using Hostinger hPanel File Manager (Recommended)
1. Log into **Hostinger hPanel**.
2. Go to **Websites** -> Choose your domain -> **File Manager**.
3. Open the `public_html/` directory.
4. Upload all files and folders located **inside `out/`** into `public_html/`.
   - Ensure `out/index.html` resides at `public_html/index.html`.
   - Ensure `out/.htaccess` resides at `public_html/.htaccess`.
   - Ensure `out/_next/` resides at `public_html/_next/`.

### Option B: Using FTP / FTPS
1. In hPanel, create an FTP Account or retrieve your primary credentials.
2. Connect with an FTPS client (FileZilla / Cyberduck):
   - Host: `ftp.yourdomain.com` (or IP in hPanel)
   - Port: `21` (FTPS explicit TLS)
3. Upload the contents of `out/` into `/public_html/`.

---

## 8. Apache / LiteSpeed `.htaccess` Configuration

The `.htaccess` file is automatically placed into `out/` during build. Its rules provide:
1. **SPA Client Routing**:
   ```apache
   RewriteEngine On
   RewriteBase /
   RewriteCond %{REQUEST_FILENAME} !-f
   RewriteCond %{REQUEST_FILENAME} !-d
   RewriteRule ^ index.html [L]
   ```
2. **HTTP Security Headers**:
   - `X-Frame-Options: SAMEORIGIN`
   - `X-Content-Type-Options: nosniff`
   - `X-XSS-Protection: "1; mode=block"`
   - `Referrer-Policy: strict-origin-when-cross-origin`
   - `Permissions-Policy: geolocation=(), microphone=(), camera=()`
3. **MIME Types & Compression**: Gzip/Brotli compression for HTML, CSS, JavaScript, and SVG.
4. **Cache Optimization**: 1-year immutable caching for fingerprinted `_next/` chunks; `no-cache` for `index.html`.

---

## 9. Post-Deployment Verification Checklist

1. [ ] Navigate to `https://your-domain.com`.
2. [ ] Verify the header displays **"Supabase (Auth Needed)"** or **"Supabase Connected"** rather than "Supabase Unconfigured".
3. [ ] Click **"Sign In / Register"** and register or sign in with your administrator account.
4. [ ] Verify user session persists across browser page reloads.
5. [ ] Create a customer and generate an invoice; verify document sequence `INV-0001` increments properly.
6. [ ] Post a journal entry in **Accounting & Ledger**; verify double-entry validation succeeds and ledger balance updates.
7. [ ] Attempt an invalid entry (e.g., debits != credits); verify that the database error is surfaced clearly in the UI.
8. [ ] Refresh the browser on any internal route; verify that the `.htaccess` rewrite serves `index.html` without a 404 error.
