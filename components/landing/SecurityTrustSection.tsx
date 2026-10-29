'use client';

import React from 'react';
import { Badge } from '@/components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { ShieldCheck, Lock, KeyRound, Database, FileSpreadsheet } from 'lucide-react';

export function SecurityTrustSection() {
  return (
    <section id="security" className="py-24 bg-[#090a0d] text-[#f3f4f6] border-b border-[#262626]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <Badge variant="gold" size="md">
            Security & Compliance
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Enterprise Data Protection & Multi-Tenant Isolation
          </h2>
          <p className="text-sm sm:text-base text-zinc-400">
            Engineered with multi-tenant isolation, cryptographically verified authentication, and strict financial accounting boundaries.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="hover:border-zinc-700 transition-colors">
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <CardTitle className="text-base text-white">
                  Database Row-Level Security (RLS)
                </CardTitle>
                <p className="text-xs text-zinc-400">Tenant Isolation Enforced at Database Layer</p>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-xs text-zinc-300 leading-relaxed">
              <p>
                Every core operational table (including invoices, journal entries, inventory items, and purchase orders)
                enforces PostgreSQL Row-Level Security. Queries automatically check the caller&apos;s authenticated tenant ID,
                preventing cross-tenant data visibility.
              </p>
              <div className="p-3 rounded-lg bg-[#0c0e12] border border-[#262626] text-zinc-400 font-mono text-[11px]">
                <span className="text-[#d39e36]">Policy:</span> tenant_isolation_policy
                <br />
                <span className="text-zinc-500">Scope:</span> sales_invoices, journal_entries, items
                <br />
                <span className="text-zinc-500">Condition:</span> tenant_id = current_user_tenant_ids()
              </div>
            </CardContent>
          </Card>

          <Card className="hover:border-zinc-700 transition-colors">
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-[#d39e36]/10 border border-[#d39e36]/20 flex items-center justify-center shrink-0">
                <KeyRound className="w-5 h-5 text-[#d39e36]" />
              </div>
              <div>
                <CardTitle className="text-base text-white">
                  Privileged Function Hardening
                </CardTitle>
                <p className="text-xs text-zinc-400">Explicit Schema Qualification</p>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-xs text-zinc-300 leading-relaxed">
              <p>
                All privileged database functions executed under <code className="text-[#d39e36]">SECURITY DEFINER</code> set
                <code className="text-zinc-200"> search_path = &apos;&apos;</code> and explicitly schema-qualify all table calls,
                preventing search path hijacking and securing audit trails.
              </p>
              <div className="p-3 rounded-lg bg-[#0c0e12] border border-[#262626] text-zinc-400 font-mono text-[11px]">
                <span className="text-[#d39e36]">Privilege Control:</span> SECURITY DEFINER
                <br />
                <span className="text-zinc-500">Search Path:</span> Empty isolation (search_path = &apos;&apos;)
                <br />
                <span className="text-zinc-500">Permissions:</span> Explicit role grants; revoked from public
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
