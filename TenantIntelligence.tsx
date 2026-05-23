import React, { useState, useMemo } from 'react';
import { useOperationalIntelligence } from '../../contexts/OperationalIntelligenceContext';
import { Users, Search, X, RotateCcw, ShieldCheck, TrendingUp, AlertOctagon, Sparkles, Filter, Info, Award } from 'lucide-react';
import { cn } from '../../utils/cn';

export const TenantIntelligence: React.FC = () => {
  const { tenantIntel, injectManualTransaction } = useOperationalIntelligence();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState<'ALL' | 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH'>('ALL');
  const [sortBy, setSortBy] = useState<'gmv' | 'health' | 'growth' | 'churn'>('gmv');

  // Filter and sort computation
  const processedTenants = useMemo(() => {
    let list = [...tenantIntel];

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(t => 
        t.name.toLowerCase().includes(q) || 
        t.region.toLowerCase().includes(q) ||
        t.riskNotes.toLowerCase().includes(q)
      );
    }

    // Risk indicator filter
    if (riskFilter !== 'ALL') {
      list = list.filter(t => t.riskIndicator === riskFilter);
    }

    // Sort order
    list.sort((a, b) => {
      switch (sortBy) {
        case 'gmv':
          return b.accumulatedGmv - a.accumulatedGmv;
        case 'health':
          return b.operationalHealthScore - a.operationalHealthScore;
        case 'growth':
          return b.growthProjection - a.growthProjection;
        case 'churn':
          return b.churnProbability - a.churnProbability;
        default:
          return 0;
      }
    });

    return list;
  }, [tenantIntel, searchQuery, riskFilter, sortBy]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setRiskFilter('ALL');
    setSortBy('gmv');
  };

  return (
    <div id="tenant-intelligence-dashboard" className="bg-[#04060c] border border-white/[0.04] rounded-2xl p-6 relative">
      <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
      
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-6 border-b border-white/[0.04] pb-4">
        <div>
          <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-400" />
            Downstream Tenant Intelligence Engine
          </h3>
          <p className="text-[11px] text-slate-500 mt-1">
            Tracks multi-tenant infrastructure usage scores, transaction speed, churn probabilities, and active risk alerts.
          </p>
        </div>

        {/* Quick incentive action */}
        <button
          onClick={() => injectManualTransaction()}
          className="px-3.5 py-1.5 bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/20 rounded-lg text-[10px] font-mono font-bold tracking-wider text-purple-350 uppercase transition-all flex items-center gap-1.5 active:scale-95"
          title="Inject a dynamic mock invoice to simulate transactional updates"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Inject Multi-Tenant GMV Event
        </button>
      </div>

      {/* Control bar: searching, sorting, and filtering */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-6 p-3 bg-slate-950/40 rounded-xl border border-white/[0.03]">
        <div className="md:col-span-6 relative">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Query tenant index, regions, operational tags..."
            className="w-full pl-8 pr-8 py-2 bg-slate-950 border border-white/5 rounded-lg text-[10px] font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500/30 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="md:col-span-3">
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value as any)}
            className="w-full px-2.5 py-2 bg-slate-950 border border-white/5 rounded-lg text-[10px] font-mono text-slate-300 focus:outline-none focus:border-purple-500/30 font-bold"
          >
            <option value="ALL">RISK INDICATORS: ALL</option>
            <option value="NONE">RISK: SECURE (NONE)</option>
            <option value="LOW">RISK: MONITOR (LOW)</option>
            <option value="MEDIUM">RISK: WARNING (MED)</option>
            <option value="HIGH">RISK: AUDIT (HIGH)</option>
          </select>
        </div>

        <div className="md:col-span-3">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="w-full px-2.5 py-2 bg-slate-950 border border-white/5 rounded-lg text-[10px] font-mono text-slate-300 focus:outline-none focus:border-purple-500/30 font-bold"
          >
            <option value="gmv">SORT BY: VOLUMETRICS (GMV)</option>
            <option value="health">SORT BY: INFRA HEALTH</option>
            <option value="growth">SORT BY: QUARTERLY GROWTH</option>
            <option value="churn">SORT BY: CHURN RATIO</option>
          </select>
        </div>
      </div>

      {/* Advanced Empty State */}
      {processedTenants.length === 0 ? (
        <div className="py-14 border border-white/[0.02] bg-[#020305]/40 rounded-xl flex flex-col items-center justify-center text-center max-w-md mx-auto p-6 space-y-4 my-2">
          <div className="w-12 h-12 rounded-full bg-slate-900 border border-white/5 flex items-center justify-center text-slate-500 animate-pulse">
            <Filter className="w-5 h-5 text-purple-400" />
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-bold font-mono uppercase text-white tracking-widest">TENANT ANALYTICS FILTER EMPTY</h4>
            <p className="text-[10px] text-slate-500 leading-relaxed font-mono">
              The intelligence engine is actively running, but zero micro-instances match the active search or risk index combinations.
            </p>
          </div>
          <button 
            onClick={handleClearFilters}
            className="px-3.5 py-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg text-[9px] font-mono font-bold uppercase text-white flex items-center gap-1.5 transition-all active:scale-95 mx-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Filter Options
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {processedTenants.map((node, index) => {
            const isHighRisk = node.riskIndicator === 'HIGH';
            const isMedRisk = node.riskIndicator === 'MEDIUM';
            const isLowRisk = node.riskIndicator === 'LOW';
            
            return (
              <div 
                key={node.id}
                className="p-4 bg-slate-950/60 border border-white/[0.02] rounded-xl flex flex-col justify-between space-y-4 hover:border-white/5 transition-all group relative overflow-hidden"
              >
                {/* Visual rank indicator */}
                {index < 3 && sortBy === 'gmv' && searchQuery === '' && riskFilter === 'ALL' && (
                  <div className="absolute top-0 right-0 bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded-bl font-mono text-[8px] font-extrabold uppercase border-l border-b border-purple-500/20">
                    Rank #{index + 1}
                  </div>
                )}

                {/* Tenant Title & Region */}
                <div className="space-y-1 pr-10">
                  <div className="flex items-center gap-1.5">
                    <span className="font-sans font-extrabold text-white text-xs block truncate leading-tight">
                      {node.name}
                    </span>
                  </div>
                  <span className="text-[9px] text-slate-500 font-mono block uppercase">
                    {node.region}
                  </span>
                </div>

                {/* Basic Metrics Grid */}
                <div className="grid grid-cols-2 gap-2 bg-[#020305]/40 p-2.5 rounded-lg border border-white/[0.01] text-[10px] font-mono leading-relaxed">
                  <div>
                    <span className="text-slate-500 block text-[8px] uppercase">Reseller Pools</span>
                    <span className="font-bold text-slate-300">{node.resellersCount} Hubs</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[8px] uppercase">Incremental GMV</span>
                    <span className="font-bold text-emerald-400">${node.accumulatedGmv.toLocaleString()}.00</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[8px] uppercase">Growth (QoQ)</span>
                    <span className={cn(
                      "font-bold truncate block",
                      node.growthProjection >= 0 ? "text-blue-400" : "text-slate-500"
                    )}>
                      {node.growthProjection >= 0 ? `+${node.growthProjection}%` : `${node.growthProjection}%`}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[8px] uppercase">Churn Probability</span>
                    <span className="font-bold text-slate-300">{node.churnProbability}%</span>
                  </div>
                </div>

                {/* Efficiency progress slider metrics */}
                <div className="space-y-1 font-mono text-[9px]">
                  <div className="flex justify-between items-center text-slate-500">
                    <span>USAGE LOAD INDEX:</span>
                    <strong className="text-slate-300">{node.infrastructureUsageScore}%</strong>
                  </div>
                  <div className="w-full bg-[#0d1527] h-1 rounded-full overflow-hidden">
                    <div className="bg-purple-400 h-full rounded-full" style={{ width: `${node.infrastructureUsageScore}%` }} />
                  </div>
                </div>

                {/* Sub-status risk analysis text */}
                <div className={cn(
                  "p-2 rounded font-mono text-[9px] leading-relaxed border",
                  isHighRisk ? "bg-rose-950/20 border-rose-500/25 text-rose-350" :
                  isMedRisk ? "bg-amber-950/20 border-amber-500/20 text-amber-300" :
                  isLowRisk ? "bg-blue-950/15 border-blue-500/10 text-blue-300" :
                  "bg-slate-950/40 border-white/[0.02] text-slate-450"
                )}>
                  <div className="flex items-start gap-1">
                    {isHighRisk && <AlertOctagon className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />}
                    {!isHighRisk && <Info className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />}
                    <div className="flex-1 select-none">
                      <strong className="uppercase font-extrabold mr-1 block">
                        {isHighRisk ? 'RISK: LEVEL AUDIT (CRITICAL)' :
                         isMedRisk ? 'RISK: LEVEL WARNING (MEDIUM)' :
                         isLowRisk ? 'RISK: LEVEL MONITOR (LOW)' : 'RISK: HEALTH INDEX OPTIMAL'}
                      </strong>
                      <span className="font-bold font-sans text-slate-400 block mt-0.5 leading-tight">{node.riskNotes}</span>
                    </div>
                  </div>
                </div>

                {/* SLA health rating footer */}
                <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between text-[8px] font-mono text-slate-500">
                  <span>ONBOARD_LAG: {node.onboardingVelocityDays}d</span>
                  <span className="flex items-center gap-1 shrink-0 font-bold">
                    HEALTH: 
                    <strong className={cn(
                      "font-sans font-extrabold text-[9px]",
                      node.operationalHealthScore > 98 ? "text-emerald-400" : "text-amber-400"
                    )}>
                      {node.operationalHealthScore}%
                    </strong>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-4 pt-3 border-t border-white/[0.02] flex items-center justify-between text-[9px] text-slate-500 font-mono">
        <span>Displaying comprehensive reseller cluster indices. Computed once per rolling epoch.</span>
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          K-Means Clustering Agent: OPERATIONAL_
        </span>
      </div>
    </div>
  );
};
