import { useState, useEffect, useCallback } from 'react';
import { Product, SupplierConnection } from '../types/index';
import { productService } from '../services/products/productService';
import { useAuth } from '../contexts/AuthContext';
import { useTenant } from '../contexts/TenantContext';

export const useProducts = () => {
  const { profile } = useAuth();
  const { tenant } = useTenant();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const agencyId = profile?.agencyId || tenant?.id;

  const fetchProducts = useCallback(async () => {
    if (!agencyId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await productService.getProducts(agencyId);
      setProducts(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  }, [agencyId]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const syncProducts = async (connection: SupplierConnection) => {
    try {
      await productService.syncProducts(connection);
      await fetchProducts();
    } catch (err: any) {
      throw err;
    }
  };

  return {
    products,
    loading,
    error,
    refresh: fetchProducts,
    syncProducts
  };
};
