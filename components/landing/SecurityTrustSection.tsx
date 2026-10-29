'use client';

import React from 'react';
import { Badge } from '@/components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { ShieldCheck, Lock, KeyRound, Database, FileSpreadsheet } from 'lucide-react';

export function SecurityTrustSection() {
  return (
    <section className="py-24 bg-[#090a0d] text-white border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <Badge variant="gold" size="md">
            Security & Compliance
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Enterprise Security Without Compromise
          </h2>
          <p className="text-base sm:text-lg text-zinc-400">
            Engineered according to OWASP Top 10, multi-tenant database isolation, and cryptographic session protection standards.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="bg-[#121316] border-zinc-800 p-2">
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <CardTitle className="text-lg text-white">
                  Row-Level Security (RLS) Isolation
                </CardTitle>
                <p className="text-xs text-zinc-400">Database Engine Level Protection</p>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-xs text-zinc-300 leading-relaxed">
              <p>
                Every table (accounts, journal entries, sales orders, purchase orders, inventory, and employees)
                enforces strict RLS. Queries cannot return records belonging to other tenants.
              </p>
              <div className="p-3 rounded-lg bg-zinc-950 font-mono text-[11px] text-zinc-400 border border-zinc-800">
                <span className="text-emerald-400">CREATE POLICY</span> tenant_isolation_policy
                <br />
                <span className="text-zinc-500">ON</span> sales_invoices <span className="text-zinc-500">FOR ALL</span>
                <br />
                <span className="text-zinc-500">USING</span> (tenant_id <span className="text-zinc-500">IN</span> (SELECT current_user_tenant_ids()));
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#121316] border-zinc-800 p-2">
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="p-3 rounded-xl bg-[#d39e36]/10 border border-[#d39e36]/20">
                <KeyRound className="w-6 h-6 text-[#e5a83b]" />
              </div>
              <div>
                <CardTitle className="text-lg text-white">
                  Privileged Function Hardening
                </CardTitle>
                <p className="text-xs text-zinc-400">search_path = &apos;&apos; Injection Defense</p>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-xs text-zinc-300 leading-relaxed">
              <p>
                All PostgreSQL functions executed under <code className="text-[#e5a83b]">SECURITY DEFINER</code> set
                <code className="text-zinc-200"> search_path = &apos;&apos;</code> and explicitly schema-qualify all table calls,
                preventing search path hijacking and privilege escalation attacks.
              </p>
              <div className="p-3 rounded-lg bg-zinc-950 font-mono text-[11px] text-zinc-400 border border-zinc-800">
                <span className="text-[#e5a83b]">SECURITY DEFINER</span>
                <br />
                <span className="text-zinc-500">SET search_path = &apos;&apos;;</span>
                <br />
                <span className="text-zinc-500">REVOKE EXECUTE ON FUNCTION FROM PUBLIC, anon;</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
