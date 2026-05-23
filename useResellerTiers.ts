import { useState, useEffect, useCallback } from 'react';
import { ResellerTier } from '../types/index';
import { resellerService } from '../services/resellers/resellerService';
import { useAuth } from '../contexts/AuthContext';
import { useTenant } from '../contexts/TenantContext';

export const useResellerTiers = () => {
  const [tiers, setTiers] = useState<ResellerTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, profile, loading: authLoading } = useAuth();
  const { tenant } = useTenant();

  const agencyId = profile?.agencyId || tenant?.id;

  const fetchTiers = useCallback(async () => {
    if (authLoading) return;
    if (!user || !agencyId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await resellerService.getTiers(agencyId);
      setTiers(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch tiers');
    } finally {
      setLoading(false);
    }
  }, [agencyId, user, authLoading]);

  useEffect(() => {
    fetchTiers();
  }, [fetchTiers]);

  const addTier = async (data: Partial<ResellerTier>) => {
    if (!agencyId) throw new Error('Not authenticated');
    try {
      await resellerService.addTier(agencyId, data);
      await fetchTiers();
    } catch (err: any) {
      throw err;
    }
  };

  const updateTier = async (id: string, data: Partial<ResellerTier>) => {
    try {
      await resellerService.updateTier(id, data);
      await fetchTiers();
    } catch (err: any) {
      throw err;
    }
  };

  const deleteTier = async (id: string) => {
    try {
      await resellerService.deleteTier(id);
      await fetchTiers();
    } catch (err: any) {
      throw err;
    }
  };

  return {
    tiers,
    loading,
    error,
    refresh: fetchTiers,
    addTier,
    updateTier,
    deleteTier
  };
};
