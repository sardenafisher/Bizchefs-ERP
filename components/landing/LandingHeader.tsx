'use client';

import React, { useState } from 'react';
import { BizChefsLogo } from '@/components/brand/BizChefsLogo';
import { Button } from '@/components/ui/Button';
import { BIZCHEFS_ECOSYSTEM } from '@/lib/theme/tokens';
import {
  ExternalLink,
  Menu,
  X,
  ChevronDown,
  ArrowRight,
  LogIn,
  Calendar
} from 'lucide-react';

interface LandingHeaderProps {
  onEnterWorkspace: (module?: string) => void;
  onOpenAuth: (mode?: 'signin' | 'signup') => void;
  onRequestDemo?: () => void;
  isAuthenticated?: boolean;
  activeTenantName?: string;
}

export function LandingHeader({
  onEnterWorkspace,
  onOpenAuth,
  onRequestDemo,
  isAuthenticated = false,
  activeTenantName = 'BizChefs Global Corp'
}: LandingHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [ecosystemDropdownOpen, setEcosystemDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-[#0c0e12]/95 backdrop-blur-md border-b border-[#262626] text-[#f3f4f6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Ecosystem Indicator */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="text-left focus:outline-none cursor-pointer"
              title="BizChefs ERP"
            >
              <BizChefsLogo variant="horizontal" size="md" theme="dark" showSubtitle={true} />
            </button>

            {/* Ecosystem dropdown (Desktop) */}
            <div className="hidden lg:block relative">
              <button
                type="button"
                onClick={() => setEcosystemDropdownOpen(!ecosystemDropdownOpen)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-zinc-300 hover:text-white rounded-lg bg-[#13171f] border border-[#262626] hover:border-zinc-700 transition-colors cursor-pointer"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#d39e36]" />
                <span>Ecosystem</span>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
              </button>

              {ecosystemDropdownOpen && (
                <div
                  className="absolute left-0 mt-2 w-72 rounded-xl bg-[#13171f] border border-[#262626] shadow-2xl p-2 z-50 text-xs"
                  onMouseLeave={() => setEcosystemDropdownOpen(false)}
                >
                  <div className="px-3 py-2 text-[10px] uppercase tracking-wider text-zinc-400 font-semibold border-b border-[#262626] mb-1">
                    BizChefs Digital Network
                  </div>
                  <a
                    href={BIZCHEFS_ECOSYSTEM.corporate.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start justify-between p-2.5 rounded-lg hover:bg-zinc-800 transition-colors group"
                  >
                    <div>
                      <div className="font-semibold text-zinc-100 group-hover:text-[#d39e36]">
                        {BIZCHEFS_ECOSYSTEM.corporate.name}
                      </div>
                      <div className="text-[11px] text-zinc-400 mt-0.5">
                        {BIZCHEFS_ECOSYSTEM.corporate.description}
                      </div>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-zinc-500 group-hover:text-[#d39e36] shrink-0 mt-0.5" />
                  </a>
                  <a
                    href={BIZCHEFS_ECOSYSTEM.studio.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start justify-between p-2.5 rounded-lg hover:bg-zinc-800 transition-colors group"
                  >
                    <div>
                      <div className="font-semibold text-zinc-100 group-hover:text-[#d39e36]">
                        {BIZCHEFS_ECOSYSTEM.studio.name}
                      </div>
                      <div className="text-[11px] text-zinc-400 mt-0.5">
                        {BIZCHEFS_ECOSYSTEM.studio.description}
                      </div>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-zinc-500 group-hover:text-[#d39e36] shrink-0 mt-0.5" />
                  </a>
                  <div className="p-2.5 rounded-lg bg-[#d39e36]/10 border border-[#d39e36]/30">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#d39e36] flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#d39e36] animate-pulse" />
                        {BIZCHEFS_ECOSYSTEM.erp.name}
                      </span>
                      <span className="text-[9px] bg-[#d39e36]/20 text-[#d39e36] px-1.5 py-0.5 rounded font-mono font-bold">
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
          <nav className="hidden xl:flex items-center gap-7 text-xs sm:text-sm font-medium text-zinc-300">
            <a href="#overview" className="hover:text-[#d39e36] transition-colors">
              Overview
            </a>
            <a href="#features" className="hover:text-[#d39e36] transition-colors">
              Features
            </a>
            <a href="#modules" className="hover:text-[#d39e36] transition-colors">
              Modules
            </a>
            <a href="#how-it-works" className="hover:text-[#d39e36] transition-colors">
              How It Works
            </a>
            <a href="#pricing" className="text-white hover:text-[#d39e36] font-semibold transition-colors flex items-center gap-1">
              <span>Pricing & Plans</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#d39e36]" />
            </a>
            <a href="#security" className="hover:text-[#d39e36] transition-colors">
              Security
            </a>
            <a href="#faq" className="hover:text-[#d39e36] transition-colors">
              FAQ
            </a>
          </nav>

          {/* Action CTAs */}
          <div className="hidden sm:flex items-center gap-3">
            {onRequestDemo && (
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<Calendar className="w-3.5 h-3.5 text-[#d39e36]" />}
                onClick={onRequestDemo}
                className="hidden lg:inline-flex text-zinc-300 hover:text-white"
              >
                Request a Demo
              </Button>
            )}

            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <span className="text-xs text-zinc-400 hidden 2xl:inline">
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
                  leftIcon={<LogIn className="w-3.5 h-3.5 text-[#d39e36]" />}
                  onClick={() => onOpenAuth('signin')}
                >
                  Sign In
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                  onClick={() => {
                    const el = document.getElementById('pricing');
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth' });
                    } else {
                      onOpenAuth('signup');
                    }
                  }}
                >
                  View Plans & Subscribe
                </Button>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="flex xl:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6 text-[#d39e36]" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-[#0c0e12] border-b border-[#262626] px-4 pt-3 pb-6 space-y-4">
          <div className="flex flex-col space-y-2 text-sm font-medium text-zinc-300">
            <a
              href="#overview"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-[#13171f] hover:text-[#d39e36]"
            >
              Overview
            </a>
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-[#13171f] hover:text-[#d39e36]"
            >
              Features & Benefits
            </a>
            <a
              href="#modules"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-[#13171f] hover:text-[#d39e36]"
            >
              Operational Modules (9)
            </a>
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-[#13171f] hover:text-[#d39e36]"
            >
              How It Works
            </a>
            <a
              href="#pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg bg-[#d39e36]/10 text-[#d39e36] font-semibold"
            >
              Subscription Plans & Pricing
            </a>
            <a
              href="#security"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-[#13171f] hover:text-[#d39e36]"
            >
              Security & PostgreSQL RLS
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-[#13171f] hover:text-[#d39e36]"
            >
              FAQ
            </a>
          </div>

          <div className="pt-3 border-t border-[#262626] flex flex-col gap-2">
            {onRequestDemo && (
              <Button
                variant="ghost"
                size="md"
                fullWidth
                leftIcon={<Calendar className="w-4 h-4 text-[#d39e36]" />}
                onClick={() => {
                  setMobileMenuOpen(false);
                  onRequestDemo();
                }}
              >
                Request a Demo
              </Button>
            )}
            <Button
              variant="secondary"
              size="md"
              fullWidth
              leftIcon={<LogIn className="w-4 h-4 text-[#d39e36]" />}
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAuth('signin');
              }}
            >
              Sign In to Existing Account
            </Button>
            <Button
              variant="primary"
              size="md"
              fullWidth
              rightIcon={<ArrowRight className="w-4 h-4" />}
              onClick={() => {
                setMobileMenuOpen(false);
                const el = document.getElementById('pricing');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              View Subscription Plans
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
