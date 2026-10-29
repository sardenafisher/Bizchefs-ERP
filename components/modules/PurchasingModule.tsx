'use client';

import React, { useState } from 'react';
import { Plus, ShoppingBag, CheckCircle, PackageCheck, Truck, Warehouse, DollarSign } from 'lucide-react';
import { ERPDatabaseState, erpDb } from '@/lib/db/database';
import { PurchaseOrder, Supplier, SalesLineItem } from '@/lib/types/erp';
import { calculateLineTotals, calculateOrderTotals } from '@/lib/erp/tax-rules';

interface PurchasingModuleProps {
  state: ERPDatabaseState;
}

export function PurchasingModule({ state }: PurchasingModuleProps) {
  const [activeTab, setActiveTab] = useState<'orders' | 'suppliers'>('orders');
  const [showCreatePOModal, setShowCreatePOModal] = useState(false);
  const [showCreateSupplierModal, setShowCreateSupplierModal] = useState(false);

  const purchaseOrders = state.purchaseOrders.filter(p => p.tenantId === state.activeTenantId);
  const suppliers = state.suppliers.filter(s => s.tenantId === state.activeTenantId);
  const warehouses = state.warehouses.filter(w => w.tenantId === state.activeTenantId);
  const items = state.items.filter(i => i.tenantId === state.activeTenantId);

  // New PO State
  const [selectedSupplierId, setSelectedSupplierId] = useState(suppliers[0]?.id || '');
  const [selectedWarehouseId, setSelectedWarehouseId] = useState(warehouses[0]?.id || '');
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0]);
  const [expectedDate, setExpectedDate] = useState(new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]);
  const [poLines, setPoLines] = useState<Array<{
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
      itemSku: items[0]?.sku || '',
      itemName: items[0]?.name || '',
      uom: items[0]?.uom || 'pcs',
      quantity: 10,
      unitPrice: items[0]?.costPrice || 50,
      taxRate: items[0]?.taxRate || 14
    }
  ]);

  const handleAddPoLine = () => {
    const first = items[0];
    setPoLines([
      ...poLines,
      {
        itemId: first?.id || '',
        itemSku: first?.sku || '',
        itemName: first?.name || '',
        uom: first?.uom || 'pcs',
        quantity: 5,
        unitPrice: first?.costPrice || 50,
        taxRate: first?.taxRate || 14
      }
    ]);
  };

  const handleItemSelect = (index: number, itemId: string) => {
    const it = items.find(i => i.id === itemId);
    if (!it) return;
    const updated = [...poLines];
    updated[index] = {
      ...updated[index],
      itemId: it.id,
      itemSku: it.sku,
      itemName: it.name,
      uom: it.uom,
      unitPrice: it.costPrice,
      taxRate: it.taxRate
    };
    setPoLines(updated);
  };

  const handleSavePO = (e: React.FormEvent) => {
    e.preventDefault();
    const sup = suppliers.find(s => s.id === selectedSupplierId) || suppliers[0];
    const wh = warehouses.find(w => w.id === selectedWarehouseId) || warehouses[0];
    if (!sup || !wh) return;

    const totals = calculateOrderTotals(poLines);
    const formattedLines: SalesLineItem[] = poLines.map((line, idx) => {
      const calc = calculateLineTotals(line.quantity, line.unitPrice, line.taxRate);
      return {
        id: `pli-${Date.now()}-${idx}`,
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

    erpDb.createPurchaseOrder({
      supplierId: sup.id,
      supplierName: sup.name,
      date: orderDate,
      expectedDate,
      warehouseId: wh.id,
      warehouseName: wh.name,
      items: formattedLines,
      subtotal: totals.subtotal,
      taxTotal: totals.taxTotal,
      grandTotal: totals.grandTotal,
      status: 'ordered'
    });

    setShowCreatePOModal(false);
  };

  const handleReceiveGoods = (poId: string) => {
    erpDb.receivePurchaseOrder(poId);
  };

  // New Supplier State
  const [supCode, setSupCode] = useState(`SUP-00${suppliers.length + 1}`);
  const [supName, setSupName] = useState('');
  const [supEmail, setSupEmail] = useState('');
  const [supPhone, setSupPhone] = useState('');

  const handleSaveSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supName.trim()) return;

    erpDb.addSupplier({
      code: supCode,
      name: supName.trim(),
      email: supEmail.trim(),
      phone: supPhone.trim(),
      paymentTermsDays: 30
    });

    setShowCreateSupplierModal(false);
    setSupName('');
    setSupEmail('');
    setSupPhone('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900">
            Purchasing &amp; Supply Chain
          </h1>
          <p className="text-xs text-zinc-500">
            Vendor Purchase Orders, Stock Inbound Receipts &amp; Accounts Payable
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'orders' && (
            <button
              type="button"
              onClick={() => setShowCreatePOModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#d39e36] hover:bg-[#be8a29] text-black font-semibold text-xs rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Purchase Order</span>
            </button>
          )}

          {activeTab === 'suppliers' && (
            <button
              type="button"
              onClick={() => setShowCreateSupplierModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#d39e36] hover:bg-[#be8a29] text-black font-semibold text-xs rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Supplier</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-200 text-xs">
        <button
          type="button"
          onClick={() => setActiveTab('orders')}
          className={`pb-2.5 px-3 font-semibold transition-colors border-b-2 cursor-pointer ${
            activeTab === 'orders'
              ? 'border-[#d39e36] text-[#d39e36]'
              : 'border-transparent text-zinc-500 hover:text-zinc-800'
          }`}
        >
          Purchase Orders ({purchaseOrders.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('suppliers')}
          className={`pb-2.5 px-3 font-semibold transition-colors border-b-2 cursor-pointer ${
            activeTab === 'suppliers'
              ? 'border-[#d39e36] text-[#d39e36]'
              : 'border-transparent text-zinc-500 hover:text-zinc-800'
          }`}
        >
          Suppliers ({suppliers.length})
        </button>
      </div>

      {/* ORDERS TAB */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 text-zinc-600 border-b border-zinc-200 text-[11px] uppercase font-semibold">
                <tr>
                  <th className="py-2.5 px-4">PO #</th>
                  <th className="py-2.5 px-4">Supplier</th>
                  <th className="py-2.5 px-4">Destination Depot</th>
                  <th className="py-2.5 px-4">Order Date</th>
                  <th className="py-2.5 px-4">Expected Date</th>
                  <th className="py-2.5 px-4 text-right">Total Amount</th>
                  <th className="py-2.5 px-4 text-center">Status</th>
                  <th className="py-2.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {purchaseOrders.map(po => (
                  <tr key={po.id} className="hover:bg-zinc-50">
                    <td className="py-3 px-4 font-mono font-bold text-zinc-900">{po.orderNumber}</td>
                    <td className="py-3 px-4 font-medium text-zinc-800">{po.supplierName}</td>
                    <td className="py-3 px-4 text-zinc-600">{po.warehouseName}</td>
                    <td className="py-3 px-4 text-zinc-500">{po.date}</td>
                    <td className="py-3 px-4 text-zinc-500">{po.expectedDate}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-zinc-900">
                      ${po.grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          po.status === 'received'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {po.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {po.status !== 'received' ? (
                        <button
                          type="button"
                          onClick={() => handleReceiveGoods(po.id)}
                          className="px-2.5 py-1 bg-[#d39e36] hover:bg-[#be8a29] text-black font-semibold rounded text-[11px] transition-colors cursor-pointer flex items-center gap-1.5 ml-auto"
                        >
                          <PackageCheck className="w-3.5 h-3.5" />
                          <span>Receive Goods</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-emerald-600 font-medium">Stocked</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUPPLIERS TAB */}
      {activeTab === 'suppliers' && (
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 text-zinc-600 border-b border-zinc-200 text-[11px] uppercase font-semibold">
                <tr>
                  <th className="py-2.5 px-4">Code</th>
                  <th className="py-2.5 px-4">Supplier Name</th>
                  <th className="py-2.5 px-4">Contact</th>
                  <th className="py-2.5 px-4">Email / Phone</th>
                  <th className="py-2.5 px-4 text-right">Payment Terms</th>
                  <th className="py-2.5 px-4 text-right">AP Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {suppliers.map(sup => (
                  <tr key={sup.id} className="hover:bg-zinc-50">
                    <td className="py-3 px-4 font-mono font-bold text-zinc-700">{sup.code}</td>
                    <td className="py-3 px-4 font-semibold text-zinc-900">{sup.name}</td>
                    <td className="py-3 px-4 text-zinc-600">{sup.contactPerson || '—'}</td>
                    <td className="py-3 px-4 text-zinc-600">
                      <div>{sup.email}</div>
                      <div className="text-[10px] text-zinc-400">{sup.phone}</div>
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-zinc-700">{sup.paymentTermsDays} Days</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-zinc-900">
                      ${sup.outstandingBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE PO MODAL */}
      {showCreatePOModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl p-6 text-zinc-100 text-xs space-y-4">
            <h2 className="text-sm font-semibold text-zinc-100">Create Supplier Purchase Order</h2>
            <form onSubmit={handleSavePO} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Supplier *</label>
                  <select
                    value={selectedSupplierId}
                    onChange={e => setSelectedSupplierId(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100"
                  >
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Destination Depot *</label>
                  <select
                    value={selectedWarehouseId}
                    onChange={e => setSelectedWarehouseId(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100"
                  >
                    {warehouses.map(w => (
                      <option key={w.id} value={w.id}>
                        {w.name} ({w.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Order Date *</label>
                  <input
                    type="date"
                    value={orderDate}
                    onChange={e => setOrderDate(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Expected Delivery Date</label>
                  <input
                    type="date"
                    value={expectedDate}
                    onChange={e => setExpectedDate(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100"
                  />
                </div>
              </div>

              {/* Line item selection */}
              <div className="p-3 bg-zinc-800/80 rounded-lg border border-zinc-700">
                <div className="font-semibold text-zinc-200 mb-2">Item to Procure</div>
                <div className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-6">
                    <select
                      value={poLines[0]?.itemId}
                      onChange={e => handleItemSelect(0, e.target.value)}
                      className="w-full px-2 py-1.5 bg-zinc-900 border border-zinc-700 rounded text-xs text-zinc-100"
                    >
                      {items.map(it => (
                        <option key={it.id} value={it.id}>
                          {it.name} (Cost: ${it.costPrice})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-3">
                    <input
                      type="number"
                      min="1"
                      value={poLines[0]?.quantity}
                      onChange={e => {
                        const updated = [...poLines];
                        updated[0].quantity = Number(e.target.value);
                        setPoLines(updated);
                      }}
                      className="w-full px-2 py-1.5 bg-zinc-900 border border-zinc-700 rounded text-xs text-zinc-100 font-mono"
                      placeholder="Qty"
                    />
                  </div>
                  <div className="col-span-3">
                    <input
                      type="number"
                      value={poLines[0]?.unitPrice}
                      onChange={e => {
                        const updated = [...poLines];
                        updated[0].unitPrice = Number(e.target.value);
                        setPoLines(updated);
                      }}
                      className="w-full px-2 py-1.5 bg-zinc-900 border border-zinc-700 rounded text-xs text-zinc-100 font-mono"
                      placeholder="Cost"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreatePOModal(false)}
                  className="px-4 py-2 text-zinc-400 hover:text-zinc-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#d39e36] hover:bg-[#be8a29] text-black font-semibold rounded-lg"
                >
                  Confirm Purchase Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE SUPPLIER MODAL */}
      {showCreateSupplierModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl p-6 text-zinc-100 text-xs space-y-4">
            <h2 className="text-sm font-semibold text-zinc-100">Add Supplier Vendor</h2>
            <form onSubmit={handleSaveSupplier} className="space-y-3">
              <div>
                <label className="block text-zinc-300 font-medium mb-1">Supplier Code *</label>
                <input
                  type="text"
                  required
                  value={supCode}
                  onChange={e => setSupCode(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 font-mono"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Vendor / Organization Name *</label>
                <input
                  type="text"
                  required
                  value={supName}
                  onChange={e => setSupName(e.target.value)}
                  placeholder="e.g. Apex Hardware Wholesalers"
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={supEmail}
                  onChange={e => setSupEmail(e.target.value)}
                  placeholder="orders@vendor.com"
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Phone</label>
                <input
                  type="text"
                  value={supPhone}
                  onChange={e => setSupPhone(e.target.value)}
                  placeholder="+20 128 171 9903"
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateSupplierModal(false)}
                  className="px-4 py-2 text-zinc-400 hover:text-zinc-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#d39e36] text-black font-semibold rounded-lg"
                >
                  Save Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
