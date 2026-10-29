'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ERP_MODULE_DEFINITIONS } from '@/lib/theme/tokens';
import {
  LayoutDashboard,
  Receipt,
  Truck,
  Package,
  BookOpen,
  Users,
  Briefcase,
  Settings,
  ShieldCheck,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

interface ModulesSectionProps {
  onEnterWorkspace: (moduleId: string) => void;
}

export function ModulesSection({ onEnterWorkspace }: ModulesSectionProps) {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'LayoutDashboard': return <LayoutDashboard className="w-6 h-6 text-[#e5a83b]" />;
      case 'Receipt': return <Receipt className="w-6 h-6 text-[#e5a83b]" />;
      case 'Truck': return <Truck className="w-6 h-6 text-[#e5a83b]" />;
      case 'Package': return <Package className="w-6 h-6 text-[#e5a83b]" />;
      case 'BookOpen': return <BookOpen className="w-6 h-6 text-[#e5a83b]" />;
      case 'Users': return <Users className="w-6 h-6 text-[#e5a83b]" />;
      case 'Briefcase': return <Briefcase className="w-6 h-6 text-[#e5a83b]" />;
      case 'Settings': return <Settings className="w-6 h-6 text-[#e5a83b]" />;
      case 'ShieldCheck': return <ShieldCheck className="w-6 h-6 text-[#e5a83b]" />;
      default: return <LayoutDashboard className="w-6 h-6 text-[#e5a83b]" />;
    }
  };

  return (
    <section id="modules" className="py-24 bg-[#0c0e12] text-white border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <Badge variant="gold" size="md">
            Enterprise Architecture
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Nine Integrated Operational Modules
          </h2>
          <p className="text-base sm:text-lg text-zinc-400">
            Every transaction links atomically across the general ledger, warehouse inventory,
            procurement matching, and sales invoicing under strict tenant row-level security.
          </p>
        </div>

        {/* 9 Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ERP_MODULE_DEFINITIONS.map(mod => (
            <Card
              key={mod.id}
              className="flex flex-col justify-between hover:border-[#d39e36]/50 hover:bg-[#15161c] transition-all group"
            >
              <CardHeader className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 group-hover:border-[#d39e36]/40 transition">
                    {getIcon(mod.iconName)}
                  </div>
                  <Badge variant="gold" size="sm">
                    {mod.badge}
                  </Badge>
                </div>
                <div>
                  <CardTitle className="text-xl group-hover:text-[#ffd166] transition">
                    {mod.name}
                  </CardTitle>
                  <p className="text-xs text-[#e5a83b] font-medium mt-1">
                    {mod.tagline}
                  </p>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <CardDescription className="text-xs leading-relaxed text-zinc-400">
                  {mod.description}
                </CardDescription>

                <div className="p-3 rounded-lg bg-zinc-900/80 border border-zinc-800 text-[11px] font-mono text-zinc-300">
                  <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1 font-sans">
                    Live Telemetry
                  </div>
                  {mod.metrics}
                </div>
              </CardContent>

              <CardFooter className="pt-4 border-t border-zinc-800/80">
                <Button
                  variant="secondary"
                  size="sm"
                  fullWidth
                  rightIcon={<ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />}
                  onClick={() => onEnterWorkspace(mod.id)}
                  className="group-hover:border-[#d39e36]/50 group-hover:text-white"
                >
                  Launch {mod.name.split(' ')[0]}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
