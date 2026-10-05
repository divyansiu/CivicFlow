import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Users, 
  SlidersHorizontal, 
  Activity, 
  CheckCircle, 
  Calendar, 
  Wrench,
  ShieldCheck,
  FileText,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { MetricPanel } from '../components/ui/MetricPanel';
import { DataTable } from '../components/ui/DataTable';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/StatusBadge';
import { RiskDistribution } from '../components/dashboard/RiskDistribution';
import { RiskChart } from '../components/dashboard/RiskChart';
import dashboardService from '../services/dashboardService';
import assetService from '../services/assetService';
import { formatScore, getActionRecommendation } from '../utils/riskColor';
import { formatAssetType, formatDate } from '../utils/formatters';

export const AdminDashboard = ({ activeTab: sidebarTab = 'overview' }) => {
  const resolvedView = sidebarTab === 'parameters' ? 'settings'
    : sidebarTab === 'officers' ? 'officers'
    : 'system';

  const [activeTab, setActiveTab] = useState(resolvedView);
  const [metrics, setMetrics] = useState(null);
  const [assets, setAssets] = useState([]);
  const [recentInterventions, setRecentInterventions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);

  // Sync internal state if the user clicks a sidebar tab
  useEffect(() => {
    setActiveTab(resolvedView);
  }, [resolvedView]);

  // Load real data from backend
  const loadData = async () => {
    setLoading(true);
    try {
      const [dashRes, assetsRes] = await Promise.all([
        dashboardService.getDashboardSummary(),
        assetService.getAssets({ limit: 50 })
      ]);
      setMetrics(dashRes);
      setAssets(assetsRes.items || []);
      setIsLive(Boolean(dashRes.isLive));

      // Fetch history for top asset to show real recent interventions
      if (assetsRes.items && assetsRes.items.length > 0) {
        const topId = assetsRes.items[0].asset_id;
        const hist = await assetService.getAssetHistory(topId);
        if (hist.maintenance_records && hist.maintenance_records.length > 0) {
          setRecentInterventions(hist.maintenance_records);
        }
      }
    } catch (err) {
      console.warn('Admin load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const [riskWeight, setRiskWeight] = useState(50);
  const [urgencyWeight, setUrgencyWeight] = useState(25);
  const [impactWeight, setImpactWeight] = useState(25);
  const [saveNotice, setSaveNotice] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaveNotice(true);
    setTimeout(() => setSaveNotice(false), 3000);
  };

  const totalAssets = metrics?.total_assets || assets.length;
  const criticalCount = metrics?.critical_risk_count || assets.filter(a => a.risk_level === 'CRITICAL').length;
  const highCount = metrics?.high_risk_count || assets.filter(a => a.risk_level === 'HIGH').length;
  const underMaintenanceCount = metrics?.under_maintenance_count || assets.filter(a => a.status === 'UNDER_MAINTENANCE').length;

  return (
    <div className="space-y-6">
      {/* Top Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DDE1E5] pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1A1A1A]">
              System Administration &amp; Governance
            </h1>
            {isLive ? (
              <span className="text-[10px] bg-emerald-100 text-[#126B37] px-2 py-0.5 rounded font-semibold border border-emerald-300">
                Live Backend API
              </span>
            ) : (
              <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-semibold border border-amber-300">
                Seed Data Cache
              </span>
            )}
          </div>
          <p className="text-xs text-[#5F6368] mt-0.5">
            Real-time infrastructure management, algorithm parameter calibration, and audit registry.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant={activeTab === 'system' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('system')}
          >
            System Status
          </Button>
          <Button
            variant={activeTab === 'assets' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('assets')}
          >
            Asset Registry
          </Button>
          <Button
            variant={activeTab === 'settings' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('settings')}
          >
            Algorithm Calibration
          </Button>
          <button
            onClick={loadData}
            disabled={loading}
            className="p-1.5 rounded hover:bg-gray-100 text-[#5F6368] border border-[#DDE1E5]"
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Real Summary Cards (derived from backend database) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <MetricPanel
          label="Registered Assets"
          value={totalAssets}
          subtext="Roads, streetlights & bridges"
          indicator={<span className="w-2.5 h-2.5 rounded-full bg-[#168A44] inline-block" />}
        />
        <MetricPanel
          label="Critical / High Risk"
          value={criticalCount + highCount}
          subtext="Score ≥ 50 (Immediate / Priority)"
          indicator={<span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block" />}
        />
        <MetricPanel
          label="Average Condition"
          value={metrics ? `${formatScore(metrics.average_condition_score)}/100` : '--'}
          subtext="Composite pavement/structure health"
        />
        <MetricPanel
          label="Under Maintenance"
          value={underMaintenanceCount}
          subtext="Active repair / overhaul work"
          indicator={<span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block" />}
        />
      </div>

      {activeTab === 'assets' ? (
        /* Real Assets Table from DB */
        <div className="gov-card p-4 sm:p-6 space-y-4">
          <div className="border-b border-[#DDE1E5] pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-[#1A1A1A]">Municipal Asset Registry</h2>
              <p className="text-xs text-[#5F6368] mt-0.5">
                Full list of infrastructure units recorded in the central database.
              </p>
            </div>
            <span className="text-xs font-mono text-[#5F6368]">{assets.length} Assets</span>
          </div>
          <DataTable
            columns={[
              { header: 'ID', accessor: 'asset_id', cellClassName: 'font-mono text-xs font-bold text-[#168A44]' },
              { header: 'NAME', accessor: 'name', cellClassName: 'font-semibold text-xs text-[#1A1A1A]' },
              { header: 'TYPE', accessor: 'asset_type', render: (row) => <span className="capitalize text-xs">{formatAssetType(row.asset_type)}</span> },
              { header: 'CONDITION', accessor: 'condition_score', render: (row) => <span className="font-mono text-xs">{Number(row.condition_score || 0).toFixed(0)}/100</span> },
              { header: 'RISK LEVEL', accessor: 'risk_level', render: (row) => <StatusBadge level={row.risk_level} size="xs" /> },
              { header: 'PRIORITY SCORE', accessor: 'priority_score', cellClassName: 'font-mono text-xs font-bold text-[#126B37]', render: (row) => <span>{Number(row.priority_score || 0).toFixed(1)}</span> },
              { header: 'STATUS', accessor: 'status', render: (row) => <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-[#5F6368]">{row.status || 'ACTIVE'}</span> }
            ]}
            data={assets}
            idKey="asset_id"
            emptyMessage="No assets registered in the database."
          />
        </div>
      ) : activeTab === 'settings' ? (
        /* Algorithm Calibration Panel */
        <div className="gov-card p-4 sm:p-6 space-y-6">
          <div className="border-b border-[#DDE1E5] pb-3">
            <h2 className="text-sm font-bold text-[#1A1A1A]">
              Decision Engine Weight Calibration
            </h2>
            <p className="text-xs text-[#5F6368] mt-0.5">
              Tune how the platform computes the composite Priority Score. Configurable prototype parameters.
            </p>
          </div>

          <form onSubmit={handleSave} className="space-y-5 max-w-xl">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <label className="text-[#1A1A1A]">1. Predictive Risk Weight (W_risk):</label>
                <span className="text-[#168A44]">{riskWeight}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="80"
                value={riskWeight}
                onChange={(e) => setRiskWeight(Number(e.target.value))}
                className="w-full accent-[#168A44]"
              />
              <span className="text-[11px] text-[#5F6368] block">
                Model-estimated probability of near-term failure/deterioration.
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <label className="text-[#1A1A1A]">2. Operational Urgency Weight (W_urgency):</label>
                <span className="text-[#168A44]">{urgencyWeight}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="60"
                value={urgencyWeight}
                onChange={(e) => setUrgencyWeight(Number(e.target.value))}
                className="w-full accent-[#168A44]"
              />
              <span className="text-[11px] text-[#5F6368] block">
                Complaint spikes, recent repair history, and environmental rainfall exposure.
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <label className="text-[#1A1A1A]">3. Public Consequence Impact Weight (W_impact):</label>
                <span className="text-[#168A44]">{impactWeight}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="60"
                value={impactWeight}
                onChange={(e) => setImpactWeight(Number(e.target.value))}
                className="w-full accent-[#168A44]"
              />
              <span className="text-[11px] text-[#5F6368] block">
                Evaluates vehicular traffic PCU and road/bridge public criticality.
              </span>
            </div>

            <div className="p-3 bg-[#F7F8FA] rounded border border-[#DDE1E5] text-xs space-y-1">
              <div className="font-semibold text-[#1A1A1A]">Current Formula:</div>
              <div className="font-mono text-[#168A44]">
                Priority = ({(riskWeight / 100).toFixed(2)} × Risk) + ({(urgencyWeight / 100).toFixed(2)} × Urgency) + ({(impactWeight / 100).toFixed(2)} × Impact)
              </div>
              <div className="text-[10px] text-[#5F6368] italic">
                * Default baseline PRD weights: 0.50 Risk + 0.25 Urgency + 0.25 Impact
              </div>
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Button type="submit" variant="primary" size="md">
                Save Parameter Calibration
              </Button>
              {saveNotice && (
                <span className="text-xs text-[#168A44] font-medium flex items-center space-x-1">
                  <CheckCircle className="w-4 h-4" />
                  <span>Parameters updated successfully.</span>
                </span>
              )}
            </div>
          </form>
        </div>
      ) : (
        /* Main System Activity + Risk Distribution */
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RiskDistribution distribution={metrics?.risk_distribution} />
            <RiskChart distribution={metrics?.risk_distribution} />
          </div>

          {/* Real Interventions Table from Backend */}
          <div className="gov-card p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-[#DDE1E5] pb-2">
              <h3 className="text-sm font-bold text-[#1A1A1A]">
                Recent Municipal Maintenance Interventions
              </h3>
              <span className="text-xs text-[#5F6368]">
                {recentInterventions.length > 0 ? `${recentInterventions.length} records logged` : 'Operational log'}
              </span>
            </div>

            {recentInterventions.length > 0 ? (
              <DataTable
                columns={[
                  { header: 'RECORD ID', accessor: 'maintenance_id', cellClassName: 'font-mono text-xs font-bold text-[#168A44]' },
                  { header: 'ASSET ID', accessor: 'asset_id', cellClassName: 'font-mono text-xs text-[#5F6368]' },
                  { header: 'INTERVENTION TYPE', accessor: 'type', cellClassName: 'font-semibold text-xs text-[#1A1A1A]' },
                  { header: 'SEVERITY', accessor: 'severity', render: (row) => <StatusBadge level={row.severity} size="xs" /> },
                  { header: 'DATE', accessor: 'date', render: (row) => <span className="font-mono text-xs">{formatDate(row.date)}</span> },
                  { header: 'DESCRIPTION', accessor: 'description', cellClassName: 'text-xs text-[#5F6368] max-w-xs truncate' }
                ]}
                data={recentInterventions}
                idKey="maintenance_id"
              />
            ) : (
              <p className="text-xs text-[#5F6368] py-4 text-center italic">
                No recent intervention records logged for active assets.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
