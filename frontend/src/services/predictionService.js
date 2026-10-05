import apiClient from './api';

/**
 * Service for Decision Intelligence & Predictive Maintenance (POST /api/predict & POST /api/simulate)
 * Connects frontend to Member 3 ML inference and What-if simulation endpoints.
 */
export const predictionService = {
  /**
   * On-demand ML Risk prediction and Decision Intelligence calculation
   * @param {Object} payload Feature vector matching PredictionRequest schema
   */
  async predictMaintenance(payload) {
    try {
      const data = await apiClient.post('/predict', payload);
      return {
        ...data,
        isLive: true,
      };
    } catch (error) {
      console.warn('Backend API /predict failed or unreachable, performing heuristic computation:', error.message);
      
      // Calculate realistic client-side fallback matching PRD decision engine rules
      const condition = payload.condition_score ?? 50;
      const complaints = payload.complaints_30d ?? 0;
      const repairs = payload.previous_repairs ?? 0;
      const age = payload.age_years ?? 5;
      const rainfall = payload.rainfall_30d ?? 100;

      // Heuristic risk score calculation (0 - 100)
      const condFactor = (100 - condition) * 0.45;
      const compFactor = Math.min(complaints * 4.5, 25);
      const repFactor = Math.min(repairs * 4, 15);
      const rainFactor = Math.min((rainfall / 300) * 15, 15);
      const rawRisk = Math.min(Math.max(condFactor + compFactor + repFactor + rainFactor, 5), 98);
      const risk_score = Number(rawRisk.toFixed(1));

      let risk_level = 'LOW';
      let recommended_action = 'Routine monitoring';
      if (risk_score >= 75) {
        risk_level = 'CRITICAL';
        recommended_action = 'Immediate inspection / dispatch';
      } else if (risk_score >= 50) {
        risk_level = 'HIGH';
        recommended_action = 'Priority inspection';
      } else if (risk_score >= 25) {
        risk_level = 'MEDIUM';
        recommended_action = 'Inspect / plan maintenance';
      }

      // Urgency & Impact
      const urgency_score = Number(Math.min(Math.max(complaints * 7 + (100 - condition) * 0.35, 10), 95).toFixed(1));
      const usageMultiplier = payload.usage_level === 'critical' ? 1.3 : payload.usage_level === 'high' ? 1.15 : 0.9;
      const impact_score = Number(Math.min(Math.max((70 + age * 1.2) * usageMultiplier, 15), 98).toFixed(1));

      // PRD Priority Formula: 0.50 * Risk + 0.25 * Urgency + 0.25 * Impact
      const priority_score = Number((0.50 * risk_score + 0.25 * urgency_score + 0.25 * impact_score).toFixed(1));

      const reasons = [];
      if (condition < 50) reasons.push('Poor current condition');
      if (complaints >= 4) reasons.push('High recent complaint frequency');
      if (repairs >= 2) reasons.push('Multiple previous repairs');
      if (rainfall > 150) reasons.push('High environmental exposure');
      if (payload.usage_level === 'high' || payload.usage_level === 'critical') reasons.push('High public criticality');
      if (reasons.length === 0) reasons.push('Baseline routine wear and tear');

      return {
        asset_id: payload.asset_id,
        risk_score,
        risk_level,
        urgency_score,
        impact_score,
        priority_score,
        recommended_action,
        reasons,
        maintenance_required_30d: risk_score >= 50,
        maintenance_probability: Number((risk_score / 100).toFixed(2)),
        model_version: 'v1.0.0-rf-prototype-fallback',
        isLive: false,
        fallbackError: error.message,
      };
    }
  },

  /**
   * Run What-If Maintenance Scenario Analysis
   * @param {Object} payload SimulationRequest matching schema
   */
  async simulateScenario(payload) {
    try {
      const data = await apiClient.post('/simulate', payload);
      return {
        ...data,
        isLive: true,
      };
    } catch (error) {
      console.warn('Backend API /simulate failed or unreachable, performing scenario simulation:', error.message);
      
      const conditionGain = payload.condition_gain || 35.0;
      const complaintReduction = payload.complaints_reduction_percent || 75.0;

      // Create pre & post intervention vectors
      const baseFeatures = payload.custom_features || {
        asset_id: payload.asset_id,
        asset_type: 'road',
        age_years: 10,
        condition_score: 42,
        complaints_30d: 8,
        previous_repairs: 3,
        rainfall_30d: 220,
        usage_level: 'high'
      };

      const before = await this.predictMaintenance(baseFeatures);

      const improvedFeatures = {
        ...baseFeatures,
        condition_score: Math.min(baseFeatures.condition_score + conditionGain, 100),
        complaints_30d: Math.max(Math.round(baseFeatures.complaints_30d * (1 - complaintReduction / 100)), 0),
      };

      const after = await this.predictMaintenance(improvedFeatures);

      const riskDelta = Number((before.risk_score - after.risk_score).toFixed(1));
      const priorityDelta = Number((before.priority_score - after.priority_score).toFixed(1));

      return {
        asset_id: payload.asset_id,
        intervention_type: payload.intervention_type || 'Resurfacing & Drainage Overhaul',
        before,
        after,
        risk_delta: Math.max(riskDelta, 0),
        priority_delta: Math.max(priorityDelta, 0),
        summary: `Simulated ${payload.intervention_type || 'intervention'} improved condition score by +${conditionGain} pts, reducing risk by ${riskDelta} pts (${before.risk_level} → ${after.risk_level}) and priority score by ${priorityDelta} pts.`,
        isLive: false,
        fallbackError: error.message,
      };
    }
  }
};

export default predictionService;
