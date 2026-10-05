import React, { useState, useEffect, useMemo } from 'react';
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
  FileText,
  Navigation,
  Locate,
  Crosshair
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
import {
  MUNICIPAL_WARDS,
  calculateDistanceKm,
  findClosestWard,
  reverseGeocode,
  getLocalizedWardsAndComplaints
} from '../utils/locationUtils';
import { useUserLocation } from '../hooks/useUserLocation';

export const UserDashboard = ({ onSelectAsset, activeTab = 'overview', locationData: externalLocationData }) => {
  const internalLocationData = useUserLocation();
  const locationData = externalLocationData || internalLocationData;
  const {
    coords: userCoords,
    status: locationStatus,
    addressInfo,
    closestWard,
    selectedWard,
    setSelectedWard,
    requestLocation,
    wards: fallbackWards = MUNICIPAL_WARDS
  } = locationData;

  const [assets, setAssets] = useState(SEED_ASSETS);
  const [metrics, setMetrics] = useState(null);
  const [complaints, setComplaints] = useState(MOCK_CITIZEN_COMPLAINTS);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newArea, setNewArea] = useState(addressInfo?.shortName || 'Local Area');
  const [newCategory, setNewCategory] = useState('Pothole / Road Depression');
  const [searchTerm, setSearchTerm] = useState('');
  const [issuesFilterWard, setIssuesFilterWard] = useState(selectedWard || (userCoords ? 'NEAR_2KM' : 'ALL'));
  const [myComplaintsWard, setMyComplaintsWard] = useState('ALL');
  const [selectedAssetId, setSelectedAssetId] = useState(null);
  const [isLive, setIsLive] = useState(false);

  // Sync locality when detected
  useEffect(() => {
    if (addressInfo?.shortName && (!newArea || newArea === 'Local Area')) {
      setNewArea(addressInfo.shortName);
    }
  }, [addressInfo]);

  // Sync filter when global location updates
  useEffect(() => {
    if (selectedWard) {
      setIssuesFilterWard(selectedWard);
    }
  }, [selectedWard]);

  // Dynamically anchor demonstration area and issue coordinates realistically around user's GPS
  const localizedData = useMemo(() => {
    return getLocalizedWardsAndComplaints(userCoords, complaints, assets, addressInfo);
  }, [userCoords, complaints, assets, addressInfo]);

  const activeWards = localizedData.wards;
  const currentComplaints = localizedData.complaints;
  const currentAssets = localizedData.assets;

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

  // Filter complaints based on Proximity or Area
  const activeWardComplaints = useMemo(() => {
    if (issuesFilterWard === 'ALL') {
      return currentComplaints;
    }
    if (issuesFilterWard === 'NEAR_2KM') {
      const near = currentComplaints.filter(c => c.distanceKm != null && c.distanceKm <= 2.0);
      return near.length > 0 ? near : currentComplaints;
    }
    if (issuesFilterWard === 'NEAR_5KM') {
      const near = currentComplaints.filter(c => c.distanceKm != null && c.distanceKm <= 5.0);
      return near.length > 0 ? near : currentComplaints;
    }
    return currentComplaints.filter(c => 
      c.ward === issuesFilterWard || 
      c.shortArea === issuesFilterWard || 
      c.areaName?.includes(issuesFilterWard)
    );
  }, [currentComplaints, issuesFilterWard]);

  // Filter assets based on Proximity or Area
  const activeWardAssets = useMemo(() => {
    if (issuesFilterWard === 'ALL') {
      return currentAssets;
    }
    if (issuesFilterWard === 'NEAR_2KM') {
      const near = currentAssets.filter(a => a.distanceKm != null && a.distanceKm <= 2.0);
      return near.length > 0 ? near : currentAssets;
    }
    if (issuesFilterWard === 'NEAR_5KM') {
      const near = currentAssets.filter(a => a.distanceKm != null && a.distanceKm <= 5.0);
      return near.length > 0 ? near : currentAssets;
    }
    return currentAssets.filter(a => a.location?.includes(issuesFilterWard) || a.areaName?.includes(issuesFilterWard));
  }, [currentAssets, issuesFilterWard]);

  const topAsset = activeWardAssets[0] || currentAssets[0] || SEED_ASSETS[0];

  // Dynamic counts for overview metric cards - strictly synchronized with active dataset!
  const totalAssetsCount = issuesFilterWard === 'ALL'
    ? (metrics?.total_assets || currentAssets.length)
    : activeWardAssets.length;

  const totalIssuesCount = activeWardComplaints.length;

  const underMaintenanceCount = issuesFilterWard === 'ALL'
    ? (metrics?.under_maintenance_count ?? currentAssets.filter(a => a.status === 'UNDER_MAINTENANCE').length)
    : activeWardAssets.filter(a => a.status === 'UNDER_MAINTENANCE').length;

  const resolvedIssuesCount = activeWardComplaints.filter(c => c.status === 'Resolved' || c.status === 'RESOLVED').length;

  const lowCount = metrics?.risk_distribution?.LOW ?? currentAssets.filter(a => a.risk_level === 'LOW').length;
  const medCount = metrics?.risk_distribution?.MEDIUM ?? currentAssets.filter(a => a.risk_level === 'MEDIUM').length;
  const totalCount = metrics?.total_assets || currentAssets.length || 1;
  const healthyPercent = Math.round((lowCount / totalCount) * 100);
  const maintenancePercent = Math.round((medCount / totalCount) * 100);
  const repairPercent = Math.max(0, 100 - healthyPercent - maintenancePercent);

  const handleUpvote = (id) => {
    setComplaints(complaints.map(c => c.id === id ? { ...c, upvotes: c.upvotes + 1 } : c));
  };

  const handleAddComplaint = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const areaLabel = newArea || addressInfo?.shortName || 'Local Area';
    const newEntry = {
      id: `CMP-2026-${Math.floor(8800 + Math.random() * 200)}`,
      asset_id: "RD-021",
      title: newTitle,
      category: newCategory,
      location: newLocation || `${areaLabel} Main Road`,
      ward: "Ward 4",
      area: areaLabel,
      areaName: areaLabel,
      shortArea: areaLabel,
      coordinates: userCoords || [23.36, 85.55],
      distanceKm: userCoords ? 0.05 : null,
      submitted_at: "Just now",
      status: "Submitted",
      urgency_flag: "Medium",
      upvotes: 1,
      citizen_name: "Citizen (You)",
      notes: "Received and scheduled for municipal inspection."
    };

    setComplaints([newEntry, ...complaints]);
    setNewTitle('');
    setNewLocation('');
    setShowSubmitModal(false);
  };

  // Filter complaints in Nearby Issues by search term and sort by proximity
  const filteredComplaints = activeWardComplaints
    .filter(c => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        c.title.toLowerCase().includes(term) ||
        c.location.toLowerCase().includes(term) ||
        (c.ward && c.ward.toLowerCase().includes(term)) ||
        c.category.toLowerCase().includes(term)
      );
    })
    .sort((a, b) => {
      if (userCoords && a.coordinates && b.coordinates) {
        const distA = calculateDistanceKm(userCoords[0], userCoords[1], a.coordinates[0], a.coordinates[1]) ?? 9999;
        const distB = calculateDistanceKm(userCoords[0], userCoords[1], b.coordinates[0], b.coordinates[1]) ?? 9999;
        return distA - distB;
      }
      return 0;
    });

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
      header: 'LOCATION & AREA',
      accessor: 'location',
      render: (row) => {
        const dist = row.distanceKm != null
          ? row.distanceKm
          : (userCoords && row.coordinates
              ? calculateDistanceKm(userCoords[0], userCoords[1], row.coordinates[0], row.coordinates[1])
              : null);
        return (
          <div>
            <div className="font-medium text-[#1A1A1A] text-xs">{row.location}</div>
            <div className="flex items-center space-x-1.5 mt-0.5 flex-wrap gap-y-1">
              <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                📍 {row.shortArea || row.area || row.areaName || row.ward}
              </span>
              {dist != null ? (
                <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                  {dist < 1 ? `${Math.round(dist * 1000)}m away` : `${dist.toFixed(1)} km away`}
                </span>
              ) : (
                <span className="text-[10px] text-[#5F6368]">Registered</span>
              )}
            </div>
          </div>
        );
      }
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
    const displayedMyComplaints = currentComplaints
      .filter(c => {
        if (myComplaintsWard === 'NEAR_2KM') {
          if (c.distanceKm == null || c.distanceKm > 2.0) return false;
        } else if (myComplaintsWard === 'NEAR_5KM') {
          if (c.distanceKm == null || c.distanceKm > 5.0) return false;
        } else if (myComplaintsWard !== 'ALL' && c.ward !== myComplaintsWard && c.shortArea !== myComplaintsWard) {
          return false;
        }
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        return (
          c.title.toLowerCase().includes(term) ||
          c.location.toLowerCase().includes(term) ||
          (c.areaName && c.areaName.toLowerCase().includes(term)) ||
          (c.shortArea && c.shortArea.toLowerCase().includes(term)) ||
          (c.ward && c.ward.toLowerCase().includes(term)) ||
          c.category.toLowerCase().includes(term)
        );
      })
      .sort((a, b) => {
        if (userCoords && a.coordinates && b.coordinates) {
          const distA = calculateDistanceKm(userCoords[0], userCoords[1], a.coordinates[0], a.coordinates[1]) ?? 9999;
          const distB = calculateDistanceKm(userCoords[0], userCoords[1], b.coordinates[0], b.coordinates[1]) ?? 9999;
          return distA - distB;
        }
        return 0;
      });

    const near2kmMyCount = currentComplaints.filter(c => c.distanceKm != null && c.distanceKm <= 2.0).length;
    const near5kmMyCount = currentComplaints.filter(c => c.distanceKm != null && c.distanceKm <= 5.0).length;

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DDE1E5] pb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#1A1A1A]">My Complaints</h1>
            <p className="text-xs text-[#5F6368] mt-0.5">
              Track all municipal issues reported in your jurisdiction.
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
              <span className="text-xs text-[#5F6368]">
                {myComplaintsWard === 'ALL'
                  ? `Showing all ${displayedMyComplaints.length} submissions across municipality`
                  : myComplaintsWard === 'NEAR_2KM'
                  ? `Showing ${displayedMyComplaints.length} submissions within 2 km of your location (out of ${currentComplaints.length} total)`
                  : myComplaintsWard === 'NEAR_5KM'
                  ? `Showing ${displayedMyComplaints.length} submissions within 5 km of your location (out of ${currentComplaints.length} total)`
                  : `Showing ${displayedMyComplaints.length} submissions in ${activeWards.find(w => w.id === myComplaintsWard)?.shortLabel || myComplaintsWard} (out of ${currentComplaints.length} total)`}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <select
                value={myComplaintsWard}
                onChange={(e) => setMyComplaintsWard(e.target.value)}
                className="px-2.5 py-1.5 text-xs border border-[#DDE1E5] rounded bg-white text-[#1A1A1A] focus:outline-none focus:border-[#168A44] font-medium"
                title="Filter complaints by proximity or area"
              >
                <option value="ALL">🌐 All Reports ({currentComplaints.length})</option>
                {userCoords && (
                  <>
                    <option value="NEAR_2KM">📍 Near Me (&lt; 2 km) ({near2kmMyCount})</option>
                    <option value="NEAR_5KM">📍 Local Area (&lt; 5 km) ({near5kmMyCount})</option>
                  </>
                )}
                {activeWards.map(w => (
                  <option key={w.id} value={w.id}>
                    {w.shortLabel ? `📍 ${w.shortLabel}` : `📍 ${w.name}`} ({currentComplaints.filter(c => c.ward === w.id).length})
                  </option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Search issues..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3 py-1.5 text-xs border border-[#DDE1E5] rounded bg-[#F7F8FA] focus:outline-none focus:border-[#168A44] w-40"
              />
            </div>
          </div>
          <DataTable columns={complaintColumns} data={displayedMyComplaints} idKey="id" emptyMessage="No issues found." />
        </div>

        {showSubmitModal && (
          <SubmitModal 
            onClose={() => setShowSubmitModal(false)} 
            onSubmit={handleAddComplaint} 
            newTitle={newTitle} 
            setNewTitle={setNewTitle} 
            newLocation={newLocation} 
            setNewLocation={setNewLocation} 
            newArea={newArea}
            setNewArea={setNewArea}
            newCategory={newCategory} 
            setNewCategory={setNewCategory}
            userCoords={userCoords}
            addressInfo={addressInfo}
            onRequestLocation={requestLocation}
            locationStatus={locationStatus}
          />
        )}
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

      {/* Real-Time Location Banner */}
      {locationStatus === 'requesting' && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800 flex items-center justify-between animate-pulse">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-ping inline-block" />
            <span>📍 <strong>Requesting browser location:</strong> Please allow location access in your browser to discover infrastructure issues in your immediate vicinity...</span>
          </div>
        </div>
      )}

      {locationStatus === 'granted' && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-xs">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#168A44] inline-block shrink-0" />
            <span>
              <strong>Real-Time Location Active:</strong> Near{' '}
              <strong className="text-[#126B37]">{addressInfo?.shortName || 'Current Location'}</strong>
              {addressInfo?.city ? ` (${addressInfo.city})` : ''}. Showing issues sorted by real distance to you.
            </span>
          </div>
          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={() => requestLocation(true)}
              className="inline-flex items-center space-x-1 px-2 py-0.5 bg-white border border-emerald-300 rounded text-xs text-[#168A44] hover:bg-emerald-100 font-semibold transition-colors"
              title="Refresh GPS location"
            >
              <Locate className="w-3 h-3" />
              <span>Refresh GPS</span>
            </button>
          </div>
        </div>
      )}

      {locationStatus === 'denied' && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Location Access Blocked / Denied:</strong> Defaulting to{' '}
              <strong>{issuesFilterWard === 'ALL' ? 'All Areas' : issuesFilterWard}</strong>. You can switch areas using the Area Dropdown or re-request GPS.
            </span>
          </div>
          <button
            onClick={() => requestLocation(true)}
            className="inline-flex items-center space-x-1 px-2 py-0.5 bg-white border border-amber-300 rounded text-xs text-amber-800 hover:bg-amber-100 font-medium transition-colors self-start sm:self-auto"
          >
            <span>Retry GPS Access</span>
          </button>
        </div>
      )}

      {/* 4 Summary Cards - DYNAMICALLY SYNCED WITH ACTIVE WARD / PROXIMITY */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <MetricPanel
          label="Total Assets"
          value={issuesFilterWard === 'ALL' ? (metrics ? metrics.total_assets : currentAssets.length) : `${totalAssetsCount} Sites`}
          subtext={
            issuesFilterWard === 'ALL'
              ? "Roads, lights & infrastructure"
              : issuesFilterWard === 'NEAR_2KM'
              ? "Assets within 2 km"
              : issuesFilterWard === 'NEAR_5KM'
              ? "Assets within 5 km"
              : `Monitored in ${activeWards.find(w => w.id === issuesFilterWard)?.shortLabel || issuesFilterWard}`
          }
        />
        <MetricPanel
          label="Issues Reported"
          value={`${totalIssuesCount} Issues`}
          subtext={
            issuesFilterWard === 'ALL'
              ? "Active reports across municipality"
              : issuesFilterWard === 'NEAR_2KM'
              ? "Active reports within 2 km"
              : issuesFilterWard === 'NEAR_5KM'
              ? "Active reports within 5 km"
              : `Active reports in ${activeWards.find(w => w.id === issuesFilterWard)?.shortLabel || issuesFilterWard}`
          }
        />
        <MetricPanel
          label="Under Maintenance"
          value={`${underMaintenanceCount} Sites`}
          subtext={
            issuesFilterWard === 'ALL'
              ? "Repairs in progress citywide"
              : issuesFilterWard === 'NEAR_2KM' || issuesFilterWard === 'NEAR_5KM'
              ? "Active repairs in vicinity"
              : `Repairs in ${activeWards.find(w => w.id === issuesFilterWard)?.shortLabel || issuesFilterWard}`
          }
        />
        <MetricPanel
          label="Resolved"
          value={`${resolvedIssuesCount} Issues`}
          subtext={
            issuesFilterWard === 'ALL'
              ? "Closed community reports"
              : issuesFilterWard === 'NEAR_2KM' || issuesFilterWard === 'NEAR_5KM'
              ? "Resolved in vicinity"
              : `Closed in ${activeWards.find(w => w.id === issuesFilterWard)?.shortLabel || issuesFilterWard}`
          }
        />
      </div>

      {/* Top Priority Alert */}
      <div className="gov-card p-4 border-l-4 border-red-500 bg-red-50/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-semibold text-red-700 uppercase tracking-wide mb-0.5">
                Top Priority Asset in Your Area
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

        {/* Right Column: Nearby Issues Table with Area Filter Dropdown */}
        <div className="lg:col-span-7 space-y-4">
          <div className="gov-card p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#DDE1E5] pb-3 mb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm font-bold text-[#1A1A1A]">
                    Nearby Issues
                  </h3>
                  {userCoords && (
                    <span className="text-[10px] font-semibold text-[#168A44] bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded">
                      GPS Proximity Sorted
                    </span>
                  )}
                </div>
                <span className="text-xs text-[#5F6368]">
                  {issuesFilterWard === 'ALL'
                    ? `Showing all ${filteredComplaints.length} submissions across municipality.`
                    : issuesFilterWard === 'NEAR_2KM'
                    ? `Showing ${filteredComplaints.length} submissions within 2 km of your location (out of ${currentComplaints.length} total).`
                    : issuesFilterWard === 'NEAR_5KM'
                    ? `Showing ${filteredComplaints.length} submissions within 5 km of your location (out of ${currentComplaints.length} total).`
                    : `Showing ${filteredComplaints.length} submissions in ${activeWards.find(w => w.id === issuesFilterWard)?.shortLabel || issuesFilterWard} (out of ${currentComplaints.length} total).`}
                </span>
              </div>

              {/* Area & Proximity Dropdown and Search Input */}
              <div className="flex items-center space-x-2">
                <select
                  value={issuesFilterWard}
                  onChange={(e) => setIssuesFilterWard(e.target.value)}
                  className="px-2.5 py-1.5 text-xs border border-[#DDE1E5] rounded bg-white text-[#1A1A1A] focus:outline-none focus:border-[#168A44] font-medium"
                  title="Filter issues by proximity or area"
                >
                  <option value="ALL">🌐 All Reports ({currentComplaints.length} Citywide)</option>
                  {userCoords && (
                    <>
                      <option value="NEAR_2KM">📍 Near Me (&lt; 2 km) ({currentComplaints.filter(c => c.distanceKm != null && c.distanceKm <= 2.0).length})</option>
                      <option value="NEAR_5KM">📍 Local Area (&lt; 5 km) ({currentComplaints.filter(c => c.distanceKm != null && c.distanceKm <= 5.0).length})</option>
                    </>
                  )}
                  {activeWards.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.shortLabel ? `📍 ${w.shortLabel}` : `📍 ${w.name}`} ({currentComplaints.filter(c => c.ward === w.id).length})
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  placeholder="Search issues..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-3 py-1.5 text-xs border border-[#DDE1E5] rounded bg-[#F7F8FA] focus:outline-none focus:border-[#168A44] w-32 sm:w-44"
                />
              </div>
            </div>

            <DataTable
              columns={complaintColumns}
              data={filteredComplaints}
              idKey="id"
              emptyMessage={
                issuesFilterWard === 'ALL' 
                  ? "No issues found matching your query." 
                  : `No issues reported yet in ${issuesFilterWard}.`
              }
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
          newArea={newArea}
          setNewArea={setNewArea}
          newCategory={newCategory}
          setNewCategory={setNewCategory}
          userCoords={userCoords}
          addressInfo={addressInfo}
          onRequestLocation={requestLocation}
          locationStatus={locationStatus}
        />
      )}
    </div>
  );
};

// ── Shared Submit Modal with Real Locality & GPS Auto-Fill ─────────
const SubmitModal = ({ 
  onClose, 
  onSubmit, 
  newTitle, 
  setNewTitle, 
  newLocation, 
  setNewLocation, 
  newArea, 
  setNewArea, 
  newCategory, 
  setNewCategory,
  userCoords,
  addressInfo,
  onRequestLocation,
  locationStatus
}) => {
  const [detectingGps, setDetectingGps] = useState(false);
  const [gpsAttached, setGpsAttached] = useState(false);

  // Quick suggestions for roads / landmarks
  const suggestedLocations = [
    "Usha Martin Turning Road",
    "Central Arterial Corridor",
    "Commercial Market Square",
    "Industrial Outer Ring Road",
    "Collector Road 8, Sector 5",
    "Station Road Junction"
  ];

  const handleUseGps = () => {
    setDetectingGps(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          try {
            const geo = await reverseGeocode(lat, lon);
            if (geo) {
              setNewArea(geo.shortName);
              const roadName = geo.raw?.address?.road || geo.raw?.address?.suburb || geo.shortName;
              setNewLocation(roadName);
            } else {
              setNewLocation(`GPS Location (${lat.toFixed(4)}, ${lon.toFixed(4)})`);
            }
          } catch {
            setNewLocation(`GPS Location (${lat.toFixed(4)}, ${lon.toFixed(4)})`);
          }
          setDetectingGps(false);
          setGpsAttached(true);
        },
        () => {
          setDetectingGps(false);
          if (userCoords) {
            setNewArea(addressInfo?.shortName || 'Local Area');
            setNewLocation(addressInfo?.shortName || `GPS (${userCoords[0].toFixed(3)}, ${userCoords[1].toFixed(3)})`);
            setGpsAttached(true);
          }
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      setDetectingGps(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white border border-[#DDE1E5] rounded gov-card w-full max-w-lg p-6 space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="border-b border-[#DDE1E5] pb-3 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[#1A1A1A]">Report an Issue</h3>
            <p className="text-xs text-[#5F6368] mt-0.5">Submit an infrastructure problem for municipal inspection</p>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 p-1 text-sm font-semibold"
          >
            ✕
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <Input
            label="Issue Summary *"
            id="complaintTitle"
            placeholder="e.g. large pothole near turning or broken pavement"
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

          {/* Real Area / Locality field (Replaces the synthetic Municipal Ward select) */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#1A1A1A]">
                Area / Locality *
              </label>
              {userCoords && (
                <span className="text-[11px] text-[#168A44] font-medium flex items-center space-x-1">
                  <span>📍 Auto-detected from GPS</span>
                </span>
              )}
            </div>
            <input
              type="text"
              value={newArea}
              onChange={(e) => setNewArea(e.target.value)}
              placeholder="e.g. Angara, Ranchi or Central Sector"
              className="w-full px-3 py-2 text-sm bg-white border border-[#DDE1E5] rounded focus:border-[#168A44] text-[#1A1A1A] focus:outline-none font-medium"
              required
            />
            <p className="text-[11px] text-[#5F6368]">
              Your neighborhood, town, or municipal zone (automatically pre-filled from your live location).
            </p>
          </div>

          {/* Location / Road with GPS Auto-Detect Button & Suggestions */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#1A1A1A]">
                Street / Landmark / Road *
              </label>
              <button
                type="button"
                onClick={handleUseGps}
                disabled={detectingGps}
                className="inline-flex items-center space-x-1 text-xs font-semibold text-[#168A44] hover:text-[#126B37] bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 px-2.5 py-1 rounded transition-colors shadow-xs"
                title="Detect and use current device GPS location"
              >
                <MapPin className="w-3.5 h-3.5 text-[#168A44]" />
                <span>{detectingGps ? 'Detecting GPS...' : '📍 Use Real-Time GPS'}</span>
              </button>
            </div>

            {/* Quick Suggestion Chips */}
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              <span className="text-[11px] text-[#5F6368] self-center">Quick options:</span>
              {suggestedLocations.map((loc) => (
                <button
                  key={loc}
                  type="button"
                  onClick={() => {
                    setNewLocation(loc);
                    setGpsAttached(false);
                  }}
                  className="text-[11px] px-2 py-0.5 bg-gray-100 hover:bg-emerald-50 hover:text-[#168A44] hover:border-emerald-300 border border-[#DDE1E5] rounded transition-colors"
                >
                  + {loc}
                </button>
              ))}
            </div>

            {/* Text input with datalist */}
            <div className="relative">
              <input
                id="complaintLocation"
                type="text"
                list="location-options"
                placeholder="Type specific road (e.g. usha martin turning road, station road)"
                value={newLocation}
                onChange={(e) => {
                  setNewLocation(e.target.value);
                  setGpsAttached(false);
                }}
                required
                className="w-full px-3 py-2 text-sm bg-white border border-[#DDE1E5] rounded focus:border-[#168A44] text-[#1A1A1A] focus:outline-none"
              />
              <datalist id="location-options">
                {suggestedLocations.map((loc) => (
                  <option key={loc} value={loc} />
                ))}
              </datalist>
            </div>

            {gpsAttached && (
              <div className="text-[11px] text-[#168A44] flex items-center space-x-1 font-medium bg-emerald-50 p-1.5 rounded border border-emerald-200">
                <span>✓ Real-time GPS location and coordinates attached to this report.</span>
              </div>
            )}
            <p className="text-[11px] text-[#5F6368]">
              Click "📍 Use Real-Time GPS", choose a quick suggestion, or type any landmark.
            </p>
          </div>

          <div className="pt-3 border-t border-[#DDE1E5] flex justify-end space-x-2">
            <Button variant="secondary" size="sm" onClick={onClose} type="button">
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
};

