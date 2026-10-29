'use client';

import React from 'react';
import { 
  ShieldAlert, 
  Building2, 
  Users, 
  Database, 
  CheckCircle2, 
  Activity, 
  CreditCard,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { ERPDatabaseState } from '@/lib/db/database';

interface AdminModuleProps {
  state: ERPDatabaseState;
  onSwitchTenant: (tenantId: string) => void;
}

export function AdminModule({ state, onSwitchTenant }: AdminModuleProps) {
  const tenants = state.tenants;
  const totalInvoices = state.salesInvoices.length;
  const totalJournalEntries = state.journalEntries.length;
  const totalEmployees = state.employees.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-zinc-900">
              Platform Administration
            </h1>
            <span className="text-[10px] bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded uppercase">
              Super Admin Only
            </span>
          </div>
          <p className="text-xs text-zinc-500">
            Multi-Tenant Platform Health, Global Enterprise Subscriptions &amp; Security Audits
          </p>
        </div>
      </div>

      {/* Global Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-zinc-200 shadow-sm space-y-1">
          <div className="text-xs text-zinc-500 font-medium">Registered Companies</div>
          <div className="text-2xl font-bold font-mono text-zinc-900">{tenants.length}</div>
          <div className="text-[10px] text-emerald-600 font-medium">100% Isolated via RLS</div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-zinc-200 shadow-sm space-y-1">
          <div className="text-xs text-zinc-500 font-medium">Global Journal Postings</div>
          <div className="text-2xl font-bold font-mono text-zinc-900">{totalJournalEntries}</div>
          <div className="text-[10px] text-zinc-400">Total double-entry vouchers</div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-zinc-200 shadow-sm space-y-1">
          <div className="text-xs text-zinc-500 font-medium">Commercial Invoices Issued</div>
          <div className="text-2xl font-bold font-mono text-zinc-900">{totalInvoices}</div>
          <div className="text-[10px] text-zinc-400">Across all tenant containers</div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-zinc-200 shadow-sm space-y-1">
          <div className="text-xs text-zinc-500 font-medium">Provisioned Employees</div>
          <div className="text-2xl font-bold font-mono text-zinc-900">{totalEmployees}</div>
          <div className="text-[10px] text-zinc-400">Total staff roster count</div>
        </div>
      </div>

      {/* Tenants Directory Table */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden space-y-2">
        <div className="px-5 py-4 border-b border-zinc-200 flex items-center justify-between">
          <h2 className="text-sm font-bold text-zinc-900">Tenant Enterprise Directory</h2>
          <span className="text-xs text-zinc-500">{tenants.length} Active Organizations</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 text-zinc-600 border-b border-zinc-200 text-[11px] uppercase font-semibold">
              <tr>
                <th className="py-2.5 px-4">Organization Name</th>
                <th className="py-2.5 px-4">Industry</th>
                <th className="py-2.5 px-4">Base Currency</th>
                <th className="py-2.5 px-4 text-center">Subscription Tier</th>
                <th className="py-2.5 px-4 text-center">Status</th>
                <th className="py-2.5 px-4">Valid Until</th>
                <th className="py-2.5 px-4 text-right">Switch Tenant</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {tenants.map(t => (
                <tr key={t.id} className="hover:bg-zinc-50">
                  <td className="py-3 px-4 font-bold text-zinc-900">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-[#d39e36]" />
                      <span>{t.name}</span>
                    </div>
                    <div className="text-[10px] font-mono text-zinc-400 pl-6">{t.id}</div>
                  </td>
                  <td className="py-3 px-4 text-zinc-600">{t.industry}</td>
                  <td className="py-3 px-4 font-mono font-bold text-zinc-800">{t.settings.baseCurrency}</td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-zinc-100 text-zinc-800 border border-zinc-200">
                      {t.subscription.plan}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                      {t.subscription.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-zinc-500 font-mono text-[11px]">
                    {t.subscription.validUntil.split('T')[0]}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => onSwitchTenant(t.id)}
                      className={`px-3 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                        t.id === state.activeTenantId
                          ? 'bg-zinc-200 text-zinc-700 cursor-default'
                          : 'bg-[#d39e36] hover:bg-[#be8a29] text-black shadow-sm'
                      }`}
                      disabled={t.id === state.activeTenantId}
                    >
                      {t.id === state.activeTenantId ? 'Current Active' : 'Switch Into Tenant →'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
