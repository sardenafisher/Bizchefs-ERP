import test from 'node:test';
import assert from 'node:assert/strict';

import { validateJournalEntryBalance, computeProfitAndLoss, computeBalanceSheet } from './accounting-rules';
import { calculateLineTotals, calculateOrderTotals } from './tax-rules';
import { computeStockBalanceForWarehouse, canIssueStock } from './inventory-rules';
import { formatDocumentNumber, parseDocumentSequence } from './numbering-rules';

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
