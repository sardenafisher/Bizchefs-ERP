'use client';

import React, { useState } from 'react';
import { 
  Settings, 
  Building2, 
  Hash, 
  Database, 
  Download, 
  Copy, 
  Check, 
  ShieldCheck, 
  History, 
  Globe,
  FileCode
} from 'lucide-react';
import { ERPDatabaseState, erpDb } from '@/lib/db/database';

interface SettingsModuleProps {
  state: ERPDatabaseState;
  onOpenSupabaseModal: () => void;
}

export function SettingsModule({ state, onOpenSupabaseModal }: SettingsModuleProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'sequences' | 'migrations' | 'export' | 'audit'>('profile');
  const [copied, setCopied] = useState(false);

  const tenant = state.tenants.find(t => t.id === state.activeTenantId) || state.tenants[0];
  const sequences = state.sequences.filter(s => s.tenantId === state.activeTenantId);
  const auditLogs = state.auditLogs.filter(l => l.tenantId === state.activeTenantId);

  // Form states for tenant profile
  const [name, setName] = useState(tenant.name);
  const [currency, setCurrency] = useState(tenant.settings.baseCurrency);
  const [taxNumber, setTaxNumber] = useState(tenant.settings.taxNumber || '');
  const [address, setAddress] = useState(tenant.settings.address || '');
  const [city, setCity] = useState(tenant.settings.city || '');
  const [country, setCountry] = useState(tenant.settings.country || '');
  const [phone, setPhone] = useState(tenant.settings.phone || '');
  const [email, setEmail] = useState(tenant.settings.email || '');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    tenant.name = name;
    tenant.settings.baseCurrency = currency;
    tenant.settings.taxNumber = taxNumber;
    tenant.settings.address = address;
    tenant.settings.city = city;
    tenant.settings.country = country;
    tenant.settings.phone = phone;
    tenant.settings.email = email;

    erpDb.logAudit('SETTINGS_UPDATED', 'TENANT', tenant.id, 'Updated company profile and commercial settings');
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleDownloadBackup = () => {
    const jsonStr = erpDb.exportTenantDataJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bizchefs_erp_backup_${tenant.slug}_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const sampleSqlMigration = `-- Supabase PostgreSQL Row Level Security (RLS) Multi-Tenant Migration
-- Platform: Supabase PostgreSQL (Version 15+)
-- Run this in your Supabase SQL Editor:

CREATE TABLE IF NOT EXISTS public.tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    base_currency VARCHAR(10) DEFAULT 'USD',
    tax_number VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.sales_invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    invoice_number VARCHAR(100) NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    grand_total NUMERIC(18, 2) NOT NULL,
    balance_due NUMERIC(18, 2) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'posted',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, invoice_number)
);

ALTER TABLE public.sales_invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant isolation for sales_invoices" ON public.sales_invoices
    FOR ALL USING (tenant_id IN (SELECT current_user_tenant_ids()));
`;

  const handleCopySql = () => {
    navigator.clipboard.writeText(sampleSqlMigration);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900">
            Company Settings &amp; Infrastructure
          </h1>
          <p className="text-xs text-zinc-500">
            Tenant Configuration, Document Sequences, Supabase Migrations &amp; Audit Trail
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenSupabaseModal}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-xs rounded-lg transition-colors cursor-pointer"
        >
          <Database className="w-3.5 h-3.5 text-[#d39e36]" />
          <span>Supabase / Hostinger Config</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-200 text-xs overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`pb-2.5 px-3 font-semibold transition-colors border-b-2 cursor-pointer shrink-0 ${
            activeTab === 'profile'
              ? 'border-[#d39e36] text-[#d39e36]'
              : 'border-transparent text-zinc-500 hover:text-zinc-800'
          }`}
        >
          Company Profile
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('sequences')}
          className={`pb-2.5 px-3 font-semibold transition-colors border-b-2 cursor-pointer shrink-0 ${
            activeTab === 'sequences'
              ? 'border-[#d39e36] text-[#d39e36]'
              : 'border-transparent text-zinc-500 hover:text-zinc-800'
          }`}
        >
          Document Numbering ({sequences.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('migrations')}
          className={`pb-2.5 px-3 font-semibold transition-colors border-b-2 cursor-pointer shrink-0 ${
            activeTab === 'migrations'
              ? 'border-[#d39e36] text-[#d39e36]'
              : 'border-transparent text-zinc-500 hover:text-zinc-800'
          }`}
        >
          Supabase SQL Migrations
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('export')}
          className={`pb-2.5 px-3 font-semibold transition-colors border-b-2 cursor-pointer shrink-0 ${
            activeTab === 'export'
              ? 'border-[#d39e36] text-[#d39e36]'
              : 'border-transparent text-zinc-500 hover:text-zinc-800'
          }`}
        >
          Backup &amp; Data Export
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('audit')}
          className={`pb-2.5 px-3 font-semibold transition-colors border-b-2 cursor-pointer shrink-0 ${
            activeTab === 'audit'
              ? 'border-[#d39e36] text-[#d39e36]'
              : 'border-transparent text-zinc-500 hover:text-zinc-800'
          }`}
        >
          Security Audit Trail ({auditLogs.length})
        </button>
      </div>

      {/* PROFILE TAB */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6 max-w-2xl text-xs space-y-4">
          <h2 className="text-sm font-bold text-zinc-900 border-b border-zinc-200 pb-2">
            Tenant Legal &amp; Commercial Settings
          </h2>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-zinc-700 font-medium mb-1">Company Legal Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-zinc-900"
                />
              </div>
              <div>
                <label className="block text-zinc-700 font-medium mb-1">Base Currency</label>
                <select
                  value={currency}
                  onChange={e => setCurrency(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-zinc-900"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EGP">EGP (E£)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="SAR">SAR (SAR)</option>
                  <option value="AED">AED (AED)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-zinc-700 font-medium mb-1">Tax / VAT Registration #</label>
                <input
                  type="text"
                  value={taxNumber}
                  onChange={e => setTaxNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-zinc-900 font-mono"
                />
              </div>
              <div>
                <label className="block text-zinc-700 font-medium mb-1">Official Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-zinc-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-zinc-700 font-medium mb-1">Commercial Address</label>
              <input
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-zinc-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-zinc-700 font-medium mb-1">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-zinc-900"
                />
              </div>
              <div>
                <label className="block text-zinc-700 font-medium mb-1">Country</label>
                <input
                  type="text"
                  value={country}
                  onChange={e => setCountry(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-zinc-900"
                />
              </div>
            </div>

            {saveSuccess && (
              <div className="p-2.5 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200 flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Company profile updated successfully!</span>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-[#d39e36] hover:bg-[#be8a29] text-black font-semibold rounded-lg shadow-sm"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SEQUENCES TAB */}
      {activeTab === 'sequences' && (
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 text-zinc-600 border-b border-zinc-200 text-[11px] uppercase font-semibold">
                <tr>
                  <th className="py-2.5 px-4">Document Type</th>
                  <th className="py-2.5 px-4">Prefix</th>
                  <th className="py-2.5 px-4">Next Sequence #</th>
                  <th className="py-2.5 px-4">Digits Padding</th>
                  <th className="py-2.5 px-4">Sample Generated Format</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 font-mono">
                {sequences.map(s => (
                  <tr key={s.id} className="hover:bg-zinc-50">
                    <td className="py-3 px-4 font-sans font-bold capitalize text-zinc-900">
                      {s.documentType.replace('_', ' ')}
                    </td>
                    <td className="py-3 px-4 text-[#d39e36] font-bold">{s.prefix}</td>
                    <td className="py-3 px-4 font-bold text-zinc-800">{s.nextNumber}</td>
                    <td className="py-3 px-4 text-zinc-600">{s.numberPadding} digits</td>
                    <td className="py-3 px-4 text-zinc-900 font-bold">
                      {s.prefix}-{String(s.nextNumber).padStart(s.numberPadding, '0')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MIGRATIONS TAB */}
      {activeTab === 'migrations' && (
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6 space-y-4 text-xs">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-zinc-900">Supabase DDL Migration File</h2>
              <p className="text-[11px] text-zinc-500">
                Found in <code className="bg-zinc-100 px-1 py-0.5 rounded font-mono">/supabase/migrations/20261028000000_bizchefs_erp_schema.sql</code>
              </p>
            </div>
            <button
              type="button"
              onClick={handleCopySql}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white font-medium rounded-lg"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied to Clipboard' : 'Copy SQL Script'}</span>
            </button>
          </div>

          <pre className="p-4 bg-zinc-950 text-zinc-200 rounded-xl overflow-x-auto font-mono text-[11px] leading-relaxed border border-zinc-800 max-h-96">
            {sampleSqlMigration}
          </pre>
        </div>
      )}

      {/* EXPORT TAB */}
      {activeTab === 'export' && (
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6 max-w-xl space-y-4 text-xs">
          <h2 className="text-sm font-bold text-zinc-900">Tenant Data Backup &amp; Portability</h2>
          <p className="text-zinc-600 leading-relaxed">
            Download a full cryptographic snapshot of all records belonging strictly to {tenant.name}, including Chart of Accounts, Journal Entries, Customers, Sales Invoices, Stock Balances, Employees, and Audit Trail.
          </p>

          <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200 font-mono text-[11px] text-zinc-700 space-y-1">
            <div>• Tenant ID: {tenant.id}</div>
            <div>• Format: Standard JSON (RFC 8259)</div>
            <div>• Row Level Security: Tenant Isolated</div>
          </div>

          <button
            type="button"
            onClick={handleDownloadBackup}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#d39e36] hover:bg-[#be8a29] text-black font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download Tenant Backup JSON</span>
          </button>
        </div>
      )}

      {/* AUDIT TAB */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 text-zinc-600 border-b border-zinc-200 text-[11px] uppercase font-semibold">
                <tr>
                  <th className="py-2.5 px-4">Timestamp</th>
                  <th className="py-2.5 px-4">User</th>
                  <th className="py-2.5 px-4">Action Event</th>
                  <th className="py-2.5 px-4">Entity</th>
                  <th className="py-2.5 px-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 font-mono">
                {auditLogs.map(l => (
                  <tr key={l.id} className="hover:bg-zinc-50">
                    <td className="py-2.5 px-4 text-zinc-500 text-[11px]">{l.createdAt.replace('T', ' ').slice(0, 19)}</td>
                    <td className="py-2.5 px-4 font-sans font-medium text-zinc-800">{l.userEmail}</td>
                    <td className="py-2.5 px-4">
                      <span className="bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded font-bold text-[10px]">
                        {l.action}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-zinc-600 text-[11px]">{l.entityType} ({l.entityId})</td>
                    <td className="py-2.5 px-4 font-sans text-zinc-700">{l.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
