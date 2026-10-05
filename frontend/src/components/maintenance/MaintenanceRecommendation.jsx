import React from 'react';
import { ShieldCheck, AlertTriangle, Clock, Banknote, ArrowRight } from 'lucide-react';
import { getRiskBadgeConfig, getActionRecommendation } from '../../utils/riskColor';

export const MaintenanceRecommendation = ({ asset, onSimulate, onExecuteAction }) => {
  if (!asset) return null;

  const action = asset.recommended_action || getActionRecommendation(asset.risk_level || asset.priority_score);
  const badgeConfig = getRiskBadgeConfig(asset.risk_level);

  return (
    <div className="bg-white rounded border border-[#DDE1E5] p-5 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-[11px] font-semibold text-[#5F6368] uppercase tracking-wider block">
            Decision Recommendation
          </span>
          <h3 className="text-base font-bold text-[#1A1A1A] mt-1">
            {action}
          </h3>
        </div>
        <span className={`text-xs font-bold px-2.5 py-1 rounded border uppercase ${badgeConfig.bg}`}>
          {badgeConfig.label}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="p-3 bg-[#F7F8FA] rounded border border-gray-100 flex items-start space-x-2.5">
          <Clock className="w-4 h-4 text-[#168A44] shrink-0 mt-0.5" />
          <div>
            <span className="text-[11px] text-[#5F6368] block">Target Intervention Window</span>
            <span className="font-semibold text-[#1A1A1A]">
              {asset.risk_level === 'CRITICAL' ? 'Within 48-72 Hours' : asset.risk_level === 'HIGH' ? 'Within 7 Days' : 'Next Routine Cycle (30 Days)'}
            </span>
            <span className="text-[10px] text-[#5F6368] block mt-0.5 italic">Prototype policy rule</span>
          </div>
        </div>

        <div className="p-3 bg-[#F7F8FA] rounded border border-gray-100 flex items-start space-x-2.5">
          <Banknote className="w-4 h-4 text-[#168A44] shrink-0 mt-0.5" />
          <div>
            <span className="text-[11px] text-[#5F6368] block">Estimated Cost Band</span>
            <span className="font-semibold text-[#1A1A1A]">
              {asset.cost_estimate_band || (asset.risk_level === 'CRITICAL' ? 'Band 3 (₹4.2L - ₹6.5L)' : 'Band 2 (₹1.5L - ₹3.0L)')}
            </span>
            <span className="text-[10px] text-[#5F6368] block mt-0.5 italic">Estimated budget impact</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100">
        {onSimulate && (
          <button
            onClick={() => onSimulate(asset)}
            className="px-3 py-1.5 rounded text-xs font-medium bg-[#F7F8FA] text-[#168A44] border border-[#168A44] hover:bg-emerald-50 transition-colors"
          >
            Run What-If Simulation
          </button>
        )}
        {onExecuteAction && (
          <button
            onClick={() => onExecuteAction(asset)}
            className="px-3.5 py-1.5 rounded text-xs font-medium bg-[#126B37] text-white hover:bg-[#0E522A] transition-colors flex items-center space-x-1"
          >
            <span>Dispatch Work Order</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default MaintenanceRecommendation;
