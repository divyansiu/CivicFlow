import React from 'react';
import { getRiskBadgeConfig } from '../../utils/riskColor';

export const RiskScore = ({ score = 0, level, showLabel = true }) => {
  const numericScore = Number(score) || 0;
  const config = getRiskBadgeConfig(level || (numericScore >= 75 ? 'CRITICAL' : numericScore >= 50 ? 'HIGH' : numericScore >= 25 ? 'MEDIUM' : 'LOW'));

  return (
    <div className="flex flex-col">
      {showLabel && (
        <span className="text-[11px] font-semibold text-[#5F6368] uppercase tracking-wider mb-1">
          Risk Score (0-100)
        </span>
      )}
      <div className="flex items-center space-x-2">
        <span className="text-2xl font-bold font-mono text-[#1A1A1A]">
          {numericScore.toFixed(1)}
        </span>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${config.bg}`}>
          {config.label}
        </span>
      </div>
      <p className="text-[11px] text-[#5F6368] mt-1 italic">
        Model-estimated likelihood of near-term maintenance need
      </p>
    </div>
  );
};

export default RiskScore;
