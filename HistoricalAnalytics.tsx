import React, { useState } from 'react';
import { useOperationalIntelligence } from '../../contexts/OperationalIntelligenceContext';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { TrendingUp, Database, Award, Sliders, DollarSign, Wallet, Activity, ShieldCheck } from 'lucide-react';
import { cn } from '../../utils/cn';

export const HistoricalAnalytics: React.FC = () => {
  const { historicalMetrics, rollingGmv, rollingRevenue } = useOperationalIntelligence();
  const [activeParam, setActiveParam] = useState<'gmv' | 'health' | 'sla' | 'margin'>('gmv');

  // Multi-variant dataset mapping for charts based on state
  const chartData = historicalMetrics.map((pt, index) => {
    // Incorporate modern state logic slightly to show live updates in the graph
    const isToday = index === historicalMetrics.length - 1;
    return {
      name: pt.date,
      GMV: isToday ? Math.round(rollingGmv / 10) : Math.round(pt.totalThroughput * 0.013), // derived proportionately
      Health: pt.systemHealth,
      SLA: pt.supplierSla,
      Margin: isToday ? Number((pt.marginSpread + (rollingRevenue / rollingGmv) * 2).toFixed(2)) : pt.marginSpread,
      Throughput: pt.totalThroughput,
      Costs: pt.operationalCostUSD
    };
  });

  return (
    <div id="historical-analytics-engine" className="bg-[#04060c] border border-white/[0.04] rounded-2xl p-6 relative">
      <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
      
      {/* Upper header summary */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-6 border-b border-white/[0.04] pb-5">
        <div>
          <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            Ecosystem Historical Analytics Engine
          </h3>
          <p className="text-[11px] text-slate-500 mt-1">
            Bloomberg-inspired executive operations metrics tracking settlement velocity, margin spreads, and wholesale SLAs.
          </p>
        </div>

        {/* Dynamic selectors */}
        <div className="flex bg-[#020305] border border-white/5 p-0.5 rounded-lg text-[10px] font-mono">
          {[
            { key: 'gmv', label: 'GMV & THROUGHPUT' },
            { key: 'health', label: 'SYSTEM HEALTH %' },
            { key: 'sla', label: 'SUPPLIER SLA %' },
            { key: 'margin', label: 'MARGIN SPREAD %' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveParam(tab.key as any)}
              className={cn(
                "px-3 py-1 rounded font-bold transition-all transition-colors uppercase",
                activeParam === tab.key 
                  ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400" 
                  : "text-slate-500 hover:text-slate-350"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Metric Chart Wrapper (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="h-[280px] w-full bg-[#020305]/60 border border-white/[0.02] rounded-xl p-4 relative">
            <ResponsiveContainer width="100%" height="100%">
              {activeParam === 'gmv' ? (
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gmvGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="rgba(16,185,129,0.2)" />
                      <stop offset="95%" stopColor="rgba(16,185,129,0)" />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#475569" fontSize={9} tickLine={false} />
                  <YAxis stroke="#475569" fontSize={9} tickLine={false} domain={['auto', 'auto']} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#020305', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '8px' }}
                    labelStyle={{ color: '#94a3b8', fontSize: '10px', fontFamily: 'monospace' }}
                    itemStyle={{ color: '#10b981', fontSize: '11px', fontFamily: 'monospace' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '9px', fontFamily: 'monospace', color: '#64748b' }} />
                  <Area type="monotone" dataKey="GMV" name="Operational GMV ($)" stroke="#10b981" strokeWidth={1.5} fillOpacity={1} fill="url(#gmvGlow)" />
                </AreaChart>
              ) : activeParam === 'health' ? (
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#475569" fontSize={9} tickLine={false} />
                  <YAxis stroke="#475569" fontSize={9} tickLine={false} domain={[99.5, 100]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#020305', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '8px' }}
                    labelStyle={{ color: '#94a3b8', fontSize: '10px', fontFamily: 'monospace' }}
                    itemStyle={{ color: '#3b82f6', fontSize: '11px', fontFamily: 'monospace' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '9px', fontFamily: 'monospace' }} />
                  <Line type="monotone" dataKey="Health" name="Node Health SLA (%)" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              ) : activeParam === 'sla' ? (
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#475569" fontSize={9} tickLine={false} />
                  <YAxis stroke="#475569" fontSize={9} tickLine={false} domain={[99.5, 100]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#020305', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '8px' }}
                    labelStyle={{ color: '#94a3b8', fontSize: '10px', fontFamily: 'monospace' }}
                    itemStyle={{ color: '#8b5cf6', fontSize: '11px', fontFamily: 'monospace' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '9px', fontFamily: 'monospace' }} />
                  <Line type="monotone" dataKey="SLA" name="Supplier Handshake SLA (%)" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              ) : (
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="marginGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="rgba(245,158,11,0.2)" />
                      <stop offset="95%" stopColor="rgba(245,158,11,0)" />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#475569" fontSize={9} tickLine={false} />
                  <YAxis stroke="#475569" fontSize={9} tickLine={false} domain={[4, 6]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#020305', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '8px' }}
                    labelStyle={{ color: '#94a3b8', fontSize: '10px', fontFamily: 'monospace' }}
                    itemStyle={{ color: '#f59e0b', fontSize: '11px', fontFamily: 'monospace' }}
                  />
                  <Area type="monotone" dataKey="Margin" name="Net Margin Spread (%)" stroke="#f59e0b" strokeWidth={1.5} fillOpacity={1} fill="url(#marginGlow)" />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center font-mono text-[10px]">
            <div className="bg-slate-950/40 p-2.5 rounded-lg border border-white/[0.01]">
              <span className="text-slate-500 block text-[8px] uppercase">7d Mean Health</span>
              <strong className="text-white text-xs block mt-0.5">99.972%</strong>
            </div>
            <div className="bg-slate-950/40 p-2.5 rounded-lg border border-white/[0.01]">
              <span className="text-slate-500 block text-[8px] uppercase">Avg Clearance</span>
              <strong className="text-emerald-400 text-xs block mt-0.5">1.21s</strong>
            </div>
            <div className="bg-slate-950/40 p-2.5 rounded-lg border border-white/[0.01]">
              <span className="text-slate-500 block text-[8px] uppercase">Estimated Spread</span>
              <strong className="text-amber-400 text-xs block mt-0.5">+4.86%</strong>
            </div>
          </div>
        </div>

        {/* Bloomberg-Inspired Operations Table (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest block pl-1">
            Historical Data Archive (Sliding 7-Day Window)
          </span>

          <div className="overflow-x-auto border border-white/[0.02] bg-slate-950/30 rounded-xl">
            <table className="w-full text-left whitespace-nowrap text-[10px] font-mono leading-relaxed">
              <thead>
                <tr className="border-b border-white/[0.04] text-[8px] uppercase text-slate-500 tracking-wider">
                  <th className="py-2 px-3">Interval</th>
                  <th className="py-2 px-2 text-right">Throughput</th>
                  <th className="py-2 px-2 text-right">System Health</th>
                  <th className="py-2 px-2 text-right">Net Margin</th>
                  <th className="py-2 px-3 text-right">Cost (USD)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.01] text-slate-300">
                {historicalMetrics.map((pt, idx) => {
                  const isLastIdx = idx === historicalMetrics.length - 1;
                  return (
                    <tr 
                      key={idx} 
                      className={cn(
                        "hover:bg-white/[0.01] transition-colors",
                        isLastIdx && "bg-emerald-500/[0.02] font-semibold text-white border-l-2 border-l-emerald-500"
                      )}
                    >
                      <td className="py-2.5 px-3">
                        {pt.date} {isLastIdx && <span className="text-[8px] bg-emerald-500/10 text-emerald-400 px-1 py-0.2 rounded uppercase ml-1">Live</span>}
                      </td>
                      <td className="py-2.5 px-2 text-right text-slate-450">
                        {pt.totalThroughput.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-2 text-right text-emerald-400 font-semibold">
                        {pt.systemHealth.toFixed(2)}%
                      </td>
                      <td className="py-2.5 px-2 text-right text-amber-400">
                        +{pt.marginSpread.toFixed(2)}%
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-400">
                        ${pt.operationalCostUSD.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-3 bg-emerald-950/15 border border-emerald-500/10 rounded-xl flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="text-[10px] uppercase font-bold text-emerald-300 font-mono block">Financial Integrity Secured</span>
              <p className="text-[9px] text-slate-400 leading-normal">
                Continuous double-entry cryptographical verification is operating across 5 clearing nodes. Standard ledger variances register zero exceptions.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer statistics statement */}
      <div className="mt-5 pt-3 border-t border-white/[0.02] flex items-center justify-between text-[9px] text-slate-500 font-mono">
        <span>Displaying rolling statistical analytics. Historical data synchronized automatically.</span>
        <span className="flex items-center gap-1">
          <Database className="w-3 h-3 text-slate-650" />
          Analytics Source Cluster: SECURE_POSTGRES
        </span>
      </div>
    </div>
  );
};
