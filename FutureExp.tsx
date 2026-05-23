import React from 'react';
import { Rocket } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { SectionHeader } from '../../components/ui/SectionHeader';

export const FutureExp = () => (
  <Card className="bg-emerald-950/10 border-emerald-900/20">
    <SectionHeader title="FUTURE_EXP_v2" icon={Rocket} colorClass="text-emerald-500" />
    <p className="text-xs text-slate-500 italic mb-4">
      "Autonomous AI Agents for automatic price arbitrage across 12+ liquidity pools."
    </p>
    <div className="grid grid-cols-2 gap-2">
      <div className="px-2 py-1.5 rounded border border-emerald-500/20 text-xs font-semibold text-center text-emerald-400 hover:bg-emerald-500/10 cursor-default uppercase">Deep-Link App</div>
      <div className="px-2 py-1.5 rounded border border-emerald-500/20 text-xs font-semibold text-center text-emerald-400 hover:bg-emerald-500/10 cursor-default uppercase">Crypto Ledger</div>
    </div>
  </Card>
);
