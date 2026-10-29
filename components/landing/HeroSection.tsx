'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  Receipt,
  Package,
  BookOpen,
  Building2,
  Lock,
  Calendar,
  Layers
} from 'lucide-react';
import { ERPDatabaseState } from '@/lib/db/database';

interface HeroSectionProps {
  onEnterWorkspace: (module?: string) => void;
  onOpenAuth: (mode?: 'signin' | 'signup') => void;
  onRequestDemo?: () => void;
  dbState: ERPDatabaseState;
  supabaseStatus: 'unconfigured' | 'unauthenticated' | 'connected' | 'error';
}

export function HeroSection({
  onEnterWorkspace,
  onOpenAuth,
  onRequestDemo,
  dbState,
  supabaseStatus
}: HeroSectionProps) {
  const [activePreviewTab, setActivePreviewTab] = useState<'sales' | 'accounting' | 'inventory'>('sales');

  return (
    <section id="overview" className="relative overflow-hidden bg-[#0c0e12] text-[#f3f4f6] pt-12 pb-20 border-b border-[#262626]">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Badges */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
          <Badge variant="gold" size="md" className="font-semibold">
            Commercial Subscription Platform
          </Badge>
          <span className="inline-flex items-center gap-1.5 text-xs text-zinc-400 bg-[#13171f] border border-[#262626] px-3 py-0.5 rounded-md">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            PostgreSQL Multi-Tenant RLS
          </span>
          <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-zinc-400 bg-[#13171f] border border-[#262626] px-3 py-0.5 rounded-md">
            <Lock className="w-3.5 h-3.5 text-zinc-400" />
            Strict Double-Entry Ledger
          </span>
        </div>

        {/* Main Commercial Headline */}
        <div className="text-center max-w-4xl mx-auto space-y-5">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Centralized ERP for Commercial Foodservice, Production & Multi-Branch Hospitality
          </h1>

          <p className="text-sm sm:text-lg text-zinc-300 max-w-2xl mx-auto font-normal leading-relaxed">
            Eliminate operational fragmentation. Connect CRM sales orders, multi-warehouse inventory valuation,
            procurement matching, and strict double-entry ledger compliance under one unified subscription service.
          </p>

          {/* Business-Critical CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
            <Button
              variant="primary"
              size="lg"
              rightIcon={<ArrowRight className="w-4 h-4" />}
              onClick={() => {
                const el = document.getElementById('pricing');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              View Subscription Plans & Pricing
            </Button>

            {onRequestDemo && (
              <Button
                variant="secondary"
                size="lg"
                leftIcon={<Calendar className="w-4 h-4 text-[#d39e36]" />}
                onClick={onRequestDemo}
              >
                Request a Live Demo
              </Button>
            )}

            <Button
              variant="gold-outline"
              size="lg"
              onClick={() => onEnterWorkspace('dashboard')}
            >
              Explore Live Demo Workspace
            </Button>
          </div>

          {/* Verified Capability Highlights */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-3 text-xs text-zinc-400">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#d39e36]" />
              Double-Entry General Ledger (Debits = Credits)
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#d39e36]" />
              Multi-Warehouse Stock Valuations
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#d39e36]" />
              Egyptian Pound (EGP) & Multi-Currency
            </span>
          </div>
        </div>

        {/* Sanitized Commercial Demonstration Preview Container */}
        <div className="mt-14 relative rounded-xl bg-[#13171f] border border-[#262626] shadow-xl overflow-hidden">
          {/* Frame Header */}
          <div className="flex flex-wrap items-center justify-between px-5 py-3 bg-[#0c0e12] border-b border-[#262626] text-xs">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
              </div>
              <span className="font-mono text-zinc-500 pl-1 text-[11px] hidden sm:inline">
                erp.bizchefs.com/app
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[11px] text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded border border-[#262626]">
                Interactive Software Preview (Demonstration Data)
              </span>
              <span className="hidden md:inline-flex items-center gap-1 text-[11px] text-emerald-400">
                <ShieldCheck className="w-3 h-3" />
                RLS Protected
              </span>
            </div>
          </div>

          {/* Quick Metrics Bar Inside Preview */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 p-5 bg-[#10141b] border-b border-[#262626]">
            <div className="p-3.5 rounded-lg bg-[#13171f] border border-[#262626]">
              <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
                <span>Monthly Billed Revenue</span>
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="text-lg font-bold text-white font-mono">
                184,500 EGP
              </div>
              <div className="text-[10px] text-zinc-500 mt-0.5">Automated Tax & Sequential Invoicing</div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#13171f] border border-[#262626]">
              <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
                <span>Active Foodservice SKUs</span>
                <Package className="w-3.5 h-3.5 text-[#d39e36]" />
              </div>
              <div className="text-lg font-bold text-white font-mono">
                {dbState.items.length} Tracked SKUs
              </div>
              <div className="text-[10px] text-zinc-500 mt-0.5">Reorder Point Thresholds Active</div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#13171f] border border-[#262626]">
              <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
                <span>General Ledger Postings</span>
                <BookOpen className="w-3.5 h-3.5 text-blue-400" />
              </div>
              <div className="text-lg font-bold text-white font-mono">
                {dbState.journalEntries.length} Entries
              </div>
              <div className="text-[10px] text-zinc-500 mt-0.5">Debits = Credits Strictly Balanced</div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#13171f] border border-[#262626]">
              <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
                <span>Multi-Tenant Architecture</span>
                <Building2 className="w-3.5 h-3.5 text-[#d39e36]" />
              </div>
              <div className="text-sm font-semibold text-emerald-400 mt-0.5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Tenant Isolated
              </div>
              <div className="text-[10px] text-zinc-500 mt-0.5">PostgreSQL Row-Level Security</div>
            </div>
          </div>

          {/* Tab Selector for Live ERP Preview Content */}
          <div className="flex items-center justify-between px-5 pt-3 bg-[#13171f] border-b border-[#262626]">
            <div className="flex items-center gap-2 overflow-x-auto">
              <button
                type="button"
                onClick={() => setActivePreviewTab('sales')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-t-md transition-colors border-b-2 cursor-pointer ${
                  activePreviewTab === 'sales'
                    ? 'border-[#d39e36] text-[#d39e36] bg-[#0c0e12]'
                    : 'border-transparent text-zinc-400 hover:text-white'
                }`}
              >
                Sales Invoices & Quotations
              </button>
              <button
                type="button"
                onClick={() => setActivePreviewTab('accounting')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-t-md transition-colors border-b-2 cursor-pointer ${
                  activePreviewTab === 'accounting'
                    ? 'border-[#d39e36] text-[#d39e36] bg-[#0c0e12]'
                    : 'border-transparent text-zinc-400 hover:text-white'
                }`}
              >
                Double-Entry Ledger Audit
              </button>
              <button
                type="button"
                onClick={() => setActivePreviewTab('inventory')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-t-md transition-colors border-b-2 cursor-pointer ${
                  activePreviewTab === 'inventory'
                    ? 'border-[#d39e36] text-[#d39e36] bg-[#0c0e12]'
                    : 'border-transparent text-zinc-400 hover:text-white'
                }`}
              >
                Warehouse Inventory Stock
              </button>
            </div>

            <button
              type="button"
              onClick={() => onEnterWorkspace(activePreviewTab)}
              className="text-xs font-medium text-[#d39e36] hover:text-[#e5a83b] flex items-center gap-1 pb-1.5 cursor-pointer"
            >
              <span>Launch Full Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Sanitized Demonstration Tables */}
          <div className="p-5 bg-[#0e1117] min-h-[200px]">
            {activePreviewTab === 'sales' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#262626] text-zinc-400 uppercase text-[10px] tracking-wider">
                      <th className="pb-2.5 font-semibold">Document #</th>
                      <th className="pb-2.5 font-semibold">Account / Client</th>
                      <th className="pb-2.5 font-semibold">Issue Date</th>
                      <th className="pb-2.5 font-semibold">Total Amount</th>
                      <th className="pb-2.5 font-semibold">Status</th>
                      <th className="pb-2.5 font-semibold text-right">Verification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#262626]/50">
                    {dbState.salesInvoices.slice(0, 3).map((inv) => (
                      <tr key={inv.id} className="hover:bg-[#13171f]/50">
                        <td className="py-2.5 font-mono font-bold text-[#d39e36]">{inv.invoiceNumber}</td>
                        <td className="py-2.5 text-zinc-200">{inv.customerName}</td>
                        <td className="py-2.5 text-zinc-400">{inv.date}</td>
                        <td className="py-2.5 font-mono font-semibold text-white">
                          ${inv.grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2.5">
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
                        <td className="py-2.5 text-right font-mono text-[11px] text-zinc-400">
                          Verified Document
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activePreviewTab === 'accounting' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-zinc-400 pb-2 border-b border-[#262626]">
                  <span className="font-semibold text-zinc-200">Balanced Journal Postings (Debits = Credits)</span>
                  <span className="font-mono text-emerald-400">Status: In Balance (0.00 Variance)</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {dbState.journalEntries.slice(0, 2).map((entry) => (
                    <div key={entry.id} className="p-3 rounded-lg bg-[#13171f] border border-[#262626] text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-[#d39e36]">{entry.entryNumber}</span>
                        <span className="text-[10px] text-zinc-500">{entry.date}</span>
                      </div>
                      <p className="text-zinc-300 font-medium truncate">{entry.memo}</p>
                      <div className="flex items-center justify-between pt-1 border-t border-[#262626] font-mono text-[11px]">
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
                    <tr className="border-b border-[#262626] text-zinc-400 uppercase text-[10px] tracking-wider">
                      <th className="pb-2.5 font-semibold">SKU Code</th>
                      <th className="pb-2.5 font-semibold">Item Name</th>
                      <th className="pb-2.5 font-semibold">Category</th>
                      <th className="pb-2.5 font-semibold">Cost Price</th>
                      <th className="pb-2.5 font-semibold">Reorder Pt</th>
                      <th className="pb-2.5 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#262626]/50">
                    {dbState.items.slice(0, 3).map((item) => (
                      <tr key={item.id} className="hover:bg-[#13171f]/50">
                        <td className="py-2.5 font-mono font-bold text-zinc-300">{item.sku}</td>
                        <td className="py-2.5 text-white font-medium">{item.name}</td>
                        <td className="py-2.5 text-zinc-400">{item.category}</td>
                        <td className="py-2.5 font-mono text-zinc-300">${item.costPrice.toFixed(2)}</td>
                        <td className="py-2.5 font-mono font-semibold text-emerald-400">
                          {item.reorderPoint} {item.uom}
                        </td>
                        <td className="py-2.5 text-right font-mono text-[11px] text-zinc-400">
                          Stock Monitored
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Bottom Bar */}
          <div className="p-4 bg-[#10141b] border-t border-[#262626] flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-zinc-400">
              Commercial multi-tenant architecture. Every tenant operates in strict database isolation.
            </div>
            <div className="flex items-center gap-2">
              {onRequestDemo && (
                <Button variant="ghost" size="sm" onClick={onRequestDemo}>
                  Request Guided Demo
                </Button>
              )}
              <Button
                variant="primary"
                size="sm"
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                onClick={() => {
                  const el = document.getElementById('pricing');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Choose Subscription Plan
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
