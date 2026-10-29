// Accounting Rules & Calculations (Pure logic, tested via node:test)

export interface ValidationResult {
  isValid: boolean;
  totalDebit: number;
  totalCredit: number;
  difference: number;
  error?: string;
}

export function roundCurrency(amount: number): number {
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}

export function validateJournalEntryBalance(lines: { debit: number; credit: number }[]): ValidationResult {
  if (!lines || lines.length < 2) {
    return {
      isValid: false,
      totalDebit: 0,
      totalCredit: 0,
      difference: 0,
      error: 'A balanced journal entry must contain at least 2 line items.'
    };
  }

  let totalDebit = 0;
  let totalCredit = 0;

  for (const line of lines) {
    if (line.debit < 0 || line.credit < 0) {
      return {
        isValid: false,
        totalDebit,
        totalCredit,
        difference: 0,
        error: 'Debit and Credit values cannot be negative.'
      };
    }
    if (line.debit > 0 && line.credit > 0) {
      return {
        isValid: false,
        totalDebit,
        totalCredit,
        difference: 0,
        error: 'A single line cannot have both Debit and Credit amounts.'
      };
    }
    totalDebit += line.debit;
    totalCredit += line.credit;
  }

  totalDebit = roundCurrency(totalDebit);
  totalCredit = roundCurrency(totalCredit);
  const difference = roundCurrency(Math.abs(totalDebit - totalCredit));

  if (difference > 0.009) {
    return {
      isValid: false,
      totalDebit,
      totalCredit,
      difference,
      error: `Journal entry is out of balance by ${difference}. Total Debits (${totalDebit}) must equal Total Credits (${totalCredit}).`
    };
  }

  if (totalDebit === 0 && totalCredit === 0) {
    return {
      isValid: false,
      totalDebit,
      totalCredit,
      difference: 0,
      error: 'Journal entry cannot have zero total amount.'
    };
  }

  return {
    isValid: true,
    totalDebit,
    totalCredit,
    difference: 0
  };
}

export interface StatementAccountSummary {
  code: string;
  name: string;
  type: 'asset' | 'liability' | 'equity' | 'income' | 'expense';
  balance: number;
}

export function computeProfitAndLoss(accounts: StatementAccountSummary[]): {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  revenueAccounts: StatementAccountSummary[];
  expenseAccounts: StatementAccountSummary[];
} {
  const revenueAccounts = accounts.filter(a => a.type === 'income');
  const expenseAccounts = accounts.filter(a => a.type === 'expense');

  const totalRevenue = roundCurrency(revenueAccounts.reduce((sum, a) => sum + a.balance, 0));
  const totalExpenses = roundCurrency(expenseAccounts.reduce((sum, a) => sum + a.balance, 0));
  const netProfit = roundCurrency(totalRevenue - totalExpenses);

  return {
    totalRevenue,
    totalExpenses,
    netProfit,
    revenueAccounts,
    expenseAccounts
  };
}

export function computeBalanceSheet(accounts: StatementAccountSummary[], netProfitFromPnl: number): {
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  totalLiabilitiesAndEquity: number;
  isBalanced: boolean;
} {
  const assetAccounts = accounts.filter(a => a.type === 'asset');
  const liabilityAccounts = accounts.filter(a => a.type === 'liability');
  const equityAccounts = accounts.filter(a => a.type === 'equity');

  const totalAssets = roundCurrency(assetAccounts.reduce((sum, a) => sum + a.balance, 0));
  const totalLiabilities = roundCurrency(liabilityAccounts.reduce((sum, a) => sum + a.balance, 0));
  const baseEquity = roundCurrency(equityAccounts.reduce((sum, a) => sum + a.balance, 0));
  const totalEquity = roundCurrency(baseEquity + netProfitFromPnl);

  const totalLiabilitiesAndEquity = roundCurrency(totalLiabilities + totalEquity);
  const isBalanced = Math.abs(totalAssets - totalLiabilitiesAndEquity) < 0.01;

  return {
    totalAssets,
    totalLiabilities,
    totalEquity,
    totalLiabilitiesAndEquity,
    isBalanced
  };
}
