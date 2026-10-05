import React from 'react';
import { Search, Filter, RotateCcw } from 'lucide-react';

export const AssetFilters = ({
  filters = {},
  onChange,
  onReset,
  searchTerm = '',
  onSearchChange,
}) => {
  return (
    <div className="bg-white p-4 rounded border border-[#DDE1E5] space-y-3">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search bar */}
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-[#5F6368] absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
            placeholder="Search by asset name, ID, or zone..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded border border-[#DDE1E5] focus:outline-none focus:border-[#168A44] bg-[#F7F8FA]"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
          {/* Asset Type */}
          <select
            value={filters.asset_type || ''}
            onChange={(e) => onChange({ ...filters, asset_type: e.target.value || undefined })}
            className="px-2.5 py-1.5 text-xs rounded border border-[#DDE1E5] bg-white focus:outline-none focus:border-[#168A44] text-[#1A1A1A]"
          >
            <option value="">All Asset Types</option>
            <option value="road">Roads</option>
            <option value="streetlight">Streetlights</option>
            <option value="bridge">Bridges</option>
          </select>

          {/* Risk Level */}
          <select
            value={filters.risk_level || ''}
            onChange={(e) => onChange({ ...filters, risk_level: e.target.value || undefined })}
            className="px-2.5 py-1.5 text-xs rounded border border-[#DDE1E5] bg-white focus:outline-none focus:border-[#168A44] text-[#1A1A1A]"
          >
            <option value="">All Risk Bands</option>
            <option value="CRITICAL">Critical (75-100)</option>
            <option value="HIGH">High (50-74)</option>
            <option value="MEDIUM">Medium (25-49)</option>
            <option value="LOW">Low (0-24)</option>
          </select>

          {/* Status */}
          <select
            value={filters.status || ''}
            onChange={(e) => onChange({ ...filters, status: e.target.value || undefined })}
            className="px-2.5 py-1.5 text-xs rounded border border-[#DDE1E5] bg-white focus:outline-none focus:border-[#168A44] text-[#1A1A1A]"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="UNDER_MAINTENANCE">Under Maintenance</option>
            <option value="INSPECTION_PENDING">Inspection Pending</option>
          </select>

          {/* Reset button */}
          {(filters.asset_type || filters.risk_level || filters.status || searchTerm) && (
            <button
              onClick={onReset}
              className="p-1.5 rounded hover:bg-gray-100 text-[#5F6368] hover:text-red-600 transition-colors"
              title="Reset Filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssetFilters;
