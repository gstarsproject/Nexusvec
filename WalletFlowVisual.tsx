import React from "react";
import { motion } from "motion/react";
import { Wallet, ArrowRight, CheckCircle2, Shield, Repeat } from "lucide-react";

export const WalletFlowVisual = () => {
  return (
    <div className="bg-slate-950 rounded-2xl border border-white/[0.04] p-8 overflow-hidden relative shadow-sm h-full flex flex-col">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-950 to-slate-950 pointer-events-none" />

      <div className="flex items-center justify-between mb-8 relative z-10">
        <div>
          <h3 className="text-lg font-bold text-white tracking-tight">
            Ledger Settlement
          </h3>
          <p className="text-[11px] text-slate-500 uppercase tracking-widest font-bold mt-0.5">
            Automated clearing flow
          </p>
        </div>
        <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
          <Wallet className="w-4 h-4 text-blue-400" />
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center relative z-10 py-4">
        <div className="space-y-6 relative">
          {/* Connection Line */}
          <div className="absolute left-6 top-8 bottom-8 w-px bg-white/[0.04]" />

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-start gap-4 relative"
          >
            <div className="w-12 h-12 rounded-xl bg-slate-900 border border-white/[0.08] shadow-sm flex items-center justify-center shrink-0 z-10">
              <Repeat className="w-5 h-5 text-slate-400" />
            </div>
            <div className="bg-slate-900/50 border border-white/[0.04] p-4 rounded-xl flex-1 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-semibold text-white">
                  Initiate Transfer
                </p>
                <span className="text-[10px] font-mono text-slate-500">
                  req_init_59x
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Match routing tables for lowest fee path.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="flex items-start gap-4 relative"
          >
            <div className="w-12 h-12 rounded-xl bg-slate-900 border border-white/[0.08] shadow-sm flex items-center justify-center shrink-0 z-10 box-border">
              <Shield className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="bg-slate-900/50 border border-emerald-500/10 p-4 rounded-xl flex-1 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-semibold text-white">
                  Risk Evaluation
                </p>
                <span className="text-[10px] font-mono text-emerald-500">
                  0.05% FRD
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Machine learning fraud checks passed.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1 }}
            className="flex items-start gap-4 relative"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0 z-10">
              <CheckCircle2 className="w-5 h-5 text-blue-400" />
            </div>
            <div className="bg-blue-500/5 border border-blue-500/20 p-4 rounded-xl flex-1 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-semibold text-white">
                  Cleared & Settled
                </p>
                <span className="text-[10px] font-mono text-blue-400">
                  LEDGER_OK
                </span>
              </div>
              <p className="text-xs text-blue-300">
                Funds available in destination wallet instantly.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
