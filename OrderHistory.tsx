import React from 'react';
import { 
  ClipboardList, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  ExternalLink,
  Target,
  Hash
} from 'lucide-react';
import { motion } from 'motion/react';
import { useOrders } from '../../hooks/useOrders';
import { cn } from '../../utils/cn';
import { formatSafe } from '../../utils/date';

export const OrderHistory = () => {
  const { orders, loading } = useOrders();

   if (loading && !orders.length) {
    return <div className="h-48 flex items-center justify-center text-slate-400 text-sm">Loading orders...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white tracking-tight flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-blue-500" />
          Recent Orders
        </h2>
        <span className="text-sm font-medium text-slate-400 px-3 py-1 rounded-full bg-white/5 border border-white/10">
          {orders.length} ACTIVE ORDERS
        </span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-white/10 bg-slate-900/50 backdrop-blur-xl">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr className="border-b border-white/10 bg-slate-900/80">
              <th className="px-6 py-4 text-xs font-semibold uppercase text-slate-400 tracking-wider">Order ID</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase text-slate-400 tracking-wider">Target URL</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase text-slate-400 tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase text-slate-400 tracking-wider">Timestamp</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase text-slate-400 tracking-wider text-right">Volume/Cost</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 font-sans">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-20 text-center text-sm text-slate-400">
                  No orders found.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-900 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm text-white font-medium">ORD_{order.id.slice(-8).toUpperCase()}</span>
                      <span className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                        <Hash className="w-3 h-3" />
                        {order.externalOrderId || 'PENDING SYNC'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-400 group-hover:text-blue-400 transition-colors truncate max-w-[200px]">
                        {order.targetUrl}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={cn(
                      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border",
                      order.status === 'COMPLETED' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                      order.status === 'ERROR' ? "bg-red-500/10 text-red-400 border-red-500/20" :
                      "bg-blue-500/10 text-blue-400 border-blue-500/20"
                    )}>
                      {order.status === 'PROCESSING' && <Loader2 className="w-3 h-3 animate-spin" />}
                      {order.status === 'COMPLETED' && <CheckCircle2 className="w-3 h-3" />}
                      {order.status === 'ERROR' && <XCircle className="w-3 h-3" />}
                      {order.status}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-400">
                    {formatSafe(order.createdAt, 'MMM dd, yyyy HH:mm', 'Unknown')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex flex-col items-end">
                      <span className="text-sm text-white font-semibold">{order.quantity.toLocaleString()}</span>
                      <span className="text-xs text-slate-500 mt-1">${order.totalCost.toFixed(2)}</span>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
