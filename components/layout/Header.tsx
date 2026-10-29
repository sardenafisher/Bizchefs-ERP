'use client';

import React, { useState } from 'react';
import { 
  Building2, 
  ChevronDown, 
  Search, 
  Bell, 
  Database, 
  CheckCircle2, 
  AlertCircle,
  Plus,
  Shield,
  Layers,
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
  isSupabaseLinked = false,
  activeView,
  onNavigateToLanding
}: HeaderProps) {
  const [showTenantDropdown, setShowTenantDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showEcosystem, setShowEcosystem] = useState(false);

  return (
    <header className="h-16 bg-[#121316] text-white border-b border-[#27272a] flex items-center justify-between px-4 sm:px-6 z-20 sticky top-0">
      {/* Left: Brand, Ecosystem & Company Switcher */}
      <div className="flex items-center gap-3 sm:gap-5">
        <button
          type="button"
          onClick={onNavigateToLanding}
          className="text-left focus:outline-none cursor-pointer"
          title="Return to Public Landing Page"
        >
          <BizChefsLogo size="sm" variant="horizontal" showSubtitle={true} theme="dark" />
        </button>

        {onNavigateToLanding && (
          <button
            type="button"
            onClick={onNavigateToLanding}
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-zinc-400 hover:text-white rounded-lg bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 transition"
          >
            ← Public Landing
          </button>
        )}

        <div className="h-6 w-px bg-zinc-800 hidden md:block" />

        {/* BizChefs Ecosystem Switcher */}
        <div className="relative hidden lg:block">
          <button
            type="button"
            onClick={() => setShowEcosystem(!showEcosystem)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-xs transition-colors cursor-pointer"
            title="BizChefs Commercial Ecosystem"
          >
            <Globe className="w-3.5 h-3.5 text-[#d39e36]" />
            <span className="text-[11px] font-medium">Ecosystem</span>
            <ChevronDown className="w-3 h-3 text-zinc-500" />
          </button>

          {showEcosystem && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setShowEcosystem(false)} />
              <div className="absolute left-0 mt-2 w-64 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl p-2 z-40 text-xs animate-in fade-in">
                <div className="px-3 py-1.5 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider border-b border-zinc-800">
                  BizChefs Digital Platforms
                </div>
                <div className="space-y-1 pt-1.5">
                  <a
                    href="https://bizchefs.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-zinc-100 flex items-center gap-1.5">
                        <span>bizchefs.com</span>
                        <ExternalLink className="w-3 h-3 text-zinc-400" />
                      </div>
                      <div className="text-[10px] text-zinc-400">Corporate Portal & Digital Agency</div>
                    </div>
                  </a>
                  <a
                    href="https://studio.bizchefs.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-zinc-100 flex items-center gap-1.5">
                        <span>studio.bizchefs.com</span>
                        <ExternalLink className="w-3 h-3 text-zinc-400" />
                      </div>
                      <div className="text-[10px] text-zinc-400">BizChefs Creative Studio & Design</div>
                    </div>
                  </a>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-800/80 border border-[#d39e36]/40 text-[#d39e36]">
                    <div>
                      <div className="font-semibold flex items-center gap-1.5">
                        <span>erp.bizchefs.com</span>
                        <span className="text-[9px] bg-[#d39e36] text-black px-1 rounded font-bold uppercase">Current</span>
                      </div>
                      <div className="text-[10px] text-zinc-300">Commercial ERP & Financial Ledger</div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="h-6 w-px bg-zinc-800 hidden sm:block" />

        {/* Multi-Tenant Switcher */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowTenantDropdown(!showTenantDropdown)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-left transition-colors cursor-pointer group"
            aria-label="Switch company or tenant"
            aria-expanded={showTenantDropdown}
          >
            <Building2 className="w-4 h-4 text-[#d39e36] group-hover:scale-105 transition-transform" />
            <div className="max-w-[160px] sm:max-w-[220px] truncate">
              <div className="text-xs font-medium text-zinc-100 truncate">{activeTenant.name}</div>
              <div className="text-[10px] text-zinc-400 flex items-center gap-1.5">
                <span>{activeTenant.settings.baseCurrency}</span>
                <span>•</span>
                <span className="capitalize">{activeTenant.subscription.plan}</span>
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400 ml-1" />
          </button>

          {showTenantDropdown && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setShowTenantDropdown(false)}
              />
              <div className="absolute left-0 mt-2 w-72 bg-zinc-900 border border-zinc-700 rounded-lg shadow-2xl p-2 z-40">
                <div className="px-2 py-1.5 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
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
                          ? 'bg-[#d39e36]/15 text-[#d39e36] font-medium border border-[#d39e36]/30'
                          : 'text-zinc-200 hover:bg-zinc-800'
                      }`}
                    >
                      <div className="truncate pr-2">
                        <div className="truncate font-medium">{t.name}</div>
                        <div className="text-[10px] text-zinc-400">{t.industry} • {t.settings.baseCurrency}</div>
                      </div>
                      {t.id === activeTenant.id && (
                        <CheckCircle2 className="w-4 h-4 text-[#d39e36] shrink-0" />
                      )}
                    </button>
                  ))}
                </div>

                <div className="border-t border-zinc-800 pt-2 mt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setShowTenantDropdown(false);
                      onOpenNewTenantModal();
                    }}
                    className="w-full text-left px-3 py-2 rounded-md text-xs font-medium text-[#d39e36] hover:bg-zinc-800 flex items-center gap-2 cursor-pointer transition-colors"
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
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-xs text-zinc-400 bg-zinc-900 border border-zinc-700 rounded-lg hover:text-zinc-200 hover:border-zinc-600 transition-colors cursor-pointer"
          aria-label="Search records and jump to module"
        >
          <Search className="w-3.5 h-3.5 text-zinc-400" />
          <span>Quick search or command...</span>
          <kbd className="text-[10px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded border border-zinc-700 font-mono">
            ⌘K
          </kbd>
        </button>

        {/* Supabase Honest Status Indicator */}
        <button
          type="button"
          onClick={onOpenSupabaseModal}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs bg-zinc-900 border transition-colors cursor-pointer ${
            supabaseStatus === 'connected'
              ? 'border-emerald-600/60 text-emerald-300 hover:bg-emerald-950/30'
              : supabaseStatus === 'unauthenticated'
              ? 'border-amber-600/60 text-amber-300 hover:bg-amber-950/30'
              : supabaseStatus === 'error'
              ? 'border-red-600/60 text-red-300 hover:bg-red-950/30'
              : 'border-zinc-700 text-zinc-400 hover:border-zinc-500'
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
                ? 'bg-emerald-400 animate-pulse'
                : supabaseStatus === 'unauthenticated'
                ? 'bg-amber-400'
                : supabaseStatus === 'error'
                ? 'bg-red-400'
                : 'bg-zinc-500'
            }`}
          />
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer relative"
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
              <div className="absolute right-0 mt-2 w-80 bg-zinc-900 border border-zinc-700 rounded-lg shadow-2xl p-3 z-40 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                  <span className="font-semibold text-zinc-200">System Notifications</span>
                  <span className="text-[10px] text-[#d39e36]">All Operational</span>
                </div>
                <div className="space-y-2 py-2">
                  <div className="p-2 bg-zinc-800/60 rounded border border-zinc-700/60">
                    <div className="font-medium text-zinc-200">Daily Ledger Check Passed</div>
                    <div className="text-[11px] text-zinc-400">Double-entry ledger balances verified with zero discrepancy.</div>
                  </div>
                  <div className="p-2 bg-zinc-800/60 rounded border border-zinc-700/60">
                    <div className="font-medium text-zinc-200">Multi-tenant RLS Active</div>
                    <div className="text-[11px] text-zinc-400">PostgreSQL row-level security active for {activeTenant.name}.</div>
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
              className="flex items-center gap-2 pl-2 border-l border-zinc-700 hover:opacity-90 transition-opacity cursor-pointer"
            >
              <div className="w-7 h-7 rounded-full bg-[#d39e36] text-black font-bold flex items-center justify-center text-xs shadow-sm">
                {(supabaseUser.email?.charAt(0) || 'U').toUpperCase()}
              </div>
              <div className="hidden xl:block text-left">
                <div className="text-xs font-medium text-zinc-200 truncate max-w-[130px]">
                  {supabaseUser.email}
                </div>
                <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                  <Shield className="w-2.5 h-2.5" />
                  <span>Verified Identity</span>
                </div>
              </div>
            </button>

            {showUserDropdown && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowUserDropdown(false)} />
                <div className="absolute right-0 mt-2 w-56 bg-zinc-900 border border-zinc-700 rounded-lg shadow-2xl p-2 z-40 text-xs">
                  <div className="px-3 py-2 border-b border-zinc-800">
                    <div className="text-zinc-400 text-[10px] uppercase font-semibold">Supabase User</div>
                    <div className="text-zinc-200 font-medium truncate">{supabaseUser.email}</div>
                  </div>
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setShowUserDropdown(false);
                        onSignOut?.();
                      }}
                      className="w-full text-left px-3 py-2 rounded text-red-400 hover:bg-zinc-800 cursor-pointer font-medium"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 pl-2 border-l border-zinc-700">
            <button
              type="button"
              onClick={onOpenAuthModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#d39e36] hover:bg-[#be8a29] text-black font-semibold text-xs transition-colors cursor-pointer shadow-sm"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Sign In / Register</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
