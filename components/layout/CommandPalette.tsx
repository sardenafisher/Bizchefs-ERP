'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  X, 
  TrendingUp, 
  ShoppingBag, 
  Package, 
  BookOpen, 
  Users, 
  Briefcase, 
  Settings, 
  FileText,
  Building
} from 'lucide-react';
import { ERPDatabaseState } from '@/lib/db/database';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: string) => void;
  state: ERPDatabaseState;
}

export function CommandPalette({ isOpen, onClose, onNavigate, state }: CommandPaletteProps) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(); // parent handles toggle
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  // Search through navigation targets, invoices, customers, and items
  const navTargets = [
    { label: 'Executive Dashboard', view: 'dashboard', icon: FileText, category: 'Navigation' },
    { label: 'CRM & Sales Invoices', view: 'sales', icon: TrendingUp, category: 'Navigation' },
    { label: 'Purchasing & Suppliers', view: 'purchasing', icon: ShoppingBag, category: 'Navigation' },
    { label: 'Inventory & Stock Movements', view: 'inventory', icon: Package, category: 'Navigation' },
    { label: 'Accounting, General Ledger & Statements', view: 'accounting', icon: BookOpen, category: 'Navigation' },
    { label: 'Human Resources & Attendance', view: 'hr', icon: Users, category: 'Navigation' },
    { label: 'Projects & Tasks', view: 'projects', icon: Briefcase, category: 'Navigation' },
    { label: 'System Settings & Supabase Migrations', view: 'settings', icon: Settings, category: 'Navigation' }
  ];

  const matchedNav = navTargets.filter(n => n.label.toLowerCase().includes(q));

  const matchedInvoices = state.salesInvoices
    .filter(i => i.tenantId === state.activeTenantId && (i.invoiceNumber.toLowerCase().includes(q) || i.customerName.toLowerCase().includes(q)))
    .slice(0, 5);

  const matchedCustomers = state.customers
    .filter(c => c.tenantId === state.activeTenantId && (c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)))
    .slice(0, 5);

  const matchedItems = state.items
    .filter(item => item.tenantId === state.activeTenantId && (item.name.toLowerCase().includes(q) || item.sku.toLowerCase().includes(q)))
    .slice(0, 5);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-xl bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl overflow-hidden flex flex-col text-zinc-100">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 border-b border-zinc-800">
          <Search className="w-5 h-5 text-zinc-400 mr-3" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Type a module, invoice #, customer or SKU..."
            className="w-full py-4 bg-transparent text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none"
            autoFocus
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1 text-zinc-400 hover:text-zinc-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="ml-2 px-1.5 py-0.5 text-[10px] bg-zinc-800 text-zinc-400 rounded border border-zinc-700 font-mono">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-3">
          {matchedNav.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                Modules &amp; Views
              </div>
              <div className="space-y-0.5">
                {matchedNav.map(item => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.view}
                      type="button"
                      onClick={() => {
                        onNavigate(item.view);
                        onClose();
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between hover:bg-[#d39e36]/15 hover:text-[#d39e36] transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4 text-zinc-400" />
                        <span className="font-medium">{item.label}</span>
                      </div>
                      <span className="text-[10px] text-zinc-400">Jump ↵</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {matchedInvoices.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                Matching Sales Invoices
              </div>
              <div className="space-y-0.5">
                {matchedInvoices.map(inv => (
                  <button
                    key={inv.id}
                    type="button"
                    onClick={() => {
                      onNavigate('sales');
                      onClose();
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between hover:bg-zinc-800 transition-colors cursor-pointer"
                  >
                    <div>
                      <span className="font-mono font-semibold text-[#d39e36] mr-2">{inv.invoiceNumber}</span>
                      <span className="text-zinc-200">{inv.customerName}</span>
                    </div>
                    <span className="font-mono text-zinc-400">${inv.grandTotal.toLocaleString()}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {matchedCustomers.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                Matching Customers
              </div>
              <div className="space-y-0.5">
                {matchedCustomers.map(cust => (
                  <button
                    key={cust.id}
                    type="button"
                    onClick={() => {
                      onNavigate('sales');
                      onClose();
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between hover:bg-zinc-800 transition-colors cursor-pointer"
                  >
                    <div>
                      <span className="font-mono text-xs text-zinc-400 mr-2">{cust.code}</span>
                      <span className="font-medium text-zinc-200">{cust.name}</span>
                    </div>
                    <span className="text-[10px] text-zinc-400">{cust.email}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {matchedItems.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                Matching Inventory Items
              </div>
              <div className="space-y-0.5">
                {matchedItems.map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onNavigate('inventory');
                      onClose();
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between hover:bg-zinc-800 transition-colors cursor-pointer"
                  >
                    <div>
                      <span className="font-mono text-xs text-[#d39e36] mr-2">{item.sku}</span>
                      <span className="text-zinc-200">{item.name}</span>
                    </div>
                    <span className="font-mono text-zinc-400">${item.unitPrice}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-zinc-800 bg-zinc-950/60 flex items-center justify-between text-[11px] text-zinc-400">
          <span>Navigation Quick Finder</span>
          <span>Press ESC to close</span>
        </div>
      </div>
    </div>
  );
}
