// Inventory Rules & Stock Balance Math (Pure logic, tested via node:test)
import { roundCurrency } from './accounting-rules';

export interface StockEntry {
  itemId: string;
  warehouseId: string;
  toWarehouseId?: string;
  movementType: 'receipt' | 'issue' | 'transfer' | 'adjustment';
  quantity: number;
  unitCost: number;
}

export function computeStockBalanceForWarehouse(
  movements: StockEntry[],
  itemId: string,
  warehouseId: string
): {
  quantityOnHand: number;
  totalCostValue: number;
  averageUnitCost: number;
} {
  let qty = 0;
  let totalCost = 0;

  for (const m of movements) {
    if (m.itemId !== itemId) continue;

    if (m.warehouseId === warehouseId) {
      if (m.movementType === 'receipt') {
        qty += m.quantity;
        totalCost += m.quantity * m.unitCost;
      } else if (m.movementType === 'issue') {
        qty -= m.quantity;
        totalCost -= m.quantity * (qty > 0 && totalCost > 0 ? totalCost / (qty + m.quantity) : m.unitCost);
      } else if (m.movementType === 'adjustment') {
        // Positive quantity increases stock, negative decreases
        qty += m.quantity;
        totalCost += m.quantity * m.unitCost;
      } else if (m.movementType === 'transfer') {
        // Transferred OUT from this warehouse
        qty -= m.quantity;
        totalCost -= m.quantity * m.unitCost;
      }
    } else if (m.movementType === 'transfer' && m.toWarehouseId === warehouseId) {
      // Transferred IN to this warehouse
      qty += m.quantity;
      totalCost += m.quantity * m.unitCost;
    }
  }

  const finalQty = Math.max(0, roundCurrency(qty));
  const finalCost = Math.max(0, roundCurrency(totalCost));
  const averageCost = finalQty > 0 ? roundCurrency(finalCost / finalQty) : 0;

  return {
    quantityOnHand: finalQty,
    totalCostValue: finalCost,
    averageUnitCost: averageCost
  };
}

export function canIssueStock(currentQty: number, requestedQty: number, allowNegativeStock: boolean = false): {
  allowed: boolean;
  remainingQty: number;
  errorMessage?: string;
} {
  if (requestedQty <= 0) {
    return {
      allowed: false,
      remainingQty: currentQty,
      errorMessage: 'Requested quantity must be greater than zero.'
    };
  }

  if (!allowNegativeStock && currentQty < requestedQty) {
    return {
      allowed: false,
      remainingQty: currentQty,
      errorMessage: `Insufficient stock. Requested ${requestedQty}, but only ${currentQty} units available in selected warehouse.`
    };
  }

  return {
    allowed: true,
    remainingQty: roundCurrency(currentQty - requestedQty)
  };
}
