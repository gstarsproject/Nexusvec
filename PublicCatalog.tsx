import React from 'react';
import { ProductCatalog } from '../modules/products/ProductCatalog';
import { useAuth } from '../contexts/AuthContext';
import { useTenant } from '../contexts/TenantContext';
import { PLATFORM_BRANDING } from '../config/branding';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Shield, 
  LayoutDashboard, 
  LogIn, 
  UserPlus, 
  Globe, 
  Wallet, 
  Zap,
  ArrowRight,
  ShieldCheck,
  Package,
  Layers
} from 'lucide-react';
import { motion } from 'motion/react';

export const PublicCatalog = () => {
  const { user } = useAuth();
  const { tenant } = useTenant();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#020617] text-slate-400 font-sans selection:bg-blue-500/30">
      {/* Enterprise Navigation */}
      <nav className="border-b border-white/[0.04] bg-slate-950 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
             <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/20">
              <Layers className="w-4 h-4 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-display font-bold text-white tracking-tight leading-none">
                {tenant?.name || PLATFORM_BRANDING.name}
              </span>
              <span className="text-xs font-mono text-slate-500 tracking-tight mt-0.5">
                Infrastructure Node
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-6">
            {user ? (
              <Link 
                to="/"
                className="btn-premium"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                Go to Portal
              </Link>
            ) : (
              <>
                <Link 
                  to="/login"
                  className="text-sm font-semibold text-slate-400 hover:text-white transition-all"
                >
                  Sign In
                </Link>
                <Link 
                  to="/register"
                  className="btn-premium"
                >
                  Join Network <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Real-time Integrity Feed */}
      <div className="bg-blue-600/5 border-b border-white/[0.04] py-2.5 overflow-hidden whitespace-nowrap relative">
        <motion.div 
          animate={{ x: [0, -1000] }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="flex gap-16 items-center"
        >
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-16">
              <span className="text-xs font-mono text-blue-400 uppercase flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" /> 
                Transaction_Node_0{i}: $145.00 Settled
              </span>
              <span className="text-xs font-mono text-slate-500 uppercase flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-700" /> 
                System_Sync: 100% Verified
              </span>
              <span className="text-xs font-mono text-emerald-400 uppercase flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> 
                Gateway_Status: Online (Low Latency)
              </span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Marketplace Header */}
      <div className="relative pt-24 pb-16 px-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.08),transparent_70%)]" />
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-3 py-1 bg-slate-950/[0.03] border border-white/[0.06] rounded-full mb-8"
          >
            <ShieldCheck className="w-3 h-3 text-blue-500" />
            <span className="text-xs font-bold text-slate-400 tracking-tight">Enterprise Distribution Protocol</span>
          </motion.div>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="max-w-2xl">
              <h1 className="text-4xl md:text-5xl font-display font-bold text-white tracking-tight mb-4 leading-tight">
                Distribution Inventory
              </h1>
              <p className="text-slate-400 text-lg leading-relaxed font-medium">
                Access a decentralized supply chain of digital monetization assets 
                and high-demand recharge resources from verified global providers.
              </p>
            </div>

            <div className="flex gap-4">
              <div className="px-6 py-4 premium-card border-blue-500/20 bg-blue-500/5">
                <div className="text-xs font-bold text-blue-400 tracking-tight mb-1">Network Throughput</div>
                <div className="text-2xl font-display font-bold text-white tracking-tight">12.4%</div>
              </div>
              <div className="px-6 py-4 premium-card">
                <div className="text-xs font-bold text-slate-500 tracking-tight mb-1">Connected Tiers</div>
                <div className="text-2xl font-display font-bold text-white tracking-tight">14,209</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Catalog Hub */}
      <main className="max-w-7xl mx-auto px-6 pb-32">
        <div className="premium-card p-1 md:p-1.5 border-none shadow-2xl">
          <div className="bg-slate-950/60 backdrop-blur-xl rounded-xl p-6 md:p-10">
            <div className="flex items-center gap-3 mb-10 border-b border-white/[0.04] pb-6">
              <Package className="w-5 h-5 text-blue-500" />
              <h2 className="text-sm font-bold text-white uppercase tracking-[0.2em]">Resource Catalog</h2>
            </div>
            <ProductCatalog />
          </div>
        </div>

        {/* B2B Trust Features */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: 'Full Solvency Audit', desc: 'Managed by our real-time double-entry ledger to ensure all asset movements are 100% matched with cashflow.', icon: Shield },
            { title: 'Real-time Fulfillment', desc: 'Orders are processed through our global distribution network for millisecond settlement and delivery.', icon: Zap },
            { title: 'Global API Bridge', desc: 'Enterprise-ready endpoints for integrating digital monetization into your existing platforms and workflows.', icon: Globe },
          ].map((f, i) => (
            <div key={i} className="premium-card p-8 border-none shadow-lg">
              <div className="w-10 h-10 bg-blue-600/10 rounded-lg flex items-center justify-center mb-6 text-blue-500">
                <f.icon className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white tracking-tight mb-3">{f.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Enterprise Footer */}
      <footer className="border-t border-white/[0.04] py-16 bg-slate-950">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex items-center gap-6 text-[11px] font-bold text-slate-500 tracking-tight">
            <Link to="#" className="hover:text-blue-400 transition-colors">Documentation</Link>
            <Link to="#" className="hover:text-blue-400 transition-colors">Privacy Policy</Link>
            <Link to="#" className="hover:text-blue-400 transition-colors">System Status</Link>
          </div>
          <div className="text-xs font-mono text-slate-400 tracking-tight text-center md:text-right">
            Infrastructure Powered by {PLATFORM_BRANDING.companyName} Distributed Ledger v4.0.2
          </div>
        </div>
      </footer>
    </div>
  );
};

