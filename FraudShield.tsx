import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { Card } from '../../components/ui/Card';
import { SectionHeader } from '../../components/ui/SectionHeader';

export const FraudShield = () => (
  <Card className="border-red-900/40 bg-red-950/5">
    <SectionHeader title="33. NEXUS_FRAUD_SHIELD" icon={ShieldCheck} colorClass="text-red-500" />
    <div className="space-y-4">
       <div className="flex justify-between items-center">
          <div className="space-y-1">
             <p className="text-xs text-slate-500 uppercase font-semibold">Threat Level</p>
             <p className="text-sm font-mono font-bold text-emerald-500">LOW_SAFE</p>
          </div>
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 rounded-full border-2 border-dashed border-red-500/20 flex items-center justify-center"
          >
            <ShieldCheck className="w-4 h-4 text-red-500" />
          </motion.div>
       </div>
       <div className="space-y-2">
          {[
            { tag: 'IP_REPUTATION', val: 'OK' },
            { tag: 'VELOCITY_LIMIT', val: 'ACTIVE' },
            { tag: 'VPN_BLOCKER', val: 'ENABLED' }
          ].map((f, i) => (
             <div key={i} className="flex justify-between items-center py-1 border-b border-white/[0.04] last:border-0">
                <span className="text-[7px] text-slate-500 font-bold tracking-wider">{f.tag}</span>
                <span className="text-[7px] text-red-400 font-mono font-semibold">{f.val}</span>
             </div>
          ))}
       </div>
       <div className="p-2 bg-red-500/10 rounded border border-red-500/20 text-[7px] text-red-400 text-center font-bold">
          4 ATTEMPTS REJECTED TODAY
       </div>
    </div>
  </Card>
);
