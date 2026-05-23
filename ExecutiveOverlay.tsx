import React from 'react';
import { useOperationalIntelligence } from '../../contexts/OperationalIntelligenceContext';
import { Sparkles, X, Activity, AlertTriangle, ShieldCheck, TrendingUp, SlidersHorizontal, Info } from 'lucide-react';
import { cn } from '../../utils/cn';

export const ExecutiveOverlay: React.FC = () => {
  const { executiveInsights, dismissInsight, triggerHighLoadState, systemHealth } = useOperationalIntelligence();

  return (
    <div id="executive-intelligence-overlay" className="bg-[#03050c]/90 border border-blue-500/10 rounded-2xl p-6 relative overflow-hidden backdrop-blur-md">
      {/* Decorative digital layout grid */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-4 border-b border-white/[0.04] relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center p-1 rounded-md bg-blue-500/10 border border-blue-500/20">
              <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
            </span>
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider font-sans">
              NexusCore Executive Intelligence Layer
            </h3>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
            Real-time heuristic evaluation models compiling predictive network recommendations and margin opportunities.
          </p>
        </div>

        {/* Quick controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={triggerHighLoadState}
            className="px-3 py-1 bg-blue-900/25 hover:bg-blue-800/40 border border-blue-500/20 text-blue-400 font-mono text-[9px] font-bold uppercase rounded-md tracking-wider transition-all"
            title="Inject temporary high routing volumes"
          >
            Run Burst-Load Test Range
          </button>
          <div className="px-2.5 py-1 bg-slate-950 border border-white/5 rounded-md font-mono text-[10px] text-slate-400 select-none">
            EVAL_CONFIDENCE: <strong className="text-emerald-400">99.42%_</strong>
          </div>
        </div>
      </div>

      {/* Narrative grid columns */}
      {executiveInsights.length === 0 ? (
        <div className="py-6 flex flex-col items-center justify-center text-center">
          <div className="p-2 rounded-full bg-slate-900 border border-white/5 text-slate-600 mb-2">
            <Info className="w-4 h-4" />
          </div>
          <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">
            Executive Intelligence Calibrated
          </span>
          <p className="text-[10px] text-slate-400 max-w-sm mt-1">
            Standard metrics are perfectly optimized. The autonomous routing agent has logged 0 structural warning exceptions.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 relative z-10">
          {executiveInsights.map((insight) => {
            const isWarn = insight.severity === 'WARNING';
            const isSug = insight.severity === 'SUGGESTION';
            
            return (
              <div 
                key={insight.id}
                className={cn(
                  "p-4 rounded-xl border relative transition-all duration-300 pr-9 group",
                  isWarn 
                    ? "bg-amber-950/20 border-amber-500/20 text-amber-300 hover:border-amber-500/30" 
                    : isSug
                    ? "bg-blue-950/15 border-blue-500/10 text-blue-300 hover:border-blue-500/25"
                    : "bg-slate-950/40 border-white/[0.03] text-slate-300 hover:border-white/[0.08]"
                )}
              >
                {/* Dismiss button */}
                <button
                  onClick={() => dismissInsight(insight.id)}
                  className="absolute top-2.5 right-2.5 p-1 text-slate-500 hover:text-white rounded transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                  title="Dismiss analysis point"
                >
                  <X className="w-3 h-3" />
                </button>

                <div className="flex items-center gap-2 mb-2">
                  <span className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    isWarn ? "bg-amber-400 animate-ping" : isSug ? "bg-blue-400" : "bg-emerald-400"
                  )} />
                  <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400">
                    {insight.type} UNIT 
                  </span>
                  <span className="text-[8px] font-mono text-slate-500 ml-auto">{insight.timestamp}</span>
                </div>

                <p className="text-[11px] leading-relaxed font-sans text-slate-300 font-medium my-1">
                  {insight.text}
                </p>

                <div className="mt-2.5 pt-2 border-t border-white/[0.04] flex items-center justify-between text-[8px] font-mono text-slate-500">
                  <span>AUTOPILOT: ENGAGED</span>
                  {isWarn && <span className="text-amber-500 font-extrabold">ACTION SUGGESTED</span>}
                  {!isWarn && <span className="text-emerald-500">MONITOR_SLA_ACTIVE</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating System-wide Integrity Bar */}
      <div className="mt-4 pt-4 border-t border-white/[0.04] flex flex-col sm:flex-row justify-between items-center gap-3 text-[10px] text-slate-500 font-mono">
        <div className="flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-blue-400" />
          <span>Continuous telemetry evaluation loop online: 7 concurrent filters validated.</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span>Overall Health Priority: </span>
          <span className={cn(
            "font-extrabold px-1.5 py-0.5 rounded text-[9px]",
            systemHealth > 95 ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"
          )}>
            {systemHealth}% STABLE
          </span>
        </div>
      </div>
    </div>
  );
};
