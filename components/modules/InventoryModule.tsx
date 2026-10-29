'use client';

import React, { useState } from 'react';
import { 
  Package, 
  Warehouse as WarehouseIcon, 
  ArrowLeftRight, 
  Sliders, 
  Plus, 
  AlertTriangle,
  History,
  CheckCircle2
} from 'lucide-react';
import { ERPDatabaseState, erpDb } from '@/lib/db/database';
import { Item, Warehouse, StockMovement } from '@/lib/types/erp';
import { computeStockBalanceForWarehouse } from '@/lib/erp/inventory-rules';

interface InventoryModuleProps {
  state: ERPDatabaseState;
}

export function InventoryModule({ state }: InventoryModuleProps) {
  const [activeTab, setActiveTab] = useState<'balances' | 'items' | 'ledger' | 'warehouses'>('balances');
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
  const [showAddItemModal, setShowAddItemModal] = useState(false);

  const items = state.items.filter(i => i.tenantId === state.activeTenantId);
  const warehouses = state.warehouses.filter(w => w.tenantId === state.activeTenantId);
  const movements = state.stockMovements.filter(m => m.tenantId === state.activeTenantId);

  // Transfer Modal State
  const [transferItemId, setTransferItemId] = useState(items[0]?.id || '');
  const [fromWhId, setFromWhId] = useState(warehouses[0]?.id || '');
  const [toWhId, setToWhId] = useState(warehouses[1]?.id || warehouses[0]?.id || '');
  const [transferQty, setTransferQty] = useState(1);
  const [transferNotes, setTransferNotes] = useState('');

  const handleConfirmTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferItemId || !fromWhId || !toWhId || transferQty <= 0) return;
    if (fromWhId === toWhId) {
      alert('Source and destination warehouse must be different.');
      return;
    }

    const success = erpDb.recordStockTransfer(transferItemId, fromWhId, toWhId, transferQty, transferNotes);
    if (success) {
      setShowTransferModal(false);
      setTransferQty(1);
      setTransferNotes('');
    }
  };

  // Adjustment Modal State
  const [adjItemId, setAdjItemId] = useState(items[0]?.id || '');
  const [adjWhId, setAdjWhId] = useState(warehouses[0]?.id || '');
  const [adjDiff, setAdjDiff] = useState(1);
  const [adjReason, setAdjReason] = useState('Periodic physical inventory count discrepancy');

  const handleConfirmAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjItemId || !adjWhId || adjDiff === 0) return;

    const success = erpDb.recordStockAdjustment(adjItemId, adjWhId, adjDiff, adjReason);
    if (success) {
      setShowAdjustmentModal(false);
      setAdjDiff(1);
    }
  };

  // Add Item State
  const [newItemSku, setNewItemSku] = useState('');
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('Hardware');
  const [newItemUom, setNewItemUom] = useState('pcs');
  const [newItemPrice, setNewItemPrice] = useState(100);
  const [newItemCost, setNewItemCost] = useState(60);
  const [newItemReorder, setNewItemReorder] = useState(5);

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemSku.trim() || !newItemName.trim()) return;

    erpDb.addItem({
      sku: newItemSku.trim().toUpperCase(),
      name: newItemName.trim(),
      category: newItemCategory,
      uom: newItemUom,
      unitPrice: Number(newItemPrice) || 0,
      costPrice: Number(newItemCost) || 0,
      taxRate: 14,
      reorderPoint: Number(newItemReorder) || 0
    });

    setShowAddItemModal(false);
    setNewItemSku('');
    setNewItemName('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900">
            Inventory &amp; Warehousing
          </h1>
          <p className="text-xs text-zinc-500">
            Traceable Stock Ledger, Inter-Warehouse Transfers &amp; Inventory Valuation
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowTransferModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-xs rounded-lg transition-colors cursor-pointer"
          >
            <ArrowLeftRight className="w-3.5 h-3.5 text-[#d39e36]" />
            <span>Inter-Depot Transfer</span>
          </button>
          <button
            type="button"
            onClick={() => setShowAdjustmentModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-zinc-50 border border-zinc-300 text-zinc-800 font-medium text-xs rounded-lg transition-colors cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5 text-zinc-600" />
            <span>Adjust Stock</span>
          </button>
          <button
            type="button"
            onClick={() => setShowAddItemModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#d39e36] hover:bg-[#be8a29] text-black font-semibold text-xs rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Item</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-200 text-xs">
        <button
          type="button"
          onClick={() => setActiveTab('balances')}
          className={`pb-2.5 px-3 font-semibold transition-colors border-b-2 cursor-pointer ${
            activeTab === 'balances'
              ? 'border-[#d39e36] text-[#d39e36]'
              : 'border-transparent text-zinc-500 hover:text-zinc-800'
          }`}
        >
          Depot Stock Balances
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('items')}
          className={`pb-2.5 px-3 font-semibold transition-colors border-b-2 cursor-pointer ${
            activeTab === 'items'
              ? 'border-[#d39e36] text-[#d39e36]'
              : 'border-transparent text-zinc-500 hover:text-zinc-800'
          }`}
        >
          Catalogue Items ({items.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('ledger')}
          className={`pb-2.5 px-3 font-semibold transition-colors border-b-2 cursor-pointer ${
            activeTab === 'ledger'
              ? 'border-[#d39e36] text-[#d39e36]'
              : 'border-transparent text-zinc-500 hover:text-zinc-800'
          }`}
        >
          Traceable Stock Ledger ({movements.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('warehouses')}
          className={`pb-2.5 px-3 font-semibold transition-colors border-b-2 cursor-pointer ${
            activeTab === 'warehouses'
              ? 'border-[#d39e36] text-[#d39e36]'
              : 'border-transparent text-zinc-500 hover:text-zinc-800'
          }`}
        >
          Warehouses &amp; Depots ({warehouses.length})
        </button>
      </div>

      {/* BALANCES TAB */}
      {activeTab === 'balances' && (
        <div className="space-y-6">
          {warehouses.map(wh => {
            return (
              <div key={wh.id} className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
                <div className="px-5 py-3.5 bg-zinc-50/80 border-b border-zinc-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <WarehouseIcon className="w-4 h-4 text-[#d39e36]" />
                    <span className="font-bold text-zinc-900 text-sm">{wh.name}</span>
                    <span className="font-mono text-[10px] text-zinc-500 bg-white px-2 py-0.5 rounded border border-zinc-200">
                      {wh.code}
                    </span>
                    {wh.isDefault && (
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-medium">
                        Primary Depot
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-zinc-500">{wh.location || 'Central Location'}</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="text-zinc-500 border-b border-zinc-100 text-[10px] uppercase font-semibold">
                      <tr>
                        <th className="py-2 px-4">Item SKU</th>
                        <th className="py-2 px-4">Name</th>
                        <th className="py-2 px-4">Category</th>
                        <th className="py-2 px-4 text-center">UOM</th>
                        <th className="py-2 px-4 text-right">Qty on Hand</th>
                        <th className="py-2 px-4 text-right">Avg Unit Cost</th>
                        <th className="py-2 px-4 text-right">Total Asset Value</th>
                        <th className="py-2 px-4 text-center">Stock Health</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {items.map(item => {
                        const bal = computeStockBalanceForWarehouse(movements, item.id, wh.id);
                        const isLow = item.reorderPoint > 0 && bal.quantityOnHand <= item.reorderPoint;
                        return (
                          <tr key={item.id} className="hover:bg-zinc-50">
                            <td className="py-2.5 px-4 font-mono font-bold text-zinc-800">{item.sku}</td>
                            <td className="py-2.5 px-4 font-medium text-zinc-900">{item.name}</td>
                            <td className="py-2.5 px-4 text-zinc-500">{item.category}</td>
                            <td className="py-2.5 px-4 text-center text-zinc-500 uppercase">{item.uom}</td>
                            <td className="py-2.5 px-4 text-right font-mono font-bold text-zinc-900">
                              {bal.quantityOnHand}
                            </td>
                            <td className="py-2.5 px-4 text-right font-mono text-zinc-600">
                              ${bal.averageUnitCost.toFixed(2)}
                            </td>
                            <td className="py-2.5 px-4 text-right font-mono font-bold text-[#d39e36]">
                              ${bal.totalCostValue.toFixed(2)}
                            </td>
                            <td className="py-2.5 px-4 text-center">
                              {isLow ? (
                                <span className="inline-flex items-center gap-1 text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-semibold">
                                  <AlertTriangle className="w-3 h-3" />
                                  <span>Reorder Alert ({bal.quantityOnHand}/{item.reorderPoint})</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-medium">
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>Sufficient</span>
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ITEMS CATALOGUE TAB */}
      {activeTab === 'items' && (
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 text-zinc-600 border-b border-zinc-200 text-[11px] uppercase font-semibold">
                <tr>
                  <th className="py-2.5 px-4">SKU</th>
                  <th className="py-2.5 px-4">Item Name</th>
                  <th className="py-2.5 px-4">Category</th>
                  <th className="py-2.5 px-4 text-center">UOM</th>
                  <th className="py-2.5 px-4 text-right">Selling Price</th>
                  <th className="py-2.5 px-4 text-right">Cost Price</th>
                  <th className="py-2.5 px-4 text-right">Tax Rate</th>
                  <th className="py-2.5 px-4 text-right">Reorder Threshold</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {items.map(it => (
                  <tr key={it.id} className="hover:bg-zinc-50">
                    <td className="py-3 px-4 font-mono font-bold text-zinc-900">{it.sku}</td>
                    <td className="py-3 px-4 font-semibold text-zinc-900">{it.name}</td>
                    <td className="py-3 px-4 text-zinc-500">{it.category}</td>
                    <td className="py-3 px-4 text-center text-zinc-600 uppercase">{it.uom}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-zinc-900">${it.unitPrice.toFixed(2)}</td>
                    <td className="py-3 px-4 text-right font-mono text-zinc-600">${it.costPrice.toFixed(2)}</td>
                    <td className="py-3 px-4 text-right font-mono text-zinc-600">{it.taxRate}%</td>
                    <td className="py-3 px-4 text-right font-mono font-medium text-amber-700">{it.reorderPoint} {it.uom}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* LEDGER TAB */}
      {activeTab === 'ledger' && (
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 text-zinc-600 border-b border-zinc-200 text-[11px] uppercase font-semibold">
                <tr>
                  <th className="py-2.5 px-4">Date</th>
                  <th className="py-2.5 px-4">Type</th>
                  <th className="py-2.5 px-4">SKU / Item</th>
                  <th className="py-2.5 px-4">Warehouse</th>
                  <th className="py-2.5 px-4 text-right">Quantity</th>
                  <th className="py-2.5 px-4 text-right">Unit Cost</th>
                  <th className="py-2.5 px-4 text-right">Total Value</th>
                  <th className="py-2.5 px-4">Notes / Audit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {movements.map(m => (
                  <tr key={m.id} className="hover:bg-zinc-50">
                    <td className="py-2.5 px-4 text-zinc-500 font-mono">{m.date}</td>
                    <td className="py-2.5 px-4 capitalize">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          m.movementType === 'receipt'
                            ? 'bg-emerald-100 text-emerald-800'
                            : m.movementType === 'transfer'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-zinc-100 text-zinc-800'
                        }`}
                      >
                        {m.movementType}
                      </span>
                    </td>
                    <td className="py-2.5 px-4">
                      <span className="font-mono font-bold text-zinc-800 mr-2">{m.itemSku}</span>
                      <span className="text-zinc-600">{m.itemName}</span>
                    </td>
                    <td className="py-2.5 px-4 text-zinc-700">
                      {m.warehouseName}
                      {m.toWarehouseName ? ` → ${m.toWarehouseName}` : ''}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-zinc-900">
                      {m.quantity}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono text-zinc-600">${m.unitCost.toFixed(2)}</td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-[#d39e36]">
                      ${m.totalValue.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-4 text-zinc-500">{m.notes || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* WAREHOUSES TAB */}
      {activeTab === 'warehouses' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {warehouses.map(w => (
            <div key={w.id} className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <WarehouseIcon className="w-5 h-5 text-[#d39e36]" />
                  <h3 className="font-bold text-zinc-900 text-sm">{w.name}</h3>
                </div>
                <span className="font-mono text-xs bg-zinc-100 text-zinc-800 px-2 py-0.5 rounded border border-zinc-200">
                  {w.code}
                </span>
              </div>
              <p className="text-xs text-zinc-500">{w.location || 'Location not specified'}</p>
              <div className="pt-2 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-600">
                <span>Status: Operational</span>
                {w.isDefault && <span className="text-emerald-600 font-semibold">Default Primary Facility</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ==================== TRANSFER MODAL ==================== */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl p-6 text-zinc-100 text-xs space-y-4">
            <h2 className="text-sm font-semibold text-zinc-100">Inter-Warehouse Stock Transfer</h2>
            <form onSubmit={handleConfirmTransfer} className="space-y-3">
              <div>
                <label className="block text-zinc-300 font-medium mb-1">Item to Transfer *</label>
                <select
                  value={transferItemId}
                  onChange={e => setTransferItemId(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100"
                >
                  {items.map(it => (
                    <option key={it.id} value={it.id}>
                      {it.name} ({it.sku})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Origin Warehouse</label>
                  <select
                    value={fromWhId}
                    onChange={e => setFromWhId(e.target.value)}
                    className="w-full px-2 py-1.5 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100"
                  >
                    {warehouses.map(w => (
                      <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Destination Warehouse</label>
                  <select
                    value={toWhId}
                    onChange={e => setToWhId(e.target.value)}
                    className="w-full px-2 py-1.5 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100"
                  >
                    {warehouses.map(w => (
                      <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Quantity to Move *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={transferQty}
                  onChange={e => setTransferQty(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 font-mono"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Transfer Memo / Transport Reference</label>
                <input
                  type="text"
                  value={transferNotes}
                  onChange={e => setTransferNotes(e.target.value)}
                  placeholder="e.g. Replenishment dispatch truck #4"
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="px-4 py-2 text-zinc-400 hover:text-zinc-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#d39e36] text-black font-semibold rounded-lg"
                >
                  Confirm Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== ADJUSTMENT MODAL ==================== */}
      {showAdjustmentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl p-6 text-zinc-100 text-xs space-y-4">
            <h2 className="text-sm font-semibold text-zinc-100">Stock Inventory Adjustment</h2>
            <form onSubmit={handleConfirmAdjustment} className="space-y-3">
              <div>
                <label className="block text-zinc-300 font-medium mb-1">Item to Adjust *</label>
                <select
                  value={adjItemId}
                  onChange={e => setAdjItemId(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100"
                >
                  {items.map(it => (
                    <option key={it.id} value={it.id}>
                      {it.name} ({it.sku})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Target Warehouse *</label>
                <select
                  value={adjWhId}
                  onChange={e => setAdjWhId(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100"
                >
                  {warehouses.map(w => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Quantity Adjustment (+ or -) *</label>
                <input
                  type="number"
                  required
                  value={adjDiff}
                  onChange={e => setAdjDiff(Number(e.target.value))}
                  placeholder="e.g. 5 or -2"
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Reason / Justification *</label>
                <input
                  type="text"
                  required
                  value={adjReason}
                  onChange={e => setAdjReason(e.target.value)}
                  placeholder="e.g. Damaged in transit or physical audit surplus"
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAdjustmentModal(false)}
                  className="px-4 py-2 text-zinc-400 hover:text-zinc-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#d39e36] text-black font-semibold rounded-lg"
                >
                  Apply Stock Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== ADD ITEM MODAL ==================== */}
      {showAddItemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl p-6 text-zinc-100 text-xs space-y-4">
            <h2 className="text-sm font-semibold text-zinc-100">Add Item to Catalogue</h2>
            <form onSubmit={handleSaveItem} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">SKU / Item Code *</label>
                  <input
                    type="text"
                    required
                    value={newItemSku}
                    onChange={e => setNewItemSku(e.target.value)}
                    placeholder="e.g. HW-SCAN-01"
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Unit of Measure</label>
                  <input
                    type="text"
                    required
                    value={newItemUom}
                    onChange={e => setNewItemUom(e.target.value)}
                    placeholder="pcs, box, kg..."
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Item Title / Description *</label>
                <input
                  type="text"
                  required
                  value={newItemName}
                  onChange={e => setNewItemName(e.target.value)}
                  placeholder="e.g. Bluetooth Barcode Laser Scanner"
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Selling Price ($)</label>
                  <input
                    type="number"
                    value={newItemPrice}
                    onChange={e => setNewItemPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Cost Price ($)</label>
                  <input
                    type="number"
                    value={newItemCost}
                    onChange={e => setNewItemCost(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Reorder Alert Threshold</label>
                <input
                  type="number"
                  value={newItemReorder}
                  onChange={e => setNewItemReorder(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 font-mono"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddItemModal(false)}
                  className="px-4 py-2 text-zinc-400 hover:text-zinc-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#d39e36] text-black font-semibold rounded-lg"
                >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
