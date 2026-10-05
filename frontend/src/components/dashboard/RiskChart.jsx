import React from 'react';

export const RiskChart = ({ distribution = { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 } }) => {
  const bands = [
    { label: 'Low (0-24)', value: distribution.LOW || 0, color: '#168A44', hover: '#126B37' },
    { label: 'Medium (25-49)', value: distribution.MEDIUM || 0, color: '#F59E0B', hover: '#D97706' },
    { label: 'High (50-74)', value: distribution.HIGH || 0, color: '#F97316', hover: '#EA580C' },
    { label: 'Critical (75-100)', value: distribution.CRITICAL || 0, color: '#DC2626', hover: '#B91C1C' },
  ];

  const maxVal = Math.max(...bands.map(b => b.value), 1);

  return (
    <div className="bg-white p-4 rounded border border-[#DDE1E5]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider">
            Risk Band Distribution Chart
          </h3>
          <p className="text-[11px] text-[#5F6368]">Operational classification across active assets</p>
        </div>
      </div>

      <div className="space-y-3 pt-2">
        {bands.map((band) => {
          const percentage = (band.value / maxVal) * 100;
          return (
            <div key={band.label} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-medium text-[#1A1A1A]">{band.label}</span>
                <span className="font-mono font-bold text-[#1A1A1A]">{band.value}</span>
              </div>
              <div className="h-4 bg-gray-100 rounded-sm overflow-hidden">
                <div
                  className="h-full rounded-sm transition-all duration-500 ease-out"
                  style={{
                    width: `${Math.max(percentage, band.value > 0 ? 8 : 0)}%`,
                    backgroundColor: band.color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RiskChart;
