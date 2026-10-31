'use client';

import React, { useState } from 'react';
import { 
  Building2, 
  ChevronDown, 
  Search, 
  Bell, 
  Database, 
  CheckCircle2, 
  Plus, 
  Shield, 
  Globe, 
  ExternalLink 
} from 'lucide-react';
import { Tenant, UserProfile } from '@/lib/types/erp';
import { BizChefsLogo } from '@/components/brand/BizChefsLogo';

interface HeaderProps {
  activeTenant: Tenant;
  tenants: Tenant[];
  currentUser: UserProfile;
  supabaseUser?: any | null;
  supabaseStatus?: 'unconfigured' | 'unauthenticated' | 'connected' | 'error';
  onSwitchTenant: (tenantId: string) => void;
  onOpenNewTenantModal: () => void;
  onOpenCommandPalette: () => void;
  onOpenSupabaseModal: () => void;
  onOpenAuthModal?: () => void;
  onSignOut?: () => void;
  isSupabaseLinked?: boolean;
  activeView: string;
  onNavigateToLanding?: () => void;
}

export function Header({
  activeTenant,
  tenants,
  currentUser,
  supabaseUser = null,
  supabaseStatus = 'unconfigured',
  onSwitchTenant,
  onOpenNewTenantModal,
  onOpenCommandPalette,
  onOpenSupabaseModal,
  onOpenAuthModal,
  onSignOut,
  onNavigateToLanding
}: HeaderProps) {
  const [showTenantDropdown, setShowTenantDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showEcosystem, setShowEcosystem] = useState(false);

  return (
    <header className="h-16 bg-white text-neutral-900 border-b border-neutral-200 flex items-center justify-between px-4 sm:px-6 z-20 sticky top-0 shadow-2xs">
      {/* Left: Brand, Ecosystem & Company Switcher */}
      <div className="flex items-center gap-3 sm:gap-5">
        <button
          type="button"
          onClick={onNavigateToLanding}
          className="text-left focus:outline-none cursor-pointer"
          title="Return to Public Landing Page"
        >
          <BizChefsLogo size="sm" variant="horizontal" showSubtitle={false} theme="light" />
        </button>

        {onNavigateToLanding && (
          <button
            type="button"
            onClick={onNavigateToLanding}
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-neutral-600 hover:text-neutral-950 rounded-lg bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 transition cursor-pointer"
          >
            ← Public Landing
          </button>
        )}

        <div className="h-6 w-px bg-neutral-200 hidden md:block" />

        {/* BizChefs Ecosystem Switcher */}
        <div className="relative hidden lg:block">
          <button
            type="button"
            onClick={() => setShowEcosystem(!showEcosystem)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white hover:bg-neutral-50 border border-neutral-200 text-neutral-700 hover:text-neutral-950 text-xs transition-colors cursor-pointer shadow-2xs"
            title="BizChefs Commercial Ecosystem"
          >
            <Globe className="w-3.5 h-3.5 text-[#d39e36]" />
            <span className="text-[11px] font-medium">Ecosystem</span>
            <ChevronDown className="w-3 h-3 text-neutral-400" />
          </button>

          {showEcosystem && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setShowEcosystem(false)} />
              <div className="absolute left-0 mt-2 w-64 bg-white border border-neutral-200 rounded-xl shadow-xl p-2 z-40 text-xs animate-in fade-in">
                <div className="px-3 py-1.5 text-[10px] font-semibold text-neutral-500 uppercase tracking-wider border-b border-neutral-100">
                  BizChefs Digital Platforms
                </div>
                <div className="space-y-1 pt-1.5">
                  <a
                    href="https://bizchefs.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-neutral-50 text-neutral-700 hover:text-neutral-950 transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-neutral-900 flex items-center gap-1.5">
                        <span>bizchefs.com</span>
                        <ExternalLink className="w-3 h-3 text-neutral-400" />
                      </div>
                      <div className="text-[10px] text-neutral-500">Corporate Portal & Digital Agency</div>
                    </div>
                  </a>
                  <a
                    href="https://studio.bizchefs.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-neutral-50 text-neutral-700 hover:text-neutral-950 transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-neutral-900 flex items-center gap-1.5">
                        <span>studio.bizchefs.com</span>
                        <ExternalLink className="w-3 h-3 text-neutral-400" />
                      </div>
                      <div className="text-[10px] text-neutral-500">BizChefs Creative Studio & Design</div>
                    </div>
                  </a>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-amber-50/80 border border-amber-200 text-amber-950">
                    <div>
                      <div className="font-semibold flex items-center gap-1.5">
                        <span>erp.bizchefs.com</span>
                        <span className="text-[9px] bg-amber-200 text-amber-900 px-1 rounded font-bold uppercase">Current</span>
                      </div>
                      <div className="text-[10px] text-neutral-600">Commercial ERP & Financial Ledger</div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="h-6 w-px bg-neutral-200 hidden sm:block" />

        {/* Multi-Tenant Switcher */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowTenantDropdown(!showTenantDropdown)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-white hover:bg-neutral-50 border border-neutral-200 text-left transition-colors cursor-pointer group shadow-2xs"
            aria-label="Switch company or tenant"
            aria-expanded={showTenantDropdown}
          >
            <Building2 className="w-4 h-4 text-[#d39e36] group-hover:scale-105 transition-transform" />
            <div className="max-w-[160px] sm:max-w-[220px] truncate">
              <div className="text-xs font-semibold text-neutral-950 truncate">{activeTenant.name}</div>
              <div className="text-[10px] text-neutral-500 flex items-center gap-1.5">
                <span>{activeTenant.settings.baseCurrency}</span>
                <span>•</span>
                <span className="capitalize">{activeTenant.subscription.plan}</span>
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-neutral-400 ml-1" />
          </button>

          {showTenantDropdown && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setShowTenantDropdown(false)}
              />
              <div className="absolute left-0 mt-2 w-72 bg-white border border-neutral-200 rounded-lg shadow-xl p-2 z-40">
                <div className="px-2 py-1.5 text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
                  Select Tenant Company
                </div>
                <div className="space-y-1 my-1 max-h-56 overflow-y-auto">
                  {tenants.map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        onSwitchTenant(t.id);
                        setShowTenantDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-md text-xs flex items-center justify-between transition-colors cursor-pointer ${
                        t.id === activeTenant.id
                          ? 'bg-amber-50 text-amber-950 font-medium border border-amber-200'
                          : 'text-neutral-800 hover:bg-neutral-50'
                      }`}
                    >
                      <div className="truncate pr-2">
                        <div className="truncate font-semibold">{t.name}</div>
                        <div className="text-[10px] text-neutral-500">{t.industry} • {t.settings.baseCurrency}</div>
                      </div>
                      {t.id === activeTenant.id && (
                        <CheckCircle2 className="w-4 h-4 text-[#d39e36] shrink-0" />
                      )}
                    </button>
                  ))}
                </div>

                <div className="border-t border-neutral-100 pt-2 mt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setShowTenantDropdown(false);
                      onOpenNewTenantModal();
                    }}
                    className="w-full text-left px-3 py-2 rounded-md text-xs font-semibold text-[#b88022] hover:bg-amber-50 flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Register New Company / Branch</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Right: Quick Search, Database Sync, User Profile */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Quick Search */}
        <button
          type="button"
          onClick={onOpenCommandPalette}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-xs text-neutral-600 bg-neutral-50 border border-neutral-200 rounded-lg hover:text-neutral-950 hover:bg-neutral-100 transition-colors cursor-pointer"
          aria-label="Search records and jump to module"
        >
          <Search className="w-3.5 h-3.5 text-neutral-400" />
          <span>Quick search or command...</span>
          <kbd className="text-[10px] bg-white text-neutral-500 px-1.5 py-0.5 rounded border border-neutral-200 font-mono shadow-2xs">
            ⌘K
          </kbd>
        </button>

        {/* Supabase Honest Status Indicator */}
        <button
          type="button"
          onClick={onOpenSupabaseModal}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs bg-white border transition-colors cursor-pointer shadow-2xs ${
            supabaseStatus === 'connected'
              ? 'border-emerald-300 text-emerald-800 hover:bg-emerald-50'
              : supabaseStatus === 'unauthenticated'
              ? 'border-amber-300 text-amber-800 hover:bg-amber-50'
              : supabaseStatus === 'error'
              ? 'border-red-300 text-red-800 hover:bg-red-50'
              : 'border-neutral-200 text-neutral-600 hover:border-neutral-300'
          }`}
          title="Supabase PostgreSQL Live Connection & Verification"
        >
          <Database className="w-3.5 h-3.5 text-[#d39e36]" />
          <span className="hidden sm:inline text-[11px] font-medium">
            {supabaseStatus === 'connected' && 'Supabase Connected'}
            {supabaseStatus === 'unauthenticated' && 'Supabase (Auth Needed)'}
            {supabaseStatus === 'error' && 'Supabase Error'}
            {supabaseStatus === 'unconfigured' && 'Supabase Unconfigured'}
          </span>
          <span
            className={`w-2 h-2 rounded-full shrink-0 ${
              supabaseStatus === 'connected'
                ? 'bg-emerald-500 animate-pulse'
                : supabaseStatus === 'unauthenticated'
                ? 'bg-amber-500'
                : supabaseStatus === 'error'
                ? 'bg-red-500'
                : 'bg-neutral-400'
            }`}
          />
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer relative"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#d39e36]" />
          </button>

          {showNotifications && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setShowNotifications(false)}
              />
              <div className="absolute right-0 mt-2 w-80 bg-white border border-neutral-200 rounded-lg shadow-xl p-3 z-40 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
                  <span className="font-semibold text-neutral-950">System Notifications</span>
                  <span className="text-[10px] text-[#b88022] font-medium">All Operational</span>
                </div>
                <div className="space-y-2 py-2">
                  <div className="p-2 bg-neutral-50 rounded border border-neutral-200">
                    <div className="font-semibold text-neutral-900">Daily Ledger Check Passed</div>
                    <div className="text-[11px] text-neutral-600">Double-entry ledger balances verified with zero discrepancy.</div>
                  </div>
                  <div className="p-2 bg-neutral-50 rounded border border-neutral-200">
                    <div className="font-semibold text-neutral-900">Multi-tenant RLS Active</div>
                    <div className="text-[11px] text-neutral-600">PostgreSQL row-level security active for {activeTenant.name}.</div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Auth / User Control */}
        {supabaseUser ? (
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center gap-2 pl-2 border-l border-neutral-200 hover:opacity-90 transition-opacity cursor-pointer"
            >
              <div className="w-7 h-7 rounded-full bg-neutral-950 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                {(supabaseUser.email?.charAt(0) || 'U').toUpperCase()}
              </div>
              <div className="hidden xl:block text-left">
                <div className="text-xs font-semibold text-neutral-950 truncate max-w-[130px]">
                  {supabaseUser.email}
                </div>
                <div className="text-[10px] text-emerald-700 flex items-center gap-1 font-medium">
                  <Shield className="w-2.5 h-2.5 text-emerald-600" />
                  <span>Verified Identity</span>
                </div>
              </div>
            </button>

            {showUserDropdown && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowUserDropdown(false)} />
                <div className="absolute right-0 mt-2 w-56 bg-white border border-neutral-200 rounded-lg shadow-xl p-2 z-40 text-xs">
                  <div className="px-3 py-2 border-b border-neutral-100">
                    <div className="text-neutral-500 text-[10px] uppercase font-semibold">Supabase User</div>
                    <div className="text-neutral-950 font-medium truncate">{supabaseUser.email}</div>
                  </div>
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setShowUserDropdown(false);
                        onSignOut?.();
                      }}
                      className="w-full text-left px-3 py-2 rounded text-red-600 hover:bg-red-50 cursor-pointer font-medium"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 pl-2 border-l border-neutral-200">
            <button
              type="button"
              onClick={onOpenAuthModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-950 hover:bg-neutral-800 text-white font-medium text-xs transition-colors cursor-pointer shadow-xs"
            >
              <Shield className="w-3.5 h-3.5 text-[#d39e36]" />
              <span>Sign In / Register</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
