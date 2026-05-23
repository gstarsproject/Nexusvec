import React from 'react';
import { useOperationalIntelligence } from '../../contexts/OperationalIntelligenceContext';
import { Network, RefreshCw, Layers, ShieldCheck, Activity, Brain, Radio, SlidersHorizontal, Sliders, CheckCircle, AlertTriangle } from 'lucide-react';
import { cn } from '../../utils/cn';

export const ProviderTrustSystem: React.FC = () => {
  const { 
    providerTrust, 
    pingUpstreamNodes, 
    isHighLoadActive, 
    updateSupplierSlaOverride 
  } = useOperationalIntelligence();
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const handleProbe = async () => {
    setIsRefreshing(true);
    await pingUpstreamNodes();
    setIsRefreshing(false);
  };

  return (
    <div id="provider-trust-reputation-engine" className="bg-[#04060c] border border-white/[0.04] rounded-2xl p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-white/[0.04] pb-4">
        <div>
          <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
            <Network className="w-4 h-4 text-purple-400" />
            Supplier Reputational Scoring Engine
          </h3>
          <p className="text-[11px] text-slate-500 mt-1">
            Tracks real-time gateway handshake compliance, failure frequencies, and dynamic routing reliability weights.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleProbe}
            disabled={isRefreshing}
            className="px-3.5 py-1.5 bg-slate-950 hover:bg-white/[0.02] border border-white/5 rounded-lg text-[10px] font-mono font-bold tracking-wider text-slate-300 uppercase transition-all flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={cn("w-3 h-3 text-purple-400", isRefreshing && "animate-spin")} />
            {isRefreshing ? 'Pinging Upstreams...' : 'Probe Active SLA Gateways'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {providerTrust.map((prov) => {
          const isOptimal = prov.status === 'OPTIMAL';
          const isSteady = prov.status === 'STEADY';
          const isDegraded = prov.status === 'DEGRADED';
          const isOffline = prov.status === 'OFFLINE';

          return (
            <div 
              key={prov.id}
              className="p-4 rounded-xl bg-slate-950/60 border border-white/[0.02] hover:border-white/5 transition-all flex flex-col justify-between space-y-4"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "w-2 h-2 rounded-full",
                      isOptimal ? "bg-emerald-400" : isSteady ? "bg-blue-400" : "bg-amber-500 animate-pulse"
                    )} />
                    <span className="text-xs font-bold text-white transition-colors">{prov.name}</span>
                    <span className="font-mono text-[10px] text-slate-500 uppercase tracking-widest bg-white/[0.02] px-1.5 py-0.2 rounded border border-white/5">
                      {prov.id}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                    Latency index: <strong className="text-white">{prov.latencyConsistency}ms</strong>
                  </span>
                </div>

                {/* Grade Badge */}
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "inline-flex items-center justify-center w-8 h-8 rounded-lg font-mono font-extrabold text-sm border-2",
                    prov.grade === 'A+' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25 shadow-[0_0_12px_rgba(16,185,129,0.1)]" :
                    prov.grade === 'A' ? "bg-emerald-500/5 text-emerald-400/90 border-emerald-500/10" :
                    prov.grade === 'B' ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                    "bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse"
                  )}>
                    {prov.grade}
                  </span>
                </div>
              </div>

              {/* Advanced SLA Telemetries */}
              <div className="grid grid-cols-3 gap-2 py-2 border-y border-white/[0.02] bg-slate-950/40 p-2.5 rounded-lg text-[10px] font-mono">
                <div>
                  <span className="text-slate-500 block text-[8px] uppercase">Compliance</span>
                  <span className="font-bold text-slate-200">{prov.slaCompliance.toFixed(3)}%</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[8px] uppercase">Reliability</span>
                  <span className="font-bold text-emerald-400">{prov.fulfillmentReliability.toFixed(2)}%</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[8px] uppercase">Failures (30d)</span>
                  <span className={cn("font-bold", prov.failureFrequency30d > 4 ? "text-amber-400" : "text-slate-400")}>
                    {prov.failureFrequency30d} counts
                  </span>
                </div>
              </div>

              {/* Micro bar layout trust score */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-slate-500 flex items-center gap-1 font-mono">
                    <Activity className="w-3 h-3 text-slate-600" />
                    REPUTATION SCORE:
                  </span>
                  <span className={cn(
                    "font-extrabold font-mono",
                    prov.trustScore > 95 ? "text-emerald-400" : prov.trustScore > 90 ? "text-blue-400" : "text-amber-400"
                  )}>
                    {prov.trustScore} / 100
                  </span>
                </div>
                <div className="w-full bg-[#0d1527] h-1.5 rounded-full overflow-hidden border border-white/5">
                  <div 
                    className={cn(
                      "h-full transition-all duration-1000 rounded-full",
                      prov.trustScore > 95 ? "bg-emerald-400" : prov.trustScore > 90 ? "bg-blue-400" : "bg-amber-400"
                    )}
                    style={{ width: `${prov.trustScore}%` }}
                  />
                </div>
              </div>

              {/* Strategic Insights */}
              <p className="text-[10px] leading-relaxed text-slate-400 italic font-medium bg-white/[0.01] p-2 rounded border border-white/[0.02]">
                {prov.recommendation}
              </p>

              {/* Dynamic Interactive Test Controls */}
              <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between text-[9px] font-mono">
                <span className="text-slate-500 uppercase">Operational Override:</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => updateSupplierSlaOverride(prov.id, false)}
                    disabled={isOffline || isDegraded}
                    className="px-2 py-1 bg-amber-500/10 hover:bg-amber-500/25 text-amber-400 rounded transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
                    title="Degrade supplier latency manually to force failovers"
                  >
                    Degrade Node
                  </button>
                  <button
                    onClick={() => updateSupplierSlaOverride(prov.id, true)}
                    disabled={isOptimal}
                    className="px-2 py-1 bg-emerald-500/15 hover:bg-emerald-500/30 text-emerald-400 rounded transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
                    title="Force supplier SLA node to optimal healthy state"
                  >
                    Set Optimal
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-white/[0.02] flex items-center justify-between text-[9px] text-slate-500 font-mono">
        <span>Displaying upstream telemetry. 0 network bypass cycles dropped in the queue pool.</span>
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
          Gateway Broker Hub Status: OPERATIONAL
        </span>
      </div>
    </div>
  );
};
