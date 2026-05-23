import React, { useState } from 'react';
import { 
  Package, 
  Search, 
  Filter, 
  RefreshCcw, 
  LayoutGrid, 
  List,
  Database,
  ArrowRight,
  ShieldCheck,
  Zap,
  DollarSign
} from 'lucide-react';
import { useProducts } from '../../hooks/useProducts';
import { useSuppliers } from '../../hooks/useSuppliers';
import { ProductTable } from '../../modules/products/ProductTable';
import { ProductStats } from '../../modules/products/ProductStats';
import { BulkPricingControl } from '../../modules/products/BulkPricingControl';
import { cn } from '../../utils/cn';
import { motion, AnimatePresence } from 'motion/react';
import { productService } from '../../services/products/productService';

export const ProductDashboard = () => {
  const { products, loading, syncProducts } = useProducts();
  const { connections } = useSuppliers();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [viewMode, setViewMode] = useState<'TABLE' | 'GRID'>('TABLE');
  const [showPricingControl, setShowPricingControl] = useState(false);

  const categories = Array.from(new Set(products.map(p => p.category)));
  const platforms = Array.from(new Set(products.map(p => p.appName)));

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         p.productCode.includes(searchQuery);
    const matchesCategory = !selectedCategory || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
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

  const handleToggle = async (id: string, enabled: boolean) => {
    try {
      await productService.toggleProductStatus(id, enabled);
    } catch (err) {
      console.error('Toggle failed:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-purple-600 rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.4)]">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-4xl font-semibold text-white uppercase tracking-[0.2em] leading-none">
              Service_Core
            </h1>
          </div>
          <p className="text-[11px] text-slate-500 font-mono uppercase tracking-[0.4em] flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            Authenticated Infrastructure / Local_Cache_v2.0
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button 
            onClick={() => setShowPricingControl(!showPricingControl)}
            className="flex items-center gap-3 bg-slate-950 border border-white/10 hover:border-purple-500/50 text-white px-6 py-3 rounded-2xl text-xs font-semibold tracking-tight transition-all"
          >
            <DollarSign className="w-4 h-4 text-emerald-500" />
            Pricing_Engine
          </button>
          <button 
            onClick={handleGlobalSync}
            disabled={syncing}
            className="flex items-center gap-3 bg-white hover:bg-slate-200 text-slate-900 px-6 py-3 rounded-2xl text-xs font-semibold tracking-tight transition-all group disabled:opacity-50"
          >
            <RefreshCcw className={cn("w-4 h-4", syncing && "animate-spin")} />
            Sync_Global_Nodes
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showPricingControl && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <BulkPricingControl 
              categories={categories} 
              platforms={platforms} 
              onComplete={() => setShowPricingControl(false)} 
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Overview */}
      <ProductStats products={products} />

      {/* Management Area */}
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="flex bg-slate-950/60 p-1 rounded-2xl border border-white/[0.04]">
            <button 
              onClick={() => setSelectedCategory(null)}
              className={cn(
                "px-5 py-2.5 rounded-xl text-xs font-semibold tracking-tight transition-all",
                !selectedCategory ? "bg-white text-slate-900 shadow-xl" : "text-slate-500 hover:text-white"
              )}
            >
              All_Nodes
            </button>
            {categories.slice(0, 4).map(cat => (
              <button 
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "px-5 py-2.5 rounded-xl text-xs font-semibold tracking-tight transition-all",
                  selectedCategory === cat ? "bg-white text-slate-900 shadow-xl" : "text-slate-500 hover:text-white"
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4 w-full lg:w-auto">
            <div className="relative flex-grow lg:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text"
                placeholder="Query_Service_Database..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950/80 border border-white/10 rounded-[20px] pl-12 pr-4 py-3.5 text-[11px] font-mono text-white placeholder:text-slate-400 outline-none focus:border-purple-500/50 focus:bg-slate-950 transition-all shadow-inner"
              />
            </div>
            
            <div className="flex bg-slate-950/60 p-1 rounded-xl border border-white/[0.04]">
              <button 
                onClick={() => setViewMode('TABLE')}
                className={cn("p-2 rounded-lg transition-all", viewMode === 'TABLE' ? "bg-slate-800 text-white" : "text-slate-400 hover:text-slate-400")}
              >
                <List className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setViewMode('GRID')}
                className={cn("p-2 rounded-lg transition-all", viewMode === 'GRID' ? "bg-slate-800 text-white" : "text-slate-400 hover:text-slate-400")}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Content Render */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-20 bg-slate-900/40 rounded-3xl animate-pulse border border-white/[0.04]" />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <ProductTable products={filteredProducts} onToggle={handleToggle} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
