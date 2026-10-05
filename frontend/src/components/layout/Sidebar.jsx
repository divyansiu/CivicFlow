import React from 'react';
import { 
  LayoutDashboard, 
  MapPin, 
  AlertTriangle, 
  Wrench, 
  Users, 
  FileText, 
  LogOut, 
  SlidersHorizontal,
  Home,
  Bell,
  CheckCircle2,
  FolderOpen,
  ArrowLeft,
  X
} from 'lucide-react';

export const Sidebar = ({
  role,
  activeTab,
  onSelectTab,
  onLogout,
  onGoHome,
  stats,
  mobileOpen = false,
  onCloseMobile
}) => {
  const getNavItems = () => {
    if (role === 'user') {
      return [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'complaints', label: 'My Complaints', icon: AlertTriangle, count: 4 },
        { id: 'map', label: 'Nearby Issues', icon: MapPin },
        { id: 'updates', label: 'Maintenance Updates', icon: Wrench },
        { id: 'info', label: 'Information', icon: FileText }
      ];
    }
    
    if (role === 'officer') {
      return [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'assets', label: 'Assets', icon: FolderOpen },
        { id: 'priorities', label: 'Maintenance', icon: Wrench, count: stats?.criticalCount || 2 },
        { id: 'reports', label: 'Reports', icon: FileText },
        { id: 'map', label: 'Map View', icon: MapPin },
        { id: 'notifications', label: 'Notifications', icon: Bell, count: 3 }
      ];
    }

    // Admin
    return [
      { id: 'overview', label: 'Overview', icon: LayoutDashboard },
      { id: 'assets', label: 'Assets', icon: FolderOpen },
      { id: 'users', label: 'Users', icon: Users },
      { id: 'officers', label: 'Officers', icon: Users, count: 3 },
      { id: 'priorities', label: 'Maintenance', icon: Wrench },
      { id: 'reports', label: 'Reports', icon: FileText },
      { id: 'parameters', label: 'System Settings', icon: SlidersHorizontal }
    ];
  };

  const navItems = getNavItems();

  const sidebarContent = (
    <div className="w-64 bg-[#126B37] text-white flex flex-col justify-between h-full select-none">
      <div>
        {/* Header */}
        <div className="p-4 border-b border-[#0e562c] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 bg-white text-[#126B37] rounded flex items-center justify-center font-bold text-xs shadow-sm">
              CF
            </div>
            <div className="leading-tight">
              <span className="font-bold text-base tracking-tight text-white block">
                CivicFlow
              </span>
              <span className="text-[11px] text-[#D1E7DD] font-medium capitalize">
                {role} Portal
              </span>
            </div>
          </div>

          {/* Close button for mobile drawer */}
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="md:hidden p-1 text-[#D1E7DD] hover:text-white rounded"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Back to Home CTA right at top of sidebar */}
        <div className="px-3 pt-3">
          <button
            onClick={() => {
              if (onCloseMobile) onCloseMobile();
              onGoHome();
            }}
            className="w-full flex items-center space-x-2 px-3 py-2 text-xs font-semibold text-[#D1E7DD] hover:text-white bg-[#0e562c]/80 hover:bg-[#0e562c] rounded border border-[#0e562c] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </button>
        </div>

        {/* Navigation items */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  if (onCloseMobile) onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 text-xs font-medium transition-colors text-left rounded ${
                  isActive
                    ? 'bg-[#168A44] text-white font-semibold shadow-sm'
                    : 'text-[#D1E7DD] hover:text-white hover:bg-[#0e562c]'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.count !== undefined && (
                  <span className={`text-[11px] px-1.5 py-0.2 rounded font-medium ${
                    isActive ? 'bg-white text-[#126B37]' : 'bg-[#0e562c] text-[#D1E7DD]'
                  }`}>
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Profile */}
      <div className="p-3 border-t border-[#0e562c] bg-[#0e562c]/60 space-y-2">
        <div className="px-2 py-1.5 rounded">
          <div className="text-xs font-medium text-white truncate">
            {role === 'officer' ? 'Er. A. K. Sundaram' : role === 'admin' ? 'System Administrator' : 'Citizen User'}
          </div>
          <div className="text-[11px] text-[#D1E7DD] truncate">
            {role === 'officer' ? 'Maintenance Officer' : role === 'admin' ? 'Operations Authority' : 'Ward 4 Resident'}
          </div>
        </div>

        <div className="flex items-center space-x-2 pt-1 border-t border-[#0e562c]">
          <button
            onClick={() => {
              if (onCloseMobile) onCloseMobile();
              onGoHome();
            }}
            className="flex-1 flex items-center justify-center space-x-1.5 py-1.5 text-xs text-[#D1E7DD] hover:text-white hover:bg-[#0e562c] rounded transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </button>
          <button
            onClick={onLogout}
            className="flex-1 flex items-center justify-center space-x-1.5 py-1.5 text-xs text-red-200 hover:text-white hover:bg-red-900/40 rounded transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex shrink-0 h-full">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop + Sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div 
            className="fixed inset-0 bg-black/50 transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative z-10 h-full shadow-xl">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
