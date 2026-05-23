import React, { useState } from 'react';
import { 
  Package, 
  Search, 
  Filter, 
  RefreshCcw, 
  ShoppingCart, 
  Tag, 
  Layers,
  ArrowUpRight,
  Info,
  ChevronRight,
  Eye,
  Activity,
  Zap,
  ShieldCheck,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useProducts } from '../../hooks/useProducts';
import { useSuppliers } from '../../hooks/useSuppliers';
import { useResellerTiers } from '../../hooks/useResellerTiers';
import { useResellers } from '../../hooks/useResellers';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../utils/cn';
import { OrderModal } from '../orders/OrderModal';
import { Product } from '../../types';

export const ProductCatalog = () => {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const { products, loading: productsLoading, syncProducts } = useProducts();
  const { tiers, loading: tiersLoading } = useResellerTiers();
  const { resellers } = useResellers();
  const { connections } = useSuppliers();

  const isReseller = role === 'RESELLER';
  
  // Find current reseller profile if applicable
  const resellerProfile = isReseller ? resellers.find(r => r.email === user?.email) : null;
  const userTier = resellerProfile?.tierId ? tiers.find(t => t.id === resellerProfile.tierId) : null;

  const getPrice = (product: Product) => {
    let rate = product.sellingPrice || product.rate || product.basePrice || 0;
    
    if (isReseller && resellerProfile) {
      const path = resellerProfile.path || '';
      const ancestorIds = path.split('/').filter(id => id && id !== resellerProfile.agencyId);
      
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
      } else if (userTier) {
        rate = rate * (1 + (userTier.markupPercentage / 100));
      }
    }
    return rate;
  };

  const loading = productsLoading || (isReseller && tiersLoading);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);

  const isVisitor = !user;

  const categories = Array.from(new Set(products.map(p => p.category)));

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         p.productCode.includes(searchQuery);
    const matchesCategory = !selectedCategory || p.category === selectedCategory;
    return matchesSearch && matchesCategory && p.isEnabled;
  });

  const handleGlobalSync = async () => {
    if (connections.length === 0) return;
    setSyncing(true);
    try {
      for (const conn of connections) {
        if (conn.status === 'ACTIVE') {
          await syncProducts(conn);
        }
      }
    } catch (err) {
      console.error('Global sync failed:', err);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-2xl font-display font-bold text-white tracking-tight flex items-center gap-3">
            Products
          </h2>
          <p className="text-sm text-slate-500 font-medium">
            Browse digital products and recharge offerings.
          </p>
        </div>
        
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-grow md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text"
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="enterprise-input pl-11"
            />
          </div>
          {!isVisitor && (
            <button 
              onClick={handleGlobalSync}
              disabled={syncing || connections.length === 0}
              className="btn-premium px-6 h-[46px] shadow-lg shadow-blue-900/20"
            >
              <RefreshCcw className={cn("w-4 h-4", syncing && "animate-spin")} />
              Sync Inventory
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide border-b border-white/[0.04]">
        <button 
          onClick={() => setSelectedCategory(null)}
          className={cn(
            "px-6 py-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap",
            !selectedCategory ? "bg-white text-slate-900" : "bg-slate-900/50 text-slate-500 hover:text-white"
          )}
        >
          All Categories
        </button>
        {categories.map(cat => (
          <button 
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={cn(
              "px-6 py-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap",
              selectedCategory === cat ? "bg-blue-600/10 text-blue-500 ring-1 ring-blue-500/30" : "bg-slate-900/50 text-slate-500 hover:text-white"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="h-64 bg-slate-900/50 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-slate-900/40 border border-dashed border-white/[0.04] rounded-[3rem] p-32 text-center">
          <Layers className="w-20 h-20 text-slate-800 mx-auto mb-8 opacity-40" />
          <h3 className="text-white font-display font-bold mb-3 text-2xl tracking-tight">No Services Available Yet</h3>
          <p className="text-sm text-slate-500 font-medium max-w-sm mx-auto leading-relaxed">
            Infrastructure nodes are ready but no services have been indexed. Synchronize with your providers to populate the catalog.
          </p>
          {!isVisitor && (
             <button 
              onClick={handleGlobalSync}
              className="mt-8 btn-premium px-10"
             >
                Initialize Sync
             </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <motion.div 
              layout
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              key={product.id}
              className="group premium-card bg-slate-950/60 p-0 border-none shadow-xl flex flex-col overflow-hidden h-full"
            >
              <div className="p-8 flex-grow space-y-6">
                <div className="flex justify-between items-start">
                  <div className="px-2.5 py-1 bg-blue-600/10 text-blue-500 text-xs font-bold tracking-tight rounded-lg border border-blue-500/20">
                    {product.category}
                  </div>
                  <span className="text-xs font-bold text-slate-400 tracking-tight">#{product.productCode}</span>
                </div>
                
                <h3 className="text-lg font-display font-bold text-white tracking-tight leading-tight group-hover:text-blue-400 transition-colors">
                  {product.name}
                </h3>
                
                <div className="flex items-start gap-2 text-slate-500">
                  <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                  <p className="text-xs font-medium leading-relaxed line-clamp-2 h-8">{product.description || 'Enterprise distribution asset with high solvency.'}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/[0.04]">
                  <div>
                    <span className="section-label block mb-2">Unit Price</span>
                    <div className="text-2xl font-bold text-white tracking-tight">
                      <span className="text-sm text-blue-500 font-medium mr-0.5">$</span>
                      {getPrice(product).toFixed(2)}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="section-label block mb-2">Inventory Limit</span>
                    <div className="text-xs font-bold text-slate-400">
                      {product.min.toLocaleString()} — {product.max.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-slate-900/40 border-t border-white/[0.04] flex gap-3">
                <button 
                  onClick={() => setViewingProduct(product)}
                  className="w-12 h-12 flex items-center justify-center rounded-xl bg-slate-950 border border-white/[0.04] hover:border-blue-500/40 transition-all text-slate-500 hover:text-blue-500 group/btn"
                >
                  <Eye className="w-5 h-5 transition-transform group-hover/btn:scale-110" />
                </button>
                <button 
                  onClick={() => isVisitor ? navigate('/register') : setSelectedProduct(product)}
                  className={cn(
                    "flex-1 h-12 rounded-xl text-xs font-bold tracking-tight flex items-center justify-center gap-2 transition-all",
                    isVisitor 
                      ? "bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-900/20" 
                      : "bg-white hover:bg-slate-200 text-slate-900"
                  )}
                >
                  {isVisitor ? (
                    <>
                      Create Account
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      Order Now
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {selectedProduct && (
          <OrderModal 
            product={selectedProduct} 
            onClose={() => setSelectedProduct(null)} 
          />
        )}
        
        {viewingProduct && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setViewingProduct(null)}
              className="absolute inset-0 bg-slate-900/90 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl bg-slate-950 border border-white/[0.04] rounded-[2.5rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)]"
            >
              {/* Modal Header */}
              <div className="p-6 sm:p-10 border-b border-white/[0.04] bg-slate-900/20">
                <div className="flex justify-between items-start mb-8">
                  <div className="px-4 py-1.5 bg-blue-600/10 border border-blue-500/20 rounded-full text-xs font-bold text-blue-500 shadow-sm">
                    {viewingProduct.category}
                  </div>
                  <button 
                    onClick={() => setViewingProduct(null)}
                    className="w-10 h-10 rounded-full bg-slate-950 flex items-center justify-center text-slate-500 hover:text-white transition-all hover:rotate-90"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight leading-tight mb-3">
                  {viewingProduct.name}
                </h2>
                <p className="text-xs font-bold text-slate-500 tracking-tight">
                  Product Code: {viewingProduct.productCode}
                </p>
              </div>

              {/* Modal Content */}
              <div className="p-6 sm:p-10 space-y-6 sm:space-y-10">
                <div className="space-y-4">
                  <h4 className="section-label flex items-center gap-2">
                    <Info className="w-3.5 h-3.5 text-blue-500" />
                    Product Description
                  </h4>
                  <div className="bg-slate-900/40 rounded-2xl p-6 border border-white/[0.02]">
                    <p className="text-sm text-slate-400 leading-relaxed font-medium">
                      {viewingProduct.description || "Digital product offering for immediate top-up via integrated providers."}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 sm:gap-6">
                  {[
                    { label: 'Min Quantity', value: viewingProduct.min.toLocaleString(), icon: Zap },
                    { label: 'Max Quantity', value: viewingProduct.max.toLocaleString(), icon: Activity },
                    { label: 'Fulfillment Time', value: '45-120ms', icon: Clock },
                    { label: 'Uptime SLA', value: '99.98%', icon: ShieldCheck },
                  ].map((stat, i) => (
                    <div key={i} className="bg-slate-900/20 border border-white/[0.02] rounded-2xl p-4 sm:p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <stat.icon className="w-3.5 h-3.5 text-blue-500" />
                        <span className="section-label">{stat.label}</span>
                      </div>
                      <div className="text-sm sm:text-base font-bold text-white tracking-tight">{stat.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal Action */}
              <div className="p-6 sm:p-10 bg-slate-900/60 border-t border-white/[0.04] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-6 sm:gap-8">
                <div>
                  <span className="section-label block mb-1">Unit Price</span>
                  <div className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
                    <span className="text-blue-500 text-lg font-medium mr-1">$</span>
                    {getPrice(viewingProduct).toFixed(2)}
                  </div>
                </div>
                <button 
                  onClick={() => {
                    const prod = viewingProduct;
                    setViewingProduct(null);
                    isVisitor ? navigate('/register') : setSelectedProduct(prod);
                  }}
                  className="btn-premium py-4 sm:py-5 px-8 sm:px-10 shadow-2xl shadow-blue-900/20 w-full sm:w-auto text-center"
                >
                  {isVisitor ? 'Register Workspace' : 'Configure Service'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
