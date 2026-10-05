import React from 'react';
import { getRiskBadgeConfig } from '../../utils/riskColor';

export const RiskDistribution = ({ distribution = { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 } }) => {
  const total = (distribution.LOW || 0) + (distribution.MEDIUM || 0) + (distribution.HIGH || 0) + (distribution.CRITICAL || 0);

  const bands = [
    { key: 'CRITICAL', label: 'CRITICAL (75-100)', count: distribution.CRITICAL || 0, color: 'bg-red-600', text: 'text-red-700', action: 'Immediate inspection / dispatch' },
    { key: 'HIGH', label: 'HIGH (50-74)', count: distribution.HIGH || 0, color: 'bg-orange-500', text: 'text-orange-700', action: 'Priority inspection' },
    { key: 'MEDIUM', label: 'MEDIUM (25-49)', count: distribution.MEDIUM || 0, color: 'bg-amber-500', text: 'text-amber-800', action: 'Inspect / plan maintenance' },
    { key: 'LOW', label: 'LOW (0-24)', count: distribution.LOW || 0, color: 'bg-emerald-600', text: 'text-emerald-700', action: 'Routine monitoring' },
  ];

  return (
    <div className="bg-white p-4 rounded border border-[#DDE1E5]">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider">
          Risk Distribution Breakdown
        </h3>
        <span className="text-xs text-[#5F6368] font-mono">
          Total: {total} Assets
        </span>
      </div>

      {/* Multi-segment progress bar */}
      <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden flex mb-4">
        {total > 0 ? (
          bands.map((band) => {
            const pct = (band.count / total) * 100;
            if (pct === 0) return null;
            return (
              <div
                key={band.key}
                style={{ width: `${pct}%` }}
                className={`${band.color} h-full transition-all`}
                title={`${band.key}: ${band.count} (${pct.toFixed(0)}%)`}
              />
            );
          })
        ) : (
          <div className="w-full bg-gray-200 h-full" />
        )}
      </div>

      {/* Detailed rows */}
      <div className="space-y-2">
        {bands.map((band) => {
          const pct = total > 0 ? Math.round((band.count / total) * 100) : 0;
          return (
            <div key={band.key} className="flex items-center justify-between text-xs py-1 border-b border-gray-50 last:border-0">
              <div className="flex items-center space-x-2">
                <span className={`w-2.5 h-2.5 rounded-full ${band.color}`} />
                <span className="font-semibold text-[#1A1A1A]">{band.label}</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-[11px] text-[#5F6368] hidden sm:inline italic">
                  {band.action}
                </span>
                <span className="font-mono font-bold text-[#1A1A1A]">
                  {band.count} <span className="text-[#5F6368] font-normal font-sans">({pct}%)</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RiskDistribution;
