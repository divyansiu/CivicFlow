import React from 'react';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';

export const RiskReasons = ({ reasons = [] }) => {
  return (
    <div className="bg-white p-4 rounded border border-[#DDE1E5] space-y-3">
      <div className="flex items-center space-x-2">
        <AlertTriangle className="w-4 h-4 text-[#168A44]" />
        <h3 className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider">
          Decision Grounding &amp; Key Reasons
        </h3>
      </div>
      <p className="text-[11px] text-[#5F6368]">
        Transparent, grounded factors driving the operational priority ranking:
      </p>

      {reasons && reasons.length > 0 ? (
        <ul className="space-y-2">
          {reasons.map((reason, idx) => (
            <li
              key={idx}
              className="flex items-start space-x-2 text-xs text-[#1A1A1A] p-2 bg-[#F7F8FA] rounded border border-gray-100"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#168A44] mt-1.5 shrink-0" />
              <span>{reason}</span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-xs text-[#5F6368] p-3 bg-gray-50 rounded italic flex items-center space-x-2">
          <Info className="w-3.5 h-3.5 shrink-0" />
          <span>No acute risk risk factors detected. Asset is within baseline operating parameters.</span>
        </div>
      )}

      <div className="text-[10px] text-[#5F6368] italic border-t border-gray-100 pt-2">
        Grounded in recorded municipal inspection, complaint, and maintenance records.
      </div>
    </div>
  );
};

export default RiskReasons;
