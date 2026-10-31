'use client';

import React from 'react';
import { Badge } from '@/components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { ShieldCheck, KeyRound } from 'lucide-react';

export function SecurityTrustSection() {
  return (
    <section id="security" className="py-24 bg-white text-neutral-900 border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <Badge variant="gold" size="md">
            Security & Compliance
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-950">
            Enterprise Data Protection & Multi-Tenant Isolation
          </h2>
          <p className="text-sm sm:text-base text-neutral-600">
            Engineered with multi-tenant isolation, cryptographically verified authentication, and strict financial accounting boundaries.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="hover:border-neutral-300 transition-colors shadow-2xs bg-white">
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <CardTitle className="text-base text-neutral-950">
                  Database Row-Level Security (RLS)
                </CardTitle>
                <p className="text-xs text-neutral-500">Tenant Isolation Enforced at Database Layer</p>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-xs text-neutral-600 leading-relaxed">
              <p>
                Every core operational table (including invoices, journal entries, inventory items, and purchase orders)
                enforces PostgreSQL Row-Level Security. Queries automatically check the caller&apos;s authenticated tenant ID,
                preventing cross-tenant data visibility.
              </p>
              <div className="p-3.5 rounded-lg bg-neutral-50 border border-neutral-200 text-neutral-800 font-mono text-[11px] space-y-0.5">
                <div><span className="text-[#b88022] font-semibold">Policy:</span> tenant_isolation_policy</div>
                <div><span className="text-neutral-500">Scope:</span> sales_invoices, journal_entries, items</div>
                <div><span className="text-neutral-500">Condition:</span> tenant_id = current_user_tenant_ids()</div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:border-neutral-300 transition-colors shadow-2xs bg-white">
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
                <KeyRound className="w-5 h-5 text-[#b88022]" />
              </div>
              <div>
                <CardTitle className="text-base text-neutral-950">
                  Privileged Function Hardening
                </CardTitle>
                <p className="text-xs text-neutral-500">Explicit Schema Qualification</p>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-xs text-neutral-600 leading-relaxed">
              <p>
                All privileged database functions executed under <code className="text-[#b88022] font-semibold bg-amber-50 px-1 py-0.5 rounded">SECURITY DEFINER</code> set
                <code className="text-neutral-800 bg-neutral-100 px-1 py-0.5 rounded"> search_path = &apos;&apos;</code> and explicitly schema-qualify all table calls,
                preventing search path hijacking and securing audit trails.
              </p>
              <div className="p-3.5 rounded-lg bg-neutral-50 border border-neutral-200 text-neutral-800 font-mono text-[11px] space-y-0.5">
                <div><span className="text-[#b88022] font-semibold">Privilege Control:</span> SECURITY DEFINER</div>
                <div><span className="text-neutral-500">Search Path:</span> Empty isolation (search_path = &apos;&apos;)</div>
                <div><span className="text-neutral-500">Permissions:</span> Explicit role grants; revoked from public</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
