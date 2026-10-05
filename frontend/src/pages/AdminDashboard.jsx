import React, { useState } from 'react';
import { 
  Building2, 
  Users, 
  SlidersHorizontal, 
  Activity, 
  CheckCircle, 
  Calendar, 
  Wrench,
  ShieldCheck,
  FileText
} from 'lucide-react';
import { MetricPanel } from '../components/ui/MetricPanel';
import { DataTable } from '../components/ui/DataTable';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/StatusBadge';
import { SEED_ASSETS, MOCK_SYSTEM_METRICS, MOCK_OFFICERS } from '../data/mockData';

export const AdminDashboard = ({ activeTab: sidebarTab = 'overview' }) => {
  // Map sidebar tabs to internal views
  const resolvedView = sidebarTab === 'parameters' ? 'settings'
    : sidebarTab === 'officers' ? 'officers'
    : 'system';

  const [activeTab, setActiveTab] = useState(resolvedView);

  // Sync internal state if the user clicks a sidebar tab
  React.useEffect(() => {
    setActiveTab(resolvedView);
  }, [resolvedView]);

  const [riskWeight, setRiskWeight] = useState(50);

  const [urgencyWeight, setUrgencyWeight] = useState(25);
  const [impactWeight, setImpactWeight] = useState(25);
  const [saveNotice, setSaveNotice] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaveNotice(true);
    setTimeout(() => setSaveNotice(false), 3000);
  };

  const userList = [
    { id: 'USR-101', name: 'Ramesh Sharma', role: 'Citizen', area: 'Ward 4 (North)', joined: '2026-08-12', reports: 5 },
    { id: 'USR-102', name: 'Anita Verma', role: 'Citizen', area: 'Ward 9 (South)', joined: '2026-09-01', reports: 3 },
    { id: 'USR-103', name: 'K. Mohan', role: 'Citizen', area: 'Ward 2 (Central)', joined: '2026-09-18', reports: 8 },
    { id: 'USR-104', name: 'Pooja Hegde', role: 'Citizen', area: 'Ward 7 (East)', joined: '2026-07-22', reports: 2 }
  ];

  const recentMaintenance = [
    { id: 'MT-882', asset: 'Central Arterial Corridor', action: 'Milling & Patching', officer: 'Er. A. K. Sundaram', status: 'In Progress', date: '2026-10-04' },
    { id: 'MT-881', asset: 'Ring Road Interchange', action: 'Feeder Pillar Repair', officer: 'Er. Vikram Patel', status: 'Scheduled', date: '2026-10-03' },
    { id: 'MT-880', asset: 'Collector Road 8', action: 'Asphalt Sealant', officer: 'Er. Sunita Rao', status: 'Completed', date: '2026-10-01' }
  ];

  return (
    <div className="space-y-6">
      {/* Top Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DDE1E5] pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1A1A1A]">
            System Overview
          </h1>
          <p className="text-xs text-[#5F6368] mt-0.5">
            Administration, user accounts, and maintenance operations oversight.
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
            variant={activeTab === 'officers' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('officers')}
          >
            Officers
          </Button>
          <Button
            variant={activeTab === 'settings' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('settings')}
          >
            System Settings
          </Button>
        </div>
      </div>

      {/* 4 Summary Cards (1 col mobile, 2 cols sm, 4 cols lg) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <MetricPanel
          label="Total Assets"
          value={MOCK_SYSTEM_METRICS.totalAssetsMonitored}
          subtext="Roads, lights & bridges"
        />
        <MetricPanel
          label="Total Users"
          value="1,420"
          subtext="Registered citizens"
        />
        <MetricPanel
          label="Total Officers"
          value={MOCK_OFFICERS.length}
          subtext="Assigned engineers"
        />
        <MetricPanel
          label="Active Projects"
          value="24"
          subtext="Under active maintenance"
        />
      </div>

      {activeTab === 'officers' ? (
        /* Officers panel */
        <div className="gov-card p-4 sm:p-6 space-y-4">
          <div className="border-b border-[#DDE1E5] pb-3">
            <h2 className="text-sm font-bold text-[#1A1A1A]">Assigned Officers</h2>
            <p className="text-xs text-[#5F6368] mt-0.5">
              Maintenance engineers assigned to infrastructure zones. <span className="italic">Synthetic prototype data.</span>
            </p>
          </div>
          <DataTable
            columns={[
              { header: 'ID', accessor: 'id', cellClassName: 'font-mono text-[11px] text-[#5F6368]' },
              { header: 'NAME', accessor: 'name', cellClassName: 'font-semibold text-[#1A1A1A] text-xs' },
              { header: 'DESIGNATION', accessor: 'designation', cellClassName: 'text-[#5F6368] text-xs' },
              { header: 'ZONE', accessor: 'zone', cellClassName: 'text-[#5F6368] text-xs' },
              { header: 'ACTIVE QUEUES', accessor: 'activeQueues', headerClassName: 'text-right', cellClassName: 'text-right font-bold text-[#1A1A1A] text-xs' },
              { header: 'CONTACT', accessor: 'phone', cellClassName: 'text-[#5F6368] text-xs font-mono' }
            ]}
            data={MOCK_OFFICERS}
            idKey="id"
          />
        </div>
      ) : activeTab === 'settings' ? (
        /* Settings panel */
        <div className="gov-card p-4 sm:p-6 space-y-6">
          <div className="border-b border-[#DDE1E5] pb-3">
            <h2 className="text-sm font-bold text-[#1A1A1A]">
              Maintenance Priority Settings
            </h2>
            <p className="text-xs text-[#5F6368] mt-0.5">
              Adjust how the platform balances physical condition, citizen reports, and traffic volume.
            </p>
          </div>

          <form onSubmit={handleSave} className="space-y-5 max-w-xl">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <label className="text-[#1A1A1A]">1. Physical Condition Weight:</label>
                <span className="text-[#168A44]">{riskWeight}%</span>
              </div>
              <input
                type="range"
                min="20"
                max="80"
                value={riskWeight}
                onChange={(e) => setRiskWeight(e.target.value)}
                className="w-full accent-[#168A44]"
              />
              <span className="text-[11px] text-[#5F6368] block">
                Evaluates pavement wear, asset age, and structural cracks.
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <label className="text-[#1A1A1A]">2. Urgency & Citizen Reports Weight:</label>
                <span className="text-[#168A44]">{urgencyWeight}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="50"
                value={urgencyWeight}
                onChange={(e) => setUrgencyWeight(e.target.value)}
                className="w-full accent-[#168A44]"
              />
              <span className="text-[11px] text-[#5F6368] block">
                Evaluates citizen complaints and overdue inspection schedules.
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <label className="text-[#1A1A1A]">3. Public Traffic & Impact Weight:</label>
                <span className="text-[#168A44]">{impactWeight}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="50"
                value={impactWeight}
                onChange={(e) => setImpactWeight(e.target.value)}
                className="w-full accent-[#168A44]"
              />
              <span className="text-[11px] text-[#5F6368] block">
                Evaluates daily vehicular volume and public transit importance.
              </span>
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Button type="submit" variant="primary" size="md">
                Save Settings
              </Button>
              {saveNotice && (
                <span className="text-xs text-[#168A44] font-medium flex items-center space-x-1">
                  <CheckCircle className="w-4 h-4" />
                  <span>Settings updated successfully.</span>
                </span>
              )}
            </div>
          </form>
        </div>
      ) : (
        /* Main System Activity + Tables */
        <div className="space-y-6">
          {/* Charts Row: System Activity + Asset Status */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* System Activity */}
            <div className="lg:col-span-6 gov-card p-4 sm:p-5 space-y-4">
              <h3 className="text-sm font-bold text-[#1A1A1A] border-b border-[#DDE1E5] pb-2">
                System Activity
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-[#5F6368] text-[11px]">
                  <span>Weekly Inspections Completed</span>
                  <span className="font-semibold text-[#168A44]">42 sites</span>
                </div>
                {/* Clean simulated bar chart */}
                <div className="h-32 bg-[#F7F8FA] rounded border border-[#DDE1E5] flex items-end justify-between px-3 sm:px-4 py-3">
                  {[35, 42, 38, 55, 48, 62, 58].map((val, idx) => (
                    <div key={idx} className="flex flex-col items-center space-y-1.5 w-6 sm:w-7">
                      <div className="w-full bg-[#168A44] rounded-t transition-all hover:bg-[#126B37]" style={{ height: `${val * 1.5}px` }}></div>
                      <span className="text-[10px] text-[#5F6368]">D{idx+1}</span>
                    </div>
                  ))}
                </div>
                <div className="text-[11px] text-[#5F6368] text-center">
                  Daily infrastructure inspection completions over the last 7 days.
                </div>
              </div>
            </div>

            {/* Asset Status */}
            <div className="lg:col-span-6 gov-card p-4 sm:p-5 space-y-4">
              <h3 className="text-sm font-bold text-[#1A1A1A] border-b border-[#DDE1E5] pb-2">
                Asset Status
              </h3>
              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-[#1A1A1A] font-medium">Operational</span>
                    <span className="font-semibold text-[#168A44]">748 Assets (89%)</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded h-2">
                    <div className="bg-[#168A44] h-2 rounded" style={{ width: '89%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-[#1A1A1A] font-medium">Under Review</span>
                    <span className="font-semibold text-amber-600">66 Assets (8%)</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded h-2">
                    <div className="bg-amber-500 h-2 rounded" style={{ width: '8%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-[#1A1A1A] font-medium">Maintenance Required</span>
                    <span className="font-semibold text-red-600">28 Assets (3%)</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded h-2">
                    <div className="bg-red-500 h-2 rounded" style={{ width: '3%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tables Row: Recent Users + Recent Maintenance */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Recent Users */}
            <div className="lg:col-span-6 gov-card p-4 sm:p-5 space-y-3">
              <h3 className="text-sm font-bold text-[#1A1A1A] border-b border-[#DDE1E5] pb-2">
                Recent Users
              </h3>
              <DataTable
                columns={[
                  { header: 'NAME', accessor: 'name', cellClassName: 'font-semibold text-[#1A1A1A]' },
                  { header: 'AREA', accessor: 'area', cellClassName: 'text-[#5F6368]' },
                  { header: 'REPORTS', accessor: 'reports', headerClassName: 'text-right', cellClassName: 'text-right font-medium text-[#1A1A1A]' }
                ]}
                data={userList}
                idKey="id"
              />
            </div>

            {/* Recent Maintenance */}
            <div className="lg:col-span-6 gov-card p-4 sm:p-5 space-y-3">
              <h3 className="text-sm font-bold text-[#1A1A1A] border-b border-[#DDE1E5] pb-2">
                Recent Maintenance
              </h3>
              <DataTable
                columns={[
                  { header: 'ASSET', accessor: 'asset', cellClassName: 'font-semibold text-[#1A1A1A]' },
                  { header: 'ACTION', accessor: 'action', cellClassName: 'text-[#5F6368]' },
                  { header: 'STATUS', accessor: 'status', render: (row) => (
                    <span className={`px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap ${
                      row.status === 'Completed' ? 'bg-[#DCFCE7] text-[#126B37]' :
                      row.status === 'In Progress' ? 'bg-orange-50 text-orange-700' : 'bg-gray-100 text-[#5F6368]'
                    }`}>
                      {row.status}
                    </span>
                  )}
                ]}
                data={recentMaintenance}
                idKey="id"
              />
            </div>
          </div>
        </div>
      )}

      {/* Prototype data notice */}
      <div className="flex items-start space-x-2 p-2.5 bg-amber-50 border border-amber-200 rounded text-[11px] text-amber-700 mt-2">
        <ShieldCheck className="w-3.5 h-3.5 shrink-0 mt-0.5" />
        <span>
          <strong>Prototype Notice:</strong> All records (users, officers, maintenance activities, assets) are synthetic seed data for demonstration purposes only. Model: <em>{MOCK_SYSTEM_METRICS.modelVersion}</em>.
        </span>
      </div>
    </div>
  );
};
