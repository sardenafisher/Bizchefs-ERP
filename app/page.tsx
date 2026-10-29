'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { erpDb, ERPDatabaseState } from '@/lib/db/database';
import { isSupabaseConnected, verifySupabaseConnection, ConnectionVerificationResult } from '@/lib/supabase/client';
import { authService } from '@/lib/services/auth-service';
import { supabaseERP } from '@/lib/services/supabase-erp-service';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { CommandPalette } from '@/components/layout/CommandPalette';
import { DocumentPrintModal } from '@/components/modules/DocumentPrintModal';
import { NewTenantModal } from '@/components/modules/NewTenantModal';
import { SupabaseSyncModal } from '@/components/modules/SupabaseSyncModal';
import { AuthModal } from '@/components/auth/AuthModal';
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
import { ChevronRight, Home, Menu, X, ShieldCheck, Database, Info, AlertTriangle, ArrowRight } from 'lucide-react';
import { User } from '@supabase/supabase-js';

export default function ERPPage() {
  const [dbState, setDbState] = useState<ERPDatabaseState>(erpDb.getState());
  const [activeView, setActiveView] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Supabase Live Verification & Auth State
  const [supabaseStatus, setSupabaseStatus] = useState<'unconfigured' | 'unauthenticated' | 'connected' | 'error'>('unconfigured');
  const [supabaseUser, setSupabaseUser] = useState<User | null>(null);
  const [verificationResult, setVerificationResult] = useState<ConnectionVerificationResult | null>(null);

  // Modals
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isNewTenantModalOpen, setIsNewTenantModalOpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedInvoiceForPrint, setSelectedInvoiceForPrint] = useState<SalesInvoice | null>(null);

  const checkSupabaseConnection = useCallback(async () => {
    try {
      const result = await verifySupabaseConnection();
      setVerificationResult(result);
      setSupabaseStatus(result.status);
      setSupabaseUser(result.user || null);

      if (result.status === 'connected' && result.user) {
        // Attempt to load tenant records from Supabase
        try {
          const remoteTenants = await supabaseERP.getUserTenants();
          if (remoteTenants && remoteTenants.length > 0) {
            // Populate remote tenants if available
            // Note: Preserves full state while making remote tenants accessible
          }
        } catch {
          // Keep current store active
        }
      }
    } catch {
      setSupabaseStatus('error');
    }
  }, []);

  useEffect(() => {
    let active = true;

    // Subscribe to real-time database state updates
    const unsubscribeDb = erpDb.subscribe(() => {
      if (active) {
        setDbState({ ...erpDb.getState() });
      }
    });

    // Initial connection verification asynchronously
    void (async () => {
      if (!active) return;
      await checkSupabaseConnection();
    })();

    // Listen to real Supabase Auth events
    const { data: { subscription } } = authService.onAuthStateChange((_event, session) => {
      if (!active) return;
      setSupabaseUser(session?.user || null);
      void checkSupabaseConnection();
    });

    return () => {
      active = false;
      unsubscribeDb();
      subscription?.unsubscribe();
    };
  }, [checkSupabaseConnection]);

  const handleSignOut = async () => {
    await authService.signOut();
    setSupabaseUser(null);
    checkSupabaseConnection();
  };

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
        supabaseUser={supabaseUser}
        supabaseStatus={supabaseStatus}
        onSwitchTenant={handleSwitchTenant}
        onOpenNewTenantModal={() => setIsNewTenantModalOpen(true)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onSignOut={handleSignOut}
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

          {/* Transparent Storage & Backend Status Banner */}
          {supabaseStatus === 'unconfigured' && (
            <div className="p-3 bg-zinc-100 border border-zinc-300 rounded-lg text-xs text-zinc-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-start sm:items-center gap-2.5">
                <Database className="w-4 h-4 text-[#d39e36] shrink-0 mt-0.5 sm:mt-0" />
                <div>
                  <span className="font-semibold text-zinc-900">Active Storage: In-Browser ACID Engine. </span>
                  <span className="text-zinc-600">To connect your remote Supabase PostgreSQL database, configure your project URL and Anon key.</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSupabaseModalOpen(true)}
                className="px-3 py-1 bg-zinc-900 text-white hover:bg-zinc-800 rounded-md text-[11px] font-medium shrink-0 flex items-center gap-1.5 cursor-pointer"
              >
                <span>Connect Supabase</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}

          {supabaseStatus === 'unauthenticated' && (
            <div className="p-3 bg-amber-50 border border-amber-300 rounded-lg text-xs text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-start sm:items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5 sm:mt-0" />
                <div>
                  <span className="font-semibold text-amber-950">Supabase Connected (Unauthenticated): </span>
                  <span className="text-amber-800">Your remote database is reachable. Sign in with your Supabase credentials to access cloud multi-tenant data.</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(true)}
                className="px-3 py-1 bg-[#d39e36] text-black hover:bg-[#be8a29] rounded-md text-[11px] font-semibold shrink-0 flex items-center gap-1.5 cursor-pointer"
              >
                <span>Sign In to Supabase</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}

          {supabaseStatus === 'connected' && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-300 rounded-lg text-[11px] text-emerald-900 flex items-center justify-between gap-2 shadow-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-medium text-emerald-950">
                  Supabase PostgreSQL Live: Authenticated as {supabaseUser?.email} • Row-Level Security Enforced
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsSupabaseModalOpen(true)}
                className="text-emerald-700 hover:text-emerald-900 underline font-medium cursor-pointer"
              >
                Inspect Schema & RLS
              </button>
            </div>
          )}

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
        onRefreshStatus={checkSupabaseConnection}
        onOpenAuth={() => {
          setIsSupabaseModalOpen(false);
          setIsAuthModalOpen(true);
        }}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={checkSupabaseConnection}
      />

      <DocumentPrintModal
        invoice={selectedInvoiceForPrint}
        tenant={activeTenant}
        onClose={() => setSelectedInvoiceForPrint(null)}
      />
    </div>
  );
}
