import React, { useState } from 'react';
import { Wrench, AlertTriangle, ClipboardCheck, Calendar } from 'lucide-react';
import { formatDate, formatCurrency } from '../../utils/formatters';

export const MaintenanceHistory = ({ history }) => {
  const [activeTab, setActiveTab] = useState('maintenance');

  const records = history?.maintenance_records || [];
  const complaints = history?.complaints || [];
  const inspections = history?.inspections || [];

  return (
    <div className="bg-white rounded border border-[#DDE1E5] overflow-hidden">
      {/* Header and Tab Controls */}
      <div className="p-4 border-b border-[#DDE1E5] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <Wrench className="w-4 h-4 text-[#168A44]" />
          <h3 className="font-bold text-sm text-[#1A1A1A]">Work &amp; Inspection Records</h3>
        </div>

        <div className="flex items-center space-x-1 text-xs">
          <button
            onClick={() => setActiveTab('maintenance')}
            className={`px-3 py-1 rounded font-medium transition-colors ${
              activeTab === 'maintenance'
                ? 'bg-[#126B37] text-white'
                : 'bg-gray-100 text-[#5F6368] hover:bg-gray-200'
            }`}
          >
            Work Orders ({records.length})
          </button>
          <button
            onClick={() => setActiveTab('complaints')}
            className={`px-3 py-1 rounded font-medium transition-colors ${
              activeTab === 'complaints'
                ? 'bg-[#126B37] text-white'
                : 'bg-gray-100 text-[#5F6368] hover:bg-gray-200'
            }`}
          >
            Reported Issues ({complaints.length})
          </button>
          <button
            onClick={() => setActiveTab('inspections')}
            className={`px-3 py-1 rounded font-medium transition-colors ${
              activeTab === 'inspections'
                ? 'bg-[#126B37] text-white'
                : 'bg-gray-100 text-[#5F6368] hover:bg-gray-200'
            }`}
          >
            Inspections ({inspections.length})
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-4">
        {activeTab === 'maintenance' && (
          <div className="space-y-3">
            {records.length > 0 ? (
              records.map((rec, idx) => (
                <div
                  key={rec.maintenance_id || idx}
                  className="p-3 bg-[#F7F8FA] rounded border border-[#DDE1E5] text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-[#168A44]">
                        {rec.maintenance_id || `MNT-${idx + 1}`}
                      </span>
                      <span className="font-semibold text-[#1A1A1A]">{rec.type}</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-red-100 text-red-700 font-bold uppercase">
                        {rec.severity}
                      </span>
                    </div>
                    {rec.description && (
                      <p className="text-[11px] text-[#5F6368]">{rec.description}</p>
                    )}
                  </div>

                  <div className="text-right text-[11px] text-[#5F6368] shrink-0 font-mono">
                    <div className="flex items-center sm:justify-end space-x-1">
                      <Calendar className="w-3 h-3 text-[#5F6368]" />
                      <span>{formatDate(rec.date)}</span>
                    </div>
                    {rec.cost !== undefined && rec.cost !== null && (
                      <div className="font-bold text-[#1A1A1A] mt-0.5">
                        Cost: {formatCurrency(rec.cost)}
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-[#5F6368] italic text-center py-4">
                No past maintenance interventions recorded for this asset.
              </p>
            )}
          </div>
        )}

        {activeTab === 'complaints' && (
          <div className="space-y-3">
            {complaints.length > 0 ? (
              complaints.map((cmp, idx) => (
                <div
                  key={cmp.complaint_id || idx}
                  className="p-3 bg-[#F7F8FA] rounded border border-[#DDE1E5] text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-[#126B37]">
                        {cmp.complaint_id || `CMP-${idx + 1}`}
                      </span>
                      <span className="font-semibold text-[#1A1A1A]">{cmp.category}</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-100 text-amber-800 font-bold uppercase">
                        {cmp.status}
                      </span>
                    </div>
                    {cmp.description && (
                      <p className="text-[11px] text-[#5F6368]">{cmp.description}</p>
                    )}
                  </div>
                  <div className="text-right text-[11px] text-[#5F6368] shrink-0 font-mono">
                    <span>{formatDate(cmp.date)}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-[#5F6368] italic text-center py-4">
                No issues reported for this asset.
              </p>
            )}
          </div>
        )}

        {activeTab === 'inspections' && (
          <div className="space-y-3">
            {inspections.length > 0 ? (
              inspections.map((ins, idx) => (
                <div
                  key={ins.inspection_id || idx}
                  className="p-3 bg-[#F7F8FA] rounded border border-[#DDE1E5] text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-[#168A44]">
                        {ins.inspection_id || `INS-${idx + 1}`}
                      </span>
                      <span className="font-semibold text-[#1A1A1A]">
                        Score: {ins.score !== undefined ? `${ins.score}/100` : '--'}
                      </span>
                    </div>
                    <span className="text-[11px] text-[#5F6368] font-mono">
                      {formatDate(ins.date)}
                    </span>
                  </div>
                  {ins.defect_type && (
                    <div className="text-[11px] text-[#1A1A1A]">
                      <strong>Defect:</strong> {ins.defect_type}
                    </div>
                  )}
                  {ins.notes && (
                    <p className="text-[11px] text-[#5F6368] italic">{ins.notes}</p>
                  )}
                  {ins.inspector && (
                    <div className="text-[10px] text-[#5F6368]">Inspector: {ins.inspector}</div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-xs text-[#5F6368] italic text-center py-4">
                No inspection reports found.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MaintenanceHistory;
