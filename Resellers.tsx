import React from 'react';
import { ResellerModule } from '../modules/resellers/ResellerModule';
import { DeveloperSnippets } from '../modules/resellers/DeveloperSnippets';
import { TransactionList } from '../modules/billing/TransactionList';
import { Users, Search, Filter, Code } from 'lucide-react';

export const ResellersPage = () => {
  return (
    <div className="max-w-7xl mx-auto py-6 space-y-12">
      <div className="mb-0 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-white uppercase tracking-[0.2em]">Partner_Network</h1>
          <p className="text-[11px] text-slate-500 font-mono uppercase tracking-[0.4em] mt-2 flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            Active Channel Distribution Map v2.1.0
          </p>
        </div>
        
        <div className="flex gap-2 bg-slate-900/50 border border-white/[0.04] p-1 rounded-xl">
          <button className="px-3 py-1.5 rounded-lg bg-emerald-600/10 text-emerald-500 text-xs font-semibold tracking-tight border border-emerald-500/20">
            Overview
          </button>
          <button className="px-3 py-1.5 rounded-lg text-slate-500 text-xs font-semibold tracking-tight hover:text-white transition-colors">
            Performance
          </button>
          <button className="px-3 py-1.5 rounded-lg text-slate-500 text-xs font-semibold tracking-tight hover:text-white transition-colors">
            Security
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-12">
          <ResellerModule />
          
          <div className="pt-8 border-t border-white/[0.04]">
            <DeveloperSnippets />
          </div>
        </div>
        <div className="bg-slate-950/20 backdrop-blur-xl border border-white/10 rounded-3xl p-6 h-fit sticky top-6">
          <TransactionList />
        </div>
      </div>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/40 border border-white/[0.04] rounded-2xl p-5">
          <div className="text-xs text-slate-500 mb-1 font-semibold tracking-tight">Total_Resellers</div>
          <div className="text-2xl font-mono font-bold text-white">42</div>
        </div>
        <div className="bg-slate-900/40 border border-white/[0.04] rounded-2xl p-5">
          <div className="text-xs text-slate-500 mb-1 font-semibold tracking-tight">Global_Liquidity</div>
          <div className="text-2xl font-mono font-bold text-white">$128.4k</div>
        </div>
        <div className="bg-slate-900/40 border border-white/[0.04] rounded-2xl p-5">
          <div className="text-xs text-slate-500 mb-1 font-semibold tracking-tight">Node_Health</div>
          <div className="text-2xl font-mono font-bold text-emerald-500">99.9%</div>
        </div>
        <div className="bg-slate-900/40 border border-white/[0.04] rounded-2xl p-5">
          <div className="text-xs text-slate-500 mb-1 font-semibold tracking-tight">Critical_Alerts</div>
          <div className="text-2xl font-mono font-bold text-slate-300">0</div>
        </div>
      </div>
    </div>
  );
};
