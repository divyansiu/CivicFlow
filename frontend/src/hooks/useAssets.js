import { useState, useEffect, useCallback } from 'react';
import assetService from '../services/assetService';

/**
 * Custom hook to manage fetching and filtering assets from the backend
 */
export function useAssets(initialFilters = {}) {
  const [assets, setAssets] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLive, setIsLive] = useState(false);
  const [filters, setFilters] = useState(initialFilters);

  const fetchAssets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await assetService.getAssets(filters);
      setAssets(res.items || []);
      setTotal(res.total || 0);
      setIsLive(Boolean(res.isLive));
    } catch (err) {
      setError(err.message || 'Failed to fetch assets');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  const updateFilters = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  return {
    assets,
    total,
    loading,
    error,
    isLive,
    filters,
    updateFilters,
    refetch: fetchAssets,
  };
}

export default useAssets;
