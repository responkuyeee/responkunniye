/**
 * Deterministic number formatters to prevent SSR / Client hydration mismatch.
 * Standard Indonesian formatting: thousand separator '.' and decimal ','
 */

export function formatNumber(num: number): string {
  if (num === null || num === undefined || isNaN(num)) return '0';
  const isNegative = num < 0;
  const abs = Math.abs(Math.round(num));
  const formatted = abs.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return isNegative ? `-${formatted}` : formatted;
}

export function formatCurrencyIdr(num: number): string {
  return `Rp${formatNumber(num)}`;
}

export function formatToken(num: number): string {
  if (num === null || num === undefined || isNaN(num)) return '0';
  const isNegative = num < 0;
  const abs = Math.abs(num);
  const parts = abs.toString().split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const result = parts.length > 1 ? `${parts[0]},${parts[1]}` : parts[0];
  return isNegative ? `-${result}` : result;
}
