// Tax and monetary calculations (Pure logic, tested via node:test)
import { roundCurrency } from './accounting-rules';

export interface CalculatedLine {
  quantity: number;
  unitPrice: number;
  taxRate: number;
  subtotal: number;
  taxAmount: number;
  lineTotal: number;
}

export function calculateLineTotals(quantity: number, unitPrice: number, taxRate: number = 0): CalculatedLine {
  const qty = Math.max(0, Number(quantity) || 0);
  const price = Math.max(0, Number(unitPrice) || 0);
  const rate = Math.max(0, Number(taxRate) || 0);

  const subtotal = roundCurrency(qty * price);
  const taxAmount = roundCurrency((subtotal * rate) / 100);
  const lineTotal = roundCurrency(subtotal + taxAmount);

  return {
    quantity: qty,
    unitPrice: price,
    taxRate: rate,
    subtotal,
    taxAmount,
    lineTotal
  };
}

export function calculateOrderTotals(lines: { quantity: number; unitPrice: number; taxRate: number }[]): {
  subtotal: number;
  taxTotal: number;
  grandTotal: number;
  lineItemsCount: number;
} {
  let subtotal = 0;
  let taxTotal = 0;

  for (const line of lines) {
    const calc = calculateLineTotals(line.quantity, line.unitPrice, line.taxRate);
    subtotal += calc.subtotal;
    taxTotal += calc.taxAmount;
  }

  subtotal = roundCurrency(subtotal);
  taxTotal = roundCurrency(taxTotal);
  const grandTotal = roundCurrency(subtotal + taxTotal);

  return {
    subtotal,
    taxTotal,
    grandTotal,
    lineItemsCount: lines.length
  };
}
