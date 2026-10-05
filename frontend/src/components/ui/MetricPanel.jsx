import React from 'react';

export const MetricPanel = ({
  label,
  value,
  subtext,
  delta,
  indicator,
  variant = 'light',
  className = ''
}) => {
  return (
    <div
      className={`p-4 bg-white border border-[#DDE1E5] rounded gov-card ${className}`}
    >
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#5F6368]">
          {label}
        </span>
        {indicator && <span>{indicator}</span>}
      </div>

      <div className="flex items-baseline space-x-2">
        <div className="text-2xl font-bold tracking-tight text-[#1A1A1A]">
          {value}
        </div>
        {delta && (
          <span className="text-xs text-[#5F6368] font-medium">
            {delta}
          </span>
        )}
      </div>

      {subtext && (
        <div className="text-xs mt-1 text-[#5F6368]">
          {subtext}
        </div>
      )}
    </div>
  );
};
