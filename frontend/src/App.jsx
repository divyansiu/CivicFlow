import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { Footer } from './components/layout/Footer';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { OfficerDashboard } from './pages/OfficerDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { Dashboard } from './pages/Dashboard';
import { Assets } from './pages/Assets';
import { Priorities } from './pages/Priorities';
import { AssetDetailsPage } from './pages/AssetDetails';
import { InfrastructureMap } from './components/map/InfrastructureMap';
import { SEED_ASSETS } from './data/mockData';
import apiClient from './services/api';
import assetService from './services/assetService';
import { Menu, ArrowLeft, LogOut, Radio, MapPin } from 'lucide-react';
import { useUserLocation } from './hooks/useUserLocation';
import { getLocalizedWardsAndComplaints } from './utils/locationUtils';

export function App() {
  const locationData = useUserLocation();
  const [dismissLocationBanner, setDismissLocationBanner] = useState(false);

  // Navigation state: 'landing' | 'login' | 'dashboard'
  const [currentPage, setCurrentPage] = useState('landing');
  // Roles: 'user' | 'officer' | 'admin' | null
  const [currentUserRole, setCurrentUserRole] = useState(null);
  // Active Sidebar tab
  const [activeTab, setActiveTab] = useState('overview');
  // Mobile drawer state
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  // Selected asset id for user map view
  const [userSelectedAssetId, setUserSelectedAssetId] = useState('RD-021');
  // Standalone inspected asset for deep dive (What-if simulations, history)
  const [inspectedAssetId, setInspectedAssetId] = useState(null);
  // Live backend connection state
  const [backendConnected, setBackendConnected] = useState(false);
  const [allAssets, setAllAssets] = useState(SEED_ASSETS);

  // Localize assets around real-time user GPS if granted
  const localizedData = useMemo(() => {
    if (locationData.coords && Array.isArray(locationData.coords)) {
      return getLocalizedWardsAndComplaints(
        locationData.coords,
        [],
        allAssets,
        locationData.addressInfo
      );
    }
    return { assets: allAssets };
  }, [locationData.coords, locationData.addressInfo, allAssets]);

  const activeAssets = localizedData.assets || allAssets;

  // Filter assets according to selected proximity dropdown
  const filteredAssets = useMemo(() => {
    if (locationData.selectedWard === 'NEAR_2KM') {
      const near = activeAssets.filter(a => a.distanceKm == null || a.distanceKm <= 2.0);
      return near.length > 0 ? near : activeAssets;
    }
    if (locationData.selectedWard === 'NEAR_5KM') {
      const local = activeAssets.filter(a => a.distanceKm == null || a.distanceKm <= 5.0);
      return local.length > 0 ? local : activeAssets;
    }
    return activeAssets;
  }, [activeAssets, locationData.selectedWard]);

  // Check backend health periodically
  useEffect(() => {
    let active = true;
    const checkConnection = async () => {
      try {
        const health = await apiClient.checkHealth();
        if (active) setBackendConnected(Boolean(health && health.status === 'healthy'));
      } catch {
        if (active) setBackendConnected(false);
      }
    };
    checkConnection();
    const interval = setInterval(checkConnection, 15000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  // Fetch initial assets list for maps and shared components
  useEffect(() => {
    assetService.getAssets().then(res => {
      if (res.items && res.items.length > 0) {
        setAllAssets(res.items);
      }
    }).catch(() => {});
  }, []);

  const handleExploreDashboard = () => {
    setCurrentPage('login');
  };

  const handleLoginSuccess = (role) => {
    setCurrentUserRole(role);
    setCurrentPage('dashboard');
    setActiveTab('overview');
    setInspectedAssetId(null);
  };

  const handleLogout = () => {
    setCurrentUserRole(null);
    setCurrentPage('landing');
    setActiveTab('overview');
    setMobileSidebarOpen(false);
    setInspectedAssetId(null);
  };

  const handleGoHome = () => {
    setCurrentPage('landing');
    setMobileSidebarOpen(false);
    setInspectedAssetId(null);
  };

  const handleInspectAsset = (assetId) => {
    setInspectedAssetId(assetId);
    setUserSelectedAssetId(assetId);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F8FA] text-[#1A1A1A]">
      {/* Real-time location prompt banner across app */}
      {locationData.status === 'requesting' && !dismissLocationBanner && (
        <div className="bg-blue-600 text-white px-4 py-2 text-xs flex items-center justify-between sticky top-0 z-50 shadow-sm animate-pulse">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
            <span>📍 <strong>CivicFlow Real-Time Location:</strong> Requesting device location to show public infrastructure issues and road repairs in your immediate area. Please click <strong>Allow</strong> in your browser prompt.</span>
          </div>
          <button onClick={() => setDismissLocationBanner(true)} className="text-blue-200 hover:text-white ml-2 text-sm font-bold">✕</button>
        </div>
      )}
      {locationData.status === 'granted' && !dismissLocationBanner && (
        <div className="bg-[#126B37] text-white px-4 py-1.5 text-xs flex items-center justify-between sticky top-0 z-50 shadow-sm">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[#86EFAC] inline-block" />
            <span>
              📍 <strong>Live GPS Active:</strong> Detected near{' '}
              <strong>{locationData.addressInfo?.shortName || 'Current Location'}</strong>
              {locationData.addressInfo?.city ? ` (${locationData.addressInfo.city})` : ''} • Showing infrastructure issues sorted by real proximity to you.
            </span>
          </div>
          <button onClick={() => setDismissLocationBanner(true)} className="text-[#86EFAC] hover:text-white ml-2 text-xs font-medium">✕ Dismiss</button>
        </div>
      )}

      {/* LANDING PAGE ROUTE */}
      {currentPage === 'landing' && (
        <>
          <Navbar 
            onExploreDashboard={handleExploreDashboard} 
            currentRole={currentUserRole}
            onLogout={handleLogout}
            locationData={locationData}
          />
          <main className="flex-1">
            <LandingPage onExploreDashboard={handleExploreDashboard} />
          </main>
          <Footer />
        </>
      )}

      {/* LOGIN PAGE ROUTE */}
      {currentPage === 'login' && (
        <LoginPage 
          onLoginSuccess={handleLoginSuccess}
          onBackToHome={handleGoHome}
        />
      )}

      {/* ROLE DASHBOARDS ROUTE */}
      {currentPage === 'dashboard' && currentUserRole && (
        <div className="flex h-screen overflow-hidden bg-[#F7F8FA]">
          {/* Institutional Green Sidebar (#126B37) with responsive drawer */}
          <Sidebar
            role={currentUserRole}
            activeTab={activeTab}
            onSelectTab={(tab) => {
              setActiveTab(tab);
              setInspectedAssetId(null);
            }}
            onLogout={handleLogout}
            onGoHome={handleGoHome}
            stats={{ 
              criticalCount: allAssets.filter(a => a.risk_level === 'CRITICAL').length || 2,
              complaintsCount: 10
            }}
            mobileOpen={mobileSidebarOpen}
            onCloseMobile={() => setMobileSidebarOpen(false)}
          />

          {/* Main Dashboard Body */}
          <div className="flex-1 flex flex-col overflow-y-auto min-w-0">
            {/* Top Subheader Bar with Mobile Menu Toggle & Clear Back Button */}
            <header className="h-14 bg-white border-b border-[#DDE1E5] px-4 sm:px-6 flex items-center justify-between text-xs shrink-0 sticky top-0 z-20">
              <div className="flex items-center space-x-2 sm:space-x-3">
                {/* Mobile hamburger menu */}
                <button
                  onClick={() => setMobileSidebarOpen(true)}
                  className="md:hidden p-1.5 rounded text-[#5F6368] hover:text-[#1A1A1A] hover:bg-gray-100 focus:outline-none"
                  aria-label="Open navigation menu"
                >
                  <Menu className="w-5 h-5" />
                </button>

                {/* Back to Home Button */}
                <button
                  onClick={handleGoHome}
                  className="inline-flex items-center space-x-1.5 px-2.5 py-1.5 text-xs font-medium text-[#5F6368] hover:text-[#168A44] hover:bg-gray-100 rounded border border-[#DDE1E5] transition-colors"
                  title="Back to Landing Page"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Back to Home</span>
                  <span className="sm:hidden">Home</span>
                </button>

                <div className="hidden sm:flex items-center space-x-2 text-[#5F6368]">
                  <span className="font-semibold text-[#1A1A1A]">CivicFlow</span>
                  <span>•</span>
                  <span className="capitalize">{currentUserRole} Portal</span>
                  <span>•</span>
                  <span className="text-[#168A44] font-medium capitalize">
                    {inspectedAssetId ? `Asset ${inspectedAssetId}` : activeTab}
                  </span>
                </div>
              </div>

              {/* Right side controls */}
              <div className="flex items-center space-x-2 sm:space-x-3">
                {/* Real-Time Area / Proximity Selector Dropdown */}
                <div className="flex items-center space-x-1.5 bg-gray-50 hover:bg-gray-100 border border-[#DDE1E5] rounded px-2.5 py-1 text-xs transition-colors">
                  <MapPin className={`w-3.5 h-3.5 shrink-0 ${locationData.status === 'granted' ? 'text-[#168A44]' : 'text-[#5F6368]'}`} />
                  <select
                    value={locationData.selectedWard}
                    onChange={(e) => {
                      if (e.target.value === 'GPS_REFRESH') {
                        locationData.requestLocation(true);
                      } else {
                        locationData.setSelectedWard(e.target.value);
                      }
                    }}
                    className="bg-transparent border-none text-xs font-semibold text-[#1A1A1A] focus:outline-none cursor-pointer max-w-[180px] truncate"
                    title="Filter by proximity, area, or refresh real-time GPS"
                  >
                    <option value="NEAR_2KM">📍 Near Me (&lt; 2 km)</option>
                    <option value="NEAR_5KM">📍 Local Area (&lt; 5 km)</option>
                    <option value="ALL">🌐 All Reports (Citywide)</option>
                    <option value="GPS_REFRESH">🔄 Refresh Real-Time GPS</option>
                  </select>
                  {locationData.status === 'granted' && (
                    <span className="hidden xl:inline text-[9px] font-bold uppercase bg-emerald-100 text-[#126B37] px-1 py-0.2 rounded border border-emerald-300 shrink-0">
                      GPS Live
                    </span>
                  )}
                </div>
                
                {/* Backend Connection Indicator */}
                {backendConnected ? (
                  <span className="hidden sm:flex items-center text-[#168A44] font-medium text-xs bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-[#168A44] inline-block mr-1.5 animate-pulse" />
                    API Live (8000)
                  </span>
                ) : (
                  <span className="hidden sm:flex items-center text-[#5F6368] font-medium text-xs bg-gray-50 px-2 py-0.5 rounded border border-[#DDE1E5]">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block mr-1.5" />
                    Operational
                  </span>
                )}

                <button
                  onClick={handleLogout}
                  className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 rounded border border-red-200 transition-colors"
                  title="Log out from dashboard"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            </header>

            {/* Dashboard Content */}
            <main className="p-4 sm:p-6 flex-1 min-w-0">
              {/* If an asset is currently selected for deep-dive inspection */}
              {inspectedAssetId ? (
                <AssetDetailsPage
                  assetId={inspectedAssetId}
                  onBack={() => setInspectedAssetId(null)}
                />
              ) : (
                <>
                  {/* OFFICER ROLE (DEFAULT) */}
                  {currentUserRole !== 'admin' && (
                    <>
                      {activeTab === 'map' ? (
                        <div className="space-y-4">
                          <InfrastructureMap
                            assets={filteredAssets}
                            selectedAssetId={userSelectedAssetId}
                            onSelectAsset={(id) => {
                              setUserSelectedAssetId(id);
                              handleInspectAsset(id);
                            }}
                            userCoords={locationData.coords}
                          />
                          <div className="text-xs text-[#5F6368] text-center">
                            Selected: <strong className="text-[#1A1A1A]">{filteredAssets.find(a => a.asset_id === userSelectedAssetId)?.name || filteredAssets[0]?.name}</strong>
                            {' — '}click on pin to view asset details.
                          </div>
                        </div>
                      ) : activeTab === 'assets' ? (
                        <Assets onSelectAsset={handleInspectAsset} />
                      ) : activeTab === 'priorities' ? (
                        <Priorities onSelectAsset={handleInspectAsset} />
                      ) : (
                        <OfficerDashboard activeTab={activeTab} locationData={locationData} localizedAssets={filteredAssets} />
                      )}
                    </>
                  )}

                  {/* ADMIN ROLE */}
                  {currentUserRole === 'admin' && (
                    <>
                      {activeTab === 'assets' ? (
                        <Assets onSelectAsset={handleInspectAsset} />
                      ) : activeTab === 'priorities' ? (
                        <Priorities onSelectAsset={handleInspectAsset} />
                      ) : (
                        <AdminDashboard activeTab={activeTab} />
                      )}
                    </>
                  )}
                </>
              )}
            </main>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
