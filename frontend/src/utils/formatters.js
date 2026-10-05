/**
 * Formatting utilities for CivicFlow UI
 */

export const formatCurrency = (val) => {
  if (val === undefined || val === null) return '--';
  const num = Number(val);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(num);
};

export const formatDate = (dateStr) => {
  if (!dateStr) return '--';
  try {
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

export const formatAssetType = (type) => {
  if (!type) return 'Unknown';
  switch (type.toLowerCase()) {
    case 'road':
      return 'Roadway Corridor';
    case 'streetlight':
      return 'Streetlight Grid';
    case 'bridge':
      return 'Bridge / Flyover';
    default:
      return type.charAt(0).toUpperCase() + type.slice(1);
  }
};

export const formatScore = (num) => {
  if (num === undefined || num === null) return '--';
  return Number(num).toFixed(1);
};
