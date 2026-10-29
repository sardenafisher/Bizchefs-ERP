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
  Check
} from 'lucide-react';

interface ModulesSectionProps {
  onEnterWorkspace: (moduleId: string) => void;
}

export function ModulesSection({ onEnterWorkspace }: ModulesSectionProps) {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'LayoutDashboard': return <LayoutDashboard className="w-5 h-5 text-[#d39e36]" />;
      case 'Receipt': return <Receipt className="w-5 h-5 text-[#d39e36]" />;
      case 'Truck': return <Truck className="w-5 h-5 text-[#d39e36]" />;
      case 'Package': return <Package className="w-5 h-5 text-[#d39e36]" />;
      case 'BookOpen': return <BookOpen className="w-5 h-5 text-[#d39e36]" />;
      case 'Users': return <Users className="w-5 h-5 text-[#d39e36]" />;
      case 'Briefcase': return <Briefcase className="w-5 h-5 text-[#d39e36]" />;
      case 'Settings': return <Settings className="w-5 h-5 text-[#d39e36]" />;
      case 'ShieldCheck': return <ShieldCheck className="w-5 h-5 text-[#d39e36]" />;
      default: return <LayoutDashboard className="w-5 h-5 text-[#d39e36]" />;
    }
  };

  return (
    <section id="modules" className="py-24 bg-[#0c0e12] text-[#f3f4f6] border-b border-[#262626]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <Badge variant="gold" size="md">
            Verified Enterprise Functionality
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Nine Integrated Operational Modules
          </h2>
          <p className="text-sm sm:text-base text-zinc-400">
            Engineered specifically for commercial foodservice, catering, and multi-branch operations.
            Every module operates under tenant row-level security and atomic database transactions.
          </p>
        </div>

        {/* 9 Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ERP_MODULE_DEFINITIONS.map((mod) => (
            <Card
              key={mod.id}
              className="flex flex-col justify-between hover:border-zinc-700 transition-colors"
            >
              <CardHeader className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-lg bg-[#0c0e12] border border-[#262626] flex items-center justify-center">
                    {getIcon(mod.iconName)}
                  </div>
                  <span className="text-[10px] text-zinc-400 uppercase font-mono tracking-wider">
                    Verified
                  </span>
                </div>
                <div>
                  <CardTitle className="text-base text-white">
                    {mod.name}
                  </CardTitle>
                  <p className="text-xs text-[#d39e36] font-medium mt-1">
                    {mod.tagline}
                  </p>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <CardDescription className="text-xs leading-relaxed text-zinc-400">
                  {mod.description}
                </CardDescription>
              </CardContent>

              <CardFooter className="pt-3 border-t border-[#262626]">
                <Button
                  variant="secondary"
                  size="sm"
                  fullWidth
                  rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                  onClick={() => onEnterWorkspace(mod.id)}
                >
                  Explore {mod.name.split(' ')[0]} Module
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
