import React, { useState, useEffect } from 'react';
import { Transaction } from '../../types';
import { History, ArrowUpRight, ArrowDownLeft, Filter, Search, Download } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { isWithinInterval, parseISO, startOfDay, endOfDay } from 'date-fns';
import { parseCreatedDate, formatSafe } from '../../utils/date';
import { cn } from '../../utils/cn';
import { TransactionDetailsModal } from './TransactionDetailsModal';

export const TransactionHistory = () => {
  const { profile } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

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
          setTransactions(data);
        } else {
          throw new Error("Failed to load transactions");
        }
      } catch (err: any) {
        console.error('Transactions fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [profile?.agencyId]);

  const filteredTransactions = transactions.filter(t => {
    // Type Filter
    if (typeFilter !== 'ALL') {
      if (typeFilter === 'DEBIT' && !['DEBIT', 'FREEZE', 'CONFIRM_DEBIT'].includes(t.type)) return false;
      if (typeFilter === 'CREDIT' && !['CREDIT', 'UNFREEZE'].includes(t.type)) return false;
      if (typeFilter === 'TRANSFER' && t.type !== 'TRANSFER') return false;
    }

    // Status Filter
    if (statusFilter !== 'ALL' && t.status !== statusFilter) {
      return false;
    }

    // Date Range Filter
    if (dateRange.start && dateRange.end) {
      const txDate = parseCreatedDate(t.createdAt);
      if (txDate) {
        const st = startOfDay(parseISO(dateRange.start));
        const en = endOfDay(parseISO(dateRange.end));
        if (!isWithinInterval(txDate, { start: st, end: en })) return false;
      } else {
        return false;
      }
    }

    return true;
  });

  return (
    <div className="bg-slate-950 border border-white/[0.04] rounded-2xl overflow-hidden shadow-sm">
      <div className="p-6 border-b border-white/[0.04] space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight uppercase flex items-center gap-2">
              <History className="w-5 h-5 text-indigo-400" />
              Complete Transaction History
            </h3>
            <p className="text-xs text-slate-400 mt-1">Review, filter, and audit all financial movements.</p>
          </div>
          <button className="px-3 py-1.5 bg-slate-900 border border-white/[0.04] hover:bg-slate-800 text-slate-300 text-xs font-semibold rounded-lg flex items-center gap-2 transition-all shadow-sm">
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 bg-slate-900/50 p-3 rounded-xl border border-white/[0.02]">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Filter className="w-4 h-4" />
            <span>Filters:</span>
          </div>

          <div className="flex items-center gap-2">
            <input 
              type="date"
              value={dateRange.start}
              onChange={e => setDateRange({...dateRange, start: e.target.value})}
              className="bg-slate-950 border border-white/[0.04] rounded-lg px-2 py-1.5 text-xs text-slate-300 outline-none focus:border-indigo-500 transition-all font-mono"
            />
            <span className="text-slate-500">to</span>
            <input 
              type="date"
              value={dateRange.end}
              onChange={e => setDateRange({...dateRange, end: e.target.value})}
              className="bg-slate-950 border border-white/[0.04] rounded-lg px-2 py-1.5 text-xs text-slate-300 outline-none focus:border-indigo-500 transition-all font-mono"
            />
          </div>

          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="bg-slate-950 border border-white/[0.04] rounded-lg px-3 py-1.5 text-xs text-slate-300 outline-none focus:border-indigo-500 transition-all font-semibold"
          >
            <option value="ALL">All Types</option>
            <option value="CREDIT">Credits</option>
            <option value="DEBIT">Debits</option>
            <option value="TRANSFER">Transfers</option>
          </select>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-white/[0.04] rounded-lg px-3 py-1.5 text-xs text-slate-300 outline-none focus:border-indigo-500 transition-all font-semibold"
          >
            <option value="ALL">All Statuses</option>
            <option value="COMPLETED">Completed</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          {(dateRange.start || dateRange.end || typeFilter !== 'ALL' || statusFilter !== 'ALL') && (
            <button 
              onClick={() => {
                setDateRange({ start: '', end: '' });
                setTypeFilter('ALL');
                setStatusFilter('ALL');
              }}
              className="text-[10px] text-slate-400 hover:text-white uppercase tracking-widest font-bold ml-auto"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto min-h-[300px]">
        {loading ? (
          <div className="p-8 space-y-3">
            {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-12 skeleton rounded-xl" />)}
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-500">
            <Search className="w-8 h-8 opacity-20 mb-3" />
            <div className="text-xs font-mono uppercase tracking-widest">No matching transactions found</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs whitespace-nowrap">
              <thead>
              <tr className="border-b border-white/[0.04] text-slate-500 font-mono font-bold uppercase tracking-widest bg-slate-900/10">
                <th className="p-4">Type</th>
                <th className="p-4">Description</th>
                <th className="p-4">Date</th>
                <th className="p-4 text-right">Amount</th>
                <th className="p-4">Status</th>
                <th className="p-4">Reference</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((t, index) => {
                const isDebitLike = ['DEBIT', 'FREEZE', 'CONFIRM_DEBIT'].includes(t.type);
                const isCreditLike = ['CREDIT', 'UNFREEZE'].includes(t.type);

                return (
                  <tr 
                    key={`${t.id}-${index}`} 
                    className="border-b border-white/[0.04] hover:bg-white/[0.01] transition-all group cursor-pointer"
                    onClick={() => setSelectedTransaction(t)}
                  >
                    <td className="p-4">
                      <div className={cn(
                        "inline-flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest",
                        isDebitLike ? "bg-red-500/10 text-red-500" : 
                        isCreditLike ? "bg-emerald-500/10 text-emerald-500" :
                        "bg-blue-500/10 text-blue-500"
                      )}>
                        {isDebitLike ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownLeft className="w-3 h-3" />}
                        {t.type}
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-slate-300">
                      {t.description}
                      {(t.balanceBefore !== undefined && t.balanceAfter !== undefined) && (
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                          Bal: ${t.balanceBefore.toFixed(2)} → ${t.balanceAfter.toFixed(2)}
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-slate-400 font-mono">
                      {formatSafe(t.createdAt, 'yyyy-MM-dd HH:mm:ss', 'N/A')}
                    </td>
                    <td className="p-4 text-right">
                      <div className={cn(
                        "font-mono font-bold text-sm",
                        isDebitLike ? "text-red-500" : isCreditLike ? "text-emerald-500" : "text-blue-500"
                      )}>
                        {isDebitLike ? '-' : '+'}${t.amount.toFixed(2)}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={cn(
                        "px-2 py-0.5 rounded font-mono font-bold uppercase text-[9px]",
                        t.status === 'COMPLETED' ? "bg-emerald-500/15 border border-emerald-500/20 text-emerald-400" :
                        t.status === 'FAILED' ? "bg-red-500/15 border border-red-500/20 text-red-500" :
                        t.status === 'PENDING' ? "bg-amber-500/15 border border-amber-500/20 text-amber-500" :
                        "bg-slate-500/15 border border-slate-500/20 text-slate-400"
                      )}>
                        {t.status}
                      </span>
                    </td>
                    <td className="p-4 text-slate-500 font-mono text-[10px]">
                      {t.orderId || t.referenceId || '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            </table>
          </div>
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
