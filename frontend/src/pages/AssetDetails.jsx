import React, { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, AlertTriangle, Layers, MapPin, Clock, Wrench } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/StatusBadge';
import { PriorityScore } from '../components/risk/PriorityScore';
import { RiskScore } from '../components/risk/RiskScore';
import { UrgencyScore } from '../components/risk/UrgencyScore';
import { ImpactScore } from '../components/risk/ImpactScore';
import { RiskReasons } from '../components/risk/RiskReasons';
import { MaintenanceHistory } from '../components/maintenance/MaintenanceHistory';
import { MaintenanceRecommendation } from '../components/maintenance/MaintenanceRecommendation';
import assetService from '../services/assetService';
import predictionService from '../services/predictionService';
import { formatAssetType, formatDate } from '../utils/formatters';

export const AssetDetailsPage = ({ assetId = 'RD-021', onBack }) => {
  const [asset, setAsset] = useState(null);
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [simulationResult, setSimulationResult] = useState(null);
  const [simulating, setSimulating] = useState(false);
  const [notice, setNotice] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [detailRes, histRes] = await Promise.all([
        assetService.getAssetById(assetId),
        assetService.getAssetHistory(assetId)
      ]);
      setAsset(detailRes);
      setHistory(histRes);
    } catch (err) {
      setError(err.message || 'Failed to load asset details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [assetId]);

  const handleSimulate = async () => {
    if (!asset) return;
    setSimulating(true);
    try {
      const sim = await predictionService.simulateScenario({
        asset_id: asset.asset_id,
        intervention_type: 'Full Resurfacing & Drainage Overhaul',
        condition_gain: 35.0,
        complaints_reduction_percent: 75.0,
        custom_features: {
          asset_id: asset.asset_id,
          asset_type: asset.asset_type || 'road',
          age_years: asset.age_years || 10,
          condition_score: asset.condition_score || 42,
          complaints_30d: asset.complaints_30d || 8,
          previous_repairs: asset.previous_repairs || 3,
          rainfall_30d: asset.rainfall_30d || 220,
          usage_level: asset.usage_level || 'high'
        }
      });
      setSimulationResult(sim);
    } catch (err) {
      alert(`Simulation failed: ${err.message}`);
    } finally {
      setSimulating(false);
    }
  };

  const handleActionTaken = () => {
    setNotice(`Maintenance work order scheduled for ${asset?.name || assetId}. Action: ${asset?.recommended_action}`);
    setTimeout(() => setNotice(null), 5000);
  };

  if (loading) {
    return (
      <div className="p-8 text-center bg-white rounded border border-[#DDE1E5]">
        <RefreshCw className="w-6 h-6 text-[#168A44] animate-spin mx-auto mb-2" />
        <p className="text-xs text-[#5F6368]">Loading asset decision details from backend API...</p>
      </div>
    );
  }

  if (error || !asset) {
    return (
      <div className="p-8 text-center bg-white rounded border border-red-200">
        <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
        <h3 className="text-sm font-bold text-[#1A1A1A]">Unable to load asset</h3>
        <p className="text-xs text-red-600 mt-1">{error || 'Asset not found'}</p>
        <Button variant="outline" size="sm" onClick={onBack} className="mt-4">
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          Back to list
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Navigation & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DDE1E5] pb-4">
        <div className="flex items-center space-x-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-1.5 rounded hover:bg-gray-100 text-[#5F6368] hover:text-[#1A1A1A] border border-[#DDE1E5]"
              title="Back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-xs font-bold text-[#168A44] bg-[#DCFCE7] px-2 py-0.5 rounded">
                {asset.asset_id}
              </span>
              <span className="text-xs text-[#5F6368] capitalize">
                {formatAssetType(asset.asset_type)}
              </span>
              <StatusBadge level={asset.risk_level} size="xs" />
              {asset.isLive && (
                <span className="text-[10px] text-[#126B37] bg-emerald-100 px-2 py-0.5 rounded font-medium">
                  Live API
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1A1A1A] mt-1">
              {asset.name}
            </h1>
            <div className="flex items-center text-xs text-[#5F6368] mt-0.5 space-x-2">
              <MapPin className="w-3.5 h-3.5 text-gray-400" />
              <span>{asset.location || asset.zone || `Lat: ${Number(asset.latitude).toFixed(4)}, Lon: ${Number(asset.longitude).toFixed(4)}`}</span>
              <span>•</span>
              <span>Last Inspected: {formatDate(asset.last_inspected)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handleSimulate} disabled={simulating}>
            <Wrench className="w-3.5 h-3.5 mr-1" />
            {simulating ? 'Simulating...' : 'What-If Simulation'}
          </Button>
          <Button variant="primary" size="sm" onClick={handleActionTaken}>
            Schedule Maintenance
          </Button>
        </div>
      </div>

      {notice && (
        <div className="p-3 bg-[#DCFCE7] border border-emerald-300 text-[#126B37] text-xs rounded flex items-center justify-between">
          <span>{notice}</span>
          <button onClick={() => setNotice(null)} className="underline text-xs">Dismiss</button>
        </div>
      )}

      {/* Main Grid: Priority & Decision Scores */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Scores & Recommendation */}
        <div className="lg:col-span-2 space-y-6">
          <PriorityScore
            score={asset.priority_score}
            riskScore={asset.risk_score}
            urgencyScore={asset.urgency_score}
            impactScore={asset.impact_score}
            rank={asset.rank}
            recommendedAction={asset.recommended_action}
          />

          {/* Sub-Score Breakdown */}
          <div className="bg-white p-4 rounded border border-[#DDE1E5] grid grid-cols-1 sm:grid-cols-3 gap-4">
            <RiskScore score={asset.risk_score} level={asset.risk_level} />
            <UrgencyScore score={asset.urgency_score} />
            <ImpactScore score={asset.impact_score} />
          </div>

          <MaintenanceRecommendation
            asset={asset}
            onSimulate={handleSimulate}
            onExecuteAction={handleActionTaken}
          />

          {/* What-If Simulation Box if run */}
          {simulationResult && (
            <div className="bg-emerald-50/60 border border-emerald-300 rounded p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#126B37] uppercase tracking-wider">
                  What-If Simulation Result ({simulationResult.intervention_type})
                </span>
                <span className="text-[11px] text-[#5F6368] font-mono">
                  Risk Delta: -{simulationResult.risk_delta} pts
                </span>
              </div>
              <p className="text-xs text-[#1A1A1A] font-medium">
                {simulationResult.summary}
              </p>
              <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-emerald-200">
                <div className="p-2 bg-white rounded border border-emerald-200">
                  <span className="text-[10px] text-[#5F6368] block">Before Intervention</span>
                  <div className="font-mono font-bold text-red-600">
                    Risk: {simulationResult.before?.risk_score} ({simulationResult.before?.risk_level})
                  </div>
                  <div className="text-[11px] text-[#5F6368]">
                    Priority: {simulationResult.before?.priority_score}
                  </div>
                </div>
                <div className="p-2 bg-white rounded border border-emerald-200">
                  <span className="text-[10px] text-[#5F6368] block">Projected After Intervention</span>
                  <div className="font-mono font-bold text-[#126B37]">
                    Risk: {simulationResult.after?.risk_score} ({simulationResult.after?.risk_level})
                  </div>
                  <div className="text-[11px] text-[#5F6368]">
                    Priority: {simulationResult.after?.priority_score}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Maintenance & Complaint History */}
          <MaintenanceHistory history={history} />
        </div>

        {/* Right Col: Grounding reasons & Metadata */}
        <div className="space-y-6">
          <RiskReasons reasons={asset.reasons} />

          {/* Asset Technical Specifications */}
          <div className="bg-white p-4 rounded border border-[#DDE1E5] space-y-3 text-xs">
            <h4 className="font-bold text-xs uppercase tracking-wider text-[#1A1A1A] border-b border-gray-100 pb-2">
              Operational Attributes
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-[#5F6368]">Condition Score</span>
                <span className="font-mono font-bold text-[#1A1A1A]">
                  {Number(asset.condition_score || 0).toFixed(0)}/100
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-[#5F6368]">Age</span>
                <span className="font-mono font-bold text-[#1A1A1A]">{asset.age_years} Years</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-[#5F6368]">Complaints (30 Days)</span>
                <span className="font-mono font-bold text-red-600">{asset.complaints_30d || 0}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-[#5F6368]">Previous Repairs</span>
                <span className="font-mono font-bold text-[#1A1A1A]">{asset.previous_repairs || 0}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-[#5F6368]">Rainfall Exposure</span>
                <span className="font-mono font-bold text-[#1A1A1A]">{asset.rainfall_30d || 0} mm</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-[#5F6368]">Criticality</span>
                <span className="font-mono font-bold text-[#1A1A1A] uppercase">{asset.criticality || 'MEDIUM'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#5F6368]">Operational Status</span>
                <span className="font-mono font-bold text-[#126B37]">{asset.status || 'ACTIVE'}</span>
              </div>
            </div>
            <div className="text-[10px] text-[#5F6368] italic pt-2 border-t border-gray-100">
              * Public/geospatial records + clearly labeled synthetic operational data
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetDetailsPage;
