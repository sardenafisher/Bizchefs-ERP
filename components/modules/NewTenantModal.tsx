'use client';

import React, { useState } from 'react';
import { X, Building2, Check } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white border border-neutral-200 rounded-xl shadow-2xl overflow-hidden text-neutral-900 animate-in fade-in">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-50 text-[#d39e36] rounded-lg border border-amber-200">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-neutral-950">Register New Company / Branch</h2>
              <p className="text-[11px] text-neutral-500">Creates an isolated multi-tenant ledger and database container</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-900 rounded transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block text-neutral-700 font-medium mb-1">Company / Organization Legal Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Alexandria Bistro & Catering Ltd"
              className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-[#d39e36] focus:ring-1 focus:ring-[#d39e36]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-neutral-700 font-medium mb-1">Base Currency *</label>
              <select
                value={currency}
                onChange={e => setCurrency(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none focus:border-[#d39e36]"
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
              <label className="block text-neutral-700 font-medium mb-1">Industry Sector</label>
              <select
                value={industry}
                onChange={e => setIndustry(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none focus:border-[#d39e36]"
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
              <label className="block text-neutral-700 font-medium mb-1">Primary Timezone</label>
              <select
                value={timezone}
                onChange={e => setTimezone(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none focus:border-[#d39e36]"
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
              <label className="block text-neutral-700 font-medium mb-1">Tax / VAT ID (Optional)</label>
              <input
                type="text"
                value={taxNumber}
                onChange={e => setTaxNumber(e.target.value)}
                placeholder="e.g. EG-TR-889102"
                className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-[#d39e36]"
              />
            </div>
          </div>

          <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 text-[11px] text-neutral-600 space-y-1">
            <div className="font-semibold text-neutral-900">Automatic Tenant Provisioning Includes:</div>
            <ul className="list-disc list-inside space-y-0.5 text-neutral-600">
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
              className="px-4 py-2 text-neutral-600 hover:text-neutral-900 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-neutral-950 hover:bg-neutral-800 text-white font-semibold rounded-lg shadow-xs transition-colors cursor-pointer flex items-center gap-2"
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
