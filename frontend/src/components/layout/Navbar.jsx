import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { ArrowRight, Menu, X } from 'lucide-react';

export const Navbar = ({ onExploreDashboard, currentRole, onLogout }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b border-[#DDE1E5] sticky top-0 z-40">
      <div className="h-16 px-4 md:px-8 flex items-center justify-between">
        <div className="flex items-center space-x-6 lg:space-x-8">
          <a href="#home" className="flex items-center space-x-2.5">
            <div className="w-7 h-7 bg-[#168A44] rounded flex items-center justify-center text-white font-bold text-sm shadow-sm">
              CF
            </div>
            <span className="font-bold text-lg tracking-tight text-[#1A1A1A]">
              CivicFlow
            </span>
          </a>

          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-[#5F6368]">
            <a href="#home" className="hover:text-[#168A44] transition-colors">Home</a>
            <a href="#how-it-works" className="hover:text-[#168A44] transition-colors">How It Works</a>
            <a href="#infrastructure" className="hover:text-[#168A44] transition-colors">Infrastructure</a>
          </nav>
        </div>

        {/* Desktop Actions */}
        <div className="hidden sm:flex items-center space-x-3">
          {currentRole ? (
            <div className="flex items-center space-x-3">
              <span className="text-xs font-medium text-[#126B37] bg-[#DCFCE7] px-2.5 py-1 rounded border border-emerald-200">
                Role: {currentRole.charAt(0).toUpperCase() + currentRole.slice(1)}
              </span>
              <Button variant="outline" size="sm" onClick={onLogout}>
                Logout
              </Button>
            </div>
          ) : (
            <Button variant="primary" size="sm" onClick={onExploreDashboard}>
              <span>Explore Dashboard</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex items-center space-x-2 sm:hidden">
          <Button variant="primary" size="sm" onClick={onExploreDashboard} className="text-xs px-2.5 py-1">
            Explore
          </Button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded text-[#5F6368] hover:text-[#1A1A1A] hover:bg-gray-100 focus:outline-none"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden px-4 pt-2 pb-4 border-t border-[#DDE1E5] bg-white space-y-3">
          <nav className="flex flex-col space-y-2 text-sm font-medium text-[#5F6368]">
            <a 
              href="#home" 
              onClick={() => setMobileMenuOpen(false)}
              className="px-2 py-1.5 rounded hover:bg-gray-50 hover:text-[#168A44]"
            >
              Home
            </a>
            <a 
              href="#how-it-works" 
              onClick={() => setMobileMenuOpen(false)}
              className="px-2 py-1.5 rounded hover:bg-gray-50 hover:text-[#168A44]"
            >
              How It Works
            </a>
            <a 
              href="#infrastructure" 
              onClick={() => setMobileMenuOpen(false)}
              className="px-2 py-1.5 rounded hover:bg-gray-50 hover:text-[#168A44]"
            >
              Infrastructure
            </a>
          </nav>

          <div className="pt-2 border-t border-[#DDE1E5]">
            {currentRole ? (
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[#126B37] bg-[#DCFCE7] px-2 py-1 rounded">
                  {currentRole.toUpperCase()}
                </span>
                <Button variant="outline" size="sm" onClick={onLogout}>
                  Logout
                </Button>
              </div>
            ) : (
              <Button 
                variant="primary" 
                size="sm" 
                onClick={() => {
                  setMobileMenuOpen(false);
                  onExploreDashboard();
                }} 
                className="w-full justify-center"
              >
                <span>Explore Dashboard</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
