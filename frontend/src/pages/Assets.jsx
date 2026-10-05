import React, { useState } from 'react';
import { AssetFilters } from '../components/assets/AssetFilters';
import { AssetTable } from '../components/assets/AssetTable';
import { AssetCard } from '../components/assets/AssetCard';
import { useAssets } from '../hooks/useAssets';
import { RefreshCw, LayoutGrid, List, Plus } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const Assets = ({ onSelectAsset }) => {
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'cards'
  const [searchTerm, setSearchTerm] = useState('');
  const { assets, total, loading, error, isLive, filters, updateFilters, refetch } = useAssets();

  const filteredAssets = assets.filter(a => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      a.name?.toLowerCase().includes(term) ||
      a.asset_id?.toLowerCase().includes(term) ||
      a.zone?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DDE1E5] pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1A1A1A]">
              Infrastructure Asset Registry
            </h1>
            {isLive ? (
              <span className="text-[10px] font-semibold bg-emerald-100 text-[#126B37] px-2 py-0.5 rounded border border-emerald-300">
                Connected
              </span>
            ) : (
              <span className="text-[10px] font-semibold bg-gray-100 text-[#5F6368] px-2 py-0.5 rounded border border-gray-300">
                Offline Records
              </span>
            )}
          </div>
          <p className="text-xs text-[#5F6368] mt-0.5">
            Catalogue of public road segments, streetlight grids, and bridges • Total catalogued: {total}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* View switcher */}
          <div className="flex items-center border border-[#DDE1E5] rounded p-0.5 bg-white">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1 rounded ${viewMode === 'table' ? 'bg-[#126B37] text-white' : 'text-[#5F6368] hover:text-[#1A1A1A]'}`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1 rounded ${viewMode === 'cards' ? 'bg-[#126B37] text-white' : 'text-[#5F6368] hover:text-[#1A1A1A]'}`}
              title="Card View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={refetch}
            disabled={loading}
            className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-medium text-[#5F6368] hover:text-[#168A44] hover:bg-gray-100 rounded border border-[#DDE1E5]"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#168A44]' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <AssetFilters
        filters={filters}
        onChange={updateFilters}
        onReset={() => {
          updateFilters({ asset_type: undefined, risk_level: undefined, status: undefined });
          setSearchTerm('');
        }}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      {/* Display Assets */}
      {viewMode === 'table' ? (
        <AssetTable
          assets={filteredAssets}
          onSelectAsset={onSelectAsset}
          loading={loading}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAssets.map(asset => (
            <AssetCard
              key={asset.asset_id}
              asset={asset}
              onSelect={onSelectAsset}
            />
          ))}
        </div>
      )}

      {/* Footer Info */}
      <div className="text-[11px] text-[#5F6368] p-3 bg-white rounded border border-[#DDE1E5] flex items-center justify-between">
        <span>Displaying {filteredAssets.length} matching infrastructure records</span>
        <span className="italic">Data derived from municipal inventory &amp; predictive decision models</span>
      </div>
    </div>
  );
};

export default Assets;
