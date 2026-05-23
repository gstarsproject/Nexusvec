import React from 'react';
import { TicketSystem } from '../modules/Support/TicketSystem';
import { 
  LifeBuoy, 
  ShieldCheck, 
  Cpu, 
  Globe
} from 'lucide-react';

export const SupportPage = () => {
  return (
    <div className="max-w-7xl mx-auto py-8 px-4 space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-semibold text-white uppercase tracking-[0.2em]">Support_Protocol</h1>
          <p className="text-[11px] text-slate-500 font-mono uppercase tracking-[0.5em] mt-3 flex items-center gap-2">
            <LifeBuoy className="w-3 h-3 text-purple-500" />
            24/7 Global Intelligence Assistance Interface
          </p>
        </div>
        
        <div className="flex gap-4">
          <div className="bg-slate-900/50 border border-white/[0.04] p-4 rounded-3xl backdrop-blur-xl flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-semibold uppercase">System_Status</div>
              <div className="text-xs font-bold text-white uppercase">Operational</div>
            </div>
          </div>
        </div>
      </div>

      <TicketSystem />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12 border-t border-white/[0.04]">
        <div className="space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
            <Cpu className="w-6 h-6 text-blue-500" />
          </div>
          <h3 className="text-sm font-semibold text-white tracking-tight">Self_Service_Docs</h3>
          <p className="text-xs text-slate-500 leading-relaxed font-mono">
            Access our technical documentation to resolve common integration issues automatically.
          </p>
          <button className="text-xs text-blue-500 font-semibold tracking-tight hover:text-blue-400 transition-colors">
            Browse_Library {'->'}
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
            <Globe className="w-6 h-6 text-purple-500" />
          </div>
          <h3 className="text-sm font-semibold text-white tracking-tight">Global_Status</h3>
          <p className="text-xs text-slate-500 leading-relaxed font-mono">
            Real-time monitoring of all infrastructure nodes and supplier connectivity status.
          </p>
          <button className="text-xs text-purple-500 font-semibold tracking-tight hover:text-purple-400 transition-colors">
            View_Node_Map {'->'}
          </button>
        </div>

        <div className="bg-slate-900/40 border border-white/[0.04] rounded-[40px] p-8 flex flex-col justify-center items-center text-center space-y-4">
          <div className="text-xs text-slate-400 font-semibold uppercase tracking-[0.3em]">Direct_Contact</div>
          <div className="text-xl font-semibold text-white font-mono">TG: @GStars_Support</div>
          <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Awaiting high-priority transmission</p>
        </div>
      </div>
    </div>
  );
};
