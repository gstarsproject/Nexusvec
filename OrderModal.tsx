import React, { useState } from 'react';
import { 
  X, 
  ShoppingCart, 
  CreditCard, 
  Users, 
  Globe, 
  AlertTriangle,
  CheckCircle2,
  Activity
} from 'lucide-react';
import { motion } from 'motion/react';
import { Product, Reseller, SupplierConnection } from '../../types/index';
import { useResellers } from '../../hooks/useResellers';
import { useSuppliers } from '../../hooks/useSuppliers';
import { useOrders } from '../../hooks/useOrders';
import { useResellerTiers } from '../../hooks/useResellerTiers';
import { cn } from '../../utils/cn';

interface OrderModalProps {
  product: Product;
  onClose: () => void;
}

export const OrderModal: React.FC<OrderModalProps> = ({ product, onClose }) => {
  const { resellers } = useResellers();
  const { connections } = useSuppliers();
  const { placeOrder } = useOrders();
  const { tiers } = useResellerTiers();
  
  const [selectedResellerId, setSelectedResellerId] = useState('');
  const [quantity, setQuantity] = useState(product.min);
  const [targetUrl, setTargetUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedReseller = resellers.find(r => r.id === selectedResellerId);
  
  const getTieredRate = (reseller: Reseller) => {
    let rate = product.sellingPrice || product.rate || 0;
    const path = reseller.path || '';
    const ancestorIds = path.split('/').filter(id => id && id !== reseller.agencyId);
    
    if (ancestorIds.length > 0) {
      ancestorIds.forEach(id => {
        const anc = resellers.find(r => r.id === id);
        if (anc?.tierId) {
          const tier = tiers.find(t => t.id === anc.tierId);
          if (tier) {
            rate = rate * (1 + (tier.markupPercentage / 100));
          }
        }
      });
    } else if (reseller.tierId) {
      const tier = tiers.find(t => t.id === reseller.tierId);
      if (tier) {
        rate = rate * (1 + (tier.markupPercentage / 100));
      }
    }
    return rate;
  };
  
  const baseRate = product.sellingPrice || product.rate || 0;
  const tieredRate = selectedReseller ? getTieredRate(selectedReseller) : baseRate;
  
  const totalCost = (tieredRate / 1000) * quantity;
  const supplierConn = connections.find(c => c.id === product.supplierId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResellerId || !supplierConn) {
      setError('Please select a reseller and ensure supplier connection is active.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await placeOrder(selectedResellerId, product.id, quantity, targetUrl, supplierConn);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Operation failure recorded.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/90 backdrop-blur-md" 
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-xl bg-slate-950 border border-white/10 rounded-2xl sm:rounded-[32px] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
      >
        <div className="p-4 sm:p-8 border-b border-white/[0.04] flex justify-between items-center bg-slate-950/5 shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold uppercase text-blue-500 tracking-wider px-2 py-0.5 bg-blue-500/10 rounded border border-blue-500/20">
                New Order
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-white tracking-tight line-clamp-1">{product.name}</h3>
          </div>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-white transition-colors">
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-8 space-y-6 overflow-y-auto flex-1 min-h-0">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Side: Parameters */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs text-slate-500 font-semibold uppercase tracking-wider flex items-center gap-2">
                  <Users className="w-3 h-3" />
                  Select Reseller
                </label>
                <select 
                  required
                  value={selectedResellerId}
                  onChange={(e) => setSelectedResellerId(e.target.value)}
                  className="enterprise-input appearance-none"
                >
                  <option value="">-- No Selection --</option>
                  {resellers.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.name} (${r.balance.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-slate-500 font-semibold uppercase tracking-wider flex items-center gap-2">
                  <Globe className="w-3 h-3" />
                  Target URL
                </label>
                <input 
                  required
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  placeholder="https://instagram.com/nexus_node..."
                  className="enterprise-input"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Quantity</label>
                  <span className="text-xs text-slate-400">[{product.min} - {product.max}]</span>
                </div>
                <input 
                  type="range"
                  min={product.min}
                  max={product.max}
                  step={10}
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full accent-blue-500 h-1.5 bg-slate-950 rounded-lg cursor-pointer my-4"
                />
                <div className="flex items-center gap-2 bg-slate-900/50 rounded-xl p-3 border border-white/[0.04]">
                  <input 
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="bg-transparent text-white font-medium text-lg w-full outline-none"
                  />
                  <span className="text-xs text-slate-400 font-semibold uppercase">Units</span>
                </div>
              </div>
            </div>

            {/* Right Side: Quote Summary */}
            <div className="bg-slate-900/50 rounded-3xl p-6 border border-white/[0.04] flex flex-col">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-6">Cost Summary</h4>
              
              <div className="space-y-4 flex-grow">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Unit Cost</span>
                  <span className="text-white">${(tieredRate/1000).toFixed(4)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Units</span>
                  <span className="text-white">x {quantity.toLocaleString()}</span>
                </div>
                <div className="pt-4 border-t border-white/[0.04] flex justify-between items-end">
                  <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Total Cost</span>
                  <span className="text-2xl font-semibold text-white">${totalCost.toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-8 space-y-3">
                <div className={cn(
                  "flex items-center gap-3 p-3 rounded-xl border transition-all text-xs font-medium",
                  selectedReseller && selectedReseller.balance >= totalCost 
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" 
                    : "bg-amber-500/10 border-amber-500/20 text-amber-500"
                )}>
                  {selectedReseller 
                    ? (selectedReseller.balance >= totalCost ? 'Sufficient Balance' : 'Insufficient Funds')
                    : 'Awaiting Reseller Selection'}
                </div>
                
                <button 
                  type="submit"
                  disabled={isSubmitting || !selectedReseller || selectedReseller.balance < totalCost}
                  className="w-full btn-primary h-14 text-sm shadow-[0_0_30px_rgba(37,99,235,0.1)] active:scale-[0.98]"
                >
                  {isSubmitting ? (
                    <>
                      <Activity className="w-4 h-4 animate-spin" />
                      Placing Order...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4" />
                      Place Order
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
