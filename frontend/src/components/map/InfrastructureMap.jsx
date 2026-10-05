import React, { useState } from 'react';
import { MapPin, Layers } from 'lucide-react';
import { StatusBadge } from '../ui/StatusBadge';

export const InfrastructureMap = ({ assets, selectedAssetId, onSelectAsset }) => {
  const [activeLayer, setActiveLayer] = useState('ALL');
  
  const visibleAssets = assets.filter(a => {
    if (activeLayer === 'ALL') return true;
    if (activeLayer === 'CRITICAL') return a.risk_level === 'CRITICAL';
    if (activeLayer === 'ROADS') return a.asset_type === 'road';
    if (activeLayer === 'STREETLIGHTS') return a.asset_type === 'streetlights';
    return true;
  });

  return (
    <div className="gov-card p-0 overflow-hidden bg-white border border-[#DDE1E5] flex flex-col h-[520px]">
      {/* Top Map Console Bar */}
      <div className="p-3 bg-[#F7F8FA] border-b border-[#DDE1E5] flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center space-x-2">
          <MapPin className="w-4 h-4 text-[#168A44]" />
          <span className="font-semibold text-[#1A1A1A]">
            Infrastructure Map View
          </span>
          <span className="text-xs text-[#5F6368] hidden sm:inline">
            • North & Central District
          </span>
        </div>

        <div className="flex items-center space-x-1.5">
          {[
            { id: 'ALL', label: 'All' },
            { id: 'CRITICAL', label: 'High Risk' },
            { id: 'ROADS', label: 'Roads' },
            { id: 'STREETLIGHTS', label: 'Streetlights' }
          ].map((layer) => (
            <button
              key={layer.id}
              onClick={() => setActiveLayer(layer.id)}
              className={`px-2.5 py-1 text-xs rounded transition-colors ${
                activeLayer === layer.id
                  ? 'bg-[#168A44] text-white font-medium'
                  : 'bg-white text-[#5F6368] hover:bg-gray-100 border border-[#DDE1E5]'
              }`}
            >
              {layer.label}
            </button>
          ))}
        </div>
      </div>

      {/* Map Canvas / Subtle modern map look with clean light styling */}
      <div className="relative flex-1 bg-[#EEF2F6] overflow-hidden flex items-center justify-center p-6">
        {/* Map Legend */}
        <div className="absolute top-3 right-3 text-xs text-[#1A1A1A] bg-white/95 px-3 py-1.5 rounded border border-[#DDE1E5] shadow-sm flex items-center space-x-3">
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block"></span>
            <span>Critical</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block"></span>
            <span>High Risk</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#168A44] inline-block"></span>
            <span>Healthy</span>
          </span>
        </div>

        {/* Vectorized Spatial Grid & Nodes */}
        <div className="relative w-full h-full max-w-2xl max-h-96 rounded border border-[#DDE1E5] bg-white shadow-sm p-4">
          {/* Subtle Sector Arterials */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" xmlns="http://www.w3.org/2000/svg">
            <line x1="10%" y1="20%" x2="90%" y2="80%" stroke="#168A44" strokeWidth="2" strokeDasharray="6 4" />
            <line x1="20%" y1="85%" x2="80%" y2="15%" stroke="#168A44" strokeWidth="2" strokeDasharray="6 4" />
            <circle cx="50%" cy="50%" r="90" stroke="#5F6368" strokeWidth="1" fill="none" />
            <circle cx="50%" cy="50%" r="140" stroke="#5F6368" strokeWidth="0.75" strokeDasharray="4 4" fill="none" />
          </svg>

          {/* Asset Interactive Nodes */}
          {visibleAssets.map((asset, index) => {
            const isSelected = selectedAssetId === asset.asset_id;
            
            const positions = [
              { top: '35%', left: '48%' }, // RD-021
              { top: '65%', left: '72%' }, // RD-014
              { top: '22%', left: '38%' }, // RD-038
              { top: '55%', left: '18%' }, // RD-005
              { top: '70%', left: '78%' }, // SL-104
              { top: '18%', left: '80%' }, // RD-052
              { top: '78%', left: '42%' }  // BR-003
            ];

            const pos = positions[index % positions.length];
            const isCritical = asset.risk_level === 'CRITICAL';
            const isHigh = asset.risk_level === 'HIGH';

            return (
              <div
                key={asset.asset_id}
                onClick={() => onSelectAsset(asset.asset_id)}
                style={{ top: pos.top, left: pos.left }}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all ${
                  isSelected ? 'z-30 scale-110' : 'z-10 hover:scale-105'
                }`}
              >
                {/* Node pin */}
                <div
                  className={`px-2 py-1 rounded border flex items-center space-x-1.5 text-xs shadow-sm ${
                    isSelected
                      ? 'bg-[#168A44] text-white border-[#126B37] ring-2 ring-emerald-300 font-semibold'
                      : isCritical
                      ? 'bg-red-50 text-red-700 border-red-300 font-medium'
                      : isHigh
                      ? 'bg-orange-50 text-orange-700 border-orange-300 font-medium'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-300 font-medium'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full inline-block ${
                      isSelected ? 'bg-white' : isCritical ? 'bg-red-600' : isHigh ? 'bg-orange-500' : 'bg-[#168A44]'
                    }`}
                  />
                  <span>{asset.name.split('—')[0].split('-')[0].trim()}</span>
                </div>

                {/* Selected tooltip preview */}
                {isSelected && (
                  <div className="absolute left-1/2 transform -translate-x-1/2 top-full mt-2 w-52 bg-white text-[#1A1A1A] rounded border border-[#DDE1E5] p-2.5 text-xs z-40 pointer-events-none shadow-md">
                    <div className="font-semibold truncate">{asset.name}</div>
                    <div className="text-[#5F6368] mt-0.5">Priority #{asset.rank} • {asset.status}</div>
                    <div className="text-[#168A44] font-medium mt-1 truncate">{asset.recommended_action}</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom map status prompt */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-[#5F6368] bg-white/95 px-3 py-1.5 rounded border border-[#DDE1E5] shadow-sm">
          <span>Click on any location pin to see maintenance details</span>
          <span className="font-medium text-[#168A44]">Map Ready</span>
        </div>
      </div>
    </div>
  );
};
