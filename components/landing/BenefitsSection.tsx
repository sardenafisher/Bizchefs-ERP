'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  ShieldCheck,
  Scale,
  Users,
  Server,
  Database,
  Lock
} from 'lucide-react';

export function BenefitsSection() {
  const benefits = [
    {
      icon: <ShieldCheck className="w-5 h-5 text-[#d39e36]" />,
      title: 'Tenant Data Isolation',
      tagline: 'PostgreSQL Row-Level Security',
      description:
        'Each customer company operates within its own dedicated logical partition. PostgreSQL Row-Level Security policies ensure that queries only access records associated with your authenticated tenant ID.'
    },
    {
      icon: <Scale className="w-5 h-5 text-[#d39e36]" />,
      title: 'Balanced Financial Integrity',
      tagline: 'Strict Double-Entry Bookkeeping',
      description:
        'All sales invoices, purchase receipts, and operational expenses trigger balanced journal entries where debits must equal credits. Out-of-balance transactions are rejected at the database level.'
    },
    {
      icon: <Users className="w-5 h-5 text-[#d39e36]" />,
      title: 'Role-Based Access Governance',
      tagline: 'Granular Team Permissions',
      description:
        'Control exactly what each team member can view and execute. Differentiate between Branch Managers, Warehouse Staff, Accountants, and Executive Directors to safeguard confidential financial data.'
    },
    {
      icon: <Server className="w-5 h-5 text-[#d39e36]" />,
      title: 'Hostinger High-Performance Architecture',
      tagline: 'Static Web + Secure Cloud Backend',
      description:
        'Deployed as an optimized static web application on Hostinger Premium Web Hosting, paired with dedicated Supabase cloud authentication and encrypted database services.'
    },
    {
      icon: <Database className="w-5 h-5 text-[#d39e36]" />,
      title: 'Operational Continuity',
      tagline: 'Local Persistence & Cloud Sync',
      description:
        'Frontline staff can continue generating receipts and logging stock transfers during temporary internet dips. Verified records synchronize automatically when connectivity is restored.'
    },
    {
      icon: <Lock className="w-5 h-5 text-[#d39e36]" />,
      title: 'Auditable Document Sequences',
      tagline: 'Sequential Invoice Numbers',
      description:
        'Every quotation, order, invoice, and payment receives a tamper-resistant sequential reference number (e.g. INV-2026-0001) to support commercial auditing and tax filings.'
    }
  ];

  return (
    <section id="features" className="py-24 bg-[#090a0d] text-[#f3f4f6] border-b border-[#262626]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <Badge variant="gold" size="md">
            Commercial Infrastructure
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Built for Commercial Foodservice Demands
          </h2>
          <p className="text-sm sm:text-base text-zinc-400">
            Engineered to replace fragile spreadsheets and disconnected software with a dependable, multi-tenant enterprise system.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((b, i) => (
            <Card key={i} className="hover:border-zinc-700 transition-colors">
              <CardHeader className="space-y-3">
                <div className="w-10 h-10 rounded-lg bg-[#0c0e12] border border-[#262626] flex items-center justify-center">
                  {b.icon}
                </div>
                <div>
                  <CardTitle className="text-base text-white">
                    {b.title}
                  </CardTitle>
                  <p className="text-xs text-[#d39e36] font-medium mt-0.5">
                    {b.tagline}
                  </p>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {b.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
