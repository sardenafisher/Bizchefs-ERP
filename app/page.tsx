'use client';

import React, { useState, useEffect } from 'react';
import { erpDb, ERPDatabaseState } from '@/lib/db/database';
import { isSupabaseConnected } from '@/lib/supabase/client';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { CommandPalette } from '@/components/layout/CommandPalette';
import { DocumentPrintModal } from '@/components/modules/DocumentPrintModal';
import { NewTenantModal } from '@/components/modules/NewTenantModal';
import { SupabaseSyncModal } from '@/components/modules/SupabaseSyncModal';
import { DashboardView } from '@/components/modules/DashboardView';
import { SalesModule } from '@/components/modules/SalesModule';
import { PurchasingModule } from '@/components/modules/PurchasingModule';
import { InventoryModule } from '@/components/modules/InventoryModule';
import { AccountingModule } from '@/components/modules/AccountingModule';
import { HRModule } from '@/components/modules/HRModule';
import { ProjectsModule } from '@/components/modules/ProjectsModule';
import { SettingsModule } from '@/components/modules/SettingsModule';
import { AdminModule } from '@/components/modules/AdminModule';
import { SalesInvoice } from '@/lib/types/erp';
import { ChevronRight, Home, Menu, X } from 'lucide-react';

export default function ERPPage() {
  const [dbState, setDbState] = useState<ERPDatabaseState>(erpDb.getState());
  const [activeView, setActiveView] = useState('dashboard');
  const [isSupabaseLinked, setIsSupabaseLinked] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Modals
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isNewTenantModalOpen, setIsNewTenantModalOpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [selectedInvoiceForPrint, setSelectedInvoiceForPrint] = useState<SalesInvoice | null>(null);

  useEffect(() => {
    // Subscribe to real-time database state updates
    const unsubscribe = erpDb.subscribe(() => {
      setDbState({ ...erpDb.getState() });
    });
    setIsSupabaseLinked(isSupabaseConnected());
    return unsubscribe;
  }, []);

  const activeTenant = dbState.tenants.find(t => t.id === dbState.activeTenantId) || dbState.tenants[0];

  const handleSwitchTenant = (tenantId: string) => {
    erpDb.switchTenant(tenantId);
  };

  const handleCreateTenant = (name: string, currency: string, timezone: string, taxNumber: string, industry: string) => {
    erpDb.registerNewTenant(name, currency, timezone, taxNumber, industry);
  };

  const handleViewInvoice = (invoiceId: string) => {
    const inv = dbState.salesInvoices.find(i => i.id === invoiceId) || null;
    setSelectedInvoiceForPrint(inv);
  };

  const getViewTitle = (viewId: string) => {
    switch (viewId) {
      case 'dashboard': return 'Executive Dashboard';
      case 'sales': return 'CRM & Sales';
      case 'purchasing': return 'Purchasing & Supply Chain';
      case 'inventory': return 'Inventory & Warehousing';
      case 'accounting': return 'Accounting & Financial Ledger';
      case 'hr': return 'Human Resources & Payroll';
      case 'projects': return 'Projects & Deliverables';
      case 'settings': return 'Company Settings & Migrations';
      case 'admin': return 'Platform Super Administration';
      default: return 'Module';
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col font-sans">
      {/* Top Header */}
      <Header
        activeTenant={activeTenant}
        tenants={dbState.tenants}
        currentUser={dbState.currentUser}
        onSwitchTenant={handleSwitchTenant}
        onOpenNewTenantModal={() => setIsNewTenantModalOpen(true)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
        isSupabaseLinked={isSupabaseLinked}
        activeView={activeView}
      />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <Sidebar
            activeView={activeView}
            onSelectView={setActiveView}
            isPlatformAdmin={dbState.currentUser.isPlatformAdmin}
          />
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 md:hidden flex">
            <div className="fixed inset-0 bg-black/60" onClick={() => setMobileMenuOpen(false)} />
            <div className="relative w-64 bg-[#18191e] h-full shadow-xl z-50 flex flex-col">
              <div className="p-4 flex items-center justify-between border-b border-zinc-800 text-white">
                <span className="font-bold text-sm">BizChefs Menu</span>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 text-zinc-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <Sidebar
                activeView={activeView}
                onSelectView={(v) => {
                  setActiveView(v);
                  setMobileMenuOpen(false);
                }}
                isPlatformAdmin={dbState.currentUser.isPlatformAdmin}
              />
            </div>
          </div>
        )}

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-4 max-w-7xl mx-auto w-full">
          {/* Mobile menu toggle & Breadcrumbs bar */}
          <div className="flex items-center justify-between pb-2 text-xs text-zinc-500">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="md:hidden p-1.5 rounded-lg bg-zinc-200 text-zinc-800 hover:bg-zinc-300 mr-2"
                aria-label="Open navigation menu"
              >
                <Menu className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setActiveView('dashboard')}
                className="hover:text-zinc-900 flex items-center gap-1 cursor-pointer"
              >
                <Home className="w-3.5 h-3.5" />
                <span>ERP</span>
              </button>
              <ChevronRight className="w-3 h-3 text-zinc-400" />
              <span className="font-semibold text-zinc-800">{getViewTitle(activeView)}</span>
            </div>

            <div className="hidden sm:flex items-center gap-2 text-[11px] text-zinc-500 font-mono">
              <span>Tenant: <span className="font-semibold text-zinc-800">{activeTenant.slug}</span></span>
              <span>•</span>
              <span>Currency: <span className="font-semibold text-zinc-800">{activeTenant.settings.baseCurrency}</span></span>
            </div>
          </div>

          {/* Module Views */}
          {activeView === 'dashboard' && (
            <DashboardView
              state={dbState}
              onNavigate={setActiveView}
              onQuickNewInvoice={() => setActiveView('sales')}
              onQuickNewPayment={() => setActiveView('sales')}
              onQuickNewJournal={() => setActiveView('accounting')}
              onQuickStockTransfer={() => setActiveView('inventory')}
              onViewInvoice={handleViewInvoice}
            />
          )}

          {activeView === 'sales' && (
            <SalesModule
              state={dbState}
              onViewInvoice={handleViewInvoice}
            />
          )}

          {activeView === 'purchasing' && (
            <PurchasingModule
              state={dbState}
            />
          )}

          {activeView === 'inventory' && (
            <InventoryModule
              state={dbState}
            />
          )}

          {activeView === 'accounting' && (
            <AccountingModule
              state={dbState}
            />
          )}

          {activeView === 'hr' && (
            <HRModule
              state={dbState}
            />
          )}

          {activeView === 'projects' && (
            <ProjectsModule
              state={dbState}
            />
          )}

          {activeView === 'settings' && (
            <SettingsModule
              state={dbState}
              onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
            />
          )}

          {activeView === 'admin' && (
            <AdminModule
              state={dbState}
              onSwitchTenant={handleSwitchTenant}
            />
          )}
        </main>
      </div>

      {/* Global Modals */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigate={setActiveView}
        state={dbState}
      />

      <NewTenantModal
        isOpen={isNewTenantModalOpen}
        onClose={() => setIsNewTenantModalOpen(false)}
        onCreateTenant={handleCreateTenant}
      />

      <SupabaseSyncModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        isLinked={isSupabaseLinked}
        onRefreshStatus={() => setIsSupabaseLinked(isSupabaseConnected())}
      />

      <DocumentPrintModal
        invoice={selectedInvoiceForPrint}
        tenant={activeTenant}
        onClose={() => setSelectedInvoiceForPrint(null)}
      />
    </div>
  );
}
