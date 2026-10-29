'use client';

import React, { useState } from 'react';
import { BizChefsLogo } from '@/components/brand/BizChefsLogo';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { BIZCHEFS_ECOSYSTEM } from '@/lib/theme/tokens';
import {
  ExternalLink,
  Menu,
  X,
  ChevronDown,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  LogIn
} from 'lucide-react';

interface LandingHeaderProps {
  onEnterWorkspace: (module?: string) => void;
  onOpenAuth: (mode?: 'signin' | 'signup') => void;
  isAuthenticated?: boolean;
  activeTenantName?: string;
}

export function LandingHeader({
  onEnterWorkspace,
  onOpenAuth,
  isAuthenticated = false,
  activeTenantName = 'BizChefs Global Corp'
}: LandingHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [ecosystemDropdownOpen, setEcosystemDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-[#0c0e12]/95 backdrop-blur-md border-b border-[#27272a]/80 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Ecosystem Indicator */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="text-left focus:outline-none"
            >
              <BizChefsLogo variant="horizontal" size="md" theme="dark" showSubtitle={true} />
            </button>

            {/* Ecosystem dropdown (Desktop) */}
            <div className="hidden lg:block relative">
              <button
                onClick={() => setEcosystemDropdownOpen(!ecosystemDropdownOpen)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-zinc-300 hover:text-white rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#d39e36]" />
                <span>Ecosystem</span>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
              </button>

              {ecosystemDropdownOpen && (
                <div
                  className="absolute left-0 mt-2 w-72 rounded-xl bg-[#121316] border border-zinc-800 shadow-2xl p-2 z-50 text-xs"
                  onMouseLeave={() => setEcosystemDropdownOpen(false)}
                >
                  <div className="px-3 py-2 text-[10px] uppercase tracking-wider text-zinc-400 font-semibold border-b border-zinc-800 mb-1">
                    BizChefs Digital Network
                  </div>
                  <a
                    href={BIZCHEFS_ECOSYSTEM.corporate.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start justify-between p-2.5 rounded-lg hover:bg-zinc-800/80 transition group"
                  >
                    <div>
                      <div className="font-semibold text-zinc-100 group-hover:text-[#e5a83b]">
                        {BIZCHEFS_ECOSYSTEM.corporate.name}
                      </div>
                      <div className="text-[11px] text-zinc-400 mt-0.5">
                        {BIZCHEFS_ECOSYSTEM.corporate.description}
                      </div>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-zinc-500 group-hover:text-[#e5a83b] shrink-0 mt-0.5" />
                  </a>
                  <a
                    href={BIZCHEFS_ECOSYSTEM.studio.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start justify-between p-2.5 rounded-lg hover:bg-zinc-800/80 transition group"
                  >
                    <div>
                      <div className="font-semibold text-zinc-100 group-hover:text-[#e5a83b]">
                        {BIZCHEFS_ECOSYSTEM.studio.name}
                      </div>
                      <div className="text-[11px] text-zinc-400 mt-0.5">
                        {BIZCHEFS_ECOSYSTEM.studio.description}
                      </div>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-zinc-500 group-hover:text-[#e5a83b] shrink-0 mt-0.5" />
                  </a>
                  <div className="p-2.5 rounded-lg bg-[#d39e36]/10 border border-[#d39e36]/30">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#e5a83b] flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#d39e36] animate-pulse" />
                        {BIZCHEFS_ECOSYSTEM.erp.name}
                      </span>
                      <span className="text-[9px] bg-[#d39e36]/20 text-[#e5a83b] px-1.5 py-0.5 rounded font-mono font-bold">
                        ACTIVE
                      </span>
                    </div>
                    <div className="text-[11px] text-zinc-300 mt-0.5">
                      {BIZCHEFS_ECOSYSTEM.erp.description}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-300">
            <a href="#modules" className="hover:text-[#e5a83b] transition">
              Modules
            </a>
            <a href="#architecture" className="hover:text-[#e5a83b] transition">
              Architecture & Security
            </a>
            <a href="#how-it-works" className="hover:text-[#e5a83b] transition">
              Workflow
            </a>
            <a href="#ecosystem" className="hover:text-[#e5a83b] transition">
              Ecosystem
            </a>
          </nav>

          {/* Action CTAs */}
          <div className="hidden sm:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <span className="text-xs text-zinc-400 hidden xl:inline">
                  Tenant: <strong className="text-white">{activeTenantName}</strong>
                </span>
                <Button
                  variant="primary"
                  size="sm"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                  onClick={() => onEnterWorkspace()}
                >
                  Enter Workspace
                </Button>
              </div>
            ) : (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<LogIn className="w-3.5 h-3.5 text-[#e5a83b]" />}
                  onClick={() => onOpenAuth('signin')}
                >
                  Sign In
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                  onClick={() => onEnterWorkspace()}
                >
                  Launch Live ERP
                </Button>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6 text-[#e5a83b]" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0c0e12] border-b border-zinc-800 px-4 pt-3 pb-6 space-y-4">
          <div className="flex flex-col space-y-3 text-sm font-medium text-zinc-300">
            <a
              href="#modules"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-zinc-900 hover:text-[#e5a83b]"
            >
              ERP Modules (9)
            </a>
            <a
              href="#architecture"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-zinc-900 hover:text-[#e5a83b]"
            >
              Security & PostgreSQL RLS
            </a>
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-zinc-900 hover:text-[#e5a83b]"
            >
              Operational Workflow
            </a>
            <a
              href="#ecosystem"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-zinc-900 hover:text-[#e5a83b]"
            >
              BizChefs Ecosystem
            </a>
          </div>

          <div className="pt-3 border-t border-zinc-800 flex flex-col gap-2">
            <Button
              variant="secondary"
              size="md"
              fullWidth
              leftIcon={<LogIn className="w-4 h-4 text-[#e5a83b]" />}
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAuth('signin');
              }}
            >
              Sign In to Account
            </Button>
            <Button
              variant="primary"
              size="md"
              fullWidth
              rightIcon={<ArrowRight className="w-4 h-4" />}
              onClick={() => {
                setMobileMenuOpen(false);
                onEnterWorkspace();
              }}
            >
              Launch Live ERP Workspace
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
