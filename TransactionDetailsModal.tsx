import React from 'react';
import { X, ArrowUpRight, ArrowDownLeft, FileText, Activity, Layers, Tag } from 'lucide-react';
import { Transaction } from '../../types';
import { formatSafe } from '../../utils/date';
import { cn } from '../../utils/cn';

interface TransactionDetailsModalProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TransactionDetailsModal: React.FC<TransactionDetailsModalProps> = ({ transaction, isOpen, onClose }) => {
  if (!isOpen || !transaction) return null;

  const isDebitLike = ['DEBIT', 'FREEZE', 'CONFIRM_DEBIT'].includes(transaction.type);
  const isCreditLike = ['CREDIT', 'UNFREEZE'].includes(transaction.type);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-lg bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b border-slate-800 shrink-0">
          <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-400" />
            Transaction Details
          </h3>
          <button 
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          {/* Header section */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                "p-3 rounded-xl",
                isDebitLike ? "bg-red-500/10 text-red-500 ring-1 ring-red-500/20" : 
                isCreditLike ? "bg-emerald-500/10 text-emerald-500 ring-1 ring-emerald-500/20" :
                "bg-blue-500/10 text-blue-500 ring-1 ring-blue-500/20"
              )}>
                {isDebitLike ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownLeft className="w-5 h-5" />}
              </div>
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">{transaction.description}</h2>
                <div className="text-xs font-mono text-slate-500 mt-0.5">ID: {transaction.id}</div>
              </div>
            </div>
            <div className="text-right">
              <div className={cn(
                "font-display text-2xl font-black tracking-tight",
                isDebitLike ? "text-red-500" : isCreditLike ? "text-emerald-500" : "text-blue-500"
              )}>
                {isDebitLike ? '-' : '+'}${transaction.amount.toFixed(2)}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-slate-900/50 rounded-xl border border-white/[0.04]">
              <div className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-1">Status</div>
               <span className={cn(
                  "px-2 py-0.5 rounded font-mono font-bold uppercase text-[9px]",
                  transaction.status === 'COMPLETED' ? "bg-emerald-500/15 border border-emerald-500/20 text-emerald-400" :
                  transaction.status === 'FAILED' ? "bg-red-500/15 border border-red-500/20 text-red-500" :
                  transaction.status === 'PENDING' ? "bg-amber-500/15 border border-amber-500/20 text-amber-500" :
                  "bg-slate-500/15 border border-slate-500/20 text-slate-400"
                )}>
                  {transaction.status}
                </span>
            </div>
            <div className="p-3 bg-slate-900/50 rounded-xl border border-white/[0.04]">
              <div className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-1">Date & Time</div>
              <div className="text-xs font-mono text-slate-300">
                {formatSafe(transaction.createdAt, 'MMM dd, yyyy HH:mm:ss')}
              </div>
            </div>
            <div className="p-3 bg-slate-900/50 rounded-xl border border-white/[0.04]">
              <div className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-1">Type</div>
              <div className="text-xs font-bold text-slate-300">{transaction.type}</div>
            </div>
            <div className="p-3 bg-slate-900/50 rounded-xl border border-white/[0.04]">
              <div className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-1">Payment Method</div>
              <div className="text-xs font-bold text-slate-300">{transaction.paymentMethod || 'N/A'}</div>
            </div>
          </div>

          {/* Balance info if available */}
          {(transaction.balanceBefore !== undefined && transaction.balanceAfter !== undefined) && (
            <div className="p-4 bg-slate-900/30 rounded-xl border border-white/[0.02] flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Balance Before</div>
                <div className="font-mono text-sm text-slate-400 mt-1">${transaction.balanceBefore.toFixed(2)}</div>
              </div>
              <Activity className="w-4 h-4 text-slate-600" />
              <div className="text-right">
                <div className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Balance After</div>
                <div className="font-mono text-sm text-slate-200 mt-1">${transaction.balanceAfter.toFixed(2)}</div>
              </div>
            </div>
          )}

          {/* References & Metadata */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2 border-b border-white/[0.04] pb-2">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              References & Metadata
            </h4>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center py-2 border-b border-white/[0.02]">
                <span className="text-xs text-slate-400 font-medium">Order ID</span>
                <span className="text-xs font-mono text-slate-200">{transaction.orderId || '-'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/[0.02]">
                <span className="text-xs text-slate-400 font-medium">Reference ID</span>
                <span className="text-xs font-mono text-slate-200">{transaction.referenceId || '-'}</span>
              </div>
              
              {transaction.metadata && Object.keys(transaction.metadata).length > 0 && (
                <div className="pt-2">
                  <div className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-2 flex items-center gap-1.5">
                    <Tag className="w-3 h-3" />
                    Additional Metadata
                  </div>
                  <pre className="bg-slate-950 p-3 rounded-lg border border-white/[0.04] text-[10px] text-slate-400 font-mono overflow-x-auto">
                    {JSON.stringify(transaction.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
