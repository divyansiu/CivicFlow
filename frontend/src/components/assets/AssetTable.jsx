import React from 'react';
import { DataTable } from '../ui/DataTable';
import { StatusBadge } from '../ui/StatusBadge';
import { ChevronRight } from 'lucide-react';
import { formatAssetType } from '../../utils/formatters';
import { getActionRecommendation } from '../../utils/riskColor';

export const AssetTable = ({
  assets = [],
  selectedAssetId,
  onSelectAsset,
  loading = false,
}) => {
  const columns = [
    {
      header: 'ASSET ID',
      accessor: 'asset_id',
      cellClassName: 'font-mono text-xs font-bold text-[#168A44]',
      render: (row) => <span>{row.asset_id}</span>,
    },
    {
      header: 'NAME & TYPE',
      accessor: 'name',
      render: (row) => (
        <div>
          <div className="font-semibold text-xs text-[#1A1A1A]">{row.name}</div>
          <div className="text-[11px] text-[#5F6368]">
            {formatAssetType(row.asset_type)}
            {row.zone ? ` • ${row.zone}` : ''}
          </div>
        </div>
      ),
    },
    {
      header: 'CONDITION',
      accessor: 'condition_score',
      cellClassName: 'font-mono text-xs',
      render: (row) => (
        <span>{Number(row.condition_score || 0).toFixed(0)}/100</span>
      ),
    },
    {
      header: 'RISK LEVEL',
      accessor: 'risk_level',
      render: (row) => <StatusBadge level={row.risk_level} size="xs" />,
    },
    {
      header: 'PRIORITY SCORE',
      accessor: 'priority_score',
      cellClassName: 'font-mono text-xs font-bold text-[#126B37]',
      render: (row) => (
        <span>{row.priority_score !== undefined ? Number(row.priority_score).toFixed(1) : '--'}</span>
      ),
    },
    {
      header: 'RECOMMENDED ACTION',
      accessor: 'recommended_action',
      render: (row) => (
        <span className="text-xs text-[#1A1A1A] max-w-[200px] truncate block" title={row.recommended_action || getActionRecommendation(row.risk_level)}>
          {row.recommended_action || getActionRecommendation(row.risk_level)}
        </span>
      ),
    },
    {
      header: 'STATUS',
      accessor: 'status',
      render: (row) => (
        <span className="text-xs px-2 py-0.5 rounded bg-[#F7F8FA] border border-[#DDE1E5] text-[#5F6368]">
          {row.status || 'ACTIVE'}
        </span>
      ),
    },
    {
      header: '',
      accessor: 'action',
      cellClassName: 'text-right',
      render: (row) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelectAsset && onSelectAsset(row.asset_id);
          }}
          className="p-1 rounded hover:bg-gray-100 text-[#5F6368] hover:text-[#168A44]"
          title="View Details"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="bg-white rounded border border-[#DDE1E5] overflow-hidden">
      <DataTable
        columns={columns}
        data={assets}
        onRowClick={(row) => onSelectAsset && onSelectAsset(row.asset_id)}
        highlightRowId={selectedAssetId}
        idKey="asset_id"
        emptyMessage={loading ? 'Loading assets...' : 'No infrastructure assets found.'}
      />
    </div>
  );
};

export default AssetTable;
