import React, { useState, useEffect } from 'react';
import { PriorityList } from '../components/dashboard/PriorityList';
import { RefreshCw, Wrench, ShieldAlert, Sparkles, Filter } from 'lucide-react';
import assetService from '../services/assetService';
import predictionService from '../services/predictionService';

export const Priorities = ({ onSelectAsset }) => {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const [simulationActive, setSimulationActive] = useState(false);
  const [simResults, setSimResults] = useState(null);

  const loadPriorities = async () => {
    setLoading(true);
    try {
      const res = await assetService.getPriorities(50);
      setItems(res.items || []);
      setTotal(res.total || 0);
      setIsLive(Boolean(res.isLive));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPriorities();
  }, []);

  const handleSimulateTopIntervention = async () => {
    if (!items.length) return;
    const top = items[0];
    setSimulationActive(true);
    try {
      const sim = await predictionService.simulateScenario({
        asset_id: top.asset_id,
        intervention_type: 'Priority Overlay & Milling Intervention',
        condition_gain: 40.0,
        complaints_reduction_percent: 80.0,
      });
      setSimResults(sim);
    } catch (err) {
      alert(`Simulation failed: ${err.message}`);
    } finally {
      setSimulationActive(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DDE1E5] pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1A1A1A]">
              Operational Maintenance Priority Queue
            </h1>
            {isLive ? (
              <span className="text-[10px] font-semibold bg-emerald-100 text-[#126B37] px-2 py-0.5 rounded border border-emerald-300">
                Live Backend API
              </span>
            ) : (
              <span className="text-[10px] font-semibold bg-amber-100 text-amber-800 px-2 py-0.5 rounded border border-amber-300">
                Prototype Seed
              </span>
            )}
          </div>
          <p className="text-xs text-[#5F6368] mt-0.5">
            Strict descending order by Composite Priority Score (0.50 Risk + 0.25 Urgency + 0.25 Impact)
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleSimulateTopIntervention}
            disabled={simulationActive || !items.length}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold bg-[#126B37] text-white hover:bg-[#0E522A] rounded shadow-xs transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{simulationActive ? 'Simulating...' : 'Simulate #1 Intervention'}</span>
          </button>
          <button
            onClick={loadPriorities}
            disabled={loading}
            className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-medium text-[#5F6368] hover:text-[#168A44] hover:bg-gray-100 rounded border border-[#DDE1E5]"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#168A44]' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Simulation Result Callout if triggered */}
      {simResults && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#126B37] uppercase tracking-wider">
              Simulation Assessment ({simResults.intervention_type})
            </span>
            <button
              onClick={() => setSimResults(null)}
              className="text-xs text-[#5F6368] hover:text-[#1A1A1A]"
            >
              Close
            </button>
          </div>
          <p className="text-xs text-[#1A1A1A]">
            {simResults.summary}
          </p>
          <div className="text-[11px] text-[#126B37] font-mono">
            Risk Improvement: -{simResults.risk_delta} pts | Priority Improvement: -{simResults.priority_delta} pts
          </div>
        </div>
      )}

      {/* Full Priority Table */}
      <PriorityList
        assets={items}
        onSelectAsset={onSelectAsset}
      />
    </div>
  );
};

export default Priorities;
