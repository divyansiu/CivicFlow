import React from 'react';
import { 
  MapPin, 
  Wrench, 
  Layers, 
  Calendar,
  AlertTriangle,
  Clock,
  ChevronRight,
  Info,
  CheckCircle2
} from 'lucide-react';
import { StatusBadge } from '../ui/StatusBadge';
import { Button } from '../ui/Button';
import { MOCK_MAINTENANCE_HISTORY } from '../../data/mockData';

export const AssetDetails = ({ asset, onActionTaken }) => {
  if (!asset) {
    return (
      <div className="gov-card flex flex-col items-center justify-center p-12 text-center text-[#5F6368]">
        <Layers className="w-10 h-10 text-gray-300 mb-3" />
        <p className="text-sm font-semibold text-[#1A1A1A]">No Asset Selected</p>
        <p className="text-xs text-[#5F6368] max-w-xs mt-1">
          Select an asset from the list or map to view details.
        </p>
      </div>
    );
  }

  const maintenanceHistory = MOCK_MAINTENANCE_HISTORY[asset.asset_id] || [];

  const severityColor = (s) => {
    switch (s?.toLowerCase()) {
      case 'critical': return 'text-red-700 bg-red-50 border-red-200';
      case 'high':     return 'text-orange-700 bg-orange-50 border-orange-200';
      case 'medium':   return 'text-amber-700 bg-amber-50 border-amber-200';
      default:         return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    }
  };

  return (
    <div className="space-y-4">
      {/* Asset Header Banner */}
      <div className="gov-card p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DDE1E5] pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-[#126B37] bg-[#DCFCE7] px-2 py-0.5 rounded">
                {asset.asset_id}
              </span>
              <span className="text-xs text-[#5F6368] font-medium capitalize">
                {asset.asset_type}
              </span>
              <StatusBadge level={asset.risk_level} />
            </div>
            <h2 className="text-lg font-bold text-[#1A1A1A] mt-2">
              {asset.name}
            </h2>
            <div className="flex items-center text-xs text-[#5F6368] mt-1 space-x-1">
              <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span>{asset.location}</span>
            </div>
          </div>

          <div className="text-right sm:border-l sm:border-[#DDE1E5] sm:pl-5 flex sm:flex-col items-baseline justify-between sm:justify-center">
            <span className="text-xs text-[#5F6368]">Priority Score</span>
            <div className="text-2xl font-bold text-[#1A1A1A]">
              {asset.priority_score}<span className="text-xs font-normal text-[#5F6368]">/100</span>
            </div>
            <span className="text-xs font-semibold text-red-600">
              Priority #{asset.rank}
            </span>
          </div>
        </div>

        {/* 4-Score Decision Breakdown */}
        <div className="mt-4">
          <div className="text-xs font-semibold text-[#5F6368] uppercase tracking-wider mb-2">
            Decision Score Breakdown
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-2.5 rounded border border-red-200 bg-red-50/60">
              <div className="text-xs text-red-700 font-medium">Risk</div>
              <div className="text-lg font-bold text-red-700">{asset.risk_score}</div>
              <div className="text-[11px] text-[#5F6368]">Structural wear</div>
            </div>
            <div className="p-2.5 rounded border border-orange-200 bg-orange-50/60">
              <div className="text-xs text-orange-700 font-medium">Urgency</div>
              <div className="text-lg font-bold text-orange-700">{asset.urgency_score}</div>
              <div className="text-[11px] text-[#5F6368]">Complaints & age</div>
            </div>
            <div className="p-2.5 rounded border border-blue-200 bg-blue-50/60">
              <div className="text-xs text-blue-700 font-medium">Impact</div>
              <div className="text-lg font-bold text-blue-700">{asset.impact_score}</div>
              <div className="text-[11px] text-[#5F6368]">Public exposure</div>
            </div>
            <div className="p-2.5 rounded border border-[#168A44]/30 bg-emerald-50/60">
              <div className="text-xs text-[#126B37] font-medium">Priority</div>
              <div className="text-lg font-bold text-[#126B37]">{asset.priority_score}</div>
              <div className="text-[11px] text-[#5F6368]">Overall rank</div>
            </div>
          </div>
          <div className="mt-2 text-[11px] text-[#5F6368] text-right">
            Formula: Priority = 0.50 × Risk + 0.25 × Urgency + 0.25 × Impact
          </div>
        </div>
      </div>

      {/* Recommended Action */}
      <div className="gov-card p-5 bg-[#F7F8FA]">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Wrench className="w-4 h-4 text-[#168A44]" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#1A1A1A]">
              Recommended Action
            </h3>
          </div>
          <span className="text-xs font-medium text-red-700 bg-white px-2 py-0.5 rounded border border-red-200">
            Within {asset.action_deadline_days} Days
          </span>
        </div>
        <p className="text-sm font-semibold text-[#1A1A1A]">
          {asset.recommended_action}
        </p>
        <div className="mt-3 pt-3 border-t border-[#DDE1E5] flex flex-wrap items-center justify-between text-xs text-[#5F6368] gap-2">
          <span>Estimated Cost: <strong className="text-[#1A1A1A]">{asset.cost_estimate_band}</strong></span>
          <span>Last Inspection: <strong className="text-[#1A1A1A]">{asset.last_inspected}</strong></span>
        </div>
      </div>

      {/* Key Observations / Why This Is a Priority */}
      <div className="gov-card p-5">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#1A1A1A] mb-3 border-b border-[#DDE1E5] pb-2">
          Key Observations
        </h3>

        <ul className="space-y-2 text-xs">
          {asset.reasons && asset.reasons.map((reason, idx) => (
            <li key={idx} className="flex items-start space-x-2 p-2 bg-[#F7F8FA] rounded border border-[#EDEFF2]">
              <span className="w-4 h-4 rounded-full bg-[#168A44] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <span className="text-[#1A1A1A] font-normal leading-relaxed">{reason}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Asset Condition & Information */}
      <div className="gov-card p-5">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#1A1A1A] mb-3 border-b border-[#DDE1E5] pb-2">
          Asset Information
        </h3>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-2.5 rounded border border-[#DDE1E5] bg-white">
            <span className="text-[#5F6368] block text-[11px]">Condition Score</span>
            <span className="font-bold text-[#1A1A1A] text-sm">{asset.condition_score} / 100</span>
          </div>
          <div className="p-2.5 rounded border border-[#DDE1E5] bg-white">
            <span className="text-[#5F6368] block text-[11px]">Age</span>
            <span className="font-bold text-[#1A1A1A] text-sm">{asset.age_years} Years</span>
          </div>
          <div className="p-2.5 rounded border border-[#DDE1E5] bg-white">
            <span className="text-[#5F6368] block text-[11px]">Citizen Complaints</span>
            <span className="font-bold text-red-600 text-sm">{asset.complaints_30d} Reports</span>
          </div>
          <div className="p-2.5 rounded border border-[#DDE1E5] bg-white">
            <span className="text-[#5F6368] block text-[11px]">Previous Repairs</span>
            <span className="font-bold text-[#1A1A1A] text-sm">{asset.previous_repairs} Times</span>
          </div>
          <div className="p-2.5 rounded border border-[#DDE1E5] bg-white">
            <span className="text-[#5F6368] block text-[11px]">Rainfall (30 Days)</span>
            <span className="font-bold text-[#1A1A1A] text-sm">{asset.rainfall_30d} mm</span>
          </div>
          <div className="p-2.5 rounded border border-[#DDE1E5] bg-white">
            <span className="text-[#5F6368] block text-[11px]">Traffic Volume</span>
            <span className="font-bold text-[#1A1A1A] text-sm">{asset.traffic_pcu?.toLocaleString()} PCU</span>
          </div>
          <div className="p-2.5 rounded border border-[#DDE1E5] bg-white col-span-2 sm:col-span-3">
            <span className="text-[#5F6368] block text-[11px]">Surface Specification</span>
            <span className="font-medium text-[#1A1A1A] text-xs">{asset.surface_type}</span>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-[#DDE1E5] flex justify-end space-x-2">
          <Button variant="secondary" size="sm" onClick={() => alert(`Exporting work report for ${asset.asset_id}`)}>
            Print Report
          </Button>
          <Button variant="primary" size="sm" onClick={() => onActionTaken && onActionTaken(asset)}>
            Schedule Maintenance
          </Button>
        </div>
      </div>

      {/* Maintenance History Timeline */}
      <div className="gov-card p-5">
        <div className="flex items-center justify-between border-b border-[#DDE1E5] pb-2 mb-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#1A1A1A]">
            Past Maintenance Work Orders
          </h3>
        </div>

        {maintenanceHistory.length === 0 ? (
          <div className="py-6 text-center text-xs text-[#5F6368]">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
            No prior maintenance records on file. Asset is within its first service cycle.
          </div>
        ) : (
          <div className="space-y-3">
            {maintenanceHistory.map((record, idx) => (
              <div key={record.id} className="flex items-start space-x-3">
                {/* Timeline dot */}
                <div className="flex flex-col items-center shrink-0 pt-0.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#168A44] border-2 border-white ring-1 ring-[#168A44]" />
                  {idx < maintenanceHistory.length - 1 && (
                    <span className="w-px flex-1 bg-[#DDE1E5] mt-1" style={{ minHeight: '24px' }} />
                  )}
                </div>

                {/* Record card */}
                <div className="flex-1 p-3 bg-[#F7F8FA] rounded border border-[#DDE1E5] space-y-1 text-xs mb-1">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="font-semibold text-[#1A1A1A]">{record.type}</span>
                    <span className={`px-2 py-0.5 rounded border font-medium text-[11px] ${severityColor(record.severity)}`}>
                      {record.severity}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 text-[#5F6368]">
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{record.date}</span>
                    </span>
                    <span>•</span>
                    <span className="font-medium text-[#1A1A1A]">{record.cost}</span>
                    {record.downtime_days > 0 && (
                      <>
                        <span>•</span>
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{record.downtime_days}d downtime</span>
                        </span>
                      </>
                    )}
                  </div>
                  <div className="text-[#5F6368] leading-relaxed">{record.notes}</div>
                  <div className="text-[#5F6368] pt-0.5">
                    Officer: <span className="font-medium text-[#1A1A1A]">{record.officer}</span>
                    <span className="ml-3 text-emerald-700 font-medium">✓ {record.status}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};


