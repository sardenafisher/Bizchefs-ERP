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
    <header className="sticky top-0 z-50 w-full bg-[#fafafa]/90 backdrop-blur-md border-b border-neutral-200 text-neutral-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-8">
          {/* Zone 1: Logo & Ecosystem Indicator */}
          <div className="flex items-center gap-4 sm:gap-6 shrink-0">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="text-left focus:outline-none cursor-pointer"
              title="BizChefs ERP"
            >
              <BizChefsLogo variant="horizontal" size="md" theme="light" showSubtitle={false} />
            </button>

            {/* Ecosystem dropdown (Desktop) */}
            <div className="hidden lg:block relative">
              <button
                type="button"
                onClick={() => setEcosystemDropdownOpen(!ecosystemDropdownOpen)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-neutral-600 hover:text-neutral-950 rounded-lg bg-white border border-neutral-200 hover:border-neutral-300 shadow-2xs transition-colors cursor-pointer"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#d39e36]" />
                <span>Ecosystem</span>
                <ChevronDown className="w-3.5 h-3.5 text-neutral-500" />
              </button>

              {ecosystemDropdownOpen && (
                <div
                  className="absolute left-0 mt-2 w-72 rounded-xl bg-white border border-neutral-200 shadow-xl p-2 z-50 text-xs"
                  onMouseLeave={() => setEcosystemDropdownOpen(false)}
                >
                  <div className="px-3 py-2 text-[10px] uppercase tracking-wider text-neutral-500 font-semibold border-b border-neutral-100 mb-1">
                    BizChefs Digital Network
                  </div>
                  <a
                    href={BIZCHEFS_ECOSYSTEM.corporate.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start justify-between p-2.5 rounded-lg hover:bg-neutral-50 transition-colors group"
                  >
                    <div>
                      <div className="font-semibold text-neutral-900 group-hover:text-[#d39e36]">
                        {BIZCHEFS_ECOSYSTEM.corporate.name}
                      </div>
                      <div className="text-[11px] text-neutral-500 mt-0.5">
                        {BIZCHEFS_ECOSYSTEM.corporate.description}
                      </div>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-neutral-400 group-hover:text-[#d39e36] shrink-0 mt-0.5" />
                  </a>
                  <a
                    href={BIZCHEFS_ECOSYSTEM.studio.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start justify-between p-2.5 rounded-lg hover:bg-neutral-50 transition-colors group"
                  >
                    <div>
                      <div className="font-semibold text-neutral-900 group-hover:text-[#d39e36]">
                        {BIZCHEFS_ECOSYSTEM.studio.name}
                      </div>
                      <div className="text-[11px] text-neutral-500 mt-0.5">
                        {BIZCHEFS_ECOSYSTEM.studio.description}
                      </div>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-neutral-400 group-hover:text-[#d39e36] shrink-0 mt-0.5" />
                  </a>
                  <div className="p-2.5 rounded-lg bg-amber-50/80 border border-amber-200/60">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-amber-950 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#d39e36]" />
                        {BIZCHEFS_ECOSYSTEM.erp.name}
                      </span>
                      <span className="text-[9px] bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded font-mono font-bold">
                        ACTIVE
                      </span>
                    </div>
                    <div className="text-[11px] text-neutral-600 mt-0.5">
                      {BIZCHEFS_ECOSYSTEM.erp.description}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Zone 2: Desktop Nav Links (Clean unboxed links) */}
          <nav className="hidden xl:flex items-center gap-7 text-xs sm:text-sm font-medium text-neutral-600">
            <a href="#overview" className="hover:text-neutral-950 transition-colors whitespace-nowrap shrink-0">
              Overview
            </a>
            <a href="#features" className="hover:text-neutral-950 transition-colors whitespace-nowrap shrink-0">
              Features
            </a>
            <a href="#modules" className="hover:text-neutral-950 transition-colors whitespace-nowrap shrink-0">
              Modules
            </a>
            <a href="#how-it-works" className="hover:text-neutral-950 transition-colors whitespace-nowrap shrink-0">
              How It Works
            </a>
            <a href="#pricing" className="text-neutral-950 hover:text-[#d39e36] font-semibold transition-colors flex items-center gap-1 whitespace-nowrap shrink-0">
              <span>Pricing & Plans</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#d39e36]" />
            </a>
            <a href="#security" className="hover:text-neutral-950 transition-colors whitespace-nowrap shrink-0">
              Security
            </a>
            <a href="#faq" className="hover:text-neutral-950 transition-colors whitespace-nowrap shrink-0">
              FAQ
            </a>
          </nav>

          {/* Zone 3: Action CTAs */}
          <div className="hidden sm:flex items-center gap-3 shrink-0">
            {onRequestDemo && (
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<Calendar className="w-3.5 h-3.5 text-[#d39e36]" />}
                onClick={onRequestDemo}
                className="hidden lg:inline-flex text-neutral-700 hover:text-neutral-950 whitespace-nowrap"
              >
                Request a Demo
              </Button>
            )}

            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <span className="text-xs text-neutral-600 hidden 2xl:inline">
                  Tenant: <strong className="text-neutral-950">{activeTenantName}</strong>
                </span>
                <Button
                  variant="primary"
                  size="sm"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                  onClick={() => onEnterWorkspace()}
                  className="whitespace-nowrap"
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
                  className="whitespace-nowrap"
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
                  className="whitespace-nowrap"
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
              className="p-2 rounded-lg text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100 transition-colors"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6 text-neutral-900" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-white border-b border-neutral-200 px-4 pt-3 pb-6 space-y-4 shadow-lg">
          <div className="flex flex-col space-y-1 text-sm font-medium text-neutral-700">
            <a
              href="#overview"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-neutral-50 hover:text-neutral-950"
            >
              Overview
            </a>
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-neutral-50 hover:text-neutral-950"
            >
              Features & Benefits
            </a>
            <a
              href="#modules"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-neutral-50 hover:text-neutral-950"
            >
              Operational Modules (9)
            </a>
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-neutral-50 hover:text-neutral-950"
            >
              How It Works
            </a>
            <a
              href="#pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg bg-amber-50 text-amber-950 font-semibold"
            >
              Subscription Plans & Pricing
            </a>
            <a
              href="#security"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-neutral-50 hover:text-neutral-950"
            >
              Security & PostgreSQL RLS
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-neutral-50 hover:text-neutral-950"
            >
              FAQ
            </a>
          </div>

          <div className="pt-3 border-t border-neutral-200 flex flex-col gap-2">
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
