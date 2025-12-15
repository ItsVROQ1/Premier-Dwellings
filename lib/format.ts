export function formatCurrency(amount: number, currency: string = 'PKR'): string {
  if (currency === 'PKR') {
    if (amount >= 10000000) {
      return `PKR ${(amount / 10000000).toFixed(2)} Crore`;
    }
    if (amount >= 100000) {
      return `PKR ${(amount / 100000).toFixed(2)} Lac`;
    }
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatArea(area: number, unit: string = 'sqft'): string {
  return `${new Intl.NumberFormat('en-US').format(area)} ${unit}`;
}

export function convertSqftToMarla(sqft: number): number {
  return sqft / 272.25;
}

export function convertMarlaToSqft(marla: number): number {
  return marla * 272.25;
}
