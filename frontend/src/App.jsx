import React, { useState, useEffect } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { Footer } from './components/layout/Footer';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { UserDashboard } from './pages/UserDashboard';
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
import { Menu, ArrowLeft, LogOut, Radio } from 'lucide-react';

export function App() {
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
      {/* LANDING PAGE ROUTE */}
      {currentPage === 'landing' && (
        <>
          <Navbar 
            onExploreDashboard={handleExploreDashboard} 
            currentRole={currentUserRole}
            onLogout={handleLogout}
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
            stats={{ criticalCount: allAssets.filter(a => a.risk_level === 'CRITICAL').length || 2 }}
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
                <span className="hidden lg:inline text-[#5F6368]">North &amp; Central District</span>
                
                {/* Backend Connection Indicator */}
                {backendConnected ? (
                  <span className="hidden sm:flex items-center text-[#168A44] font-medium text-xs bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-[#168A44] inline-block mr-1.5 animate-pulse" />
                    API Live (8000)
                  </span>
                ) : (
                  <span className="hidden sm:flex items-center text-amber-700 font-medium text-xs bg-amber-50 px-2 py-0.5 rounded border border-amber-200" title="FastAPI backend offline; using prototype seed data">
                    <span className="w-2 h-2 rounded-full bg-amber-500 inline-block mr-1.5" />
                    Prototype Mode
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
                  {/* USER ROLE */}
                  {currentUserRole === 'user' && (
                    <>
                      {activeTab === 'map' ? (
                        <div className="space-y-4">
                          <InfrastructureMap
                            assets={allAssets}
                            selectedAssetId={userSelectedAssetId}
                            onSelectAsset={(id) => {
                              setUserSelectedAssetId(id);
                              handleInspectAsset(id);
                            }}
                          />
                          {userSelectedAssetId && (
                            <div className="text-xs text-[#5F6368] text-center">
                              Selected: <strong className="text-[#1A1A1A]">{allAssets.find(a => a.asset_id === userSelectedAssetId)?.name}</strong>
                              {' — '}click to inspect full decision intelligence file.
                            </div>
                          )}
                        </div>
                      ) : (
                        <UserDashboard
                          activeTab={activeTab}
                          onSelectAsset={handleInspectAsset}
                        />
                      )}
                    </>
                  )}

                  {/* OFFICER ROLE */}
                  {currentUserRole === 'officer' && (
                    <>
                      {activeTab === 'map' ? (
                        <div className="space-y-4">
                          <InfrastructureMap
                            assets={allAssets}
                            selectedAssetId={userSelectedAssetId}
                            onSelectAsset={(id) => {
                              setUserSelectedAssetId(id);
                              handleInspectAsset(id);
                            }}
                          />
                          <div className="text-xs text-[#5F6368] text-center">
                            Selected: <strong className="text-[#1A1A1A]">{allAssets.find(a => a.asset_id === userSelectedAssetId)?.name}</strong>
                            {' — '}click on pin to inspect decision file.
                          </div>
                        </div>
                      ) : activeTab === 'assets' ? (
                        <Assets onSelectAsset={handleInspectAsset} />
                      ) : activeTab === 'priorities' ? (
                        <Priorities onSelectAsset={handleInspectAsset} />
                      ) : (
                        <OfficerDashboard activeTab={activeTab} />
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
