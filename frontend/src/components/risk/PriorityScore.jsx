import React from 'react';
import { getRiskBadgeConfig, getActionRecommendation } from '../../utils/riskColor';

export const PriorityScore = ({
  score = 0,
  riskScore = 0,
  urgencyScore = 0,
  impactScore = 0,
  rank,
  recommendedAction,
}) => {
  const numericScore = Number(score) || 0;
  const config = getRiskBadgeConfig(numericScore >= 75 ? 'CRITICAL' : numericScore >= 50 ? 'HIGH' : numericScore >= 25 ? 'MEDIUM' : 'LOW');
  const action = recommendedAction || getActionRecommendation(numericScore);

  return (
    <div className="bg-white p-4 rounded border border-[#DDE1E5] space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-[11px] font-semibold text-[#5F6368] uppercase tracking-wider block">
            Composite Priority Score
          </span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-3xl font-bold font-mono text-[#1A1A1A]">
              {numericScore.toFixed(1)}
            </span>
            {rank && (
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-[#126B37] text-white">
                Queue Rank #{rank}
              </span>
            )}
          </div>
        </div>

        <span className={`text-xs font-bold px-2.5 py-1 rounded border uppercase ${config.bg}`}>
          {config.label}
        </span>
      </div>

      {/* Recommended Action */}
      <div className="p-2.5 bg-[#F7F8FA] rounded border border-[#DDE1E5] text-xs">
        <span className="text-[#5F6368] block font-medium mb-0.5">Prototype Action Recommendation:</span>
        <span className="font-semibold text-[#1A1A1A]">{action}</span>
      </div>

      {/* Formula breakdown */}
      <div className="pt-2 border-t border-gray-100 text-[11px] text-[#5F6368] space-y-1">
        <div className="flex justify-between font-mono">
          <span>0.50 × Risk ({Number(riskScore).toFixed(0)})</span>
          <span>+</span>
          <span>0.25 × Urgency ({Number(urgencyScore).toFixed(0)})</span>
          <span>+</span>
          <span>0.25 × Impact ({Number(impactScore).toFixed(0)})</span>
        </div>
        <div className="text-[10px] italic text-[#5F6368]">
          * Prototype policy weights (configurable design parameters)
        </div>
      </div>
    </div>
  );
};

export default PriorityScore;
