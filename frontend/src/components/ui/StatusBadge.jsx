import React from 'react';
import { getRiskBadgeConfig } from '../../utils/riskColor';

export const StatusBadge = ({ level, label, size = 'sm', className = '' }) => {
  const config = getRiskBadgeConfig(level);
  const displayLabel = label || config.label;

  const sizeClasses = {
    xs: 'px-2 py-0.5 text-[11px]',
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-3 py-1 text-xs'
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium border rounded ${config.bg} ${config.border || ''} ${sizeClasses[size]} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <span>{displayLabel}</span>
    </span>
  );
};
