import React from 'react';
import { getRiskBadgeConfig } from '../../utils/riskColor';

export const AssetMarker = ({ asset, isSelected, onClick }) => {
  if (!asset) return null;
  const config = getRiskBadgeConfig(asset.risk_level);

  return (
    <div
      onClick={() => onClick && onClick(asset.asset_id)}
      className={`cursor-pointer transition-transform transform ${
        isSelected ? 'scale-125 z-30' : 'hover:scale-110 z-10'
      }`}
      title={`${asset.name} (${asset.asset_id}) - ${asset.risk_level} Risk`}
    >
      <div
        className={`w-4 h-4 rounded-full border-2 border-white shadow-md flex items-center justify-center ${
          asset.risk_level === 'CRITICAL'
            ? 'bg-red-600'
            : asset.risk_level === 'HIGH'
            ? 'bg-orange-500'
            : asset.risk_level === 'MEDIUM'
            ? 'bg-amber-500'
            : 'bg-emerald-600'
        } ${isSelected ? 'ring-2 ring-emerald-500' : ''}`}
      />
    </div>
  );
};

export default AssetMarker;
