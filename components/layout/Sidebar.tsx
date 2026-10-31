'use client';

import React from 'react';
import {
  LayoutDashboard,
  TrendingUp,
  ShoppingBag,
  Package,
  BookOpen,
  Users,
  Briefcase,
  Settings,
  ShieldAlert,
  Calendar,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  activeView: string;
  onSelectView: (view: string) => void;
  isPlatformAdmin: boolean;
}

export function Sidebar({ activeView, onSelectView, isPlatformAdmin }: SidebarProps) {
  const navItems = [
    { id: 'dashboard', label: 'Executive Dashboard', icon: LayoutDashboard, badge: 'Live' },
    { id: 'sales', label: 'CRM & Sales', icon: TrendingUp },
    { id: 'purchasing', label: 'Purchasing & POs', icon: ShoppingBag },
    { id: 'inventory', label: 'Inventory & Stock', icon: Package },
    { id: 'accounting', label: 'Accounting & Ledger', icon: BookOpen },
    { id: 'hr', label: 'HR & Personnel', icon: Users },
    { id: 'projects', label: 'Projects & Tasks', icon: Briefcase },
    { id: 'settings', label: 'Settings & Database', icon: Settings },
  ];

  if (isPlatformAdmin) {
    navItems.push({
      id: 'admin',
      label: 'Platform Admin',
      icon: ShieldAlert,
      badge: 'Super'
    });
  }

  return (
    <aside className="w-64 bg-white border-r border-neutral-200 flex flex-col justify-between shrink-0 h-[calc(100vh-4rem)] text-neutral-700">
      {/* Primary Navigation List */}
      <div className="py-4 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
          Enterprise Modules
        </div>

        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectView(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                isActive
                  ? 'bg-neutral-950 text-white font-semibold shadow-xs'
                  : 'text-neutral-700 hover:text-neutral-950 hover:bg-neutral-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#d39e36]' : 'text-neutral-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge ? (
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold uppercase tracking-wider ${
                    isActive
                      ? 'bg-neutral-800 text-[#d39e36]'
                      : 'bg-neutral-100 text-neutral-700 border border-neutral-200'
                  }`}
                >
                  {item.badge}
                </span>
              ) : isActive ? (
                <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
              ) : null}
            </button>
          );
        })}
      </div>

      {/* Bottom Information Card */}
      <div className="p-3 border-t border-neutral-200 bg-neutral-50/60">
        <div className="p-2.5 rounded-lg bg-white border border-neutral-200 space-y-2 shadow-2xs">
          <div className="flex items-center justify-between text-[11px] text-neutral-500">
            <span className="flex items-center gap-1.5 font-medium text-neutral-900">
              <Calendar className="w-3 h-3 text-[#d39e36]" />
              <span>FY 2026 Active</span>
            </span>
            <span className="text-emerald-700 text-[10px] font-mono font-medium">Balanced</span>
          </div>
          <div className="text-[10px] text-neutral-500 leading-relaxed">
            BizChefs ERP Engine compliant with Hostinger Web Hosting &amp; Supabase PostgreSQL.
          </div>
          <div className="flex flex-col gap-1 pt-1 border-t border-neutral-100 text-[10px]">
            <a
              href="https://bizchefs.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#b88022] hover:text-[#d39e36] font-medium flex items-center justify-between"
            >
              <span>bizchefs.com (Corporate)</span>
              <ExternalLink className="w-2.5 h-2.5 opacity-60" />
            </a>
            <a
              href="https://studio.bizchefs.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-500 hover:text-neutral-900 flex items-center justify-between"
            >
              <span>studio.bizchefs.com (Studio)</span>
              <ExternalLink className="w-2.5 h-2.5 opacity-60" />
            </a>
          </div>
        </div>
      </div>
    </aside>
  );
}
