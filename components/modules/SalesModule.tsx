'use client';

import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Printer, 
  CreditCard, 
  ArrowRight, 
  FileCheck, 
  Users, 
  DollarSign,
  Trash2,
  CheckCircle,
  Eye,
  FileText
} from 'lucide-react';
import { ERPDatabaseState, erpDb } from '@/lib/db/database';
import { SalesInvoice, Customer, Quotation, SalesLineItem, PaymentReceipt } from '@/lib/types/erp';
import { calculateLineTotals, calculateOrderTotals } from '@/lib/erp/tax-rules';

interface SalesModuleProps {
  state: ERPDatabaseState;
  onViewInvoice: (invoiceId: string) => void;
  initialTab?: 'invoices' | 'quotations' | 'customers' | 'payments';
}

export function SalesModule({ state, onViewInvoice, initialTab = 'invoices' }: SalesModuleProps) {
  const [activeTab, setActiveTab] = useState<'invoices' | 'quotations' | 'customers' | 'payments'>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [showCreateInvoiceModal, setShowCreateInvoiceModal] = useState(false);
  const [showCreateCustomerModal, setShowCreateCustomerModal] = useState(false);
  const [showCreateQuotationModal, setShowCreateQuotationModal] = useState(false);
  const [paymentInvoice, setPaymentInvoice] = useState<SalesInvoice | null>(null);

  // Filtered data by active tenant
  const invoices = state.salesInvoices.filter(i => i.tenantId === state.activeTenantId);
  const customers = state.customers.filter(c => c.tenantId === state.activeTenantId);
  const quotations = state.quotations.filter(q => q.tenantId === state.activeTenantId);
  const payments = state.payments.filter(p => p.tenantId === state.activeTenantId && p.type === 'incoming');
  const items = state.items.filter(i => i.tenantId === state.activeTenantId);

  // ==================== NEW INVOICE FORM STATE ====================
  const [selectedCustomerId, setSelectedCustomerId] = useState(customers[0]?.id || '');
  const [invoiceDate, setInvoiceDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [invoiceDueDate, setInvoiceDueDate] = useState(() => new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]);
  const [invoiceNotes, setInvoiceNotes] = useState('');
  const [invoiceLines, setInvoiceLines] = useState<Array<{
    itemId: string;
    itemSku: string;
    itemName: string;
    uom: string;
    quantity: number;
    unitPrice: number;
    taxRate: number;
  }>>([
    {
      itemId: items[0]?.id || '',
      itemSku: items[0]?.sku || 'SRV-01',
      itemName: items[0]?.name || 'Standard Service',
      uom: items[0]?.uom || 'pcs',
      quantity: 1,
      unitPrice: items[0]?.unitPrice || 100,
      taxRate: items[0]?.taxRate || 14
    }
  ]);

  const handleAddInvoiceLine = () => {
    const firstItem = items[0];
    setInvoiceLines([
      ...invoiceLines,
      {
        itemId: firstItem?.id || '',
        itemSku: firstItem?.sku || '',
        itemName: firstItem?.name || '',
        uom: firstItem?.uom || 'pcs',
        quantity: 1,
        unitPrice: firstItem?.unitPrice || 0,
        taxRate: firstItem?.taxRate || 14
      }
    ]);
  };

  const handleLineItemChange = (index: number, itemId: string) => {
    const it = items.find(i => i.id === itemId);
    if (!it) return;
    const updated = [...invoiceLines];
    updated[index] = {
      ...updated[index],
      itemId: it.id,
      itemSku: it.sku,
      itemName: it.name,
      uom: it.uom,
      unitPrice: it.unitPrice,
      taxRate: it.taxRate
    };
    setInvoiceLines(updated);
  };

  const handleLineFieldChange = (index: number, field: 'quantity' | 'unitPrice' | 'taxRate', val: number) => {
    const updated = [...invoiceLines];
    updated[index] = { ...updated[index], [field]: val };
    setInvoiceLines(updated);
  };

  const handleRemoveInvoiceLine = (index: number) => {
    if (invoiceLines.length <= 1) return;
    setInvoiceLines(invoiceLines.filter((_, i) => i !== index));
  };

  const calculatedTotals = calculateOrderTotals(invoiceLines);

  const handleSaveInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const cust = customers.find(c => c.id === selectedCustomerId) || customers[0];
    if (!cust) return;

    const formattedLines: SalesLineItem[] = invoiceLines.map((line, idx) => {
      const calc = calculateLineTotals(line.quantity, line.unitPrice, line.taxRate);
      return {
        id: `ili-${Date.now()}-${idx}`,
        itemId: line.itemId,
        itemSku: line.itemSku,
        itemName: line.itemName,
        uom: line.uom,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        taxRate: line.taxRate,
        taxAmount: calc.taxAmount,
        lineTotal: calc.lineTotal
      };
    });

    erpDb.createSalesInvoice({
      customerId: cust.id,
      customerName: cust.name,
      date: invoiceDate,
      dueDate: invoiceDueDate,
      items: formattedLines,
      subtotal: calculatedTotals.subtotal,
      taxTotal: calculatedTotals.taxTotal,
      grandTotal: calculatedTotals.grandTotal,
      notes: invoiceNotes
    });

    setShowCreateInvoiceModal(false);
  };

  // ==================== NEW CUSTOMER STATE ====================
  const [newCustCode, setNewCustCode] = useState(`CUST-00${customers.length + 1}`);
  const [newCustName, setNewCustName] = useState('');
  const [newCustEmail, setNewCustEmail] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustLimit, setNewCustLimit] = useState(10000);

  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName.trim()) return;

    erpDb.addCustomer({
      code: newCustCode,
      name: newCustName.trim(),
      email: newCustEmail.trim(),
      phone: newCustPhone.trim(),
      creditLimit: Number(newCustLimit) || 0,
      paymentTermsDays: 30
    });

    setShowCreateCustomerModal(false);
    setNewCustName('');
    setNewCustEmail('');
    setNewCustPhone('');
  };

  // ==================== PAYMENT RECORD STATE ====================
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentReceipt['paymentMethod']>('bank_transfer');
  const [paymentRef, setPaymentRef] = useState('');

  const handleOpenPayment = (inv: SalesInvoice) => {
    setPaymentInvoice(inv);
    setPaymentAmount(inv.balanceDue);
    const numPart = inv.invoiceNumber ? inv.invoiceNumber.replace(/[^0-9]/g, '') : '1001';
    setPaymentRef(`WIRE-${numPart}`);
  };

  const handleConfirmPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentInvoice || paymentAmount <= 0) return;

    erpDb.recordInvoicePayment(paymentInvoice.id, paymentAmount, paymentMethod, paymentRef);
    setPaymentInvoice(null);
  };

  const handleConvertQuotation = (quotationId: string) => {
    const inv = erpDb.convertQuotationToInvoice(quotationId);
    if (inv) {
      setActiveTab('invoices');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Module Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900">
            CRM &amp; Commercial Sales
          </h1>
          <p className="text-xs text-zinc-500">
            Quotations, Sales Invoices, Real-time Customer Balances &amp; AR Ledger Postings
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'invoices' && (
            <button
              type="button"
              onClick={() => setShowCreateInvoiceModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#d39e36] hover:bg-[#be8a29] text-black font-semibold text-xs rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Sales Invoice</span>
            </button>
          )}

          {activeTab === 'customers' && (
            <button
              type="button"
              onClick={() => setShowCreateCustomerModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#d39e36] hover:bg-[#be8a29] text-black font-semibold text-xs rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Customer</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-200 text-xs">
        <button
          type="button"
          onClick={() => setActiveTab('invoices')}
          className={`pb-2.5 px-3 font-semibold transition-colors border-b-2 cursor-pointer ${
            activeTab === 'invoices'
              ? 'border-[#d39e36] text-[#d39e36]'
              : 'border-transparent text-zinc-500 hover:text-zinc-800'
          }`}
        >
          Sales Invoices ({invoices.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('quotations')}
          className={`pb-2.5 px-3 font-semibold transition-colors border-b-2 cursor-pointer ${
            activeTab === 'quotations'
              ? 'border-[#d39e36] text-[#d39e36]'
              : 'border-transparent text-zinc-500 hover:text-zinc-800'
          }`}
        >
          Quotations ({quotations.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('customers')}
          className={`pb-2.5 px-3 font-semibold transition-colors border-b-2 cursor-pointer ${
            activeTab === 'customers'
              ? 'border-[#d39e36] text-[#d39e36]'
              : 'border-transparent text-zinc-500 hover:text-zinc-800'
          }`}
        >
          Customers ({customers.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('payments')}
          className={`pb-2.5 px-3 font-semibold transition-colors border-b-2 cursor-pointer ${
            activeTab === 'payments'
              ? 'border-[#d39e36] text-[#d39e36]'
              : 'border-transparent text-zinc-500 hover:text-zinc-800'
          }`}
        >
          Payment Receipts ({payments.length})
        </button>
      </div>

      {/* TAB CONTENT: INVOICES */}
      {activeTab === 'invoices' && (
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 text-zinc-600 border-b border-zinc-200 text-[11px] uppercase font-semibold">
                <tr>
                  <th className="py-2.5 px-4">Invoice #</th>
                  <th className="py-2.5 px-4">Customer</th>
                  <th className="py-2.5 px-4">Invoice Date</th>
                  <th className="py-2.5 px-4">Due Date</th>
                  <th className="py-2.5 px-4 text-right">Grand Total</th>
                  <th className="py-2.5 px-4 text-right">Balance Due</th>
                  <th className="py-2.5 px-4 text-center">Status</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-zinc-500">
                      No sales invoices issued yet.
                    </td>
                  </tr>
                ) : (
                  invoices.map(inv => (
                    <tr key={inv.id} className="hover:bg-zinc-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-zinc-900">{inv.invoiceNumber}</td>
                      <td className="py-3 px-4 font-medium text-zinc-800">{inv.customerName}</td>
                      <td className="py-3 px-4 text-zinc-500">{inv.date}</td>
                      <td className="py-3 px-4 text-zinc-500">{inv.dueDate}</td>
                      <td className="py-3 px-4 text-right font-mono font-medium">
                        ${inv.grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-zinc-900">
                        ${inv.balanceDue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            inv.status === 'paid'
                              ? 'bg-emerald-100 text-emerald-800'
                              : inv.status === 'partially_paid'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-zinc-100 text-zinc-700'
                          }`}
                        >
                          {inv.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        {inv.balanceDue > 0 && (
                          <button
                            type="button"
                            onClick={() => handleOpenPayment(inv)}
                            className="px-2 py-1 bg-zinc-900 hover:bg-zinc-800 text-white rounded text-[11px] font-medium transition-colors cursor-pointer"
                          >
                            Pay
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => onViewInvoice(inv.id)}
                          className="px-2 py-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded text-[11px] font-medium transition-colors cursor-pointer"
                        >
                          Print / View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: QUOTATIONS */}
      {activeTab === 'quotations' && (
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 text-zinc-600 border-b border-zinc-200 text-[11px] uppercase font-semibold">
                <tr>
                  <th className="py-2.5 px-4">Quotation #</th>
                  <th className="py-2.5 px-4">Customer</th>
                  <th className="py-2.5 px-4">Date</th>
                  <th className="py-2.5 px-4">Valid Until</th>
                  <th className="py-2.5 px-4 text-right">Total</th>
                  <th className="py-2.5 px-4 text-center">Status</th>
                  <th className="py-2.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {quotations.map(q => (
                  <tr key={q.id} className="hover:bg-zinc-50">
                    <td className="py-3 px-4 font-mono font-bold text-zinc-900">{q.quotationNumber}</td>
                    <td className="py-3 px-4 font-medium text-zinc-800">{q.customerName}</td>
                    <td className="py-3 px-4 text-zinc-500">{q.date}</td>
                    <td className="py-3 px-4 text-zinc-500">{q.validUntil}</td>
                    <td className="py-3 px-4 text-right font-mono font-medium">
                      ${q.grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700">
                        {q.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {q.status !== 'ordered' && (
                        <button
                          type="button"
                          onClick={() => handleConvertQuotation(q.id)}
                          className="px-2.5 py-1 bg-[#d39e36] hover:bg-[#be8a29] text-black font-semibold rounded text-[11px] transition-colors cursor-pointer"
                        >
                          Convert to Invoice →
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: CUSTOMERS */}
      {activeTab === 'customers' && (
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 text-zinc-600 border-b border-zinc-200 text-[11px] uppercase font-semibold">
                <tr>
                  <th className="py-2.5 px-4">Code</th>
                  <th className="py-2.5 px-4">Company Name</th>
                  <th className="py-2.5 px-4">Contact</th>
                  <th className="py-2.5 px-4">Email / Phone</th>
                  <th className="py-2.5 px-4 text-right">Credit Limit</th>
                  <th className="py-2.5 px-4 text-right">Outstanding (AR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {customers.map(c => (
                  <tr key={c.id} className="hover:bg-zinc-50">
                    <td className="py-3 px-4 font-mono font-bold text-zinc-700">{c.code}</td>
                    <td className="py-3 px-4 font-semibold text-zinc-900">{c.name}</td>
                    <td className="py-3 px-4 text-zinc-600">{c.contactPerson || '—'}</td>
                    <td className="py-3 px-4 text-zinc-600">
                      <div>{c.email}</div>
                      <div className="text-[10px] text-zinc-400">{c.phone}</div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono">${c.creditLimit.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-zinc-900">
                      ${c.outstandingBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: PAYMENTS */}
      {activeTab === 'payments' && (
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 text-zinc-600 border-b border-zinc-200 text-[11px] uppercase font-semibold">
                <tr>
                  <th className="py-2.5 px-4">Receipt #</th>
                  <th className="py-2.5 px-4">Customer</th>
                  <th className="py-2.5 px-4">Date</th>
                  <th className="py-2.5 px-4">Invoice #</th>
                  <th className="py-2.5 px-4">Method &amp; Ref</th>
                  <th className="py-2.5 px-4 text-right">Amount Received</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {payments.map(p => (
                  <tr key={p.id} className="hover:bg-zinc-50">
                    <td className="py-3 px-4 font-mono font-bold text-zinc-900">{p.paymentNumber}</td>
                    <td className="py-3 px-4 font-medium text-zinc-800">{p.customerName}</td>
                    <td className="py-3 px-4 text-zinc-500">{p.date}</td>
                    <td className="py-3 px-4 font-mono text-[#d39e36]">{p.invoiceNumber}</td>
                    <td className="py-3 px-4 text-zinc-600 capitalize">
                      {p.paymentMethod.replace('_', ' ')} {p.reference ? `(${p.reference})` : ''}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600">
                      +${p.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================== CREATE INVOICE MODAL ==================== */}
      {showCreateInvoiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl overflow-hidden text-zinc-100 max-h-[92vh] flex flex-col">
            <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950">
              <h2 className="text-sm font-semibold text-zinc-100">New Commercial Sales Invoice</h2>
              <button
                type="button"
                onClick={() => setShowCreateInvoiceModal(false)}
                className="text-zinc-400 hover:text-zinc-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveInvoice} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Customer *</label>
                  <select
                    value={selectedCustomerId}
                    onChange={e => setSelectedCustomerId(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:border-[#d39e36]"
                  >
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Invoice Date *</label>
                  <input
                    type="date"
                    value={invoiceDate}
                    onChange={e => setInvoiceDate(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:border-[#d39e36]"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Due Date *</label>
                  <input
                    type="date"
                    value={invoiceDueDate}
                    onChange={e => setInvoiceDueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:border-[#d39e36]"
                  />
                </div>
              </div>

              {/* Line Items */}
              <div className="space-y-2 pt-2 border-t border-zinc-800">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-zinc-200">Billable Line Items</span>
                  <button
                    type="button"
                    onClick={handleAddInvoiceLine}
                    className="text-xs text-[#d39e36] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {invoiceLines.map((line, idx) => (
                    <div key={idx} className="p-2.5 bg-zinc-800/80 rounded-lg border border-zinc-700/80 grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-5">
                        <label className="text-[10px] text-zinc-400 block mb-0.5">Item Catalogue</label>
                        <select
                          value={line.itemId}
                          onChange={e => handleLineItemChange(idx, e.target.value)}
                          className="w-full px-2 py-1.5 bg-zinc-900 border border-zinc-700 rounded text-xs text-zinc-100"
                        >
                          {items.map(it => (
                            <option key={it.id} value={it.id}>
                              {it.name} (${it.unitPrice})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-span-2">
                        <label className="text-[10px] text-zinc-400 block mb-0.5">Quantity</label>
                        <input
                          type="number"
                          min="1"
                          value={line.quantity}
                          onChange={e => handleLineFieldChange(idx, 'quantity', Number(e.target.value))}
                          className="w-full px-2 py-1.5 bg-zinc-900 border border-zinc-700 rounded text-xs text-zinc-100"
                        />
                      </div>

                      <div className="col-span-2">
                        <label className="text-[10px] text-zinc-400 block mb-0.5">Unit Price</label>
                        <input
                          type="number"
                          value={line.unitPrice}
                          onChange={e => handleLineFieldChange(idx, 'unitPrice', Number(e.target.value))}
                          className="w-full px-2 py-1.5 bg-zinc-900 border border-zinc-700 rounded text-xs text-zinc-100 font-mono"
                        />
                      </div>

                      <div className="col-span-2">
                        <label className="text-[10px] text-zinc-400 block mb-0.5">Tax (%)</label>
                        <input
                          type="number"
                          value={line.taxRate}
                          onChange={e => handleLineFieldChange(idx, 'taxRate', Number(e.target.value))}
                          className="w-full px-2 py-1.5 bg-zinc-900 border border-zinc-700 rounded text-xs text-zinc-100 font-mono"
                        />
                      </div>

                      <div className="col-span-1 text-center pt-4">
                        <button
                          type="button"
                          onClick={() => handleRemoveInvoiceLine(idx)}
                          className="text-zinc-500 hover:text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Subtotal & Grand Total Preview */}
              <div className="flex justify-end pt-2 border-t border-zinc-800 text-xs">
                <div className="w-64 space-y-1.5 bg-zinc-950 p-3 rounded-lg border border-zinc-800 font-mono">
                  <div className="flex justify-between text-zinc-400">
                    <span>Subtotal:</span>
                    <span>${calculatedTotals.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Tax (VAT):</span>
                    <span>${calculatedTotals.taxTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-zinc-100 text-sm border-t border-zinc-800 pt-1">
                    <span>Grand Total:</span>
                    <span className="text-[#d39e36]">${calculatedTotals.grandTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateInvoiceModal(false)}
                  className="px-4 py-2 text-zinc-400 hover:text-zinc-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#d39e36] hover:bg-[#be8a29] text-black font-semibold rounded-lg"
                >
                  Post Invoice &amp; Update Ledger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== CREATE CUSTOMER MODAL ==================== */}
      {showCreateCustomerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl p-6 text-zinc-100 text-xs space-y-4">
            <h2 className="text-sm font-semibold text-zinc-100">Add Commercial Customer</h2>
            <form onSubmit={handleSaveCustomer} className="space-y-3">
              <div>
                <label className="block text-zinc-300 font-medium mb-1">Customer Code *</label>
                <input
                  type="text"
                  required
                  value={newCustCode}
                  onChange={e => setNewCustCode(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 font-mono"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Company / Client Name *</label>
                <input
                  type="text"
                  required
                  value={newCustName}
                  onChange={e => setNewCustName(e.target.value)}
                  placeholder="e.g. Nile Delta Logistics"
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={newCustEmail}
                  onChange={e => setNewCustEmail(e.target.value)}
                  placeholder="billing@company.com"
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Phone Number</label>
                <input
                  type="text"
                  value={newCustPhone}
                  onChange={e => setNewCustPhone(e.target.value)}
                  placeholder="+20 128 171 9903"
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Credit Limit ($)</label>
                <input
                  type="number"
                  value={newCustLimit}
                  onChange={e => setNewCustLimit(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 font-mono"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateCustomerModal(false)}
                  className="px-4 py-2 text-zinc-400 hover:text-zinc-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#d39e36] text-black font-semibold rounded-lg"
                >
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== PAYMENT COLLECTION MODAL ==================== */}
      {paymentInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl p-6 text-zinc-100 text-xs space-y-4">
            <h2 className="text-sm font-semibold text-zinc-100">
              Record Payment for {paymentInvoice.invoiceNumber}
            </h2>
            <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800 space-y-1 font-mono">
              <div className="flex justify-between text-zinc-400">
                <span>Customer:</span>
                <span className="text-zinc-200">{paymentInvoice.customerName}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Invoice Total:</span>
                <span>${paymentInvoice.grandTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Remaining Due:</span>
                <span className="text-red-400 font-bold">${paymentInvoice.balanceDue.toFixed(2)}</span>
              </div>
            </div>

            <form onSubmit={handleConfirmPayment} className="space-y-3">
              <div>
                <label className="block text-zinc-300 font-medium mb-1">Payment Amount ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  max={paymentInvoice.balanceDue}
                  required
                  value={paymentAmount}
                  onChange={e => setPaymentAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 font-mono font-bold text-sm"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value as any)}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100"
                >
                  <option value="bank_transfer">Direct Bank Wire / Transfer</option>
                  <option value="cash">Cash on Delivery</option>
                  <option value="credit_card">Corporate Credit Card</option>
                  <option value="cheque">Company Cheque</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Transaction Reference</label>
                <input
                  type="text"
                  value={paymentRef}
                  onChange={e => setPaymentRef(e.target.value)}
                  placeholder="e.g. WIRE-881920"
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 font-mono"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentInvoice(null)}
                  className="px-4 py-2 text-zinc-400 hover:text-zinc-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg shadow-sm"
                >
                  Confirm &amp; Post to Cash Ledger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
