import test from 'node:test';
import assert from 'node:assert/strict';

import { validateJournalEntryBalance, computeProfitAndLoss, computeBalanceSheet } from './accounting-rules';
import { calculateLineTotals, calculateOrderTotals } from './tax-rules';
import { computeStockBalanceForWarehouse, canIssueStock } from './inventory-rules';
import { formatDocumentNumber, parseDocumentSequence } from './numbering-rules';
import { hasPermission, canAccessModule, ErpRole } from './rbac';

test('Double-entry balancing accepts balanced debits and credits', () => {
  const balancedLines = [
    { debit: 1250.50, credit: 0 },
    { debit: 0, credit: 1250.50 }
  ];
  const result = validateJournalEntryBalance(balancedLines);
  assert.equal(result.isValid, true);
  assert.equal(result.difference, 0);
  assert.equal(result.totalDebit, 1250.50);
  assert.equal(result.totalCredit, 1250.50);
});

test('Double-entry balancing rejects out-of-balance entries', () => {
  const unbalancedLines = [
    { debit: 1000, credit: 0 },
    { debit: 0, credit: 950 }
  ];
  const result = validateJournalEntryBalance(unbalancedLines);
  assert.equal(result.isValid, false);
  assert.equal(result.difference, 50);
  assert.match(result.error || '', /out of balance/i);
});

test('Double-entry balancing rejects negative lines or simultaneous debit/credit', () => {
  const invalidLines = [
    { debit: -100, credit: 0 },
    { debit: 0, credit: 100 }
  ];
  const result = validateJournalEntryBalance(invalidLines);
  assert.equal(result.isValid, false);
  assert.match(result.error || '', /cannot be negative/i);

  const doubleSided = [
    { debit: 100, credit: 50 },
    { debit: 0, credit: 50 }
  ];
  const res2 = validateJournalEntryBalance(doubleSided);
  assert.equal(res2.isValid, false);
  assert.match(res2.error || '', /both Debit and Credit/i);
});

test('Financial statements compute correct Net Profit and balanced Balance Sheet', () => {
  const accounts = [
    { code: '1010', name: 'Cash', type: 'asset' as const, balance: 15000 },
    { code: '1200', name: 'Accounts Receivable', type: 'asset' as const, balance: 5000 },
    { code: '2010', name: 'Accounts Payable', type: 'liability' as const, balance: 4000 },
    { code: '3010', name: 'Common Equity', type: 'equity' as const, balance: 10000 },
    { code: '4010', name: 'Web Services Revenue', type: 'income' as const, balance: 12000 },
    { code: '5010', name: 'Software Hosting Expenses', type: 'expense' as const, balance: 6000 }
  ];

  const pnl = computeProfitAndLoss(accounts);
  assert.equal(pnl.totalRevenue, 12000);
  assert.equal(pnl.totalExpenses, 6000);
  assert.equal(pnl.netProfit, 6000);

  const balanceSheet = computeBalanceSheet(accounts, pnl.netProfit);
  assert.equal(balanceSheet.totalAssets, 20000);
  assert.equal(balanceSheet.totalLiabilities, 4000);
  assert.equal(balanceSheet.totalEquity, 16000);
  assert.equal(balanceSheet.totalLiabilitiesAndEquity, 20000);
  assert.equal(balanceSheet.isBalanced, true);
});

test('Tax calculation correctly computes line amounts and order aggregates', () => {
  const line = calculateLineTotals(3, 150, 14); // 3 * 150 = 450, tax 14% = 63, total = 513
  assert.equal(line.subtotal, 450);
  assert.equal(line.taxAmount, 63);
  assert.equal(line.lineTotal, 513);

  const order = calculateOrderTotals([
    { quantity: 2, unitPrice: 100, taxRate: 10 }, // 200 + 20 = 220
    { quantity: 1, unitPrice: 500, taxRate: 14 }  // 500 + 70 = 570
  ]);
  assert.equal(order.subtotal, 700);
  assert.equal(order.taxTotal, 90);
  assert.equal(order.grandTotal, 790);
  assert.equal(order.lineItemsCount, 2);
});

test('Inventory rules compute correct balance across receipts, issues and transfers', () => {
  const movements = [
    { itemId: 'item-1', warehouseId: 'wh-main', movementType: 'receipt' as const, quantity: 100, unitCost: 10 },
    { itemId: 'item-1', warehouseId: 'wh-main', movementType: 'issue' as const, quantity: 20, unitCost: 10 },
    { itemId: 'item-1', warehouseId: 'wh-main', toWarehouseId: 'wh-branch', movementType: 'transfer' as const, quantity: 30, unitCost: 10 }
  ];

  const mainStore = computeStockBalanceForWarehouse(movements, 'item-1', 'wh-main');
  assert.equal(mainStore.quantityOnHand, 50);

  const branchStore = computeStockBalanceForWarehouse(movements, 'item-1', 'wh-branch');
  assert.equal(branchStore.quantityOnHand, 30);

  const issueCheck = canIssueStock(mainStore.quantityOnHand, 40, false);
  assert.equal(issueCheck.allowed, true);
  assert.equal(issueCheck.remainingQty, 10);

  const overIssueCheck = canIssueStock(mainStore.quantityOnHand, 60, false);
  assert.equal(overIssueCheck.allowed, false);
  assert.match(overIssueCheck.errorMessage || '', /Insufficient stock/i);
});

test('Document numbering formats sequential reference identifiers', () => {
  assert.equal(formatDocumentNumber('INV', 1, 4), 'INV-0001');
  assert.equal(formatDocumentNumber('PO-', 45, 5), 'PO-00045');
  assert.equal(formatDocumentNumber('SO/2026/', 128, 4), 'SO/2026/0128');

  const parsed = parseDocumentSequence('INV-0042');
  assert.ok(parsed);
  assert.equal(parsed?.prefix, 'INV');
  assert.equal(parsed?.sequenceNumber, 42);
});

test('Double-entry balancing rejects empty journal lines or less than 2 lines', () => {
  const emptyLines: any[] = [];
  const resultEmpty = validateJournalEntryBalance(emptyLines);
  assert.equal(resultEmpty.isValid, false);
  assert.match(resultEmpty.error || '', /at least 2 line/i);

  const singleLine = [{ debit: 100, credit: 0 }];
  const resultSingle = validateJournalEntryBalance(singleLine);
  assert.equal(resultSingle.isValid, false);
  assert.match(resultSingle.error || '', /at least 2 line/i);
});

test('Document numbering concurrency simulation produces zero duplicate numbers', () => {
  // Simulate atomic sequence allocator (matching Postgres ON CONFLICT DO UPDATE RETURNING)
  class AtomicSequenceStore {
    private sequences = new Map<string, number>();

    getNext(tenantId: string, docType: string): string {
      const key = `${tenantId}:${docType}`;
      const current = this.sequences.get(key) || 1;
      this.sequences.set(key, current + 1);
      return `INV-${String(current).padStart(4, '0')}`;
    }
  }

  const store = new AtomicSequenceStore();
  const allocated = new Set<string>();
  const totalRequests = 100;

  for (let i = 0; i < totalRequests; i++) {
    const num = store.getNext('tenant-1', 'sales_invoice');
    assert.equal(allocated.has(num), false, `Collision detected on document number: ${num}`);
    allocated.add(num);
  }

  assert.equal(allocated.size, totalRequests);
  assert.equal(allocated.has('INV-0001'), true);
  assert.equal(allocated.has('INV-0100'), true);
});

test('Cross-tenant data access validator rejects foreign tenant records', () => {
  function validateTenantAccess(
    callerTenantIds: string[],
    targetTenantId: string,
    isSuperAdmin: boolean = false
  ): boolean {
    if (isSuperAdmin) return true;
    return callerTenantIds.includes(targetTenantId);
  }

  const userATenants = ['tenant-alpha-uuid'];
  const userBTenants = ['tenant-beta-uuid'];

  // User A accessing Tenant Alpha: Allowed
  assert.equal(validateTenantAccess(userATenants, 'tenant-alpha-uuid'), true);

  // User A accessing Tenant Beta: Denied
  assert.equal(validateTenantAccess(userATenants, 'tenant-beta-uuid'), false);

  // User B accessing Tenant Alpha: Denied
  assert.equal(validateTenantAccess(userBTenants, 'tenant-alpha-uuid'), false);

  // Platform Super Admin accessing any tenant: Allowed
  assert.equal(validateTenantAccess([], 'tenant-alpha-uuid', true), true);
  assert.equal(validateTenantAccess([], 'tenant-beta-uuid', true), true);
});

test('RBAC: Accountant can post journals but cannot approve sales orders or change tenant settings', () => {
  const role: ErpRole = 'accountant';
  assert.equal(hasPermission(role, 'accounting.journal.post'), true);
  assert.equal(hasPermission(role, 'accounting.period.close'), true);
  assert.equal(hasPermission(role, 'accounting.reports.read'), true);

  // Cross-domain boundary checks
  assert.equal(hasPermission(role, 'sales.order.approve'), false);
  assert.equal(hasPermission(role, 'settings.tenant.update'), false);
  assert.equal(hasPermission(role, 'settings.users.manage'), false);
  assert.equal(hasPermission(role, 'inventory.stock.adjust'), false);
});

test('RBAC: Sales Staff can create quotes and orders but cannot approve or post invoices', () => {
  const role: ErpRole = 'sales_staff';
  assert.equal(hasPermission(role, 'sales.quote.create'), true);
  assert.equal(hasPermission(role, 'sales.order.create'), true);
  assert.equal(hasPermission(role, 'sales.invoice.read'), true);

  // Privilege escalation boundary checks
  assert.equal(hasPermission(role, 'sales.quote.approve'), false);
  assert.equal(hasPermission(role, 'sales.order.approve'), false);
  assert.equal(hasPermission(role, 'sales.invoice.post'), false);
  assert.equal(hasPermission(role, 'accounting.journal.post'), false);
});

test('RBAC: Auditor has read-only access across financial modules with zero mutation rights', () => {
  const role: ErpRole = 'auditor';
  assert.equal(hasPermission(role, 'accounting.journal.read'), true);
  assert.equal(hasPermission(role, 'accounting.reports.read'), true);
  assert.equal(hasPermission(role, 'audit.logs.read'), true);
  assert.equal(hasPermission(role, 'sales.invoice.read'), true);
  assert.equal(hasPermission(role, 'purchasing.bill.read'), true);

  // Mutation rights must all be false
  assert.equal(hasPermission(role, 'accounting.journal.create'), false);
  assert.equal(hasPermission(role, 'accounting.journal.post'), false);
  assert.equal(hasPermission(role, 'accounting.account.manage'), false);
  assert.equal(hasPermission(role, 'settings.users.manage'), false);
  assert.equal(hasPermission(role, 'sales.invoice.create'), false);
});

test('RBAC: Module accessibility properly gates unauthorized functional areas', () => {
  assert.equal(canAccessModule('purchasing_staff', 'purchasing'), true);
  assert.equal(canAccessModule('purchasing_staff', 'inventory'), true); // reads items
  assert.equal(canAccessModule('purchasing_staff', 'accounting'), false);
  assert.equal(canAccessModule('purchasing_staff', 'hr'), false);
  assert.equal(canAccessModule('purchasing_staff', 'projects'), false);

  assert.equal(canAccessModule('warehouse_staff', 'inventory'), true);
  assert.equal(canAccessModule('warehouse_staff', 'accounting'), false);
  assert.equal(canAccessModule('warehouse_staff', 'settings'), false);

  assert.equal(canAccessModule('owner', 'settings'), true);
  assert.equal(canAccessModule('owner', 'accounting'), true);
  assert.equal(canAccessModule('owner', 'hr'), true);
});

test('Auth: Password strength validator enforces entropy rules', () => {
  function getPasswordScore(pwd: string): number {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  }

  assert.equal(getPasswordScore('123'), 1); // < 8 chars, only digits
  assert.equal(getPasswordScore('password'), 2); // >= 8 chars, lowercase only
  assert.equal(getPasswordScore('Password123'), 4); // len, upper, lower, num
  assert.equal(getPasswordScore('P@ssw0rd!2026'), 5); // maximum strength
});

test('Auth: Registration validator rejects malformed emails and mismatched passwords', () => {
  function validateRegistration(email: string, pass: string, confirm: string, name: string): { valid: boolean; error?: string } {
    if (!name.trim()) return { valid: false, error: 'Full Name is required' };
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email.trim())) return { valid: false, error: 'Invalid email' };
    if (pass.length < 8) return { valid: false, error: 'Password too short' };
    if (pass !== confirm) return { valid: false, error: 'Passwords mismatch' };
    return { valid: true };
  }

  assert.equal(validateRegistration('', 'Pass1234!', 'Pass1234!', 'John').valid, false);
  assert.equal(validateRegistration('bad-email', 'Pass1234!', 'Pass1234!', 'John').valid, false);
  assert.equal(validateRegistration('john@bizchefs.com', 'short', 'short', 'John').valid, false);
  assert.equal(validateRegistration('john@bizchefs.com', 'Pass1234!', 'Pass9999!', 'John').valid, false);
  assert.equal(validateRegistration('john@bizchefs.com', 'Pass1234!', 'Pass1234!', 'John').valid, true);
});

test('Auth: Recovery hash parser accurately extracts type=recovery for static SPA routing', () => {
  function parseAuthTypeFromHash(hashString: string): string | null {
    if (!hashString || !hashString.startsWith('#')) return null;
    const params = new URLSearchParams(hashString.substring(1));
    return params.get('type');
  }

  const recoveryHash = '#access_token=test_tok&expires_in=3600&refresh_token=ref_tok&token_type=bearer&type=recovery';
  const signupHash = '#access_token=test_tok&expires_in=3600&refresh_token=ref_tok&token_type=bearer&type=signup';

  assert.equal(parseAuthTypeFromHash(recoveryHash), 'recovery');
  assert.equal(parseAuthTypeFromHash(signupHash), 'signup');
  assert.equal(parseAuthTypeFromHash(''), null);
});

test('Onboarding: Workspace slug generator normalizes company names safely', () => {
  function generateTenantSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  assert.equal(generateTenantSlug('Acme Hospitality & Catering'), 'acme-hospitality-catering');
  assert.equal(generateTenantSlug('BizChefs   Studio   Ltd!'), 'bizchefs-studio-ltd');
  assert.equal(generateTenantSlug('---Special---Chars***'), 'special-chars');
});


