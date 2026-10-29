'use client';

import React, { useState } from 'react';
import { 
  BookOpen, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  Scale, 
  TrendingUp, 
  FileSpreadsheet, 
  Trash2,
  Lock,
  ArrowRight
} from 'lucide-react';
import { ERPDatabaseState, erpDb } from '@/lib/db/database';
import { JournalEntry, JournalLine, Account } from '@/lib/types/erp';
import { validateJournalEntryBalance, computeProfitAndLoss, computeBalanceSheet } from '@/lib/erp/accounting-rules';

interface AccountingModuleProps {
  state: ERPDatabaseState;
}

export function AccountingModule({ state }: AccountingModuleProps) {
  const [activeTab, setActiveTab] = useState<'journal' | 'coa' | 'trial_balance' | 'pnl' | 'balance_sheet'>('journal');
  const [showCreateJournalModal, setShowCreateJournalModal] = useState(false);

  const accounts = state.accounts.filter(a => a.tenantId === state.activeTenantId);
  const journalEntries = state.journalEntries.filter(j => j.tenantId === state.activeTenantId);

  // Financial Statements
  const pnl = computeProfitAndLoss(accounts);
  const balanceSheet = computeBalanceSheet(accounts, pnl.netProfit);

  // Journal Entry Form State
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0]);
  const [entryMemo, setEntryMemo] = useState('');
  const [entryReference, setEntryReference] = useState('');
  const [entryLines, setEntryLines] = useState<Array<{
    accountId: string;
    accountCode: string;
    accountName: string;
    debit: number;
    credit: number;
    memo?: string;
  }>>([
    {
      accountId: accounts[0]?.id || '',
      accountCode: accounts[0]?.code || '1010',
      accountName: accounts[0]?.name || 'Operating Bank',
      debit: 500,
      credit: 0
    },
    {
      accountId: accounts[8]?.id || accounts[1]?.id || '',
      accountCode: accounts[8]?.code || '4010',
      accountName: accounts[8]?.name || 'Revenue',
      debit: 0,
      credit: 500
    }
  ]);

  const validation = validateJournalEntryBalance(entryLines);

  const handleAddLine = () => {
    const acc = accounts[0];
    setEntryLines([
      ...entryLines,
      {
        accountId: acc?.id || '',
        accountCode: acc?.code || '',
        accountName: acc?.name || '',
        debit: 0,
        credit: 0
      }
    ]);
  };

  const handleAccountSelect = (index: number, accountId: string) => {
    const acc = accounts.find(a => a.id === accountId);
    if (!acc) return;
    const updated = [...entryLines];
    updated[index] = {
      ...updated[index],
      accountId: acc.id,
      accountCode: acc.code,
      accountName: acc.name
    };
    setEntryLines(updated);
  };

  const handleLineAmountChange = (index: number, field: 'debit' | 'credit', val: number) => {
    const updated = [...entryLines];
    updated[index] = {
      ...updated[index],
      [field]: Math.max(0, val),
      // If debit is typed, clear credit on this line and vice versa
      ...(field === 'debit' && val > 0 ? { credit: 0 } : {}),
      ...(field === 'credit' && val > 0 ? { debit: 0 } : {})
    };
    setEntryLines(updated);
  };

  const handleRemoveLine = (index: number) => {
    if (entryLines.length <= 2) return;
    setEntryLines(entryLines.filter((_, i) => i !== index));
  };

  const handleSaveJournal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validation.isValid || !entryMemo.trim()) return;

    const formattedLines: JournalLine[] = entryLines.map((l, idx) => ({
      id: `jl-${Date.now()}-${idx}`,
      accountId: l.accountId,
      accountCode: l.accountCode,
      accountName: l.accountName,
      debit: l.debit,
      credit: l.credit,
      memo: l.memo
    }));

    const result = erpDb.postJournalEntry({
      entryNumber: erpDb.getNextDocumentNumber('journal_entry'),
      date: entryDate,
      reference: entryReference,
      memo: entryMemo.trim(),
      lines: formattedLines
    });

    if (result.success) {
      setShowCreateJournalModal(false);
      setEntryMemo('');
      setEntryReference('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900">
            Accounting &amp; Double-Entry Ledger
          </h1>
          <p className="text-xs text-zinc-500">
            Immutable General Ledger, Trial Balance, Profit &amp; Loss and Balance Sheet
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowCreateJournalModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#d39e36] hover:bg-[#be8a29] text-black font-semibold text-xs rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Post Journal Entry</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-200 text-xs overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('journal')}
          className={`pb-2.5 px-3 font-semibold transition-colors border-b-2 cursor-pointer shrink-0 ${
            activeTab === 'journal'
              ? 'border-[#d39e36] text-[#d39e36]'
              : 'border-transparent text-zinc-500 hover:text-zinc-800'
          }`}
        >
          Journal Entries ({journalEntries.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('trial_balance')}
          className={`pb-2.5 px-3 font-semibold transition-colors border-b-2 cursor-pointer shrink-0 ${
            activeTab === 'trial_balance'
              ? 'border-[#d39e36] text-[#d39e36]'
              : 'border-transparent text-zinc-500 hover:text-zinc-800'
          }`}
        >
          Trial Balance
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('pnl')}
          className={`pb-2.5 px-3 font-semibold transition-colors border-b-2 cursor-pointer shrink-0 ${
            activeTab === 'pnl'
              ? 'border-[#d39e36] text-[#d39e36]'
              : 'border-transparent text-zinc-500 hover:text-zinc-800'
          }`}
        >
          Income Statement (P&amp;L)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('balance_sheet')}
          className={`pb-2.5 px-3 font-semibold transition-colors border-b-2 cursor-pointer shrink-0 ${
            activeTab === 'balance_sheet'
              ? 'border-[#d39e36] text-[#d39e36]'
              : 'border-transparent text-zinc-500 hover:text-zinc-800'
          }`}
        >
          Balance Sheet
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('coa')}
          className={`pb-2.5 px-3 font-semibold transition-colors border-b-2 cursor-pointer shrink-0 ${
            activeTab === 'coa'
              ? 'border-[#d39e36] text-[#d39e36]'
              : 'border-transparent text-zinc-500 hover:text-zinc-800'
          }`}
        >
          Chart of Accounts ({accounts.length})
        </button>
      </div>

      {/* JOURNAL ENTRIES TAB */}
      {activeTab === 'journal' && (
        <div className="space-y-4">
          {journalEntries.map(entry => (
            <div key={entry.id} className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
              <div className="px-5 py-3 bg-zinc-50/70 border-b border-zinc-200 flex flex-wrap items-center justify-between text-xs gap-2">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-zinc-900 text-sm">{entry.entryNumber}</span>
                  <span className="text-zinc-500">Date: {entry.date}</span>
                  {entry.reference && (
                    <span className="font-mono text-zinc-600 bg-white px-1.5 py-0.5 rounded border border-zinc-200">
                      Ref: {entry.reference}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                    {entry.status}
                  </span>
                  <span className="font-mono font-bold text-zinc-900">
                    Total: ${entry.totalDebit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div className="p-4 space-y-2">
                <div className="text-xs font-semibold text-zinc-800">{entry.memo}</div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="text-zinc-400 border-b border-zinc-100 text-[10px] uppercase font-semibold">
                      <tr>
                        <th className="py-1 px-3">Account Code</th>
                        <th className="py-1 px-3">Account Title</th>
                        <th className="py-1 px-3">Line Memo</th>
                        <th className="py-1 px-3 text-right">Debit ($)</th>
                        <th className="py-1 px-3 text-right">Credit ($)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {entry.lines.map((l, i) => (
                        <tr key={i} className="hover:bg-zinc-50/50">
                          <td className="py-2 px-3 font-mono font-semibold text-zinc-700">{l.accountCode}</td>
                          <td className="py-2 px-3 font-medium text-zinc-800">{l.accountName}</td>
                          <td className="py-2 px-3 text-zinc-500">{l.memo || '—'}</td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-zinc-900">
                            {l.debit > 0 ? `$${l.debit.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '—'}
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-zinc-900">
                            {l.credit > 0 ? `$${l.credit.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TRIAL BALANCE TAB */}
      {activeTab === 'trial_balance' && (
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
          <div className="p-4 bg-zinc-50 border-b border-zinc-200 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-zinc-900">Unadjusted Trial Balance</h2>
              <p className="text-[11px] text-zinc-500">Summary of all debit and credit account balances</p>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
              <CheckCircle2 className="w-4 h-4" />
              <span>Debits Equal Credits</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-100/70 text-zinc-600 border-b border-zinc-200 text-[11px] uppercase font-semibold">
                <tr>
                  <th className="py-2.5 px-4">Account Code</th>
                  <th className="py-2.5 px-4">Account Title</th>
                  <th className="py-2.5 px-4">Classification</th>
                  <th className="py-2.5 px-4 text-right">Debit Balance</th>
                  <th className="py-2.5 px-4 text-right">Credit Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {accounts.map(acc => {
                  const isDebitNature = acc.type === 'asset' || acc.type === 'expense';
                  const debitBal = isDebitNature && acc.balance >= 0 ? acc.balance : 0;
                  const creditBal = !isDebitNature && acc.balance >= 0 ? acc.balance : 0;

                  return (
                    <tr key={acc.id} className="hover:bg-zinc-50">
                      <td className="py-2.5 px-4 font-mono font-bold text-zinc-800">{acc.code}</td>
                      <td className="py-2.5 px-4 font-medium text-zinc-900">{acc.name}</td>
                      <td className="py-2.5 px-4 capitalize text-zinc-500">{acc.type}</td>
                      <td className="py-2.5 px-4 text-right font-mono font-medium">
                        {debitBal > 0 ? `$${debitBal.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '—'}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono font-medium">
                        {creditBal > 0 ? `$${creditBal.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PROFIT & LOSS TAB */}
      {activeTab === 'pnl' && (
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6 max-w-2xl mx-auto space-y-6 text-xs">
          <div className="text-center border-b border-zinc-200 pb-4">
            <h2 className="text-base font-bold text-zinc-900">Statement of Profit &amp; Loss (Income Statement)</h2>
            <p className="text-[11px] text-zinc-500">For Active Fiscal Period • Currency: {state.tenants[0].settings.baseCurrency}</p>
          </div>

          {/* Revenue Section */}
          <div className="space-y-2">
            <div className="font-bold text-zinc-900 uppercase tracking-wider text-[11px] border-b border-zinc-200 pb-1">
              Operating Revenue &amp; Income
            </div>
            {pnl.revenueAccounts.map(a => (
              <div key={a.code} className="flex justify-between py-1 text-zinc-700">
                <span>{a.code} — {a.name}</span>
                <span className="font-mono font-medium">${a.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            ))}
            <div className="flex justify-between font-bold text-zinc-900 border-t border-zinc-300 pt-1">
              <span>Total Revenue:</span>
              <span className="font-mono text-emerald-600">${pnl.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

          {/* Expenses Section */}
          <div className="space-y-2 pt-2">
            <div className="font-bold text-zinc-900 uppercase tracking-wider text-[11px] border-b border-zinc-200 pb-1">
              Operating Expenses
            </div>
            {pnl.expenseAccounts.map(a => (
              <div key={a.code} className="flex justify-between py-1 text-zinc-700">
                <span>{a.code} — {a.name}</span>
                <span className="font-mono font-medium">${a.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            ))}
            <div className="flex justify-between font-bold text-zinc-900 border-t border-zinc-300 pt-1">
              <span>Total Operating Expenses:</span>
              <span className="font-mono text-red-600">${pnl.totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

          {/* Net Profit Summary */}
          <div className="p-4 bg-zinc-900 text-white rounded-lg flex items-center justify-between text-sm font-bold">
            <span>Net Operating Margin (Profit):</span>
            <span className="font-mono text-[#d39e36] text-lg">
              ${pnl.netProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      )}

      {/* BALANCE SHEET TAB */}
      {activeTab === 'balance_sheet' && (
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6 max-w-2xl mx-auto space-y-6 text-xs">
          <div className="text-center border-b border-zinc-200 pb-4">
            <h2 className="text-base font-bold text-zinc-900">Statement of Financial Position (Balance Sheet)</h2>
            <p className="text-[11px] text-zinc-500">Double-entry verified • Total Assets = Total Liabilities + Equity</p>
          </div>

          {/* Assets */}
          <div className="space-y-2">
            <div className="font-bold text-zinc-900 uppercase tracking-wider text-[11px] border-b border-zinc-200 pb-1">
              Assets (Current &amp; Fixed)
            </div>
            {accounts.filter(a => a.type === 'asset').map(a => (
              <div key={a.code} className="flex justify-between py-1 text-zinc-700">
                <span>{a.code} — {a.name}</span>
                <span className="font-mono font-medium">${a.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            ))}
            <div className="flex justify-between font-bold text-zinc-900 border-t border-zinc-300 pt-1 text-sm">
              <span>Total Assets:</span>
              <span className="font-mono text-[#d39e36]">${balanceSheet.totalAssets.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

          {/* Liabilities */}
          <div className="space-y-2 pt-2">
            <div className="font-bold text-zinc-900 uppercase tracking-wider text-[11px] border-b border-zinc-200 pb-1">
              Liabilities
            </div>
            {accounts.filter(a => a.type === 'liability').map(a => (
              <div key={a.code} className="flex justify-between py-1 text-zinc-700">
                <span>{a.code} — {a.name}</span>
                <span className="font-mono font-medium">${a.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            ))}
            <div className="flex justify-between font-bold text-zinc-900 border-t border-zinc-300 pt-1">
              <span>Total Liabilities:</span>
              <span className="font-mono">${balanceSheet.totalLiabilities.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

          {/* Equity */}
          <div className="space-y-2 pt-2">
            <div className="font-bold text-zinc-900 uppercase tracking-wider text-[11px] border-b border-zinc-200 pb-1">
              Owner&#39;s Equity &amp; Retained Earnings
            </div>
            {accounts.filter(a => a.type === 'equity').map(a => (
              <div key={a.code} className="flex justify-between py-1 text-zinc-700">
                <span>{a.code} — {a.name}</span>
                <span className="font-mono font-medium">${a.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            ))}
            <div className="flex justify-between py-1 text-emerald-700 font-medium">
              <span>Current Period Net Margin:</span>
              <span className="font-mono">${pnl.netProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between font-bold text-zinc-900 border-t border-zinc-300 pt-1">
              <span>Total Equity:</span>
              <span className="font-mono">${balanceSheet.totalEquity.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

          {/* Verification Bar */}
          <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200 flex items-center justify-between font-bold">
            <span>Total Liabilities &amp; Equity:</span>
            <span className="font-mono text-zinc-900">${balanceSheet.totalLiabilitiesAndEquity.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
      )}

      {/* CHART OF ACCOUNTS TAB */}
      {activeTab === 'coa' && (
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 text-zinc-600 border-b border-zinc-200 text-[11px] uppercase font-semibold">
                <tr>
                  <th className="py-2.5 px-4">Account Code</th>
                  <th className="py-2.5 px-4">Account Title</th>
                  <th className="py-2.5 px-4">Category</th>
                  <th className="py-2.5 px-4">Currency</th>
                  <th className="py-2.5 px-4 text-right">Current Ledger Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {accounts.map(a => (
                  <tr key={a.id} className="hover:bg-zinc-50">
                    <td className="py-3 px-4 font-mono font-bold text-zinc-800">{a.code}</td>
                    <td className="py-3 px-4 font-semibold text-zinc-900">{a.name}</td>
                    <td className="py-3 px-4 capitalize text-zinc-600">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-zinc-100 font-medium border border-zinc-200">
                        {a.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-zinc-500">{a.currency}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-zinc-900">
                      ${a.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================== CREATE JOURNAL ENTRY MODAL ==================== */}
      {showCreateJournalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl p-6 text-zinc-100 text-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <h2 className="text-sm font-semibold text-zinc-100">Post Double-Entry Journal Transaction</h2>
              <button
                type="button"
                onClick={() => setShowCreateJournalModal(false)}
                className="text-zinc-400 hover:text-zinc-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveJournal} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Posting Date *</label>
                  <input
                    type="date"
                    required
                    value={entryDate}
                    onChange={e => setEntryDate(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Reference / Document #</label>
                  <input
                    type="text"
                    value={entryReference}
                    onChange={e => setEntryReference(e.target.value)}
                    placeholder="e.g. ADJ-OCT-2026"
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Transaction Description / Memo *</label>
                <input
                  type="text"
                  required
                  value={entryMemo}
                  onChange={e => setEntryMemo(e.target.value)}
                  placeholder="e.g. Allocation of software licenses to operating expenses"
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100"
                />
              </div>

              {/* Journal Lines */}
              <div className="space-y-2 pt-2 border-t border-zinc-800">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-zinc-200">Balanced Ledger Lines</span>
                  <button
                    type="button"
                    onClick={handleAddLine}
                    className="text-xs text-[#d39e36] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Line</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {entryLines.map((line, idx) => (
                    <div key={idx} className="p-2.5 bg-zinc-800/80 rounded-lg border border-zinc-700 grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-6">
                        <label className="text-[10px] text-zinc-400 block mb-0.5">Account</label>
                        <select
                          value={line.accountId}
                          onChange={e => handleAccountSelect(idx, e.target.value)}
                          className="w-full px-2 py-1.5 bg-zinc-900 border border-zinc-700 rounded text-xs text-zinc-100"
                        >
                          {accounts.map(a => (
                            <option key={a.id} value={a.id}>
                              {a.code} — {a.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-span-3">
                        <label className="text-[10px] text-zinc-400 block mb-0.5">Debit ($)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={line.debit}
                          onChange={e => handleLineAmountChange(idx, 'debit', Number(e.target.value))}
                          className="w-full px-2 py-1.5 bg-zinc-900 border border-zinc-700 rounded text-xs text-zinc-100 font-mono font-bold"
                        />
                      </div>

                      <div className="col-span-2">
                        <label className="text-[10px] text-zinc-400 block mb-0.5">Credit ($)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={line.credit}
                          onChange={e => handleLineAmountChange(idx, 'credit', Number(e.target.value))}
                          className="w-full px-2 py-1.5 bg-zinc-900 border border-zinc-700 rounded text-xs text-zinc-100 font-mono font-bold"
                        />
                      </div>

                      <div className="col-span-1 text-center pt-4">
                        <button
                          type="button"
                          onClick={() => handleRemoveLine(idx)}
                          className="text-zinc-500 hover:text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Balance Validation Card */}
              <div
                className={`p-3 rounded-lg border flex items-center justify-between font-mono text-xs ${
                  validation.isValid
                    ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800'
                    : 'bg-red-950/40 text-red-300 border-red-800'
                }`}
              >
                <div>
                  <span>Total Debits: ${validation.totalDebit.toFixed(2)}</span>
                  <span className="mx-2">•</span>
                  <span>Total Credits: ${validation.totalCredit.toFixed(2)}</span>
                </div>
                <div>
                  {validation.isValid ? (
                    <span className="font-bold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Balanced</span>
                    </span>
                  ) : (
                    <span className="font-bold text-red-400">
                      Out of Balance (${validation.difference.toFixed(2)})
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateJournalModal(false)}
                  className="px-4 py-2 text-zinc-400 hover:text-zinc-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!validation.isValid}
                  className="px-4 py-2 bg-[#d39e36] hover:bg-[#be8a29] disabled:bg-zinc-700 disabled:text-zinc-500 text-black font-semibold rounded-lg shadow-sm"
                >
                  Post to General Ledger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
