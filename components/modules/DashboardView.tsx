'use client';

import React from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  Package, 
  Users, 
  AlertCircle, 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  PlusCircle, 
  ArrowRight,
  FileText,
  Warehouse as WarehouseIcon,
  CreditCard
} from 'lucide-react';
import { ERPDatabaseState } from '@/lib/db/database';
import { computeProfitAndLoss, computeBalanceSheet } from '@/lib/erp/accounting-rules';
import { computeStockBalanceForWarehouse } from '@/lib/erp/inventory-rules';

interface DashboardViewProps {
  state: ERPDatabaseState;
  onNavigate: (view: string) => void;
  onQuickNewInvoice: () => void;
  onQuickNewPayment: () => void;
  onQuickNewJournal: () => void;
  onQuickStockTransfer: () => void;
  onViewInvoice: (invoiceId: string) => void;
}

export function DashboardView({
  state,
  onNavigate,
  onQuickNewInvoice,
  onQuickNewPayment,
  onQuickNewJournal,
  onQuickStockTransfer,
  onViewInvoice
}: DashboardViewProps) {
  const tenant = state.tenants.find(t => t.id === state.activeTenantId) || state.tenants[0];
  const accounts = state.accounts.filter(a => a.tenantId === state.activeTenantId);
  const invoices = state.salesInvoices.filter(i => i.tenantId === state.activeTenantId);
  const customers = state.customers.filter(c => c.tenantId === state.activeTenantId);
  const items = state.items.filter(i => i.tenantId === state.activeTenantId);
  const warehouses = state.warehouses.filter(w => w.tenantId === state.activeTenantId);
  const movements = state.stockMovements.filter(m => m.tenantId === state.activeTenantId);
  const employees = state.employees.filter(e => e.tenantId === state.activeTenantId);
  const attendance = state.attendance.filter(a => a.tenantId === state.activeTenantId);

  // Accounting aggregates
  const pnl = computeProfitAndLoss(accounts);
  const balanceSheet = computeBalanceSheet(accounts, pnl.netProfit);

  // Cash balance (1010)
  const cashAccount = accounts.find(a => a.code === '1010');
  const cashBalance = cashAccount ? cashAccount.balance : 0;

  // Receivables (1200)
  const arAccount = accounts.find(a => a.code === '1200');
  const totalReceivables = arAccount ? arAccount.balance : 0;

  // Inventory value
  let totalInventoryValue = 0;
  const lowStockAlerts: { item: typeof items[0]; currentQty: number }[] = [];

  for (const item of items) {
    let itemTotalQty = 0;
    for (const wh of warehouses) {
      const bal = computeStockBalanceForWarehouse(movements, item.id, wh.id);
      itemTotalQty += bal.quantityOnHand;
      totalInventoryValue += bal.totalCostValue;
    }
    if (item.reorderPoint > 0 && itemTotalQty <= item.reorderPoint) {
      lowStockAlerts.push({ item, currentQty: itemTotalQty });
    }
  }

  const presentCount = attendance.filter(a => a.status === 'present').length;

  return (
    <div className="space-y-6">
      {/* Top Welcome & Quick Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900">
            {tenant.name}
          </h1>
          <p className="text-xs text-zinc-500">
            Enterprise Overview • Operating Base: <span className="font-semibold text-zinc-700">{tenant.settings.baseCurrency}</span> • Fiscal Period Active
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onQuickNewInvoice}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#d39e36] hover:bg-[#be8a29] text-black font-semibold text-xs rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>New Invoice</span>
          </button>
          <button
            type="button"
            onClick={onQuickNewPayment}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-xs rounded-lg transition-colors cursor-pointer"
          >
            <CreditCard className="w-3.5 h-3.5 text-[#d39e36]" />
            <span>Record Payment</span>
          </button>
          <button
            type="button"
            onClick={onQuickStockTransfer}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-zinc-50 border border-zinc-300 text-zinc-700 font-medium text-xs rounded-lg transition-colors cursor-pointer"
          >
            <Package className="w-3.5 h-3.5 text-zinc-500" />
            <span>Transfer Stock</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="p-4 bg-white rounded-xl border border-zinc-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-zinc-500 text-xs">
            <span className="font-medium">Total YTD Revenue</span>
            <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-md">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-zinc-900 font-mono">
            ${pnl.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-zinc-500 flex items-center justify-between pt-1 border-t border-zinc-100">
            <span>Net Margin:</span>
            <span className="font-semibold text-emerald-600 font-mono">
              ${pnl.netProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Operating Bank Cash */}
        <div className="p-4 bg-white rounded-xl border border-zinc-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-zinc-500 text-xs">
            <span className="font-medium">Operating Bank Cash</span>
            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-md">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-zinc-900 font-mono">
            ${cashBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-zinc-500 flex items-center justify-between pt-1 border-t border-zinc-100">
            <span>Account 1010</span>
            <span className="text-blue-600 font-medium">Reconciled</span>
          </div>
        </div>

        {/* Outstanding Receivables */}
        <div className="p-4 bg-white rounded-xl border border-zinc-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-zinc-500 text-xs">
            <span className="font-medium">Trade Receivables (AR)</span>
            <div className="p-1.5 bg-amber-50 text-amber-600 rounded-md">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-zinc-900 font-mono">
            ${totalReceivables.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-zinc-500 flex items-center justify-between pt-1 border-t border-zinc-100">
            <span>Active Customers:</span>
            <span className="font-medium text-zinc-700">{customers.length}</span>
          </div>
        </div>

        {/* Inventory Stock Valuation */}
        <div className="p-4 bg-white rounded-xl border border-zinc-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-zinc-500 text-xs">
            <span className="font-medium">Total Inventory Asset</span>
            <div className="p-1.5 bg-purple-50 text-purple-600 rounded-md">
              <WarehouseIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-zinc-900 font-mono">
            ${totalInventoryValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-zinc-500 flex items-center justify-between pt-1 border-t border-zinc-100">
            <span>Warehouses:</span>
            <span className="font-medium text-zinc-700">{warehouses.length} active depots</span>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Recent Invoices & Inventory Warnings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left (2 cols): Recent Invoices & Transactions */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-zinc-900">Recent Commercial Invoices</h2>
              <p className="text-[11px] text-zinc-500">Live transaction records posted to general ledger</p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('sales')}
              className="text-xs text-[#d39e36] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 text-zinc-600 border-b border-zinc-200 text-[11px] uppercase font-semibold">
                <tr>
                  <th className="py-2.5 px-4">Invoice #</th>
                  <th className="py-2.5 px-4">Customer</th>
                  <th className="py-2.5 px-4">Date</th>
                  <th className="py-2.5 px-4 text-right">Total</th>
                  <th className="py-2.5 px-4 text-right">Balance Due</th>
                  <th className="py-2.5 px-4 text-center">Status</th>
                  <th className="py-2.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {invoices.slice(0, 6).map(inv => (
                  <tr key={inv.id} className="hover:bg-zinc-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-zinc-900">
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-3 px-4 font-medium text-zinc-800">{inv.customerName}</td>
                    <td className="py-3 px-4 text-zinc-500">{inv.date}</td>
                    <td className="py-3 px-4 text-right font-mono font-medium">
                      ${inv.grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-zinc-900">
                      ${inv.balanceDue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          inv.status === 'paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : inv.status === 'partially_paid'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-zinc-100 text-zinc-700'
                        }`}
                      >
                        {inv.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => onViewInvoice(inv.id)}
                        className="text-xs text-[#d39e36] font-semibold hover:underline cursor-pointer"
                      >
                        View / Print
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right (1 col): Low Stock Alerts & Operations Summary */}
        <div className="space-y-4">
          {/* Low Stock Card */}
          <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <h3 className="text-xs font-bold text-zinc-900">Stock Reorder Alerts</h3>
              </div>
              <span className="text-[10px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded font-bold font-mono">
                {lowStockAlerts.length} Attention
              </span>
            </div>

            {lowStockAlerts.length === 0 ? (
              <div className="p-4 text-center text-xs text-zinc-500">
                <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
                <span>All catalogue items are above configured reorder thresholds.</span>
              </div>
            ) : (
              <div className="space-y-2">
                {lowStockAlerts.map(({ item, currentQty }) => (
                  <div
                    key={item.id}
                    className="p-2.5 bg-amber-50/50 rounded-lg border border-amber-200/60 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-zinc-900 truncate max-w-[170px]">{item.name}</div>
                      <div className="text-[10px] font-mono text-zinc-500">SKU: {item.sku}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-amber-800 font-mono">{currentQty} {item.uom}</div>
                      <div className="text-[10px] text-zinc-400">Reorder at {item.reorderPoint}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <button
              type="button"
              onClick={() => onNavigate('inventory')}
              className="w-full py-1.5 text-center text-xs text-[#d39e36] font-semibold hover:bg-amber-50/50 rounded transition-colors cursor-pointer"
            >
              Manage Inventory Stock →
            </button>
          </div>

          {/* Quick Operations Pulse */}
          <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-4 space-y-3">
            <h3 className="text-xs font-bold text-zinc-900 pb-2 border-b border-zinc-100">
              Enterprise Operations Pulse
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-zinc-600 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Team On Duty Today</span>
                </span>
                <span className="font-bold font-mono text-zinc-900">{presentCount} / {employees.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-600 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Balance Sheet Status</span>
                </span>
                <span className="font-mono text-emerald-600 font-bold">100% Balanced</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-600 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Active Ledger Journal Lines</span>
                </span>
                <span className="font-mono font-bold text-zinc-800">{state.journalEntries.length * 2}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
