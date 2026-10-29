'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  ShieldCheck,
  Scale,
  Users2,
  Server,
  DatabaseZap,
  Lock,
  FileCheck2,
  Cpu
} from 'lucide-react';

export function BenefitsSection() {
  const benefits = [
    {
      icon: <ShieldCheck className="w-6 h-6 text-[#e5a83b]" />,
      title: 'PostgreSQL Row-Level Security (RLS)',
      badge: 'Zero-Leakage Guarantee',
      description:
        'Every single SQL query is scoped by the authenticated user’s tenant membership in current_user_tenant_ids(). Tenant boundaries cannot be crossed even if direct SQL queries are executed.'
    },
    {
      icon: <Scale className="w-6 h-6 text-[#e5a83b]" />,
      title: 'Atomic Double-Entry General Ledger',
      badge: 'Debits = Credits Enforced',
      description:
        'All financial events (invoices, bills, payments, and inventory adjustments) execute through atomic post_journal_entry() RPC. Unbalanced entries are rejected at the database engine level.'
    },
    {
      icon: <Users2 className="w-6 h-6 text-[#e5a83b]" />,
      title: 'Granular Role-Based Access Control',
      badge: 'RBAC Security Matrix',
      description:
        'Explicit roles (Super Admin, Tenant Admin, Financial Accountant, Operations Manager, Staff) govern module access, document approvals, and write permissions.'
    },
    {
      icon: <Server className="w-6 h-6 text-[#e5a83b]" />,
      title: 'Hostinger Static Export Compatibility',
      badge: 'Litespeed / Apache Ready',
      description:
        'Generates fully static HTML/JS bundles configured for Hostinger Premium Web Hosting public_html directory with complete .htaccess routing and zero server maintenance costs.'
    },
    {
      icon: <DatabaseZap className="w-6 h-6 text-[#e5a83b]" />,
      title: 'Offline-Resilient Cloud Synchronization',
      badge: 'Supabase Cloud Sync',
      description:
        'Operates seamlessly with local browser persistence for uninterrupted field operations, automatically syncing transactions to Supabase PostgreSQL when cloud connectivity is active.'
    },
    {
      icon: <Cpu className="w-6 h-6 text-[#e5a83b]" />,
      title: 'Hardened Privileged Database Functions',
      badge: 'search_path = \'\' Verified',
      description:
        'All SECURITY DEFINER functions use search_path = \'\' and schema-qualified references, preventing privilege escalation vulnerabilities and securing audit trails.'
    }
  ];

  return (
    <section id="architecture" className="py-24 bg-[#090a0d] text-white border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <Badge variant="gold" size="md">
            Security & Performance
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Architected for Institutional Reliability
          </h2>
          <p className="text-base sm:text-lg text-zinc-400">
            Engineered from first principles to guarantee financial precision, zero tenant data leakage,
            and 100% uptime on modern hosting infrastructure.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((b, i) => (
            <Card key={i} className="hover:border-zinc-700 bg-[#121316] transition-all">
              <CardHeader className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                    {b.icon}
                  </div>
                  <Badge variant="gold" size="sm">
                    {b.badge}
                  </Badge>
                </div>
                <CardTitle className="text-lg text-white">
                  {b.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
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
