import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  MapPin, 
  PlusCircle, 
  CheckCircle2, 
  Clock, 
  ThumbsUp, 
  Search,
  Wrench,
  AlertTriangle,
  Info,
  ChevronRight,
  Bell,
  FileText
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { MetricPanel } from '../components/ui/MetricPanel';
import { StatusBadge } from '../components/ui/StatusBadge';
import { DataTable } from '../components/ui/DataTable';
import { AssetDetails } from '../components/assets/AssetDetails';
import { SEED_ASSETS, MOCK_CITIZEN_COMPLAINTS } from '../data/mockData';
import assetService from '../services/assetService';
import dashboardService from '../services/dashboardService';

export const UserDashboard = ({ onSelectAsset, activeTab = 'overview' }) => {
  const [assets, setAssets] = useState(SEED_ASSETS);
  const [metrics, setMetrics] = useState(null);
  const [complaints, setComplaints] = useState(MOCK_CITIZEN_COMPLAINTS);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newCategory, setNewCategory] = useState('Pothole / Road Depression');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAssetId, setSelectedAssetId] = useState(null);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    let mounted = true;
    Promise.all([
      assetService.getPriorities(20),
      dashboardService.getDashboardSummary()
    ]).then(([pRes, dRes]) => {
      if (!mounted) return;
      if (pRes.items && pRes.items.length > 0) {
        setAssets(pRes.items);
      }
      setMetrics(dRes);
      setIsLive(Boolean(pRes.isLive || dRes.isLive));
    }).catch(err => {
      console.warn('Fallback to seed assets in user dashboard:', err);
    });
    return () => { mounted = false; };
  }, []);

  const topAsset = assets[0] || SEED_ASSETS[0];

  const lowCount = metrics?.risk_distribution?.LOW ?? assets.filter(a => a.risk_level === 'LOW').length;
  const medCount = metrics?.risk_distribution?.MEDIUM ?? assets.filter(a => a.risk_level === 'MEDIUM').length;
  const highCritCount = metrics
    ? ((metrics.risk_distribution?.HIGH || 0) + (metrics.risk_distribution?.CRITICAL || 0))
    : assets.filter(a => a.risk_level === 'HIGH' || a.risk_level === 'CRITICAL').length;
  const totalCount = metrics?.total_assets || assets.length || 1;
  const healthyPercent = Math.round((lowCount / totalCount) * 100);
  const maintenancePercent = Math.round((medCount / totalCount) * 100);
  const repairPercent = Math.max(0, 100 - healthyPercent - maintenancePercent);

  const handleUpvote = (id) => {
    setComplaints(complaints.map(c => c.id === id ? { ...c, upvotes: c.upvotes + 1 } : c));
  };

  const handleAddComplaint = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newEntry = {
      id: `CMP-2026-${Math.floor(8800 + Math.random() * 200)}`,
      asset_id: "RD-021",
      title: newTitle,
      category: newCategory,
      location: newLocation || "Ward 4 Community Link",
      ward: "Ward 4",
      submitted_at: "Just now",
      status: "Submitted",
      urgency_flag: "Medium",
      upvotes: 1,
      citizen_name: "Citizen (You)",
      notes: "Received and scheduled for inspection."
    };

    setComplaints([newEntry, ...complaints]);
    setNewTitle('');
    setNewLocation('');
    setShowSubmitModal(false);
  };

  const filteredComplaints = complaints.filter(c => 
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const complaintColumns = [
    {
      header: 'ISSUE',
      accessor: 'title',
      render: (row) => (
        <div>
          <div className="font-semibold text-[#1A1A1A]">{row.title}</div>
          <div className="text-[11px] text-[#5F6368]">{row.category} • {row.submitted_at}</div>
        </div>
      )
    },
    {
      header: 'LOCATION',
      accessor: 'location',
      cellClassName: 'text-[#5F6368]'
    },
    {
      header: 'STATUS',
      accessor: 'status',
      render: (row) => (
        <span className="text-xs font-medium text-[#168A44] bg-[#DCFCE7] px-2 py-0.5 rounded border border-emerald-200">
          {row.status}
        </span>
      )
    },
    {
      header: 'CONFIRMATIONS',
      accessor: 'upvotes',
      headerClassName: 'text-right',
      cellClassName: 'text-right',
      render: (row) => (
        <button
          onClick={() => handleUpvote(row.id)}
          className="inline-flex items-center space-x-1 px-2 py-0.5 border border-[#DDE1E5] rounded bg-white text-xs hover:border-[#168A44] transition-colors"
        >
          <ThumbsUp className="w-3 h-3 text-[#5F6368]" />
          <span>{row.upvotes}</span>
        </button>
      )
    }
  ];

  // ── TAB: My Complaints ───────────────────────────────────────────────
  if (activeTab === 'complaints') {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DDE1E5] pb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#1A1A1A]">My Complaints</h1>
            <p className="text-xs text-[#5F6368] mt-0.5">
              Track all issues you have reported in your ward.
            </p>
          </div>
          <Button variant="primary" size="sm" onClick={() => setShowSubmitModal(true)} className="flex items-center space-x-1.5 self-start sm:self-auto">
            <PlusCircle className="w-4 h-4" />
            <span>Report an Issue</span>
          </Button>
        </div>

        <div className="gov-card p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#DDE1E5] pb-3 mb-4">
            <div>
              <h3 className="text-sm font-bold text-[#1A1A1A]">All Reported Issues</h3>
              <span className="text-xs text-[#5F6368]">Showing {filteredComplaints.length} of {complaints.length} submissions</span>
            </div>
            <input
              type="text"
              placeholder="Search issues..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-1.5 text-xs border border-[#DDE1E5] rounded bg-[#F7F8FA] focus:outline-none focus:border-[#168A44] w-48"
            />
          </div>
          <DataTable columns={complaintColumns} data={filteredComplaints} idKey="id" emptyMessage="No issues found." />
        </div>

        {showSubmitModal && <SubmitModal onClose={() => setShowSubmitModal(false)} onSubmit={handleAddComplaint} newTitle={newTitle} setNewTitle={setNewTitle} newLocation={newLocation} setNewLocation={setNewLocation} newCategory={newCategory} setNewCategory={setNewCategory} />}
      </div>
    );
  }

  // ── TAB: Maintenance Updates ─────────────────────────────────────────
  if (activeTab === 'updates') {
    return (
      <div className="space-y-6">
        <div className="border-b border-[#DDE1E5] pb-4">
          <h1 className="text-2xl font-bold tracking-tight text-[#1A1A1A]">Maintenance Updates</h1>
          <p className="text-xs text-[#5F6368] mt-0.5">
            Latest repair activities and scheduled works in your area. <span className="italic">Synthetic prototype data.</span>
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <MetricPanel
            label="In Progress"
            value={metrics?.under_maintenance_count !== undefined
              ? metrics.under_maintenance_count
              : assets.filter(a => a.status === 'UNDER_MAINTENANCE').length}
            subtext="Active repair crews"
            indicator={<span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block" />}
          />
          <MetricPanel
            label="Scheduled"
            value={`${highCritCount} Sites`}
            subtext="Pending priority intervention"
            indicator={<span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />}
          />
          <MetricPanel
            label="Resolved"
            value={`${complaints.filter(c => c.status === 'Resolved' || c.status === 'RESOLVED').length} Issues`}
            subtext="Closed community reports"
            indicator={<span className="w-2.5 h-2.5 rounded-full bg-[#168A44] inline-block" />}
          />
        </div>

        <div className="gov-card p-5 space-y-3">
          <h3 className="text-sm font-bold text-[#1A1A1A] border-b border-[#DDE1E5] pb-2">Recent Activity</h3>
          {[
            { title: 'Pothole Repairs Completed', location: 'Collector Road 8 resurfacing finished on schedule.', tag: 'Resolved', tagColor: 'text-[#168A44]', date: '2026-10-01' },
            { title: 'Streetlight Maintenance', location: 'Overpass luminaire replacement scheduled for tomorrow.', tag: 'Scheduled', tagColor: 'text-orange-600', date: '2026-10-03' },
            { title: 'Drainage Desiltation', location: 'Industrial Outer Ring Road catch basin cleared.', tag: 'Completed', tagColor: 'text-[#168A44]', date: '2026-09-28' },
            { title: 'Road Marking Refresh', location: 'Collector Road 8, Sector 5 — lane markings repainted.', tag: 'Completed', tagColor: 'text-[#168A44]', date: '2026-09-20' },
            { title: 'Bridge Expansion Joint Inspection', location: 'Canal Cross Bridge, Ward 12 — cyclical check completed.', tag: 'Completed', tagColor: 'text-[#168A44]', date: '2026-09-15' }
          ].map((item, idx) => (
            <div key={idx} className="p-3 bg-[#F7F8FA] rounded border border-[#DDE1E5] text-xs">
              <div className="flex items-center justify-between gap-2">
                <div className="font-semibold text-[#1A1A1A]">{item.title}</div>
                <span className={`text-[11px] font-medium ${item.tagColor}`}>✓ {item.tag}</span>
              </div>
              <div className="text-[#5F6368] mt-0.5">{item.location}</div>
              <div className="text-[11px] text-[#5F6368] mt-1">{item.date}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── TAB: Information ─────────────────────────────────────────────────
  if (activeTab === 'info') {
    return (
      <div className="space-y-6">
        <div className="border-b border-[#DDE1E5] pb-4">
          <h1 className="text-2xl font-bold tracking-tight text-[#1A1A1A]">Information</h1>
          <p className="text-xs text-[#5F6368] mt-0.5">
            How CivicFlow works and what to expect after reporting an issue.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[
            { icon: PlusCircle, title: 'How to Report an Issue', body: 'Click "Report an Issue" on the Overview page. Provide a brief description, select the category, and enter the location. Your complaint is immediately logged and queued for inspection.' },
            { icon: Clock, title: 'What Happens Next', body: 'Your report is reviewed by maintenance officers within 2–5 working days. High-urgency issues (e.g., deep potholes, non-functional traffic lights) are prioritised automatically by the AI risk engine.' },
            { icon: ThumbsUp, title: 'Confirm an Existing Issue', body: 'If you see an existing complaint that matches your observation, press the Confirm button to add your vote. Reports with more confirmations receive a higher urgency score and are addressed sooner.' },
            { icon: MapPin, title: 'Asset Map', body: 'Switch to the "Nearby Issues" tab to see a map of all reported and monitored assets in your ward. Colour codes indicate risk level: Red = Critical, Orange = High Risk, Green = Healthy.' },
            { icon: Wrench, title: 'Decision Scores Explained', body: 'Each asset has four scores: Risk (structural wear), Urgency (complaints & age), Impact (public exposure), and Priority (combined rank). Priority = 0.50 × Risk + 0.25 × Urgency + 0.25 × Impact. These are prototype design parameters.' },
            { icon: Info, title: 'About This Platform', body: 'CivicFlow is a prototype predictive maintenance platform. Data shown is synthetic seed data for demonstration purposes. No real personal information is stored.' }
          ].map((card, idx) => {
            const Icon = card.icon;
            return (
              <div key={idx} className="gov-card p-5 space-y-2">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded bg-[#DCFCE7] text-[#168A44] flex items-center justify-center">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-[#1A1A1A]">{card.title}</h3>
                </div>
                <p className="text-xs text-[#5F6368] leading-relaxed">{card.body}</p>
              </div>
            );
          })}
        </div>

        <div className="p-4 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800">
          <strong>Prototype Notice:</strong> All maintenance records, asset data, and complaint records displayed in this platform are synthetic seed data generated for demonstration and evaluation purposes only. This platform is not a live government service.
        </div>
      </div>
    );
  }

  // ── TAB: Overview (default) ──────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Welcome Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DDE1E5] pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1A1A1A]">
            Welcome Back
          </h1>
          <p className="text-xs text-[#5F6368] mt-0.5">
            Monitor public facilities in your area and track reported issues.
          </p>
        </div>

        <Button 
          variant="primary" 
          size="sm"
          onClick={() => setShowSubmitModal(true)}
          className="flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Report an Issue</span>
        </Button>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <MetricPanel
          label="Total Assets"
          value={metrics ? metrics.total_assets : assets.length}
          subtext="Roads, lights & infrastructure"
        />
        <MetricPanel
          label="Issues Reported"
          value={complaints.length}
          subtext="Active community complaints"
        />
        <MetricPanel
          label="Under Maintenance"
          value={`${metrics?.under_maintenance_count ?? assets.filter(a => a.status === 'UNDER_MAINTENANCE').length} Sites`}
          subtext="Repairs in progress"
        />
        <MetricPanel
          label="Resolved"
          value={`${complaints.filter(c => c.status === 'Resolved' || c.status === 'RESOLVED').length} Issues`}
          subtext="Closed community reports"
        />
      </div>

      {/* Top Priority Alert */}
      <div className="gov-card p-4 border-l-4 border-red-500 bg-red-50/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-semibold text-red-700 uppercase tracking-wide mb-0.5">
                Top Priority Asset in Your District
              </div>
              <div className="text-sm font-bold text-[#1A1A1A]">{topAsset.name}</div>
              <div className="text-xs text-[#5F6368] mt-0.5">{topAsset.location} • Priority Score: <strong>{topAsset.priority_score}/100</strong></div>
            </div>
          </div>
          <div className="flex items-center space-x-2 shrink-0">
            <StatusBadge level={topAsset.risk_level} />
            <button
              onClick={() => setSelectedAssetId(selectedAssetId === topAsset.asset_id ? null : topAsset.asset_id)}
              className="inline-flex items-center space-x-1 text-xs font-medium text-[#168A44] hover:underline"
            >
              <span>{selectedAssetId === topAsset.asset_id ? 'Hide Details' : 'View Details'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        {selectedAssetId === topAsset.asset_id && (
          <div className="mt-4 pt-4 border-t border-red-200">
            <AssetDetails asset={topAsset} />
          </div>
        )}
      </div>

      {/* Two columns: Infrastructure Status + Recent Updates */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Infrastructure Status */}
        <div className="lg:col-span-5 space-y-4">
          <div className="gov-card p-5 space-y-4">
            <h3 className="text-sm font-bold text-[#1A1A1A] border-b border-[#DDE1E5] pb-2">
              Infrastructure Status
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between text-[#1A1A1A] font-medium mb-1">
                  <span>Healthy &amp; Good Condition (Low Risk)</span>
                  <span className="text-[#168A44] font-semibold">{healthyPercent}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded h-2 overflow-hidden">
                  <div className="bg-[#168A44] h-2 rounded transition-all duration-300" style={{ width: `${healthyPercent}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[#1A1A1A] font-medium mb-1">
                  <span>Regular Maintenance (Medium Risk)</span>
                  <span className="text-orange-600 font-semibold">{maintenancePercent}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded h-2 overflow-hidden">
                  <div className="bg-orange-500 h-2 rounded transition-all duration-300" style={{ width: `${maintenancePercent}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[#1A1A1A] font-medium mb-1">
                  <span>Needs Inspection / Repair (High &amp; Critical)</span>
                  <span className="text-red-600 font-semibold">{repairPercent}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded h-2 overflow-hidden">
                  <div className="bg-red-500 h-2 rounded transition-all duration-300" style={{ width: `${repairPercent}%` }}></div>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-[#DDE1E5] text-xs text-[#5F6368]">
              Inspection crews evaluate ward infrastructure on a cyclical 30-day schedule.
            </div>
          </div>

          {/* Recent Updates */}
          <div className="gov-card p-5 space-y-3">
            <h3 className="text-sm font-bold text-[#1A1A1A] border-b border-[#DDE1E5] pb-2">
              Recent Updates
            </h3>
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-[#F7F8FA] rounded border border-[#DDE1E5]">
                <div className="font-semibold text-[#1A1A1A]">Pothole Repairs Completed</div>
                <div className="text-[#5F6368] mt-0.5">Collector Road 8 resurfacing finished on schedule.</div>
                <span className="text-[11px] text-[#168A44] font-medium mt-1 inline-block">✓ Resolved</span>
              </div>
              <div className="p-3 bg-[#F7F8FA] rounded border border-[#DDE1E5]">
                <div className="font-semibold text-[#1A1A1A]">Streetlight Maintenance</div>
                <div className="text-[#5F6368] mt-0.5">Overpass luminaire replacement scheduled for tomorrow.</div>
                <span className="text-[11px] text-orange-600 font-medium mt-1 inline-block">Scheduled</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Nearby Issues Table */}
        <div className="lg:col-span-7 space-y-4">
          <div className="gov-card p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#DDE1E5] pb-3 mb-4">
              <div>
                <h3 className="text-sm font-bold text-[#1A1A1A]">
                  Nearby Issues
                </h3>
                <span className="text-xs text-[#5F6368]">
                  Community reports in Ward 4 and adjacent sectors.
                </span>
              </div>

              <input
                type="text"
                placeholder="Search issues..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3 py-1.5 text-xs border border-[#DDE1E5] rounded bg-[#F7F8FA] focus:outline-none focus:border-[#168A44] w-48"
              />
            </div>

            <DataTable
              columns={complaintColumns}
              data={filteredComplaints}
              idKey="id"
              emptyMessage="No issues found."
            />
          </div>
        </div>
      </div>

      {/* Prototype data notice */}
      <div className="flex items-center space-x-2 p-2.5 bg-amber-50 border border-amber-200 rounded text-[11px] text-amber-700">
        <Info className="w-3.5 h-3.5 shrink-0" />
        <span><strong>Prototype Notice:</strong> All records shown are synthetic seed data generated for demonstration purposes. This is not a live government service.</span>
      </div>

      {/* Report Modal */}
      {showSubmitModal && (
        <SubmitModal
          onClose={() => setShowSubmitModal(false)}
          onSubmit={handleAddComplaint}
          newTitle={newTitle}
          setNewTitle={setNewTitle}
          newLocation={newLocation}
          setNewLocation={setNewLocation}
          newCategory={newCategory}
          setNewCategory={setNewCategory}
        />
      )}
    </div>
  );
};

// ── Shared Submit Modal ───────────────────────────────────────────────
const SubmitModal = ({ onClose, onSubmit, newTitle, setNewTitle, newLocation, setNewLocation, newCategory, setNewCategory }) => (
  <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
    <div className="bg-white border border-[#DDE1E5] rounded gov-card w-full max-w-md p-6 space-y-4 shadow-lg">
      <div className="border-b border-[#DDE1E5] pb-3">
        <h3 className="text-base font-bold text-[#1A1A1A]">Report an Issue</h3>
        <p className="text-xs text-[#5F6368] mt-0.5">Submit a problem for municipal inspection</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-3.5">
        <Input
          label="Issue Summary"
          id="complaintTitle"
          placeholder="e.g. Broken pavement near bus stop"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          required
        />

        <div className="space-y-1">
          <label className="text-xs font-semibold text-[#1A1A1A]">
            Category
          </label>
          <select
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-white border border-[#DDE1E5] rounded focus:border-[#168A44] text-[#1A1A1A] focus:outline-none"
          >
            <option value="Pothole / Road Depression">Pothole / Road Depression</option>
            <option value="Streetlight Malfunction">Streetlight Malfunction</option>
            <option value="Drainage / Surface Stripping">Drainage / Surface Stripping</option>
            <option value="Road Signage / Markings">Road Signage / Markings</option>
          </select>
        </div>

        <Input
          label="Location"
          id="complaintLocation"
          placeholder="e.g. Central Market Road"
          value={newLocation}
          onChange={(e) => setNewLocation(e.target.value)}
          required
        />

        <div className="pt-3 border-t border-[#DDE1E5] flex justify-end space-x-2">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit">
            Submit Issue
          </Button>
        </div>
      </form>
    </div>
  </div>
);
