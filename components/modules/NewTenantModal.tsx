'use client';

import React, { useState } from 'react';
import { X, Building2, Check, Globe, DollarSign } from 'lucide-react';

interface NewTenantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTenant: (name: string, currency: string, timezone: string, taxNumber: string, industry: string) => void;
}

export function NewTenantModal({ isOpen, onClose, onCreateTenant }: NewTenantModalProps) {
  const [name, setName] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [timezone, setTimezone] = useState('Africa/Cairo');
  const [taxNumber, setTaxNumber] = useState('');
  const [industry, setIndustry] = useState('Technology & Software');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onCreateTenant(name.trim(), currency, timezone, taxNumber.trim(), industry);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl overflow-hidden text-zinc-100 animate-in fade-in">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#d39e36]/15 text-[#d39e36] rounded-lg border border-[#d39e36]/30">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-100">Register New Company / Branch</h2>
              <p className="text-[11px] text-zinc-400">Creates an isolated multi-tenant ledger and database container</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-200 rounded transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block text-zinc-300 font-medium mb-1">Company / Organization Legal Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Alexandria Bistro & Catering Ltd"
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-[#d39e36]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-zinc-300 font-medium mb-1">Base Currency *</label>
              <select
                value={currency}
                onChange={e => setCurrency(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:border-[#d39e36]"
              >
                <option value="USD">USD — US Dollar ($)</option>
                <option value="EGP">EGP — Egyptian Pound (E£)</option>
                <option value="EUR">EUR — Euro (€)</option>
                <option value="GBP">GBP — British Pound (£)</option>
                <option value="SAR">SAR — Saudi Riyal (SAR)</option>
                <option value="AED">AED — UAE Dirham (AED)</option>
              </select>
            </div>

            <div>
              <label className="block text-zinc-300 font-medium mb-1">Industry Sector</label>
              <select
                value={industry}
                onChange={e => setIndustry(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:border-[#d39e36]"
              >
                <option value="Technology & Software">Technology &amp; Software</option>
                <option value="Food & Beverage / Restaurant">Food &amp; Beverage / Restaurant</option>
                <option value="Hospitality & Catering">Hospitality &amp; Catering</option>
                <option value="Retail & Hardware Distribution">Retail &amp; Hardware Distribution</option>
                <option value="Professional Services">Professional Services</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-zinc-300 font-medium mb-1">Primary Timezone</label>
              <select
                value={timezone}
                onChange={e => setTimezone(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:border-[#d39e36]"
              >
                <option value="Africa/Cairo">Africa/Cairo (UTC+2 / UTC+3)</option>
                <option value="UTC">UTC (Universal Time)</option>
                <option value="America/New_York">America/New_York (EST)</option>
                <option value="Europe/London">Europe/London (GMT)</option>
                <option value="Asia/Riyadh">Asia/Riyadh (UTC+3)</option>
                <option value="Asia/Dubai">Asia/Dubai (UTC+4)</option>
              </select>
            </div>

            <div>
              <label className="block text-zinc-300 font-medium mb-1">Tax / VAT ID (Optional)</label>
              <input
                type="text"
                value={taxNumber}
                onChange={e => setTaxNumber(e.target.value)}
                placeholder="e.g. EG-TR-889102"
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-[#d39e36]"
              />
            </div>
          </div>

          <div className="p-3 bg-zinc-800/60 rounded-lg border border-zinc-700/60 text-[11px] text-zinc-400 space-y-1">
            <div className="font-semibold text-zinc-300">Automatic Tenant Provisioning Includes:</div>
            <ul className="list-disc list-inside space-y-0.5 text-zinc-400">
              <li>Dedicated Standard Chart of Accounts (COA) with zero balance</li>
              <li>Autonomous document sequences (INV, QT, SO, PO, JV, RCT)</li>
              <li>Row-Level Security (RLS) isolation policy bound to your profile</li>
              <li>Default central storage warehouse</li>
            </ul>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#d39e36] hover:bg-[#be8a29] text-black font-semibold rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>Create Tenant Company</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
