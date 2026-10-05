/**
 * Risk, Priority, and Operational Status styling and labeling
 * Adheres strictly to PS04 PRD Section 5.5 and Member 3 backend API contracts:
 * - 0–24: LOW -> "Routine monitoring"
 * - 25–49: MEDIUM -> "Inspect / plan maintenance"
 * - 50–74: HIGH -> "Priority inspection"
 * - 75–100: CRITICAL -> "Immediate inspection / dispatch"
 */

export const getRiskBandFromScore = (score) => {
  const val = Number(score) || 0;
  if (val >= 75) return 'CRITICAL';
  if (val >= 50) return 'HIGH';
  if (val >= 25) return 'MEDIUM';
  return 'LOW';
};

export const getActionRecommendation = (riskOrPriority) => {
  const band = typeof riskOrPriority === 'string' 
    ? riskOrPriority.toUpperCase() 
    : getRiskBandFromScore(riskOrPriority);

  switch (band) {
    case 'CRITICAL':
      return 'Immediate inspection / dispatch';
    case 'HIGH':
      return 'Priority inspection';
    case 'MEDIUM':
      return 'Inspect / plan maintenance';
    case 'LOW':
    default:
      return 'Routine monitoring';
  }
};

export const getRiskBadgeConfig = (level) => {
  switch (level?.toUpperCase()) {
    case 'CRITICAL':
      return {
        bg: 'bg-red-50 text-red-700 border-red-200',
        dot: 'bg-red-600',
        label: 'CRITICAL',
        badgeBg: 'bg-red-600 text-white',
        action: 'Immediate inspection / dispatch',
      };
    case 'HIGH':
      return {
        bg: 'bg-orange-50 text-orange-700 border-orange-200',
        dot: 'bg-orange-500',
        label: 'HIGH',
        badgeBg: 'bg-orange-500 text-white',
        action: 'Priority inspection',
      };
    case 'MEDIUM':
      return {
        bg: 'bg-amber-50 text-amber-800 border-amber-200',
        dot: 'bg-amber-500',
        label: 'MEDIUM',
        badgeBg: 'bg-amber-500 text-white',
        action: 'Inspect / plan maintenance',
      };
    case 'LOW':
    default:
      return {
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        dot: 'bg-emerald-600',
        label: 'LOW',
        badgeBg: 'bg-emerald-600 text-white',
        action: 'Routine monitoring',
      };
  }
};

export const getStatusBadgeConfig = (status) => {
  switch (status?.toUpperCase()) {
    case 'ACTIVE':
      return {
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        label: 'ACTIVE',
      };
    case 'UNDER_MAINTENANCE':
    case 'IN_PROGRESS':
      return {
        bg: 'bg-blue-50 text-blue-700 border-blue-200',
        label: 'UNDER MAINTENANCE',
      };
    case 'INSPECTION_PENDING':
    case 'REQUIRES_ATTENTION':
      return {
        bg: 'bg-amber-50 text-amber-800 border-amber-200',
        label: 'INSPECTION PENDING',
      };
    case 'DECOMMISSIONED':
      return {
        bg: 'bg-gray-100 text-gray-700 border-gray-300',
        label: 'DECOMMISSIONED',
      };
    default:
      return {
        bg: 'bg-gray-50 text-gray-700 border-gray-200',
        label: status || 'ACTIVE',
      };
  }
};

export const formatScore = (num) => {
  if (num === undefined || num === null) return '--';
  return typeof num === 'number' ? num.toFixed(1) : Number(num).toFixed(1);
};
