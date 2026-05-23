import React, { useState } from 'react';
import { 
  X, 
  Shield, 
  Key, 
  Hash, 
  Activity, 
  CheckCircle2, 
  AlertCircle,
  Zap
} from 'lucide-react';
import { motion } from 'motion/react';
import { useSuppliers } from '../../hooks/useSuppliers';
import { supplierRegistry } from '../../adapters/suppliers/registry';
import { cn } from '../../utils/cn';

interface SupplierConnectFormProps {
  onClose: () => void;
}

export const SupplierConnectForm: React.FC<SupplierConnectFormProps> = ({ onClose }) => {
  const { addConnection } = useSuppliers();
  const [selectedSupplierId, setSelectedSupplierId] = useState(supplierRegistry.getAllAdapters()[0].id);
  const [apiKey, setApiKey] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [resellerId, setResellerId] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await addConnection({
        id: selectedSupplierId, // Pass adapter ID
        apiKey,
        secretKey,
        resellerId,
        accessToken
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to establish connection');
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
        className="absolute inset-0 bg-slate-950 backdrop-blur-sm" 
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-lg bg-slate-950 border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="p-6 border-b border-white/[0.04] flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-white tracking-tight flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-500" />
              Configure_Connection
            </h3>
            <p className="text-xs text-slate-500 font-mono tracking-tight mt-1">Establishing secure handshake protocol</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white p-2">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-xs text-red-400 font-mono flex items-center gap-3">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs text-slate-500 font-semibold tracking-tight">Select_Provider</label>
              <div className="grid grid-cols-2 gap-2">
                {supplierRegistry.getAllAdapters().map((adapter) => (
                  <button
                    key={adapter.id}
                    type="button"
                    onClick={() => setSelectedSupplierId(adapter.id)}
                    className={cn(
                      "p-3 rounded-xl border text-left transition-all",
                      selectedSupplierId === adapter.id
                        ? "bg-blue-600/10 border-blue-500 text-white"
                        : "bg-slate-900 border-white/[0.04] text-slate-500 hover:border-white/10"
                    )}
                  >
                    <span className="text-xs font-semibold uppercase block">{adapter.name}</span>
                    <span className="text-xs font-mono opacity-50">NODE_ID: {adapter.id}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs text-slate-500 font-semibold tracking-tight">API_Key_Secret</label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input 
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full bg-slate-900 border border-white/[0.04] rounded-lg pl-10 pr-4 py-3 text-xs text-white outline-none focus:border-blue-500 transition-all font-mono"
                    placeholder="nexus_api_778..."
                    required
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-slate-500 font-semibold tracking-tight">Identity_Hash (RESELLER_ID)</label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input 
                    value={resellerId}
                    onChange={(e) => setResellerId(e.target.value)}
                    className="w-full bg-slate-900 border border-white/[0.04] rounded-lg pl-10 pr-4 py-3 text-xs text-white outline-none focus:border-blue-500 transition-all font-mono"
                    placeholder="RS_99402"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-500 font-semibold tracking-tight">Access_Token (AUTHENTICATION)</label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input 
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                  className="w-full bg-slate-900 border border-white/[0.04] rounded-lg pl-10 pr-4 py-3 text-xs text-white outline-none focus:border-blue-500 transition-all font-mono"
                  placeholder="X-Nexus-Auth-Token..."
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-500">
              <CheckCircle2 className="w-4 h-4 animate-pulse" />
              <span className="text-xs font-semibold tracking-tight">System_Ready_To_Verify</span>
            </div>
            <div className="flex gap-3">
              <button 
                type="button" 
                onClick={onClose}
                className="px-6 py-3 rounded-lg text-xs font-semibold text-slate-500 tracking-tight hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button 
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-8 py-3 rounded-lg text-xs font-semibold tracking-tight flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(37,99,235,0.2)]"
              >
                {isSubmitting ? (
                  <>
                    <Activity className="w-4 h-4 animate-spin" />
                    Initializing...
                  </>
                ) : (
                  <>
                    Verify_&_Connect
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
