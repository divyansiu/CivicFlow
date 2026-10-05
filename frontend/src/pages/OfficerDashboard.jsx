import React, { useState, useEffect } from 'react';
import { 
  Building, 
  MapPin, 
  Download, 
  CheckCircle2, 
  Wrench, 
  AlertTriangle, 
  Lightbulb, 
  Building2, 
  Waves, 
  Droplets, 
  Bell, 
  FileText, 
  FolderOpen, 
  Info,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { PriorityList } from '../components/dashboard/PriorityList';
import { AssetDetails } from '../components/assets/AssetDetails';
import { InfrastructureMap } from '../components/map/InfrastructureMap';
import { MetricPanel } from '../components/ui/MetricPanel';
import { DataTable } from '../components/ui/DataTable';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Button } from '../components/ui/Button';
import { RiskDistribution } from '../components/dashboard/RiskDistribution';
import { RiskChart } from '../components/dashboard/RiskChart';
import { SEED_ASSETS, MOCK_SYSTEM_METRICS, MOCK_OFFICERS, MOCK_CITIZEN_COMPLAINTS } from '../data/mockData';
import assetService from '../services/assetService';
import dashboardService from '../services/dashboardService';
import predictionService from '../services/predictionService';

export const OfficerDashboard = ({ activeTab = 'overview' }) => {
  const [assets, setAssets] = useState(SEED_ASSETS);
  const [selectedAssetId, setSelectedAssetId] = useState('RD-021');
  const [metrics, setMetrics] = useState(null);
  const [selectedAssetDetail, setSelectedAssetDetail] = useState(null);
  const [notice, setNotice] = useState(null);
  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [pRes, dRes] = await Promise.all([
        assetService.getPriorities(50),
        dashboardService.getDashboardSummary()
      ]);
      if (pRes.items && pRes.items.length > 0) {
        setAssets(pRes.items);
      }
      setMetrics(dRes);
      setIsLive(Boolean(pRes.isLive || dRes.isLive));
    } catch (err) {
      console.warn('Fallback to seed assets in officer dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Fetch full detail when selected asset changes
  useEffect(() => {
    let mounted = true;
    if (selectedAssetId) {
      assetService.getAssetById(selectedAssetId).then(res => {
        if (mounted) setSelectedAssetDetail(res);
      }).catch(() => {});
    }
    return () => { mounted = false; };
  }, [selectedAssetId]);

  const selectedAsset = selectedAssetDetail || assets.find((a) => a.asset_id === selectedAssetId) || assets[0];

  const handleActionTaken = (asset) => {
    setNotice(`Maintenance scheduled for ${asset.name}. Action: ${asset.recommended_action || 'Immediate inspection / dispatch'}`);
    setTimeout(() => setNotice(null), 5000);
  };

  const handleSimulateScenario = async () => {
    if (!selectedAsset) return;
    setSimulating(true);
    try {
      const sim = await predictionService.simulateScenario({
        asset_id: selectedAsset.asset_id,
        intervention_type: 'Preventive Milling & Resurfacing',
        condition_gain: 35.0,
        complaints_reduction_percent: 75.0,
        custom_features: {
          asset_id: selectedAsset.asset_id,
          asset_type: selectedAsset.asset_type || 'road',
          age_years: selectedAsset.age_years || 8,
          condition_score: selectedAsset.condition_score || 42,
          complaints_30d: selectedAsset.complaints_30d || 8,
          previous_repairs: selectedAsset.previous_repairs || 3,
          rainfall_30d: selectedAsset.rainfall_30d || 220,
          usage_level: selectedAsset.usage_level || 'high'
        }
      });
      setSimulationResult(sim);
    } catch (err) {
      alert(`Simulation failed: ${err.message}`);
    } finally {
      setSimulating(false);
    }
  };

  const highRiskCount = metrics?.critical_risk_count 
    ? (metrics.critical_risk_count + (metrics.high_risk_count || 0))
    : assets.filter(a => a.risk_level === 'CRITICAL' || a.risk_level === 'HIGH').length;

  const NoticeBar = () => notice ? (
    <div className="p-3 bg-[#DCFCE7] border border-emerald-300 text-[#126B37] text-xs rounded flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <CheckCircle2 className="w-4 h-4 text-[#168A44]" />
        <span>{notice}</span>
      </div>
      <button onClick={() => setNotice(null)} className="text-xs underline text-[#126B37]">Dismiss</button>
    </div>
  ) : null;

  // ── TAB: Assets ──────────────────────────────────────────────────────
  if (activeTab === 'assets') {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DDE1E5] pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1A1A1A]">Asset Registry</h1>
              {isLive ? (
                <span className="text-[10px] bg-emerald-100 text-[#126B37] px-2 py-0.5 rounded font-semibold border border-emerald-300">
                  Live Backend API
                </span>
              ) : (
                <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-semibold border border-amber-300">
                  Prototype Seed Data
                </span>
              )}
            </div>
            <p className="text-xs text-[#5F6368] mt-0.5">
              Select an asset to view its full condition and decision scores. <span className="italic">Public/geospatial records + synthetic operational data.</span>
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={loadData} className="flex items-center space-x-1">
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </Button>
            <Button variant="outline" size="sm" onClick={() => alert('Exporting asset registry (CSV)')} className="flex items-center space-x-1">
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </Button>
          </div>
        </div>
        <NoticeBar />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7">
            <div className="gov-card p-4 sm:p-5">
              <div className="flex items-center justify-between border-b border-[#DDE1E5] pb-3 mb-3">
                <h2 className="text-sm font-bold text-[#1A1A1A]">All Monitored Assets</h2>
                <span className="text-xs text-[#5F6368] font-mono">{assets.length} records</span>
              </div>
              <PriorityList assets={assets} selectedAssetId={selectedAssetId} onSelectAsset={setSelectedAssetId} />
            </div>
          </div>
          <div className="lg:col-span-5 space-y-4">
            <AssetDetails asset={selectedAsset} onActionTaken={handleActionTaken} />
            <div className="bg-white p-4 rounded border border-[#DDE1E5] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider">What-If Intervention Simulation</span>
                <Sparkles className="w-4 h-4 text-[#168A44]" />
              </div>
              <p className="text-[11px] text-[#5F6368]">
                Evaluate potential risk and priority reduction before committing capital budget.
              </p>
              <Button variant="outline" size="sm" onClick={handleSimulateScenario} disabled={simulating} className="w-full text-xs">
                {simulating ? 'Evaluating Model...' : 'Simulate Resurfacing Intervention'}
              </Button>
              {simulationResult && (
                <div className="p-2.5 bg-emerald-50 rounded border border-emerald-200 text-xs text-[#126B37] mt-2 space-y-1">
                  <div className="font-bold">Projected Impact:</div>
                  <div>Risk: {simulationResult.before?.risk_score} → {simulationResult.after?.risk_score} (-{simulationResult.risk_delta} pts)</div>
                  <div>Priority: {simulationResult.before?.priority_score} → {simulationResult.after?.priority_score} (-{simulationResult.priority_delta} pts)</div>
                  <div className="text-[10px] text-[#5F6368] italic">{simulationResult.summary}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── TAB: Maintenance Priority ────────────────────────────────────────
  if (activeTab === 'priorities') {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DDE1E5] pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1A1A1A]">Maintenance Priority Queue</h1>
              {isLive && (
                <span className="text-[10px] bg-emerald-100 text-[#126B37] px-2 py-0.5 rounded font-semibold border border-emerald-300">
                  Live API
                </span>
              )}
            </div>
            <p className="text-xs text-[#5F6368] mt-0.5">
              Strict ranking by Composite Priority Score (0.50 Risk + 0.25 Urgency + 0.25 Impact). Prototype policy rule.
            </p>
          </div>
          <Button variant="primary" size="sm" onClick={handleSimulateScenario} disabled={simulating}>
            <Sparkles className="w-3.5 h-3.5 mr-1" />
            <span>Simulate What-If</span>
          </Button>
        </div>
        <NoticeBar />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7">
            <div className="gov-card p-4 sm:p-5">
              <div className="flex items-center justify-between border-b border-[#DDE1E5] pb-3 mb-3">
                <div>
                  <h2 className="text-sm font-bold text-[#1A1A1A]">Ranked Queue</h2>
                  <span className="text-xs text-[#5F6368]">Sorted strictly descending by priority score</span>
                </div>
              </div>
              <PriorityList assets={assets} selectedAssetId={selectedAssetId} onSelectAsset={setSelectedAssetId} />
            </div>
          </div>
          <div className="lg:col-span-5 space-y-4">
            <AssetDetails asset={selectedAsset} onActionTaken={handleActionTaken} />
          </div>
        </div>
      </div>
    );
  }

  // ── TAB: Reports ─────────────────────────────────────────────────────
  if (activeTab === 'reports') {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DDE1E5] pb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1A1A1A]">Citizen Reports &amp; Grievances</h1>
            <p className="text-xs text-[#5F6368] mt-0.5">All community grievances linked to infrastructure segments. <span className="italic">Public/geospatial records + synthetic operational data.</span></p>
          </div>
          <Button variant="outline" size="sm" onClick={() => alert('Exporting complaints report (CSV)')} className="flex items-center space-x-1">
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <MetricPanel label="Total Reports" value={MOCK_CITIZEN_COMPLAINTS.length} subtext="Catalogued citizen inputs" />
          <MetricPanel label="Pending Action" value="2" subtext="Scheduled for field visit" indicator={<span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block" />} />
          <MetricPanel label="Resolved" value="1" subtext="Closed after verification" indicator={<span className="w-2.5 h-2.5 rounded-full bg-[#168A44] inline-block" />} />
        </div>

        <div className="gov-card p-4 sm:p-5">
          <h3 className="text-sm font-bold text-[#1A1A1A] border-b border-[#DDE1E5] pb-2 mb-3">All Complaints Log</h3>
          <DataTable
            columns={[
              { header: 'ID', accessor: 'id', cellClassName: 'font-mono text-[11px] text-[#5F6368]' },
              { header: 'TITLE & LOCATION', accessor: 'title', render: (row) => (
                <div>
                  <div className="font-semibold text-xs text-[#1A1A1A]">{row.title}</div>
                  <div className="text-[11px] text-[#5F6368]">{row.location} ({row.ward})</div>
                </div>
              )},
              { header: 'CATEGORY', accessor: 'category', cellClassName: 'text-xs text-[#5F6368]' },
              { header: 'STATUS', accessor: 'status', render: (row) => <StatusBadge level={row.status === 'Resolved' ? 'HEALTHY' : 'MEDIUM'} size="xs" /> },
              { header: 'CITIZEN', accessor: 'citizen_name', cellClassName: 'text-xs text-[#5F6368]' },
              { header: 'SUBMITTED', accessor: 'submitted_at', cellClassName: 'font-mono text-[11px] text-[#5F6368]' }
            ]}
            data={MOCK_CITIZEN_COMPLAINTS}
            emptyMessage="No complaints recorded."
          />
        </div>
      </div>
    );
  }

  // ── TAB: Overview (default) ──────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Top Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DDE1E5] pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1A1A1A]">
              Officer Maintenance Command Center
            </h1>
            {isLive ? (
              <span className="text-[10px] bg-emerald-100 text-[#126B37] px-2 py-0.5 rounded font-semibold border border-emerald-300">
                Live Backend API
              </span>
            ) : (
              <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-semibold border border-amber-300">
                Prototype Seed Mode
              </span>
            )}
          </div>
          <p className="text-xs text-[#5F6368] mt-0.5">
            Operational decision intelligence for public infrastructure interventions • North &amp; Central District
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            className="flex items-center space-x-1"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => alert('Exporting maintenance report (CSV)')}
            className="flex items-center space-x-1"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </Button>
        </div>
      </div>

      <NoticeBar />

      {/* Top Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <MetricPanel
          label="High Risk Assets"
          value={highRiskCount}
          delta="Needs Action"
          subtext="Score ≥ 50 (Immediate or Priority)"
          indicator={<span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block" />}
        />
        <MetricPanel
          label="Monitored Assets"
          value={metrics ? metrics.total_assets : assets.length}
          subtext="Under municipal management"
        />
        <MetricPanel
          label="Average Condition"
          value={metrics ? `${metrics.average_condition_score}/100` : '51.5/100'}
          subtext="Structural condition score"
          indicator={<span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block" />}
        />
        <MetricPanel
          label="Average Priority"
          value={metrics ? `${metrics.average_priority_score}` : '64.2'}
          subtext="Composite priority index"
          indicator={<span className="w-2.5 h-2.5 rounded-full bg-[#168A44] inline-block" />}
        />
      </div>

      {/* Risk Distribution + Priority Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 space-y-4">
          <RiskDistribution distribution={metrics?.risk_distribution} />
          <RiskChart distribution={metrics?.risk_distribution} />
        </div>

        <div className="lg:col-span-7 space-y-4">
          <div className="gov-card p-4 sm:p-5">
            <div className="flex items-center justify-between border-b border-[#DDE1E5] pb-3 mb-3">
              <h2 className="text-sm font-bold text-[#1A1A1A]">Priority Maintenance Queue</h2>
              <span className="text-xs text-[#5F6368] font-mono">{assets.length} items</span>
            </div>
            <PriorityList
              assets={assets}
              selectedAssetId={selectedAssetId}
              onSelectAsset={setSelectedAssetId}
            />
          </div>
        </div>
      </div>

      {/* Selected Asset Deep Dive Card */}
      {selectedAsset && (
        <div className="gov-card p-5 border border-[#168A44]">
          <div className="flex items-center justify-between border-b border-[#DDE1E5] pb-3 mb-4">
            <div className="flex items-center space-x-2">
              <Wrench className="w-4 h-4 text-[#168A44]" />
              <h3 className="font-bold text-sm text-[#1A1A1A]">
                Focused Asset Decision File: {selectedAsset.name} ({selectedAsset.asset_id})
              </h3>
            </div>
            <span className="text-xs font-mono text-[#5F6368]">
              Priority #{selectedAsset.rank || 1} • Score: {selectedAsset.priority_score}
            </span>
          </div>
          <AssetDetails asset={selectedAsset} onActionTaken={handleActionTaken} />
        </div>
      )}

      {/* Footer Notes */}
      <div className="p-3 bg-[#F7F8FA] rounded border border-[#DDE1E5] text-[11px] text-[#5F6368] flex items-center justify-between">
        <span>Public/geospatial records + clearly labeled synthetic operational data</span>
        <span className="italic">Any exact response times shown are prototype policy rules.</span>
      </div>
    </div>
  );
};

export default OfficerDashboard;
