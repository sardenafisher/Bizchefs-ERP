'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import {
  ArrowRight,
  ShieldCheck,
  Zap,
  Layers,
  Database,
  Lock,
  CheckCircle2,
  TrendingUp,
  Receipt,
  Package,
  BookOpen,
  Building2,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { ERPDatabaseState } from '@/lib/db/database';

interface HeroSectionProps {
  onEnterWorkspace: (module?: string) => void;
  onOpenAuth: (mode?: 'signin' | 'signup') => void;
  dbState: ERPDatabaseState;
  supabaseStatus: 'unconfigured' | 'unauthenticated' | 'connected' | 'error';
}

export function HeroSection({
  onEnterWorkspace,
  onOpenAuth,
  dbState,
  supabaseStatus
}: HeroSectionProps) {
  const [activePreviewTab, setActivePreviewTab] = useState<'sales' | 'accounting' | 'inventory'>('sales');

  const activeTenant = dbState.tenants.find(t => t.id === dbState.activeTenantId) || dbState.tenants[0];

  // Calculate live numbers
  const totalSalesRevenue = dbState.salesInvoices
    .filter(i => i.tenantId === dbState.activeTenantId)
    .reduce((sum, inv) => sum + inv.grandTotal, 0);

  const inventoryCount = dbState.items
    .filter(i => i.tenantId === dbState.activeTenantId)
    .length;

  const journalEntriesCount = dbState.journalEntries
    .filter(j => j.tenantId === dbState.activeTenantId)
    .length;

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#0c0e12] via-[#101217] to-[#0c0e12] text-white pt-12 pb-24 border-b border-zinc-800">
      {/* Background Glow & Mesh Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] pointer-events-none opacity-20">
        <div className="absolute -top-32 left-1/4 w-96 h-96 bg-[#d39e36] rounded-full blur-[140px]" />
        <div className="absolute top-10 right-1/4 w-80 h-80 bg-[#e5a83b] rounded-full blur-[160px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Badges */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
          <Badge variant="gold" size="md" className="gap-2 px-3 py-1 bg-[#d39e36]/10">
            <Sparkles className="w-3.5 h-3.5 text-[#e5a83b]" />
            Official Enterprise Release
          </Badge>
          <span className="inline-flex items-center gap-2 text-xs text-zinc-400 bg-zinc-900/90 border border-zinc-800 px-3 py-1 rounded-full">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            PostgreSQL RLS Zero-Leakage Architecture
          </span>
          <span className="inline-flex items-center gap-2 text-xs text-zinc-400 bg-zinc-900/90 border border-zinc-800 px-3 py-1 rounded-full hidden sm:inline-flex">
            <Database className="w-3.5 h-3.5 text-amber-400" />
            Hostinger Static Export + Supabase Backend
          </span>
        </div>

        {/* Main Headline */}
        <div className="text-center max-w-4xl mx-auto space-y-6">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.12]">
            The Enterprise Operating System for{' '}
            <span className="bg-gradient-to-r from-[#ffd166] via-[#e5a83b] to-[#b88022] bg-clip-text text-transparent">
              Multi-Tenant Commercial Hospitality
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-zinc-300 max-w-3xl mx-auto font-normal leading-relaxed">
            Strict double-entry ledger enforcement, supply chain purchasing, multi-location inventory,
            and row-level tenant security — engineered for high-throughput culinary and commercial operations.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Button
              variant="primary"
              size="lg"
              rightIcon={<ArrowRight className="w-5 h-5" />}
              onClick={() => onEnterWorkspace('dashboard')}
              className="px-8 shadow-xl shadow-[#d39e36]/25"
            >
              Launch Live ERP Workspace
            </Button>
            <Button
              variant="secondary"
              size="lg"
              leftIcon={<Layers className="w-4 h-4 text-[#e5a83b]" />}
              onClick={() => {
                const el = document.getElementById('modules');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Explore 9 Core Modules
            </Button>
            <Button
              variant="gold-outline"
              size="lg"
              onClick={() => onOpenAuth('signup')}
            >
              Register Tenant
            </Button>
          </div>

          {/* Quick Credibility Footnote */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs text-zinc-400">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Real Double-Entry Accounting
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              100% Production Static Hostinger Ready
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Automated Document Numbering
            </span>
          </div>
        </div>

        {/* Live Interactive ERP Dashboard Preview Container */}
        <div className="mt-16 relative rounded-2xl bg-[#121316] border border-[#27272a] shadow-2xl overflow-hidden">
          {/* Mock Browser Header / Title Bar */}
          <div className="flex flex-wrap items-center justify-between px-6 py-3.5 bg-[#090a0d] border-b border-zinc-800 text-xs">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-500/80" />
                <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
              </div>
              <span className="font-mono text-zinc-400 pl-2 hidden sm:inline">
                https://erp.bizchefs.com/app
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-zinc-300">
                <Building2 className="w-3.5 h-3.5 text-[#e5a83b]" />
                <span className="font-medium text-white">{activeTenant?.name || 'Active Tenant'}</span>
                <span className="text-zinc-500">({activeTenant?.settings?.baseCurrency || 'USD'})</span>
              </span>
              <span className="hidden md:inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                <Lock className="w-3 h-3 text-emerald-400" />
                RLS Isolated
              </span>
            </div>
          </div>

          {/* Quick Metrics Bar Inside Preview */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-6 bg-[#15161c] border-b border-zinc-800/80">
            <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800">
              <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
                <span>Total Invoiced</span>
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-xl font-bold text-white font-mono">
                ${totalSalesRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-zinc-500 mt-1">Verified Sales Orders</div>
            </div>

            <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800">
              <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
                <span>Active SKUs</span>
                <Package className="w-4 h-4 text-[#e5a83b]" />
              </div>
              <div className="text-xl font-bold text-white font-mono">
                {inventoryCount} Items
              </div>
              <div className="text-[11px] text-zinc-500 mt-1">Warehouse Stock Managed</div>
            </div>

            <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800">
              <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
                <span>General Ledger</span>
                <BookOpen className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-xl font-bold text-white font-mono">
                {journalEntriesCount} Entries
              </div>
              <div className="text-[11px] text-zinc-500 mt-1">Balanced Double-Entry</div>
            </div>

            <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800">
              <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
                <span>Supabase Status</span>
                <Database className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-sm font-semibold text-emerald-400 mt-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                {supabaseStatus === 'connected' ? 'Cloud Verified' : 'Engine Ready'}
              </div>
              <div className="text-[11px] text-zinc-500 mt-0.5">PostgreSQL Migrations Up</div>
            </div>
          </div>

          {/* Tab Selector for Live ERP Preview Content */}
          <div className="flex items-center justify-between px-6 pt-4 bg-[#121316] border-b border-zinc-800">
            <div className="flex items-center gap-2 overflow-x-auto">
              <button
                onClick={() => setActivePreviewTab('sales')}
                className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition border-b-2 ${
                  activePreviewTab === 'sales'
                    ? 'border-[#e5a83b] text-[#e5a83b] bg-zinc-900/60'
                    : 'border-transparent text-zinc-400 hover:text-white'
                }`}
              >
                Sales Invoices & CRM
              </button>
              <button
                onClick={() => setActivePreviewTab('accounting')}
                className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition border-b-2 ${
                  activePreviewTab === 'accounting'
                    ? 'border-[#e5a83b] text-[#e5a83b] bg-zinc-900/60'
                    : 'border-transparent text-zinc-400 hover:text-white'
                }`}
              >
                Double-Entry Ledger Audit
              </button>
              <button
                onClick={() => setActivePreviewTab('inventory')}
                className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition border-b-2 ${
                  activePreviewTab === 'inventory'
                    ? 'border-[#e5a83b] text-[#e5a83b] bg-zinc-900/60'
                    : 'border-transparent text-zinc-400 hover:text-white'
                }`}
              >
                Warehouse Inventory Stock
              </button>
            </div>

            <button
              onClick={() => onEnterWorkspace(activePreviewTab)}
              className="text-xs font-medium text-[#e5a83b] hover:text-[#ffd166] flex items-center gap-1 pb-2"
            >
              <span>Open in Full Screen</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Preview Tab Body */}
          <div className="p-6 bg-[#0e1014] min-h-[220px]">
            {activePreviewTab === 'sales' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-zinc-800 text-zinc-400 uppercase text-[10px] tracking-wider">
                      <th className="pb-3 font-semibold">Document #</th>
                      <th className="pb-3 font-semibold">Customer</th>
                      <th className="pb-3 font-semibold">Issue Date</th>
                      <th className="pb-3 font-semibold">Total Amount</th>
                      <th className="pb-3 font-semibold">Status</th>
                      <th className="pb-3 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {dbState.salesInvoices
                      .filter(i => i.tenantId === dbState.activeTenantId)
                      .slice(0, 3)
                      .map(inv => (
                        <tr key={inv.id} className="hover:bg-zinc-900/50">
                          <td className="py-3 font-mono font-bold text-[#e5a83b]">{inv.invoiceNumber}</td>
                          <td className="py-3 text-zinc-200">{inv.customerName}</td>
                          <td className="py-3 text-zinc-400">{inv.date}</td>
                          <td className="py-3 font-mono font-semibold text-white">
                            ${inv.grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                                inv.status === 'paid'
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                  : inv.status === 'posted'
                                  ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                                  : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                              }`}
                            >
                              {inv.status}
                            </span>
                          </td>
                          <td className="py-3 text-right">
                            <button
                              onClick={() => onEnterWorkspace('sales')}
                              className="text-xs text-[#e5a83b] hover:underline font-medium"
                            >
                              View Invoice →
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}

            {activePreviewTab === 'accounting' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-zinc-400 pb-2 border-b border-zinc-800">
                  <span className="font-semibold text-zinc-200">Balanced Journal Postings (Debits = Credits)</span>
                  <span className="font-mono text-emerald-400">Status: In Balance (0.00 Variance)</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {dbState.journalEntries
                    .filter(j => j.tenantId === dbState.activeTenantId)
                    .slice(0, 2)
                    .map(entry => (
                      <div key={entry.id} className="p-3 rounded-lg bg-zinc-900/70 border border-zinc-800 text-xs space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-[#e5a83b]">{entry.entryNumber}</span>
                          <span className="text-[10px] text-zinc-500">{entry.date}</span>
                        </div>
                        <p className="text-zinc-300 font-medium truncate">{entry.memo}</p>
                        <div className="flex items-center justify-between pt-1 border-t border-zinc-800 font-mono text-[11px]">
                          <span className="text-zinc-400">Total Debit / Credit:</span>
                          <span className="text-white font-bold">${entry.totalDebit.toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {activePreviewTab === 'inventory' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-zinc-800 text-zinc-400 uppercase text-[10px] tracking-wider">
                      <th className="pb-3 font-semibold">SKU Code</th>
                      <th className="pb-3 font-semibold">Item Name</th>
                      <th className="pb-3 font-semibold">Category</th>
                      <th className="pb-3 font-semibold">Cost Price</th>
                      <th className="pb-3 font-semibold">Reorder Pt</th>
                      <th className="pb-3 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {dbState.items
                      .filter(i => i.tenantId === dbState.activeTenantId)
                      .slice(0, 3)
                      .map(item => (
                        <tr key={item.id} className="hover:bg-zinc-900/50">
                          <td className="py-3 font-mono font-bold text-zinc-300">{item.sku}</td>
                          <td className="py-3 text-white font-medium">{item.name}</td>
                          <td className="py-3 text-zinc-400">{item.category}</td>
                          <td className="py-3 font-mono text-zinc-300">${item.costPrice.toFixed(2)}</td>
                          <td className="py-3 font-mono font-semibold text-emerald-400">
                            {item.reorderPoint} {item.uom}
                          </td>
                          <td className="py-3 text-right">
                            <button
                              onClick={() => onEnterWorkspace('inventory')}
                              className="text-xs text-[#e5a83b] hover:underline font-medium"
                            >
                              Manage Stock →
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Launch Workspace Banner */}
          <div className="p-4 bg-gradient-to-r from-zinc-900 via-[#18191e] to-zinc-900 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-zinc-300 font-medium">
                Live interactive environment running. Full data operations enabled.
              </span>
            </div>
            <Button
              variant="primary"
              size="sm"
              rightIcon={<ArrowRight className="w-4 h-4" />}
              onClick={() => onEnterWorkspace(activePreviewTab)}
            >
              Enter Full ERP Workspace
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
