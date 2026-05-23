import React from 'react';
import { ShieldAlert, Info } from 'lucide-react';
import { APP_CONFIG } from '../../config/constants';

export const GlobalLimitsCard = () => {
  const limits = APP_CONFIG.GLOBAL_LIMITS;

  return (
    <div className="bg-slate-900/40 border border-white/[0.04] rounded-[32px] p-6 space-y-4">
      <div className="flex justify-between items-start">
        <div className="w-10 h-10 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
          <ShieldAlert className="w-5 h-5 text-orange-500" />
        </div>
        <span className="text-xs font-semibold text-orange-500 border border-orange-500/20 px-2 py-0.5 rounded bg-orange-500/5">RISK_ENFORCED</span>
      </div>
      <h3 className="text-sm font-semibold text-white tracking-tight">Transaction_Guardrails</h3>
      
      <div className="space-y-3 pt-2">
        <div className="flex justify-between items-center p-2 rounded bg-slate-900/40 border border-white/[0.04]">
          <span className="text-xs text-slate-500 font-semibold uppercase">Max_Transaction</span>
          <span className="text-xs text-white font-mono font-bold">IDR {limits.MAX_TRANSACTION_AMOUNT.toLocaleString()}</span>
        </div>
        
        <div className="flex justify-between items-center p-2 rounded bg-slate-900/40 border border-white/[0.04]">
          <span className="text-xs text-slate-500 font-semibold uppercase">Min_Transaction</span>
          <span className="text-xs text-white font-mono font-bold">IDR {limits.MIN_TRANSACTION_AMOUNT.toLocaleString()}</span>
        </div>

        <div className="flex justify-between items-center p-2 rounded bg-slate-900/40 border border-white/[0.04]">
          <span className="text-xs text-slate-500 font-semibold uppercase">Daily_Reseller_Cap</span>
          <span className="text-xs text-white font-mono font-bold">IDR {limits.MAX_DAILY_VOLUME_PER_RESELLER.toLocaleString()}</span>
        </div>
      </div>

      <div className="flex gap-2 p-3 bg-blue-500/5 border border-blue-500/10 rounded-xl mt-2">
        <Info className="w-3 h-3 text-blue-500 shrink-0" />
        <p className="text-xs text-slate-400 font-medium leading-relaxed italic">
          Limits are enforced globally across all agencies to mitigate API abuse and managed liquid risk.
        </p>
      </div>
    </div>
  );
};
