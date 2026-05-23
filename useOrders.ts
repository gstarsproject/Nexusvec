import { useState, useEffect, useCallback } from 'react';
import { Order, SupplierConnection } from '../types/index';
import { orderService } from '../services/orders/orderService';
import { useAuth } from '../contexts/AuthContext';
import { useTenant } from '../contexts/TenantContext';

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, profile, loading: authLoading } = useAuth();
  const { tenant } = useTenant();

  const agencyId = profile?.agencyId || tenant?.id;

  const fetchOrders = useCallback(async () => {
    if (authLoading) return;
    if (!user || !agencyId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await orderService.getOrders(agencyId);
      setOrders(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  }, [agencyId, user, authLoading]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const placeOrder = async (
    resellerId: string, 
    productId: string, 
    quantity: number, 
    targetUrl: string,
    supplierConnection: SupplierConnection
  ) => {
    try {
      const orderId = await orderService.placeOrder(resellerId, productId, quantity, targetUrl, supplierConnection);
      await fetchOrders();
      
      // Auto-process order
      orderService.processOrder(orderId, supplierConnection).then(() => {
        fetchOrders();
      }).catch(err => {
        console.error('Order processing background error:', err);
        fetchOrders();
      });
      
      return orderId;
    } catch (err: any) {
      throw err;
    }
  };

  return {
    orders,
    loading,
    error,
    refresh: fetchOrders,
    placeOrder
  };
};
