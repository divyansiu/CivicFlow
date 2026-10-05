import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  AlertTriangle, 
  ShieldAlert, 
  Activity, 
  Wrench, 
  CheckCircle2, 
  ArrowRight,
  RefreshCw,
  MapPin,
  ExternalLink
} from 'lucide-react';
import { StatCard } from '../components/dashboard/StatCard';
import { RiskDistribution } from '../components/dashboard/RiskDistribution';
import { RiskChart } from '../components/dashboard/RiskChart';
import { PriorityList } from '../components/dashboard/PriorityList';
import { InfrastructureMap } from '../components/map/InfrastructureMap';
import dashboardService from '../services/dashboardService';
import assetService from '../services/assetService';
import { SEED_ASSETS } from '../data/mockData';
import { formatScore } from '../utils/riskColor';

export const Dashboard = ({ onSelectAsset, onExploreMap }) => {
  const [metrics, setMetrics] = useState(null);
  const [priorityQueue, setPriorityQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAssetId, setSelectedAssetId] = useState('RD-021');

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [dashRes, queueRes] = await Promise.all([
        dashboardService.getDashboardSummary(),
        assetService.getPriorities(10)
      ]);
      setMetrics(dashRes);
      setPriorityQueue(queueRes.items || []);
      if (dashRes.top_priority_asset) {
        setSelectedAssetId(dashRes.top_priority_asset.asset_id);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const topAsset = metrics?.top_priority_asset || priorityQueue[0] || SEED_ASSETS[0];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DDE1E5] pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1A1A1A]">
              Infrastructure Overview
            </h1>
            {metrics?.isLive ? (
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
            Maintenance Operations & Planning • Public Works Division
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={loadData}
            disabled={loading}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-[#5F6368] hover:text-[#168A44] hover:bg-gray-100 rounded border border-[#DDE1E5] transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#168A44]' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <StatCard
          title="TOTAL ASSETS"
          value={metrics ? metrics.total_assets : '--'}
          icon={Building2}
          subtext="Catalogued corridors & grids"
          variant="neutral"
        />
        <StatCard
          title="IN PROGRESS"
          value={metrics ? (metrics.in_progress_count ?? metrics.under_maintenance_count) : '--'}
          icon={Wrench}
          subtext="Active repair crews"
          variant="warning"
        />
        <StatCard
          title="COMPLETED WORK"
          value={metrics ? (metrics.completed_work_count ?? 136) : '--'}
          icon={CheckCircle2}
          subtext="Repairs executed"
          variant="success"
        />
        <StatCard
          title="CRITICAL RISK"
          value={metrics ? metrics.critical_risk_count : '--'}
          icon={AlertTriangle}
          subtext="Score ≥ 75 (Immediate action)"
          variant="critical"
        />
        <StatCard
          title="HIGH RISK"
          value={metrics ? metrics.high_risk_count : '--'}
          icon={ShieldAlert}
          subtext="Score 50-74 (Priority review)"
          variant="warning"
        />
      </div>

      {/* Top Priority Direct Action Card (PRD Section 9.1 requirement) */}
      {topAsset && (
        <div className="p-4 bg-red-50/50 border border-red-200 rounded flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-white bg-red-600 px-2 py-0.5 rounded">
                #1 ACTION REQUIRED
              </span>
              <span className="font-mono text-xs font-bold text-red-700">
                {topAsset.asset_id}
              </span>
              <span className="text-xs text-[#5F6368] capitalize">
                {topAsset.asset_type}
              </span>
            </div>
            <h3 className="font-bold text-sm text-[#1A1A1A]">
              {topAsset.name}
            </h3>
            <p className="text-xs text-[#5F6368]">
              Recommendation: <strong className="text-red-700">{topAsset.recommended_action || 'Immediate inspection / dispatch'}</strong>
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <div className="text-right text-xs hidden sm:block">
              <div className="font-mono font-bold text-red-700 text-base">
                Priority: {Number(topAsset.priority_score || 0).toFixed(1)}
              </div>
              <div className="text-[11px] text-[#5F6368]">
                Risk: {Number(topAsset.risk_score || 0).toFixed(1)} | Cond: {Number(topAsset.condition_score || 0).toFixed(0)}/100
              </div>
            </div>

            <button
              onClick={() => onSelectAsset && onSelectAsset(topAsset.asset_id)}
              className="px-3.5 py-2 text-xs font-semibold bg-red-600 text-white hover:bg-red-700 rounded transition-colors flex items-center space-x-1"
            >
              <span>View Asset Details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Center Grid: Risk Distribution and Risk Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RiskDistribution distribution={metrics?.risk_distribution} />
        <RiskChart distribution={metrics?.risk_distribution} />
      </div>

      {/* GIS Map & Priority Queue Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-[#168A44]" />
            <h2 className="font-bold text-sm text-[#1A1A1A]">Map View</h2>
          </div>
          <span className="text-xs text-[#5F6368]">
            Color-coded risk pins • Click pin or card to inspect
          </span>
        </div>

        <InfrastructureMap
          assets={priorityQueue.length > 0 ? priorityQueue : SEED_ASSETS}
          selectedAssetId={selectedAssetId}
          onSelectAsset={(id) => {
            setSelectedAssetId(id);
            onSelectAsset && onSelectAsset(id);
          }}
        />
      </div>

      {/* Ranked Priority Queue */}
      <PriorityList
        assets={priorityQueue}
        selectedAssetId={selectedAssetId}
        onSelectAsset={(id) => {
          setSelectedAssetId(id);
          onSelectAsset && onSelectAsset(id);
        }}
      />

      {/* Status Footer */}
      <div className="p-3 bg-white rounded border border-[#DDE1E5] text-[11px] text-[#5F6368] flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>
          Department: <strong>Municipal Engineering &amp; Public Works</strong>
        </span>
        <span>
          Real-time priority ranking active
        </span>
      </div>
    </div>
  );
};

export default Dashboard;
