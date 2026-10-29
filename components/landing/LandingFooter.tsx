'use client';

import React from 'react';
import { BizChefsLogo } from '@/components/brand/BizChefsLogo';
import { BIZCHEFS_ECOSYSTEM } from '@/lib/theme/tokens';
import { ExternalLink, ShieldCheck, Heart } from 'lucide-react';

interface LandingFooterProps {
  onEnterWorkspace: (moduleId?: string) => void;
  onOpenAuth: (mode?: 'signin' | 'signup' | 'forgot-password' | 'reset-password' | 'onboarding' | 'tenant-select') => void;
}

export function LandingFooter({ onEnterWorkspace, onOpenAuth }: LandingFooterProps) {
  return (
    <footer id="ecosystem" className="bg-[#090a0d] text-zinc-400 border-t border-zinc-800 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <BizChefsLogo variant="horizontal" size="md" theme="dark" showSubtitle={true} />
            <p className="text-xs text-zinc-400 max-w-sm leading-relaxed">
              Institutional-grade multi-tenant Enterprise Resource Planning software engineered
              for the modern foodservice, hospitality, and culinary industry.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-zinc-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>SOC2 Type II & GDPR-Ready Database Architecture</span>
            </div>
          </div>

          {/* Ecosystem Col */}
          <div className="space-y-3">
            <div className="font-semibold text-white tracking-wider uppercase text-[11px]">
              Ecosystem
            </div>
            <ul className="space-y-2">
              <li>
                <a
                  href={BIZCHEFS_ECOSYSTEM.corporate.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-[#e5a83b] transition"
                >
                  <span>{BIZCHEFS_ECOSYSTEM.corporate.name}</span>
                  <ExternalLink className="w-3 h-3 text-zinc-600" />
                </a>
              </li>
              <li>
                <a
                  href={BIZCHEFS_ECOSYSTEM.studio.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-[#e5a83b] transition"
                >
                  <span>{BIZCHEFS_ECOSYSTEM.studio.name}</span>
                  <ExternalLink className="w-3 h-3 text-zinc-600" />
                </a>
              </li>
              <li>
                <span className="text-white font-medium flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#d39e36]" />
                  <span>{BIZCHEFS_ECOSYSTEM.erp.name}</span>
                </span>
              </li>
            </ul>
          </div>

          {/* Core Modules Col */}
          <div className="space-y-3">
            <div className="font-semibold text-white tracking-wider uppercase text-[11px]">
              Core Modules
            </div>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onEnterWorkspace('sales')}
                  className="hover:text-[#e5a83b] transition text-left"
                >
                  CRM & Sales Orders
                </button>
              </li>
              <li>
                <button
                  onClick={() => onEnterWorkspace('accounting')}
                  className="hover:text-[#e5a83b] transition text-left"
                >
                  Double-Entry Ledger
                </button>
              </li>
              <li>
                <button
                  onClick={() => onEnterWorkspace('inventory')}
                  className="hover:text-[#e5a83b] transition text-left"
                >
                  Inventory & Warehouse
                </button>
              </li>
              <li>
                <button
                  onClick={() => onEnterWorkspace('purchasing')}
                  className="hover:text-[#e5a83b] transition text-left"
                >
                  Purchasing & POs
                </button>
              </li>
              <li>
                <button
                  onClick={() => onEnterWorkspace('admin')}
                  className="hover:text-[#e5a83b] transition text-left"
                >
                  Super Administration
                </button>
              </li>
            </ul>
          </div>

          {/* Access & Deployment Col */}
          <div className="space-y-3">
            <div className="font-semibold text-white tracking-wider uppercase text-[11px]">
              Platform Access
            </div>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onOpenAuth('signin')}
                  className="hover:text-[#e5a83b] transition text-left"
                >
                  Account Sign In
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenAuth('signup')}
                  className="hover:text-[#e5a83b] transition text-left"
                >
                  Register New Tenant
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenAuth('forgot-password')}
                  className="hover:text-[#e5a83b] transition text-left"
                >
                  Reset Password
                </button>
              </li>
              <li>
                <span className="text-zinc-400">Hostinger Premium Export</span>
              </li>
              <li>
                <span className="text-zinc-400">Supabase Cloud Sync</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-12 mt-12 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-4 text-xs text-zinc-400">
          <div>
            © {new Date().getFullYear()} BizChefs Inc. All rights reserved. Built for institutional multi-tenant operations.
          </div>
          <div className="flex items-center gap-6">
            <span>Destination: <strong className="text-zinc-300">erp.bizchefs.com</strong></span>
            <span>Server: <strong className="text-zinc-300">Hostinger Premium (LiteSpeed/Apache)</strong></span>
          </div>
        </div>
      </div>
    </footer>
  );
}
