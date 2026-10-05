import apiClient from './api';
import { SEED_ASSETS, MOCK_MAINTENANCE_HISTORY, MOCK_CITIZEN_COMPLAINTS } from '../data/mockData';

/**
 * Service for Infrastructure Assets and Ranked Priority Queue
 * Implements endpoints specified in test/divyanshu API documentation:
 * - GET /api/assets
 * - GET /api/assets/{id}
 * - GET /api/assets/{id}/history
 * - GET /api/priorities
 */
export const assetService = {
  /**
   * List assets with optional filtering and pagination
   */
  async getAssets(filters = {}) {
    const { asset_type, risk_level, status, limit = 50, offset = 0 } = filters;
    try {
      const data = await apiClient.get('/assets', {
        asset_type,
        risk_level,
        status,
        limit,
        offset,
      });
      return {
        ...data,
        isLive: true,
      };
    } catch (error) {
      console.warn('Backend API /assets not reachable, filtering seed assets:', error.message);
      let items = [...SEED_ASSETS];
      if (asset_type) items = items.filter(a => a.asset_type === asset_type);
      if (risk_level) items = items.filter(a => a.risk_level === risk_level);
      if (status) items = items.filter(a => a.status === status);

      const paginated = items.slice(offset, offset + limit);
      return {
        items: paginated,
        total: items.length,
        limit,
        offset,
        isLive: false,
        fallbackError: error.message,
      };
    }
  },

  /**
   * Retrieve complete asset detail by unique ID
   */
  async getAssetById(assetId) {
    try {
      const data = await apiClient.get(`/assets/${assetId}`);
      return {
        ...data,
        isLive: true,
      };
    } catch (error) {
      console.warn(`Backend API /assets/${assetId} not reachable, matching seed data:`, error.message);
      const match = SEED_ASSETS.find(a => a.asset_id === assetId) || SEED_ASSETS[0];
      return {
        ...match,
        latitude: match.coordinates ? match.coordinates[0] : 12.9716,
        longitude: match.coordinates ? match.coordinates[1] : 77.5946,
        isLive: false,
        fallbackError: error.message,
      };
    }
  },

  /**
   * Retrieve historical maintenance, complaints, and inspection logs for an asset
   */
  async getAssetHistory(assetId) {
    try {
      const data = await apiClient.get(`/assets/${assetId}/history`);
      return {
        ...data,
        isLive: true,
      };
    } catch (error) {
      console.warn(`Backend API /assets/${assetId}/history not reachable, using fallback logs:`, error.message);
      const records = MOCK_MAINTENANCE_HISTORY[assetId] || [];
      const complaints = MOCK_CITIZEN_COMPLAINTS.filter(c => c.asset_id === assetId);
      return {
        asset_id: assetId,
        maintenance_records: records.map((r, idx) => ({
          maintenance_id: r.id || `MNT-${assetId}-${idx + 1}`,
          asset_id: assetId,
          date: r.date,
          type: r.type || 'Pothole Patching',
          severity: r.severity || 'HIGH',
          cost: parseFloat(String(r.cost || '45000').replace(/[^0-9.]/g, '')) * 100000 || 45000,
          downtime_hours: (r.downtime_days || 1) * 8.0,
          description: r.notes || (r.officer ? `Officer: ${r.officer}` : 'Standard intervention')
        })),
        complaints: complaints.map(c => ({
          complaint_id: c.id,
          asset_id: c.asset_id,
          date: c.submitted_at || '2026-09-28',
          category: c.category,
          severity: c.urgency_flag === 'Critical' ? 'CRITICAL' : 'MEDIUM',
          status: c.status === 'Resolved' ? 'RESOLVED' : 'OPEN',
          description: c.title
        })),
        inspections: [
          {
            inspection_id: `INS-${assetId}-01`,
            asset_id: assetId,
            date: '2026-09-15',
            score: 42.0,
            defect_type: 'Structural surface wear and micro-cracking',
            inspector: 'Eng. R. Sharma (PWD Inspection Unit)',
            notes: 'Pavement degradation accelerating under commercial vehicle axle loads.'
          }
        ],
        isLive: false,
        fallbackError: error.message,
      };
    }
  },

  /**
   * Retrieve ranked priority queue ordered by priority score descending
   */
  async getPriorities(limit = 50, offset = 0) {
    try {
      const data = await apiClient.get('/priorities', { limit, offset });
      return {
        ...data,
        isLive: true,
      };
    } catch (error) {
      console.warn('Backend API /priorities not reachable, ranking seed data:', error.message);
      const sorted = [...SEED_ASSETS].sort((a, b) => (b.priority_score || 0) - (a.priority_score || 0));
      const rankedItems = sorted.map((item, idx) => ({
        rank: idx + 1,
        asset_id: item.asset_id,
        name: item.name,
        asset_type: item.asset_type,
        priority_score: item.priority_score,
        risk_score: item.risk_score,
        risk_level: item.risk_level,
        urgency_score: item.urgency_score,
        impact_score: item.impact_score,
        condition_score: item.condition_score,
        recommended_action: item.recommended_action,
        status: item.status || 'ACTIVE',
        reasons: item.reasons || [],
      }));

      const paginated = rankedItems.slice(offset, offset + limit);
      return {
        items: paginated,
        total: rankedItems.length,
        limit,
        offset,
        isLive: false,
        fallbackError: error.message,
      };
    }
  }
};

export default assetService;
