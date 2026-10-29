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
  FileText,
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
    <aside className="w-64 bg-[#18191e] border-r border-[#27272a] flex flex-col justify-between shrink-0 h-[calc(100vh-4rem)] text-zinc-300">
      {/* Primary Navigation List */}
      <div className="py-4 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
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
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#d39e36] text-black font-semibold shadow-sm'
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-800/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-black' : 'text-zinc-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge ? (
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold uppercase tracking-wider ${
                    isActive
                      ? 'bg-black text-[#d39e36]'
                      : 'bg-zinc-800 text-[#d39e36] border border-zinc-700'
                  }`}
                >
                  {item.badge}
                </span>
              ) : isActive ? (
                <ChevronRight className="w-3.5 h-3.5 text-black" />
              ) : null}
            </button>
          );
        })}
      </div>

      {/* Bottom Information Card */}
      <div className="p-3 border-t border-[#27272a] bg-[#121316]/50">
        <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 space-y-2">
          <div className="flex items-center justify-between text-[11px] text-zinc-400">
            <span className="flex items-center gap-1.5 font-medium text-zinc-300">
              <Calendar className="w-3 h-3 text-[#d39e36]" />
              <span>FY 2026 Active</span>
            </span>
            <span className="text-emerald-400 text-[10px] font-mono">Balanced</span>
          </div>
          <div className="text-[10px] text-zinc-400 leading-relaxed">
            BizChefs ERP Engine compliant with Hostinger Web Hosting &amp; Supabase PostgreSQL.
          </div>
          <div className="flex flex-col gap-1 pt-1 border-t border-zinc-800 text-[10px]">
            <a
              href="https://bizchefs.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#d39e36] hover:underline flex items-center justify-between"
            >
              <span>bizchefs.com (Corporate)</span>
              <ExternalLink className="w-2.5 h-2.5 opacity-60" />
            </a>
            <a
              href="https://studio.bizchefs.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-400 hover:text-white flex items-center justify-between"
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
