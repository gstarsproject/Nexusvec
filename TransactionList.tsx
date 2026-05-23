import React, { useState, useEffect } from 'react';
import { Transaction } from '../../types';
import { History, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { formatSafe } from '../../utils/date';
import { cn } from '../../utils/cn';
import { TransactionDetailsModal } from './TransactionDetailsModal';

export const TransactionList = () => {
  const { profile } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!profile?.agencyId) {
        if (!loading) setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(`/api/transactions?agencyId=${profile.agencyId}`);
        if (res.ok) {
          const data = await res.json();
          setTransactions(data.slice(0, 10));
        } else {
          throw new Error("Failed to load transactions");
        }
      } catch (err: any) {
        console.error('Ledger fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [profile?.agencyId]);

  return (
    <div className="space-y-4">
      <h3 className="section-label flex items-center gap-2">
        <History className="w-4 h-4 text-emerald-500" />
        Financial Ledger Output
      </h3>

      <div className="space-y-3">
        {loading ? (
          [1, 2, 3].map(i => <div key={i} className="h-14 skeleton" />)
        ) : transactions.length === 0 ? (
          <div className="p-10 text-center flex flex-col items-center justify-center text-xs text-slate-500 font-mono uppercase border border-dashed border-white/[0.1] rounded-[2rem] bg-slate-900/20">
            <History className="w-8 h-8 opacity-20 mb-3" />
            No financial movements recorded.
          </div>
        ) : (
          transactions.map((t, index) => {
            const isDebitLike = ['DEBIT', 'FREEZE', 'CONFIRM_DEBIT'].includes(t.type);
            const isCreditLike = ['CREDIT', 'UNFREEZE'].includes(t.type);
            
            return (
              <div 
                key={`${t.id}-${index}`} 
                className="flex items-center justify-between p-4 bg-slate-900/40 rounded-2xl border border-white/[0.04] hover:border-white/10 hover:bg-slate-900/80 transition-all duration-300 group shadow-sm cursor-pointer"
                onClick={() => setSelectedTransaction(t)}
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "p-3 rounded-xl",
                    isDebitLike ? "bg-red-500/10 text-red-500 ring-1 ring-red-500/20" : 
                    isCreditLike ? "bg-emerald-500/10 text-emerald-500 ring-1 ring-emerald-500/20" :
                    "bg-blue-500/10 text-blue-500 ring-1 ring-blue-500/20"
                  )}>
                    {isDebitLike ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white uppercase tracking-tight truncate max-w-[180px]">{t.description}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-bold tracking-widest">{t.type}</span>
                      <span className={cn(
                        "badge",
                        t.status === 'COMPLETED' ? "badge-success" :
                        t.status === 'FAILED' ? "badge-error" :
                        (t.status as string) === 'CHALLENGED' ? "badge-warning" :
                        "badge-info"
                      )}>
                        {t.status || 'SETTLED'}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {t.balanceBefore !== undefined && t.balanceAfter !== undefined && (
                          `$${t.balanceBefore.toFixed(2)} → $${t.balanceAfter.toFixed(2)}`
                        )}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={cn(
                    "font-display text-base font-black tracking-tight",
                    isDebitLike ? "text-red-500" : isCreditLike ? "text-emerald-500" : "text-blue-500"
                  )}>
                    {isDebitLike ? '-' : '+'}${t.amount.toFixed(2)}
                  </div>
                  <div className="text-[9px] text-slate-500 font-mono uppercase tracking-widest mt-1 group-hover:text-slate-400 transition-colors">
                    {formatSafe(t.createdAt, 'HH:mm // MMM dd')}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <TransactionDetailsModal
        transaction={selectedTransaction}
        isOpen={!!selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
      />
    </div>
  );
};
