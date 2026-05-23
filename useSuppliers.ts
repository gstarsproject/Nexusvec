import { useState, useEffect, useCallback } from 'react';
import { SupplierConnection } from '../types/index';
import { supplierService } from '../services/suppliers/supplierService';
import { useAuth } from '../contexts/AuthContext';
import { useTenant } from '../contexts/TenantContext';

export const useSuppliers = () => {
  const [connections, setConnections] = useState<SupplierConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, profile, loading: authLoading } = useAuth();
  const { tenant } = useTenant();

  const agencyId = profile?.agencyId || tenant?.id;

  const fetchConnections = useCallback(async () => {
    if (authLoading) return;
    if (!user || !agencyId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await supplierService.getConnections(agencyId);
      setConnections(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch connections');
    } finally {
      setLoading(false);
    }
  }, [agencyId, user, authLoading]);

  useEffect(() => {
    fetchConnections();
  }, [fetchConnections]);

  const addConnection = async (data: Partial<SupplierConnection>) => {
    if (!agencyId) throw new Error('Not authenticated with agency');
    try {
      await supplierService.addConnection(agencyId, data);
      await fetchConnections();
    } catch (err: any) {
      throw err;
    }
  };

  const deleteConnection = async (id: string) => {
    try {
      await supplierService.deleteConnection(id);
      setConnections(prev => prev.filter(c => c.id !== id));
    } catch (err: any) {
      throw err;
    }
  };

  const syncConnection = async (id: string) => {
    try {
      await supplierService.syncConnection(id);
      await fetchConnections();
    } catch (err: any) {
      throw err;
    }
  };

  return {
    connections,
    loading,
    error,
    refresh: fetchConnections,
    addConnection,
    deleteConnection,
    syncConnection
  };
};
