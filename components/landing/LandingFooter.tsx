'use client';

import React from 'react';
import { BizChefsLogo } from '@/components/brand/BizChefsLogo';
import { BIZCHEFS_ECOSYSTEM } from '@/lib/theme/tokens';
import { ExternalLink, ShieldCheck, Mail, Phone, MapPin } from 'lucide-react';

interface LandingFooterProps {
  onEnterWorkspace: (moduleId?: string) => void;
  onOpenAuth: (mode?: 'signin' | 'signup' | 'forgot-password' | 'reset-password' | 'onboarding' | 'tenant-select') => void;
  onRequestDemo?: () => void;
}

export function LandingFooter({ onEnterWorkspace, onOpenAuth, onRequestDemo }: LandingFooterProps) {
  return (
    <footer className="bg-[#090a0d] text-zinc-400 border-t border-[#262626] text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand & Identity Column */}
          <div className="lg:col-span-2 space-y-4">
            <BizChefsLogo variant="horizontal" size="md" theme="dark" showSubtitle={true} />
            <p className="text-xs text-zinc-400 max-w-sm leading-relaxed">
              Commercial multi-tenant Enterprise Resource Planning software engineered
              specifically for foodservice operations, central production kitchens, catering ventures, and multi-branch restaurant groups.
            </p>
            <div className="space-y-1.5 text-[11px] text-zinc-400">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#d39e36] shrink-0" />
                <a href="mailto:contact@bizchefs.com" className="hover:text-white transition-colors">
                  contact@bizchefs.com
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#d39e36] shrink-0" />
                <span>+20 128 171 9903</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#d39e36] shrink-0" />
                <span>Cairo, Egypt & Global Operations</span>
              </div>
            </div>
          </div>

          {/* Subscription & Pricing */}
          <div className="space-y-3">
            <div className="font-semibold text-white tracking-wider uppercase text-[11px]">
              Plans & Pricing
            </div>
            <ul className="space-y-2">
              <li>
                <a href="#pricing" className="hover:text-[#d39e36] transition-colors">
                  Starter Plan (1,950 EGP/mo)
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-[#d39e36] transition-colors">
                  Growth Plan (4,750 EGP/mo)
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-[#d39e36] transition-colors">
                  Enterprise Agreement
                </a>
              </li>
              {onRequestDemo && (
                <li>
                  <button
                    type="button"
                    onClick={onRequestDemo}
                    className="hover:text-[#d39e36] transition-colors text-left cursor-pointer"
                  >
                    Request Guided Demo
                  </button>
                </li>
              )}
              <li>
                <button
                  type="button"
                  onClick={() => onOpenAuth('signup')}
                  className="hover:text-[#d39e36] transition-colors text-left cursor-pointer text-[#d39e36] font-medium"
                >
                  Register New Organization →
                </button>
              </li>
            </ul>
          </div>

          {/* Operational Modules */}
          <div className="space-y-3">
            <div className="font-semibold text-white tracking-wider uppercase text-[11px]">
              Verified Modules
            </div>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onEnterWorkspace('sales')}
                  className="hover:text-[#d39e36] transition-colors text-left cursor-pointer"
                >
                  CRM & Sales Orders
                </button>
              </li>
              <li>
                <button
                  onClick={() => onEnterWorkspace('accounting')}
                  className="hover:text-[#d39e36] transition-colors text-left cursor-pointer"
                >
                  General Ledger & Accounting
                </button>
              </li>
              <li>
                <button
                  onClick={() => onEnterWorkspace('inventory')}
                  className="hover:text-[#d39e36] transition-colors text-left cursor-pointer"
                >
                  Multi-Warehouse Inventory
                </button>
              </li>
              <li>
                <button
                  onClick={() => onEnterWorkspace('purchasing')}
                  className="hover:text-[#d39e36] transition-colors text-left cursor-pointer"
                >
                  Purchasing & PO Matching
                </button>
              </li>
              <li>
                <button
                  onClick={() => onEnterWorkspace('admin')}
                  className="hover:text-[#d39e36] transition-colors text-left cursor-pointer"
                >
                  Super Administration
                </button>
              </li>
            </ul>
          </div>

          {/* Digital Ecosystem */}
          <div className="space-y-3">
            <div className="font-semibold text-white tracking-wider uppercase text-[11px]">
              BizChefs Network
            </div>
            <ul className="space-y-2">
              <li>
                <a
                  href={BIZCHEFS_ECOSYSTEM.corporate.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-[#d39e36] transition-colors"
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
                  className="flex items-center gap-1.5 hover:text-[#d39e36] transition-colors"
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
              <li className="pt-2">
                <button
                  type="button"
                  onClick={() => onOpenAuth('signin')}
                  className="text-zinc-300 hover:text-white transition-colors cursor-pointer"
                >
                  Sign In to Tenant
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-10 mt-12 border-t border-[#262626] flex flex-wrap items-center justify-between gap-4 text-xs text-zinc-400">
          <div>
            © {new Date().getFullYear()} BizChefs Inc. All rights reserved. Commercial Enterprise Resource Planning Platform.
          </div>
          <div className="flex items-center gap-4">
            <span>Destination: <strong className="text-zinc-300">erp.bizchefs.com</strong></span>
            <span>Server: <strong className="text-zinc-300">Hostinger Premium (LiteSpeed/Apache)</strong></span>
          </div>
        </div>
      </div>
    </footer>
  );
}
