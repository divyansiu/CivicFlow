import React, { useState } from 'react';
import { DataTable } from '../ui/DataTable';
import { StatusBadge } from '../ui/StatusBadge';
import { Filter, ChevronRight, AlertTriangle } from 'lucide-react';
import { getRiskBadgeConfig, getActionRecommendation } from '../../utils/riskColor';

export const PriorityList = ({ assets = [], selectedAssetId, onSelectAsset }) => {
  const [filterType, setFilterType] = useState('ALL');

  const filteredAssets = (assets || []).filter((asset) => {
    if (filterType === 'ALL') return true;
    if (filterType === 'CRITICAL') return asset.risk_level === 'CRITICAL';
    if (filterType === 'HIGH') return asset.risk_level === 'HIGH';
    if (filterType === 'ROAD') return asset.asset_type === 'road';
    if (filterType === 'STREETLIGHT') return asset.asset_type?.startsWith('streetlight');
    if (filterType === 'BRIDGE') return asset.asset_type?.startsWith('bridge');
    return true;
  });

  const columns = [
    {
      header: 'PRIORITY',
      accessor: 'rank',
      headerClassName: 'w-14 sm:w-16 text-center',
      cellClassName: 'text-center font-semibold text-[#1A1A1A]',
      render: (row, index) => {
        const rank = row.rank || (index + 1);
        return (
          <span className={`inline-block px-2 py-0.5 text-xs font-bold rounded ${
            rank === 1 ? 'bg-red-600 text-white' : rank <= 3 ? 'bg-[#126B37] text-white' : 'bg-gray-100 text-[#5F6368]'
          }`}>
            #{rank}
          </span>
        );
      }
    },
    {
      header: 'ASSET NAME & TYPE',
      accessor: 'name',
      render: (row) => (
        <div className="min-w-[140px] max-w-[240px]">
          <div className="font-semibold text-[#1A1A1A] text-xs truncate">
            {row.name}
          </div>
          <div className="text-[11px] text-[#5F6368] mt-0.5 truncate">
            <span className="capitalize">{row.asset_type}</span> • {row.asset_id}
            {row.zone ? ` • ${row.zone}` : (row.location ? ` • ${row.location.split('(')[0]}` : '')}
          </div>
        </div>
      )
    },
    {
      header: 'RISK LEVEL',
      accessor: 'risk_level',
      render: (row) => <StatusBadge level={row.risk_level} size="xs" />
    },
    {
      header: 'SCORES (P / R / U / I)',
      accessor: 'priority_score',
      render: (row) => (
        <div className="text-xs space-y-0.5 font-mono">
          <div className="font-bold text-[#1A1A1A]">P: {Number(row.priority_score || 0).toFixed(1)}</div>
          <div className="text-[10px] text-[#5F6368]">
            R:{Number(row.risk_score || 0).toFixed(0)} U:{Number(row.urgency_score || 0).toFixed(0)} I:{Number(row.impact_score || 0).toFixed(0)}
          </div>
        </div>
      )
    },
    {
      header: 'RECOMMENDED ACTION',
      accessor: 'recommended_action',
      render: (row) => (
        <div className="text-xs text-[#1A1A1A] max-w-[180px] truncate" title={row.recommended_action || getActionRecommendation(row.risk_level)}>
          {row.recommended_action || getActionRecommendation(row.risk_level)}
        </div>
      )
    },
    {
      header: 'STATUS',
      accessor: 'status',
      render: (row) => (
        <span className="text-xs text-[#5F6368] bg-[#F7F8FA] px-2 py-0.5 rounded border border-[#DDE1E5] whitespace-nowrap">
          {row.status || 'ACTIVE'}
        </span>
      )
    },
    {
      header: '',
      accessor: 'action',
      headerClassName: 'w-10 text-right',
      cellClassName: 'text-right',
      render: (row) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelectAsset && onSelectAsset(row.asset_id);
          }}
          className="p-1 rounded hover:bg-gray-100 text-[#5F6368] hover:text-[#168A44] transition-colors"
          title="View Asset Details"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )
    }
  ];

  return (
    <div className="bg-white rounded border border-[#DDE1E5] overflow-hidden">
      {/* Header & Filter Controls */}
      <div className="p-4 border-b border-[#DDE1E5] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-[#168A44]" />
          <h2 className="font-bold text-sm text-[#1A1A1A]">Priority Maintenance Queue</h2>
          <span className="text-xs text-[#5F6368] font-mono">({filteredAssets.length} items)</span>
        </div>

        {/* Filter Badges */}
        <div className="flex items-center space-x-1 overflow-x-auto pb-1 sm:pb-0 text-xs">
          <Filter className="w-3.5 h-3.5 text-[#5F6368] mr-1 hidden sm:inline" />
          {['ALL', 'CRITICAL', 'HIGH', 'ROAD', 'STREETLIGHT', 'BRIDGE'].map((filter) => (
            <button
              key={filter}
              onClick={() => setFilterType(filter)}
              className={`px-2.5 py-1 rounded text-xs font-medium whitespace-nowrap transition-colors ${
                filterType === filter
                  ? 'bg-[#126B37] text-white shadow-xs'
                  : 'bg-gray-100 text-[#5F6368] hover:bg-gray-200'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={filteredAssets}
        onRowClick={(row) => onSelectAsset && onSelectAsset(row.asset_id)}
        highlightRowId={selectedAssetId}
        idKey="asset_id"
        emptyMessage="No prioritized infrastructure assets found matching current criteria."
      />

      <div className="p-2.5 bg-[#F7F8FA] border-t border-[#DDE1E5] text-[11px] text-[#5F6368] flex items-center justify-between">
        <span>Formula: <strong>Priority = 0.50 × Risk + 0.25 × Urgency + 0.25 × Impact</strong></span>
        <span>Standard weights</span>
      </div>
    </div>
  );
};

export default PriorityList;
