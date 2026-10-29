'use client';

import React from 'react';
import { Badge } from '@/components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { UserCheck, Sliders, ArrowLeftRight, FileText } from 'lucide-react';

export function HowItWorksSection() {
  const steps = [
    {
      step: '01',
      title: 'Tenant Provisioning & Identity',
      icon: <UserCheck className="w-5 h-5 text-[#e5a83b]" />,
      description:
        'Create a corporate identity via Supabase Auth. The system automatically creates a tenant record, seeds default permissions, and binds your user profile to your secure tenant ID.'
    },
    {
      step: '02',
      title: 'Chart of Accounts & Fiscal Year',
      icon: <Sliders className="w-5 h-5 text-[#e5a83b]" />,
      description:
        'Initialize standard GAAP/IFRS account trees (Assets, Liabilities, Equity, Revenue, COGS, Expenses), define your reporting currency, tax registration rates, and fiscal periods.'
    },
    {
      step: '03',
      title: 'Commercial Transaction Lifecycle',
      icon: <ArrowLeftRight className="w-5 h-5 text-[#e5a83b]" />,
      description:
        'Generate quotations and sales orders. When fulfilled, one-click posting updates inventory SKU counts and invokes post_journal_entry() to book revenue and accounts receivable.'
    },
    {
      step: '04',
      title: 'Audit Trails & Document Printing',
      icon: <FileText className="w-5 h-5 text-[#e5a83b]" />,
      description:
        'Produce printable professional invoices, delivery notes, and purchase orders. Run real-time Trial Balance and Income Statement reports with immutable historical audit logs.'
    }
  ];

  return (
    <section id="how-it-works" className="py-24 bg-[#0c0e12] text-white border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <Badge variant="gold" size="md">
            Workflow Architecture
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            From Onboarding to Balance Sheet
          </h2>
          <p className="text-base sm:text-lg text-zinc-400">
            A seamless, compliance-grade operational sequence designed to eliminate manual spreadsheet reconciliation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s, idx) => (
            <Card key={idx} className="relative bg-[#121316] hover:border-[#d39e36]/40 transition-all">
              <div className="absolute top-4 right-4 font-mono font-black text-2xl text-zinc-800 selection:bg-none">
                {s.step}
              </div>
              <CardHeader className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                  {s.icon}
                </div>
                <CardTitle className="text-base text-white font-semibold">
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
