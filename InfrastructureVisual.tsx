import React from 'react';
import { motion } from 'motion/react';
import { Network, Server, Zap, Database, Globe } from 'lucide-react';

export const InfrastructureVisual = () => {
  return (
    <div className="bg-slate-950 rounded-2xl border border-white/[0.04] p-8 overflow-hidden relative shadow-sm">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px]" />
      
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div>
          <h3 className="text-lg font-bold text-white tracking-tight">Active Protocol Nodes</h3>
          <p className="text-[11px] text-slate-500 uppercase tracking-widest font-bold mt-0.5">Real-time edge geography</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/10 rounded-full border border-blue-500/20">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-[10px] font-bold text-blue-400 tracking-wider">SYNCING</span>
        </div>
      </div>

      <div className="h-[200px] md:h-[240px] relative z-10 w-full flex items-center justify-center mt-6">
        {/* Center Node */}
        <motion.div
           animate={{ scale: [1, 1.05, 1] }}
           transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
           className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center relative z-20 shadow-[0_0_30px_rgba(37,99,235,0.2)]"
        >
          <Database className="w-6 h-6 md:w-8 md:h-8 text-blue-400" />
          <div className="absolute -bottom-6 text-[9px] md:text-[10px] font-mono text-blue-400 text-center uppercase">US-EAST</div>
        </motion.div>

        {/* Orbit Lines */}
        <div className="absolute w-[200px] h-[200px] md:w-[280px] md:h-[280px] border border-white/[0.02] rounded-full text-center" />
        <div className="absolute w-[130px] h-[130px] md:w-[180px] md:h-[180px] border border-white/[0.04] rounded-full text-center" />

        {/* Orbiting Nodes */}
        <motion.div
           animate={{ rotate: 360 }}
           transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
           className="absolute w-[200px] h-[200px] md:w-[280px] md:h-[280px]"
        >
           <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-7 h-7 md:w-8 md:h-8 rounded-lg bg-slate-900 border border-white/[0.08] flex items-center justify-center -rotate-90">
             <Server className="w-3.5 h-3.5 md:w-4 md:h-4 text-emerald-400" />
           </div>
           
           <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-7 h-7 md:w-8 md:h-8 rounded-lg bg-slate-900 border border-white/[0.08] flex items-center justify-center rotate-90">
             <Globe className="w-3.5 h-3.5 md:w-4 md:h-4 text-purple-400" />
           </div>
        </motion.div>

        <motion.div
           animate={{ rotate: -360 }}
           transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
           className="absolute w-[130px] h-[130px] md:w-[180px] md:h-[180px]"
        >
           <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-7 h-7 md:w-8 md:h-8 rounded-lg bg-slate-900 border border-white/[0.08] flex items-center justify-center">
             <Zap className="w-3.5 h-3.5 md:w-4 md:h-4 text-amber-400" />
           </div>
           <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-7 h-7 md:w-8 md:h-8 rounded-lg bg-slate-900 border border-white/[0.08] flex items-center justify-center">
             <Network className="w-3.5 h-3.5 md:w-4 md:h-4 text-slate-300" />
           </div>
        </motion.div>

      </div>
    </div>
  );
};
