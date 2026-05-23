import { useState, useEffect, useCallback } from 'react';
import { Reseller } from '../types/index';
import { resellerService } from '../services/resellers/resellerService';
import { useAuth } from '../contexts/AuthContext';
import { useTenant } from '../contexts/TenantContext';

export const useResellers = () => {
  const [resellers, setResellers] = useState<Reseller[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, profile, loading: authLoading } = useAuth();
  const { tenant } = useTenant();

  const agencyId = profile?.agencyId || tenant?.id;

  const fetchResellers = useCallback(async () => {
    if (authLoading) return;
    if (!user || !agencyId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await resellerService.getResellers(agencyId);
      setResellers(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch resellers');
    } finally {
      setLoading(false);
    }
  }, [agencyId, user, authLoading]);

  useEffect(() => {
    fetchResellers();
  }, [fetchResellers]);

  const addReseller = async (name: string, email: string, balance: number, parentId?: string, hierarchyLevel?: number, parentPath?: string) => {
    if (!agencyId) throw new Error('Not authenticated with agency');
    try {
      await resellerService.addReseller(agencyId, { 
        name, 
        email, 
        balance,
        parentId,
        hierarchyLevel,
        parentPath
      });
      await fetchResellers();
    } catch (err: any) {
      throw err;
    }
  };

  const updateBalance = async (id: string, balance: number) => {
    if (!agencyId) throw new Error('Not authenticated with agency');
    try {
      await resellerService.updateResellerBalance(agencyId, id, balance);
      setResellers(prev => prev.map(r => r.id === id ? { ...r, balance: r.balance + balance } : r));
    } catch (err: any) {
      throw err;
    }
  };

  const updateStatus = async (id: string, status: 'ACTIVE' | 'SUSPENDED') => {
    try {
      await resellerService.updateResellerStatus(id, status);
      setResellers(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    } catch (err: any) {
      throw err;
    }
  };

  const updateResellerParams = async (id: string, data: Partial<Reseller>) => {
    try {
      await resellerService.updateReseller(id, data);
      setResellers(prev => prev.map(r => r.id === id ? { ...r, ...data } : r));
    } catch (err: any) {
      throw err;
    }
  };

  const deleteReseller = async (id: string) => {
    try {
      await resellerService.deleteReseller(id);
      setResellers(prev => prev.filter(r => r.id !== id));
    } catch (err: any) {
      throw err;
    }
  };

  const assignTier = async (resellerId: string, tierId: string | null) => {
    try {
      await resellerService.updateResellerTier(resellerId, tierId);
      setResellers(prev => prev.map(r => r.id === resellerId ? { ...r, tierId: tierId || undefined } : r));
    } catch (err: any) {
      throw err;
    }
  };

  return {
    resellers,
    loading,
    error,
    refresh: fetchResellers,
    addReseller,
    updateBalance,
    updateStatus,
    updateResellerParams,
    deleteReseller,
    assignTier
  };
};
