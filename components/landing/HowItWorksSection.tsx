'use client';

import React from 'react';
import { Badge } from '@/components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Layers, UserPlus, Sliders, CheckCircle2 } from 'lucide-react';

export function HowItWorksSection() {
  const steps = [
    {
      step: '01',
      title: 'Compare Subscription Tiers',
      icon: <Layers className="w-5 h-5 text-[#d39e36]" />,
      description:
        'Evaluate your monthly invoice volume, number of users, and warehouse count across the Starter, Growth, and Enterprise subscription plans.'
    },
    {
      step: '02',
      title: 'Choose a Plan or Request a Demo',
      icon: <UserPlus className="w-5 h-5 text-[#d39e36]" />,
      description:
        'Select your preferred tier to begin company onboarding, or request a customized consultation with our hospitality operations team.'
    },
    {
      step: '03',
      title: 'Configure Your Organization Profile',
      icon: <Sliders className="w-5 h-5 text-[#d39e36]" />,
      description:
        'Register your company identity, base currency (EGP, USD, or EUR), tax registration ID, and default fiscal calendar in the onboarding flow.'
    },
    {
      step: '04',
      title: 'Operate in Your Dedicated Workspace',
      icon: <CheckCircle2 className="w-5 h-5 text-[#d39e36]" />,
      description:
        'Access your isolated ERP tenant at erp.bizchefs.com to issue quotations, post verified invoices, track warehouse stock, and audit general ledger balances.'
    }
  ];

  return (
    <section id="how-it-works" className="py-24 bg-[#0c0e12] text-[#f3f4f6] border-b border-[#262626]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <Badge variant="gold" size="md">
            Subscription & Onboarding Model
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            How to Get Started with BizChefs ERP
          </h2>
          <p className="text-sm sm:text-base text-zinc-400">
            A straightforward, compliance-oriented process to transition your hospitality operations into a centralized ERP.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s, idx) => (
            <Card key={idx} className="relative hover:border-zinc-700 transition-colors">
              <div className="absolute top-4 right-4 font-mono font-bold text-xl text-zinc-700">
                {s.step}
              </div>
              <CardHeader className="space-y-3">
                <div className="w-10 h-10 rounded-lg bg-[#0c0e12] border border-[#262626] flex items-center justify-center">
                  {s.icon}
                </div>
                <CardTitle className="text-sm text-white font-semibold">
                  {s.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {s.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
