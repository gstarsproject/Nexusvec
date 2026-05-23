import React from 'react';
import { useOperationalIntelligence } from '../../contexts/OperationalIntelligenceContext';
import { Radio, Layers, ChevronRight, Cpu, Compass, Users, Activity, ToggleLeft, RefreshCw, AlertTriangle, ShieldCheck } from 'lucide-react';
import { cn } from '../../utils/cn';

export const EcosystemTimeline: React.FC = () => {
  const { timelineEntries, resetTelemetryEcosystem } = useOperationalIntelligence();

  return (
    <div id="ecosystem-global-timeline" className="bg-[#04060c] border border-white/[0.04] rounded-2xl p-6 relative">
      <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-white/[0.04] pb-4">
        <div>
          <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            Global Infrastructure Operations Timeline
          </h3>
          <p className="text-[11px] text-slate-500 mt-1">
            Real-time chronological ledger recording autonomous path routing updates, credential rotations, ledger syncs, and SLA events.
          </p>
        </div>

        {/* System reset option */}
        <button
          onClick={resetTelemetryEcosystem}
          className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-lg text-[9px] font-mono font-bold tracking-wider text-rose-400 uppercase transition-all flex items-center gap-1.5 active:scale-95"
          title="Factory reset memory cache to clear active simulation errors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Clear Telemetry Cache Memory
        </button>
      </div>

      {timelineEntries.length === 0 ? (
        <div className="py-10 text-center text-slate-650 text-xs font-mono">
          Operations timeline buffer currently empty. Initializing trace signals...
        </div>
      ) : (
        <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
          {timelineEntries.map((log) => {
            const isRouter = log.type === 'ROUTING';
            const isRecovery = log.type === 'RECOVERY';
            const isAudit = log.type === 'AUDIT';
            const isTraffic = log.type === 'TRAFFIC';
            const isSync = log.type === 'SYNC';
            const isUpgrade = log.type === 'UPGRADE';
            const isDeployment = log.type === 'DEPLOYMENT';
            const isIncident = log.type === 'INCIDENT';

            return (
              <div 
                key={log.id} 
                className="p-3 bg-slate-950/40 border border-white/[0.02] hover:border-white/5 rounded-lg space-y-1 relative animate-in fade-in duration-200 block text-xs font-mono group transition-all"
              >
                <div className="flex flex-wrap items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded font-mono",
                      isRouter ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
                      isRecovery ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/10" :
                      isAudit ? "bg-purple-500/10 text-purple-400 border border-purple-500/15" :
                      isTraffic ? "bg-amber-500/10 text-amber-400 border border-amber-500/15" :
                      isUpgrade ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/15" :
                      isDeployment ? "bg-slate-500/10 text-slate-400 border border-slate-500/15" :
                      isSync ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/10" :
                      "bg-rose-500/15 text-rose-400 border border-rose-500/20"
                    )}>
                      {log.type}
                    </span>
                    <span className="font-extrabold text-[12px] text-slate-200 tracking-tight group-hover:text-white transition-colors">
                      {log.title}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono italic">{log.timestamp}</span>
                </div>

                <p className="text-slate-400 font-sans leading-relaxed text-[11px] pl-2 pl-[4px] border-l border-white/[0.04] mt-1 pr-6 hover:text-slate-300 transition-colors">
                  {log.description}
                </p>

                <div className="flex items-center gap-1 text-[9px] text-slate-500 pt-1">
                  <ChevronRight className="w-3 h-3 text-slate-600" />
                  <span>Operator Agent: </span>
                  <span className="text-slate-450 italic font-semibold">{log.operator}</span>
                  <span className="mx-1">•</span>
                  <span className={cn(
                    "uppercase",
                    log.severity === 'critical' ? 'text-rose-500 font-bold animate-pulse' :
                    log.severity === 'warn' ? 'text-amber-500 font-semibold' :
                    log.severity === 'success' ? 'text-emerald-400 font-semibold' : 'text-slate-450'
                  )}>
                    [{log.severity.toUpperCase()}]
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-4 pt-3 border-t border-white/[0.02] flex items-center justify-between text-[9px] text-slate-500 font-mono">
        <span>Displaying real-time traces. Logging and ledger verification matching is autonomous.</span>
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          Logger Agent Thread Hash: VERIFIED_MATCH
        </span>
      </div>
    </div>
  );
};
