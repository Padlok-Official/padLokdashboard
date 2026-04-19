export function formatCurrency(amount: number | string, currency = 'NGN'): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '0.00';

  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(num);
}

export function maskAmount(_amount: string): string {
  return '****';
}
