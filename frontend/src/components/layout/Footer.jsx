import React from 'react';
import { ShieldCheck, HeartHandshake, Phone, Mail } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-white text-[#5F6368] border-t border-[#DDE1E5] text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1 */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-[#168A44] text-white rounded flex items-center justify-center font-bold text-xs shadow-sm">
                CF
              </div>
              <span className="font-bold text-base tracking-tight text-[#1A1A1A]">
                CivicFlow
              </span>
            </div>
            <p className="text-xs leading-relaxed text-[#5F6368]">
              Public infrastructure maintenance management system designed to prioritize repairs, reduce disruptions, and keep public facilities safe.
            </p>
          </div>

          {/* Col 2 */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#1A1A1A]">
              Infrastructure Categories
            </h4>
            <ul className="space-y-1.5 text-[#5F6368] text-xs">
              <li>Roads & Highways</li>
              <li>Streetlights & Lighting Grids</li>
              <li>Bridges & Flyovers</li>
              <li>Drainage & Water Channels</li>
            </ul>
          </div>

          {/* Col 3 */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#1A1A1A]">
              Platform Access
            </h4>
            <ul className="space-y-1.5 text-[#5F6368] text-xs">
              <li>Field Engineering Operations</li>
              <li>Department Administration</li>
            </ul>
          </div>

          {/* Col 4 */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#1A1A1A]">
              Assistance & Transparency
            </h4>
            <p className="text-xs leading-relaxed text-[#5F6368]">
              Municipal Engineering & Public Works Division. Dedicated to transparent maintenance planning and rapid fault resolution.
            </p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-[#DDE1E5] flex flex-col sm:flex-row items-center justify-between text-xs text-[#5F6368]">
          <div>
            &copy; 2026 CivicFlow. Government Infrastructure Management System.
          </div>
          <div className="mt-2 sm:mt-0 flex space-x-4">
            <span className="hover:text-[#168A44] cursor-pointer">Privacy Policy</span>
            <span className="hover:text-[#168A44] cursor-pointer">Terms of Service</span>
            <span className="hover:text-[#168A44] cursor-pointer">Accessibility</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
