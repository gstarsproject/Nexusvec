import React from 'react';
import { useOperationalIntelligence } from '../../contexts/OperationalIntelligenceContext';
import { ShieldAlert, CheckCircle, Flame, ServerCrash, Zap, AlertTriangle, ShieldCheck, Sliders, History, Radio } from 'lucide-react';
import { cn } from '../../utils/cn';

export const IncidentCenter: React.FC = () => {
  const { 
    incidents, 
    resolveActiveIncident, 
    triggerSimulationIncident,
    systemHealth
  } = useOperationalIntelligence();

  const [simulationCategory, setSimulationCategory] = React.useState<'FIBER_CUT' | 'GATEWAY_DEGRADATION' | 'ROUTING_RETRY_STORM' | 'AUDIT_MISMATCH'>('FIBER_CUT');

  const handleSimulate = () => {
    triggerSimulationIncident(simulationCategory);
  };

  const active = incidents.filter(inc => inc.status !== 'RESOLVED');
  const past = incidents.filter(inc => inc.status === 'RESOLVED');

  return (
    <div id="incident-management-center" className="bg-[#04060c] border border-white/[0.04] rounded-2xl p-6 relative">
      <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full blur-2xl pointer-events-none" />
      
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-6 border-b border-white/[0.04] pb-4">
        <div>
          <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-500" />
            Nexus Incident Command Board
          </h3>
          <p className="text-[11px] text-slate-500 mt-1">
            Datadog + Palantir inspired real-time diagnostic incident tracking, failover sequence audits, and recovery logs.
          </p>
        </div>

        {/* Global SLA indicator */}
        <div className="flex items-center gap-3 font-mono text-[10px]">
          <span className="text-slate-500 uppercase">SYS_INTEGRITY:</span>
          <span className={cn(
            "font-extrabold px-2.5 py-1 rounded border",
            systemHealth > 95 ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-rose-500/15 text-rose-400 border-rose-500/25 animate-pulse"
          )}>
            {systemHealth}% STABLE
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Incident Logs and Lists Table (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Section 1: Active Outages/Degradations */}
          <div>
            <h4 className="text-[10px] font-mono font-bold text-rose-500 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Flame className="w-3.5 h-3.5 animate-pulse" />
              Active System Diagnostic Alerts ({active.length})
            </h4>

            {active.length === 0 ? (
              <div className="py-10 border border-white/[0.02] bg-[#020305]/40 rounded-xl flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-sm shadow-emerald-500/5">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h5 className="text-[11px] font-mono font-extrabold text-white uppercase tracking-wider">NO ACTIVE INCIDENTS</h5>
                  <p className="text-[10px] text-slate-500 max-w-sm leading-relaxed">
                    Infrastructure stability remains within nominal operational thresholds. No active alerts are logged at this interval.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {active.map((inc) => (
                  <div 
                    key={inc.id}
                    className="p-4 rounded-xl bg-rose-950/10 border border-rose-500/20 relative overflow-hidden transition-all animate-in slide-in-from-top-1"
                  >
                    <div className="absolute top-0 bottom-0 left-0 w-1 bg-rose-500" />
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 bg-rose-500/20 text-rose-400 font-mono text-[9px] font-extrabold rounded">
                          {inc.severity.replace(/_/g, " ")}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">ID: {inc.id}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-ping" />
                        Triggered {new Date(inc.timestamp).toLocaleTimeString()}
                      </span>
                    </div>

                    <h5 className="text-xs font-bold text-white mb-1.5">{inc.title}</h5>
                    <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
                      {inc.description}
                    </p>

                    {/* Affected nodes */}
                    <div className="flex flex-wrap items-center gap-1.5 mb-4">
                      <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider mr-1">Affected systems:</span>
                      {inc.affectedSystems.map((sys, idx) => (
                        <span key={idx} className="px-1.5 py-0.2 bg-white/[0.04] border border-white/5 text-[9px] font-mono text-slate-300 rounded">
                          {sys}
                        </span>
                      ))}
                    </div>

                    {/* Manual interactive trigger */}
                    <div className="pt-3 border-t border-white/[0.04] flex items-center justify-between">
                      <span className="text-[10px] italic text-slate-500 font-mono">STATUS: {inc.status} (INVESTIGATING)</span>
                      <button
                        onClick={() => resolveActiveIncident(inc.id)}
                        className="px-3 py-1 bg-emerald-500/15 hover:bg-emerald-500/35 border border-emerald-500/30 font-mono text-[9px] font-bold text-emerald-400 uppercase rounded transition-all active:scale-95"
                        title="Simulate engineering recovery resolving all parameters"
                      >
                        Initiate SLA Recovery Sequence
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 2: Historic Resolved Alerts */}
          <div>
            <h4 className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <History className="w-3.5 h-3.5 text-slate-500" />
              Incident Audit Log / Resolutions History
            </h4>

            {past.length === 0 ? (
              <div className="py-6 text-center text-slate-600 text-[11px] font-mono">
                No historic incident logs stored inside operational buffer.
              </div>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {past.map((inc) => (
                  <div 
                    key={inc.id}
                    className="p-3 bg-slate-950/40 border border-white/[0.02] rounded-lg text-[11px] font-mono space-y-1 my-1"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-400 font-extrabold flex items-center gap-1 text-[9px] uppercase">
                          <CheckCircle className="w-3 h-3" /> Resolved
                        </span>
                        <span className="font-extrabold text-slate-350">{inc.title}</span>
                      </div>
                      <span className="text-slate-500 text-[9px]">
                        Recovery: <strong className="text-emerald-400 font-bold">{inc.recoveryDurationMinutes} mins</strong>
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-sans pl-4 leading-normal italic">
                      {inc.operationalNotes}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Live Simulator Panel (4 Cols) */}
        <div className="lg:col-span-4 bg-slate-950/60 border border-white/[0.02] rounded-xl p-4 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <h4 className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-blue-400" />
              Incident Injection Console
            </h4>
            <p className="text-[10px] text-slate-500 leading-normal">
              Inject a simulated live incident to test physical route failover behaviors, ledger synchronization stops, and reputation scoring performance.
            </p>

            <div className="space-y-2.5 pt-2">
              <label className="text-[9px] font-mono text-slate-500 block">SELECT EXPLOITATION PARAMETER:</label>
              {[
                { key: 'FIBER_CUT', label: 'Undersea Fiber Cut (SEV-1)', desc: 'UniPin offline. Spikes latency consistency.' },
                { key: 'GATEWAY_DEGRADATION', label: 'Payment Handshake Timeout (SEV-2)', desc: 'Codashop timeout fails. Dynamic route shifting.' },
                { key: 'ROUTING_RETRY_STORM', label: 'SLA Queue Retry Storm (SEV-3)', desc: 'Increases general queue latency state.' },
                { key: 'AUDIT_MISMATCH', label: 'ZKP Ledger Audit Halt (SEV-3)', desc: 'Cryptographical hold on payout transfers.' }
              ].map((sim) => (
                <button
                  key={sim.key}
                  onClick={() => setSimulationCategory(sim.key as any)}
                  className={cn(
                    "w-full p-2.5 rounded-lg border text-left transition-all leading-normal flex flex-col gap-0.5",
                    simulationCategory === sim.key 
                      ? "bg-blue-500/10 border-blue-500/30 text-blue-300" 
                      : "bg-[#020305] border-white/[0.02] text-slate-400 hover:border-white/5"
                  )}
                >
                  <span className="text-[10px] font-bold block">{sim.label}</span>
                  <span className="text-[9px] text-slate-500 block leading-tight">{sim.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleSimulate}
            className="w-full py-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 text-rose-450 font-mono text-[10px] font-bold uppercase rounded-lg tracking-wider transition-all active:scale-95 text-center"
          >
            Trigger Exploit Simulation
          </button>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-white/[0.02] flex items-center justify-between text-[9px] text-slate-500 font-mono">
        <span>Displaying live sliding incident windows. Incident events sync with local state.</span>
        <span className="flex items-center gap-1">
          <ServerCrash className="w-3 h-3 text-rose-500" />
          SysOps Guard Status: READY_
        </span>
      </div>
    </div>
  );
};
