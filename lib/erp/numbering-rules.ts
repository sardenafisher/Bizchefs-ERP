// Document Sequence & Numbering Rules (Pure logic, tested via node:test)

export function formatDocumentNumber(prefix: string, nextNumber: number, padding: number = 4): string {
  const padded = String(Math.max(1, nextNumber)).padStart(padding, '0');
  const cleanPrefix = prefix.trim();
  if (cleanPrefix.endsWith('-') || cleanPrefix.endsWith('/')) {
    return `${cleanPrefix}${padded}`;
  }
  return `${cleanPrefix}-${padded}`;
}

export function parseDocumentSequence(docNumber: string): { prefix: string; sequenceNumber: number } | null {
  const match = docNumber.match(/^(.+?)[-/]?(\d+)$/);
  if (!match) return null;
  return {
    prefix: match[1],
    sequenceNumber: parseInt(match[2], 10)
  };
}
