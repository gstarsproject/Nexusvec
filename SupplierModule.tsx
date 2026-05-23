import React, { useState } from 'react';
import { 
  Plus, 
  Settings2, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  Database, 
  Trash2,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useSuppliers } from '../../hooks/useSuppliers';
import { SupplierConnectForm } from './SupplierConnectForm';
import { cn } from '../../utils/cn';
import { formatSafe } from '../../utils/date';

export const SupplierModule = () => {
  const { connections, loading, deleteConnection, syncConnection, addConnection } = useSuppliers();
  const [showConnectForm, setShowConnectForm] = useState(false);
  const [syncingId, setSyncingId] = useState<string | null>(null);

  const handleSync = async (id: string) => {
    setSyncingId(id);
    try {
      await syncConnection(id);
    } catch (err) {
      console.error(err);
    } finally {
      setSyncingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-white tracking-tight flex items-center gap-3">
            <Database className="w-5 h-5 text-blue-500" />
            Supplier_Connect
          </h2>
          <p className="text-xs text-slate-500 font-mono uppercase tracking-[0.2em] mt-1">
            Global Infrastructure Integration Protocol
          </p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => {
              addConnection({
                supplierName: 'SupplierA Alpha Node',
                apiKey: 'SUPPLY_DEMO_KEY',
                resellerId: 'DEMO_NODE_01',
                status: 'ACTIVE'
              });
            }}
            className="border border-white/10 hover:border-blue-500/50 text-slate-400 hover:text-white px-4 py-2 rounded-lg text-xs font-semibold tracking-tight flex items-center gap-2 transition-all active:scale-95"
          >
            <Zap className="w-4 h-4 text-amber-500" />
            Provision_A
          </button>
          <button 
            onClick={() => {
              addConnection({
                supplierName: 'SupplierB Global Nexus',
                apiKey: 'SUPPLY_DEMO_B_KEY',
                resellerId: 'DEMO_NODE_02',
                status: 'ACTIVE'
              });
            }}
            className="border border-white/10 hover:border-blue-500/50 text-slate-400 hover:text-white px-4 py-2 rounded-lg text-xs font-semibold tracking-tight flex items-center gap-2 transition-all active:scale-95"
          >
            <Zap className="w-4 h-4 text-blue-500" />
            Provision_B
          </button>
          <button 
            onClick={() => {
              addConnection({
                supplierName: 'SupplierC Global Nexus',
                apiKey: 'SUPPLY_DEMO_C_KEY',
                resellerId: 'DEMO_NODE_03',
                status: 'ACTIVE'
              });
            }}
            className="border border-white/10 hover:border-blue-500/50 text-slate-400 hover:text-white px-4 py-2 rounded-lg text-xs font-semibold tracking-tight flex items-center gap-2 transition-all active:scale-95"
          >
            <Zap className="w-4 h-4 text-emerald-500" />
            Provision_C
          </button>
          <button 
            onClick={() => setShowConnectForm(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-xs font-semibold tracking-tight flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(37,99,235,0.2)] active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Add_New_Provider
          </button>
        </div>
      </div>

      {loading && !connections.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 bg-slate-900/50 border border-white/[0.04] rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : connections.length === 0 ? (
        <div className="bg-slate-950/20 border-2 border-dashed border-white/[0.04] rounded-2xl p-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mb-4">
            <Settings2 className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-slate-400 font-semibold tracking-tight mb-2">No active connections</h3>
          <p className="text-xs text-slate-400 font-mono max-w-xs tracking-tight">
            Protocol initialized. Awaiting supplier credential input to establish synchronization.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {connections.map((conn) => (
            <motion.div 
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              key={conn.id}
              className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:border-blue-500/30 transition-all group"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-sm font-semibold text-white uppercase tracking-tight">{conn.supplierName}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={cn(
                      "w-2 h-2 rounded-full animate-pulse",
                      conn.status === 'ACTIVE' ? "bg-emerald-500" : conn.status === 'ERROR' ? "bg-red-500" : "bg-slate-950"
                    )} />
                    <span className="text-xs font-mono uppercase tracking-[0.2em] text-slate-500">
                      STATUS // {conn.status}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => handleSync(conn.id)}
                    disabled={syncingId === conn.id}
                    className="p-2 bg-slate-950/5 rounded-lg hover:bg-slate-950/10 text-slate-400 transition-all disabled:opacity-50"
                  >
                    <RefreshCw className={cn("w-4 h-4", syncingId === conn.id && "animate-spin text-blue-500")} />
                  </button>
                  <button 
                    onClick={() => deleteConnection(conn.id)}
                    className="p-2 bg-slate-950/5 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-slate-400 font-semibold tracking-tight">Access_Token_Hash</span>
                  <div className="flex items-center gap-2 bg-slate-950 rounded px-2 py-1.5 border border-white/[0.04]">
                    <ShieldCheck className="w-3 h-3 text-emerald-500" />
                    <span className="text-xs text-slate-400 font-mono">••••••••{conn.apiKey.slice(-6)}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-slate-400 font-semibold tracking-tight">Reseller_ID</span>
                    <span className="text-xs text-white font-mono">{conn.resellerId || 'N/A'}</span>
                  </div>
                  <div className="flex flex-col gap-1 items-end">
                    <span className="text-xs text-slate-400 font-semibold tracking-tight text-right">Region_Code</span>
                    <span className="text-xs text-blue-400 font-mono">ASIA-SING-1</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/[0.04] flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-xs text-slate-400 font-semibold tracking-tight">Last_Data_Sync</span>
                  <span className="text-xs text-slate-400 font-mono">{formatSafe(conn.lastSyncAt, 'HH:mm:ss // MM.dd', 'NEVER')}</span>
                </div>
                <button className="text-slate-500 hover:text-white transition-colors">
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showConnectForm && (
          <SupplierConnectForm onClose={() => setShowConnectForm(false)} />
        )}
      </AnimatePresence>
    </div>
  );
};
