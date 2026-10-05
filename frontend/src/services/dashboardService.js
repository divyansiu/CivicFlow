import apiClient from './api';
import { MOCK_SYSTEM_METRICS, SEED_ASSETS } from '../data/mockData';

/**
 * Service for Dashboard KPI Metrics and Risk Distribution
 * Interacts with GET /api/dashboard
 */
export const dashboardService = {
  /**
   * Fetches dashboard summary statistics, risk counts, and top priority asset
   * @returns {Promise<Object>} DashboardResponse object
   */
  async getDashboardSummary() {
    try {
      const data = await apiClient.get('/dashboard');
      return {
        ...data,
        isLive: true,
      };
    } catch (error) {
      console.warn('Backend API /dashboard not reachable, falling back to prototype seed metrics:', error.message);
      
      // Calculate from seed assets as fallback
      const criticalCount = SEED_ASSETS.filter(a => a.risk_level === 'CRITICAL').length;
      const highCount = SEED_ASSETS.filter(a => a.risk_level === 'HIGH').length;
      const mediumCount = SEED_ASSETS.filter(a => a.risk_level === 'MEDIUM').length;
      const lowCount = SEED_ASSETS.filter(a => a.risk_level === 'LOW').length;
      const avgCondition = SEED_ASSETS.reduce((acc, a) => acc + (a.condition_score || 0), 0) / SEED_ASSETS.length;
      const avgPriority = SEED_ASSETS.reduce((acc, a) => acc + (a.priority_score || 0), 0) / SEED_ASSETS.length;

      return {
        total_assets: SEED_ASSETS.length,
        in_progress_count: 1,
        completed_work_count: 136,
        critical_risk_count: criticalCount,
        high_risk_count: highCount,
        medium_risk_count: mediumCount,
        low_risk_count: lowCount,
        under_maintenance_count: 1,
        average_condition_score: Number(avgCondition.toFixed(1)),
        average_priority_score: Number(avgPriority.toFixed(1)),
        risk_distribution: {
          LOW: lowCount,
          MEDIUM: mediumCount,
          HIGH: highCount,
          CRITICAL: criticalCount,
        },
        asset_type_breakdown: {
          road: SEED_ASSETS.filter(a => a.asset_type === 'road').length,
          streetlight: SEED_ASSETS.filter(a => a.asset_type === 'streetlight').length,
          bridge: SEED_ASSETS.filter(a => a.asset_type === 'bridge').length,
        },
        top_priority_asset: SEED_ASSETS[0] || null,
        isLive: false,
        fallbackError: error.message,
      };
    }
  }
};

export default dashboardService;
