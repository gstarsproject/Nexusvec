import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  ArrowUpRight, 
  ShieldCheck, 
  ChevronRight, 
  Copy, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  ExternalLink,
  ShieldAlert,
  Server
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../utils/cn';
import { useTenant } from '../../contexts/TenantContext';

type ProvisioningStatus = 'IDLE' | 'DNS_SETUP' | 'VERIFYING' | 'PROVISIONING' | 'LIVE';

export const DomainManager = () => {
  const { tenant, updateTenant } = useTenant();
  const [domainInput, setDomainInput] = useState(tenant?.domain || '');
  const [status, setStatus] = useState<ProvisioningStatus>(tenant?.domain ? 'LIVE' : 'IDLE');
  const [isCopied, setIsCopied] = useState<string | null>(null);

  // Sync state with tenant if it changes externally
  useEffect(() => {
    if (tenant?.domain && status === 'IDLE') {
      setDomainInput(tenant.domain);
      setStatus('LIVE');
    }
  }, [tenant]);

  const handleStartSetup = () => {
    if (!domainInput) return;
    setStatus('DNS_SETUP');
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(key);
    setTimeout(() => setIsCopied(null), 2000);
  };

  const verifyDNS = async () => {
    setStatus('VERIFYING');
    // Simulate real DNS check
    await new Promise(r => setTimeout(r, 2500));
    setStatus('PROVISIONING');
    
    // Auto-proceed to persistence
    await new Promise(r => setTimeout(r, 2000));
    try {
      await updateTenant({ domain: domainInput });
      setStatus('LIVE');
    } catch (error) {
      console.error('Failed to update domain:', error);
      setStatus('DNS_SETUP');
      // In a real app, show error toast
    }
  };

  const removeDomain = async () => {
    if (!confirm('Are you sure you want to remove this domain? Traffic will stop routing immediately.')) return;
    try {
      await updateTenant({ domain: '' });
      setDomainInput('');
      setStatus('IDLE');
    } catch (error) {
      console.error('Failed to remove domain:', error);
    }
  };

  return (
    <div className="premium-card p-8 bg-slate-900/40 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none">
        <Server className="w-48 h-48" />
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600/10 rounded-xl flex items-center justify-center text-blue-500 shadow-lg shadow-blue-500/5">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-display font-bold text-white tracking-tight">Domain Infrastructure</h2>
            <p className="text-xs text-slate-500 font-medium">Map your custom enterprise domain to this NexusNode</p>
          </div>
        </div>

        {status === 'LIVE' && (
          <div className="flex items-center gap-3 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-emerald-500 tracking-tight">Global Traffic Routing Active</span>
          </div>
        )}
      </div>

      <div className="space-y-8">
        {/* Input Phase */}
        <AnimatePresence mode="wait">
          {status === 'IDLE' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-xl"
            >
              <div className="space-y-1.5 mb-6">
                <label className="section-label">Target Domain</label>
                <div className="flex gap-3">
                  <input 
                    type="text" 
                    value={domainInput}
                    onChange={(e) => setDomainInput(e.target.value)}
                    placeholder="recharge.your-company.com"
                    className="enterprise-input flex-1"
                  />
                  <button 
                    onClick={handleStartSetup}
                    disabled={!domainInput.includes('.')}
                    className="btn-premium px-8"
                  >
                    Connect <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-2 flex items-center gap-2">
                  <ShieldCheck className="w-3 h-3" /> 
                  Automated SSL certificates included via Let's Encrypt Enterprise
                </p>
              </div>
            </motion.div>
          )}

          {/* DNS Configuration Phase */}
          {(status === 'DNS_SETUP' || status === 'VERIFYING' || status === 'PROVISIONING') && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-8"
            >
              <div className="p-6 bg-blue-600/5 border border-blue-500/20 rounded-xl flex items-start gap-4">
                <AlertCircle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-white mb-1">Configuration Required</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Log in to your domain provider (Cloudflare, GoDaddy, Namecheap) and add the following records to route traffic to 
                    <span className="text-white font-bold px-1.5">{domainInput}</span>.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* CNAME Record */}
                <div className="premium-card p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 tracking-tight">Record 01: CNAME</span>
                    <span className="text-xs bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded font-mono uppercase">Subdomain Routing</span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-slate-400 uppercase font-bold">Host / Name</span>
                      <div className="flex items-center justify-between bg-slate-900 border border-white/[0.04] p-2.5 rounded text-xs font-mono">
                        <span className="text-white">{domainInput.split('.')[0]}</span>
                        <button onClick={() => handleCopy(domainInput.split('.')[0], 'host')} className="text-slate-500 hover:text-white transition-colors">
                          {isCopied === 'host' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-slate-400 uppercase font-bold">Value / Points To</span>
                      <div className="flex items-center justify-between bg-slate-900 border border-white/[0.04] p-2.5 rounded text-xs font-mono">
                        <span className="text-blue-500">cname.nexuscore.io</span>
                        <button onClick={() => handleCopy('cname.nexuscore.io', 'val')} className="text-slate-500 hover:text-white transition-colors">
                          {isCopied === 'val' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* A Record */}
                <div className="premium-card p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 tracking-tight">Record 02: A Record</span>
                    <span className="text-xs bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded font-mono uppercase">Root Apex (Optional)</span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-slate-400 uppercase font-bold">Host / Name</span>
                      <div className="flex items-center justify-between bg-slate-900 border border-white/[0.04] p-2.5 rounded text-xs font-mono text-white">
                        <span>@</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-slate-400 uppercase font-bold">IP Address</span>
                      <div className="flex items-center justify-between bg-slate-900 border border-white/[0.04] p-2.5 rounded text-xs font-mono">
                        <span className="text-purple-500">76.76.21.21</span>
                        <button onClick={() => handleCopy('76.76.21.21', 'ip')} className="text-slate-500 hover:text-white transition-colors">
                          {isCopied === 'ip' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-white/[0.04]">
                <button 
                  onClick={() => setStatus('IDLE')}
                  className="text-xs font-bold text-slate-500 hover:text-white transition-colors"
                >
                  Cancel & Change Domain
                </button>
                <button 
                  onClick={verifyDNS}
                  disabled={status !== 'DNS_SETUP'}
                  className="btn-premium px-10 min-w-[200px]"
                >
                  {status === 'VERIFYING' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Scanning DNS...
                    </>
                  ) : status === 'PROVISIONING' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Issuing SSL...
                    </>
                  ) : (
                    <>Verify DNS & Activate</>
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {/* Active Phase */}
          {status === 'LIVE' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 premium-card p-8 bg-blue-600/5 border-blue-500/20">
                  <div className="flex items-start justify-between mb-8">
                    <div className="flex items-center gap-4">
                       <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
                          < Globe className="w-8 h-8" />
                       </div>
                       <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-2xl font-display font-bold text-white tracking-tight">{tenant?.domain || domainInput}</h3>
                            <ExternalLink className="w-4 h-4 text-slate-400" />
                          </div>
                          <p className="text-xs text-blue-400 font-mono uppercase tracking-[0.2em]">Node ID: {tenant?.id?.slice(0, 8).toUpperCase()}</p>
                       </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1">
                       <div className="text-xs font-bold text-slate-500 tracking-tight">TLS STATUS</div>
                       <div className="flex items-center gap-2 text-emerald-500 font-bold text-xs tracking-tight">
                         <ShieldCheck className="w-4 h-4" /> Secure
                       </div>
                    </div>
                    <div className="space-y-1">
                       <div className="text-xs font-bold text-slate-500 tracking-tight">GATEWAY</div>
                       <div className="text-white font-bold text-xs tracking-tight">NexusCore-v4</div>
                    </div>
                    <div className="space-y-1">
                       <div className="text-xs font-bold text-slate-500 tracking-tight">LATENCY</div>
                       <div className="text-white font-bold text-xs">14ms average</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <button 
                    onClick={() => window.open(`http://${domainInput}`, '_blank')}
                    className="w-full btn-premium py-4"
                  >
                    Visit Storefront <ArrowUpRight className="w-4 h-4 ml-2" />
                  </button>
                  <button 
                    onClick={removeDomain}
                    className="w-full btn-outline py-4 border-red-500/10 text-slate-500 hover:text-red-500 hover:bg-red-500/5 hover:border-red-500/20 flex items-center justify-center gap-2"
                  >
                    <ShieldAlert className="w-4 h-4" /> Unbind Domain
                  </button>
                </div>
              </div>

              <div className="p-4 bg-slate-900/40 border border-white/[0.04] rounded-xl flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-3 italic">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Infrastructure synchronized across 42 global edge locations.
                </div>
                <div className="font-mono text-xs">VERIFIED_AT: {new Date().toISOString().split('T')[0]}</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
