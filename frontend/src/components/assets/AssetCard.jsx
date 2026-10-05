import React from 'react';
import { StatusBadge } from '../ui/StatusBadge';
import { formatAssetType } from '../../utils/formatters';
import { getActionRecommendation } from '../../utils/riskColor';
import { ChevronRight, MapPin } from 'lucide-react';

export const AssetCard = ({ asset, isSelected, onSelect }) => {
  if (!asset) return null;

  return (
    <div
      onClick={() => onSelect && onSelect(asset.asset_id)}
      className={`p-4 bg-white rounded border cursor-pointer transition-all ${
        isSelected
          ? 'border-[#168A44] ring-1 ring-[#168A44] shadow-xs'
          : 'border-[#DDE1E5] hover:border-gray-300'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-mono text-xs font-bold text-[#168A44]">
              {asset.asset_id}
            </span>
            <span className="text-[11px] text-[#5F6368]">
              {formatAssetType(asset.asset_type)}
            </span>
          </div>
          <h4 className="font-semibold text-sm text-[#1A1A1A] mt-1 line-clamp-1">
            {asset.name}
          </h4>
        </div>
        <StatusBadge level={asset.risk_level} size="xs" />
      </div>

      <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-gray-100 text-xs">
        <div>
          <span className="text-[10px] text-[#5F6368] block">Condition</span>
          <span className="font-mono font-bold text-[#1A1A1A]">
            {Number(asset.condition_score || 0).toFixed(0)}/100
          </span>
        </div>
        <div>
          <span className="text-[10px] text-[#5F6368] block">Priority</span>
          <span className="font-mono font-bold text-[#126B37]">
            {Number(asset.priority_score || 0).toFixed(1)}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-[#5F6368] block">Risk</span>
          <span className="font-mono font-bold text-[#1A1A1A]">
            {Number(asset.risk_score || 0).toFixed(1)}
          </span>
        </div>
      </div>

      <div className="mt-3 pt-2 border-t border-gray-50 flex items-center justify-between text-[11px] text-[#5F6368]">
        <span className="truncate max-w-[200px]">
          {asset.recommended_action || getActionRecommendation(asset.risk_level)}
        </span>
        <ChevronRight className="w-3.5 h-3.5 text-[#5F6368] shrink-0" />
      </div>
    </div>
  );
};

export default AssetCard;
