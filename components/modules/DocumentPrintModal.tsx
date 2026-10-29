'use client';

import React from 'react';
import { X, Printer, Download, CheckCircle, Building2 } from 'lucide-react';
import { SalesInvoice, Tenant } from '@/lib/types/erp';

interface DocumentPrintModalProps {
  invoice: SalesInvoice | null;
  tenant: Tenant;
  onClose: () => void;
}

export function DocumentPrintModal({ invoice, tenant, onClose }: DocumentPrintModalProps) {
  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white text-zinc-900 rounded-xl shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header Actions */}
        <div className="no-print bg-zinc-900 text-white px-6 py-3 flex items-center justify-between border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">Commercial Invoice Preview</span>
            <span className="text-xs bg-[#d39e36] text-black font-mono font-bold px-2 py-0.5 rounded">
              {invoice.invoiceNumber}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#d39e36] hover:bg-[#be8a29] text-black font-semibold text-xs rounded transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close invoice preview"
              className="p-1.5 text-zinc-400 hover:text-white rounded transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Document Body */}
        <div className="printable-document p-8 sm:p-12 overflow-y-auto text-xs leading-relaxed space-y-8 bg-white">
          {/* Top Company Header & Invoice Badge */}
          <div className="flex justify-between items-start border-b border-zinc-200 pb-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-[#d39e36] text-black font-black flex items-center justify-center text-sm">
                  BC
                </div>
                <span className="text-xl font-bold tracking-tight text-zinc-900">{tenant.name}</span>
              </div>
              <div className="text-zinc-600">{tenant.settings.address || 'Tech Business Park'}</div>
              <div className="text-zinc-600">
                {tenant.settings.city}, {tenant.settings.country}
              </div>
              <div className="text-zinc-600">Tax Registration: {tenant.settings.taxNumber || 'N/A'}</div>
              <div className="text-zinc-600">Email: {tenant.settings.email || 'billing@bizchefs.com'}</div>
            </div>

            <div className="text-right space-y-1">
              <div className="text-2xl font-black uppercase tracking-wider text-zinc-900">TAX INVOICE</div>
              <div className="text-xs font-mono font-bold text-zinc-800">№ {invoice.invoiceNumber}</div>
              <div className="text-zinc-600">Date: <span className="font-semibold text-zinc-900">{invoice.date}</span></div>
              <div className="text-zinc-600">Due Date: <span className="font-semibold text-zinc-900">{invoice.dueDate}</span></div>
              <div className="inline-block mt-2 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-zinc-100 text-zinc-800 border border-zinc-300">
                Status: {invoice.status.replace('_', ' ')}
              </div>
            </div>
          </div>

          {/* Billed To Customer */}
          <div className="grid grid-cols-2 gap-8 border-b border-zinc-200 pb-6">
            <div>
              <div className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider mb-1">Billed To</div>
              <div className="text-sm font-bold text-zinc-900">{invoice.customerName}</div>
              <div className="text-zinc-600">Authorized Commercial Account</div>
              <div className="text-zinc-600">Terms: Net 30 Days</div>
            </div>

            <div>
              <div className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider mb-1">Payment Method &amp; Currency</div>
              <div className="text-zinc-700 font-medium">Bank Wire Transfer / Corporate Cheque</div>
              <div className="text-zinc-600">Currency: {tenant.settings.baseCurrency}</div>
              <div className="text-zinc-600">Swift / IBAN: EG6800020001000000008891029</div>
            </div>
          </div>

          {/* Line Items Table */}
          <div>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-zinc-900 text-zinc-700 text-[11px] font-bold uppercase">
                  <th className="py-2.5">Item &amp; Description</th>
                  <th className="py-2.5 text-center">UOM</th>
                  <th className="py-2.5 text-right">Qty</th>
                  <th className="py-2.5 text-right">Unit Price</th>
                  <th className="py-2.5 text-right">Tax (14%)</th>
                  <th className="py-2.5 text-right">Total ({tenant.settings.baseCurrency})</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {invoice.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-zinc-50">
                    <td className="py-3">
                      <div className="font-semibold text-zinc-900">{item.itemName}</div>
                      <div className="text-[10px] font-mono text-zinc-500">SKU: {item.itemSku}</div>
                    </td>
                    <td className="py-3 text-center text-zinc-600 uppercase">{item.uom}</td>
                    <td className="py-3 text-right font-medium">{item.quantity}</td>
                    <td className="py-3 text-right font-mono">${item.unitPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td className="py-3 text-right font-mono text-zinc-600">${item.taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td className="py-3 text-right font-mono font-bold text-zinc-900">
                      ${item.lineTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Subtotals & Balances */}
          <div className="flex justify-end pt-4">
            <div className="w-72 space-y-2 border-t-2 border-zinc-900 pt-3 text-xs">
              <div className="flex justify-between text-zinc-600">
                <span>Subtotal (Excl. Tax):</span>
                <span className="font-mono font-medium">${invoice.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span>Sales Tax / VAT:</span>
                <span className="font-mono font-medium">${invoice.taxTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-zinc-900 border-t border-zinc-300 pt-2">
                <span>Grand Total:</span>
                <span className="font-mono text-[#d39e36]">${invoice.grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span>Amount Paid:</span>
                <span className="font-mono font-medium text-emerald-600">-${invoice.amountPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-zinc-900 border-t border-dashed border-zinc-300 pt-2">
                <span>Balance Due:</span>
                <span className="font-mono text-red-600">${invoice.balanceDue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          {/* Notes and Authorization Footer */}
          <div className="border-t border-zinc-200 pt-6 space-y-4 text-[11px] text-zinc-500">
            {invoice.notes && (
              <div>
                <span className="font-bold text-zinc-700">Notes / Instructions: </span>
                <span>{invoice.notes}</span>
              </div>
            )}
            <div className="flex justify-between items-end pt-4">
              <div>
                <div>BizChefs ERP • Verified Electronic Document</div>
                <div>Questions? Contact {tenant.settings.email || 'billing@bizchefs.com'}</div>
              </div>
              <div className="text-right">
                <div className="w-40 border-b border-zinc-400 mb-1" />
                <div className="text-[10px] uppercase font-bold text-zinc-600">Authorized Signature &amp; Stamp</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
