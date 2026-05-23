import React, { useState } from 'react';
import { 
  CreditCard, 
  Layers, 
  Calendar, 
  Plus, 
  Download, 
  Mail, 
  CheckCircle, 
  BarChart, 
  AlertCircle,
  FileText,
  DollarSign,
  TrendingUp,
  Sliders,
  Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { TransactionHistory } from '../modules/billing/TransactionHistory';

export const BillingDashboard = () => {
  const [activePlan, setActivePlan] = useState('silver');
  const [showInvoiceCreator, setShowInvoiceCreator] = useState(false);
  const [invoices, setInvoices] = useState([
    { id: 'INV-2026-001', company: 'Infin_Link Corp', plan: 'Gold Nexus Executor', amount: 499.00, status: 'PAID', date: '2026-05-10', dueDate: '2026-05-20' },
    { id: 'INV-2026-002', company: 'Riddle_Node Dist', plan: 'Silver VIP Node', amount: 199.00, status: 'PAID', date: '2026-05-08', dueDate: '2026-05-18' },
    { id: 'INV-2026-003', company: 'Apex_SaaS Network', plan: 'Silver VIP Node', amount: 199.00, status: 'OVERDUE', date: '2026-04-30', dueDate: '2026-05-10' },
    { id: 'INV-2026-004', company: 'Nexus_LvlUp Global', plan: 'Bronze Base Node', amount: 49.00, status: 'PAID', date: '2026-04-28', dueDate: '2026-05-08' }
  ]);

  const [newInvoice, setNewInvoice] = useState({
    company: '',
    planName: 'Silver VIP Node',
    amount: 199.00,
    email: '',
    items: [{ desc: 'Secondary Node Allocation', qty: 1, price: 199.00 }]
  });

  const [activeTab, setActiveTab] = useState<'plans' | 'invoices' | 'history' | 'usage'>('plans');

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const invId = `INV-2026-0${invoices.length + 1}`;
    const newInv = {
      id: invId,
      company: newInvoice.company || 'Custom Agency',
      plan: newInvoice.planName,
      amount: Number(newInvoice.amount),
      status: 'PAID',
      date: format(new Date(), 'yyyy-MM-dd'),
      dueDate: format(new Date(Date.now() + 10 * 86400000), 'yyyy-MM-dd')
    };

    setInvoices([newInv, ...invoices]);
    setShowInvoiceCreator(false);
    setNewInvoice({
      company: '',
      planName: 'Silver VIP Node',
      amount: 199.00,
      email: '',
      items: [{ desc: 'Secondary Node Allocation', qty: 1, price: 199.00 }]
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-4 border-b border-white/[0.04]">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-widest font-mono">
            <span>Operations / Settings / Billing & Invoices</span>
          </div>
          <h1 className="text-3xl font-bold font-sans text-white tracking-tight mt-2 flex items-center gap-3">
            <CreditCard className="w-8 h-8 text-indigo-500" />
            Billing & Subscriptions
          </h1>
          <p className="text-sm text-slate-400 font-medium mt-1">
            Manage multi-tenant distribution nodes, generate dynamic invoicing, and track API limits.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowInvoiceCreator(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs tracking-tight rounded-xl flex items-center gap-2 transition-all shadow-md hover:scale-[1.02] active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Issue Custom Invoice
          </button>
        </div>
      </div>

      {/* Tabs Layout */}
      <div className="flex border-b border-white/[0.04] bg-slate-900/30 p-2 gap-1.5 rounded-xl z-20 relative">
        {[
          { id: 'plans', label: 'Subscription Plans', icon: Layers },
          { id: 'invoices', label: 'Invoices & Settlements', icon: FileText },
          { id: 'history', label: 'Transaction History', icon: DollarSign },
          { id: 'usage', label: 'API Usage Logs', icon: BarChart }
        ].map((t, index) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={`${t.id}-${index}`}
              onClick={() => setActiveTab(t.id as any)}
              className={`flex items-center gap-2.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                isActive 
                  ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20' 
                  : 'text-slate-400 hover:text-white border border-transparent'
              }`}
            >
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'plans' && (
        <div className="space-y-8">
          {/* Subscription plans cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { id: 'bronze', name: 'Starter Distribution Node', price: '$49/mo', desc: 'Designed for early stage resellers and regional sub-dealers.', features: ['Up to 5 Sub-Resellers', '1.2% Digiflazz Markup Sync', 'Standard SLA Callback', 'Shared Gateway Pipelines'] },
              { id: 'silver', name: 'Enterprise Silver API Node', price: '$199/mo', desc: 'Designed for scalable scaling partner companies.', features: ['Unlimited Sub-Resellers', '0.5% Commission Ceiling', 'Dual supplier redundant gateways', 'Dedicated Slack Slack Support', 'Priority support & webhooks'] },
              { id: 'gold', name: 'Gold Nexus Dedicated Executor', price: '$499/mo', desc: 'Ultimate localized shard for institutional volume.', features: ['Dedicated cloud DB instance', '0% Markup Platform Fee', 'Unlimited Custom Domain Whitelabels', 'Direct DB Replication pipeline', '99.99% Guaranteed uptime SLA'] }
            ].map((plan, index) => (
              <div 
                key={`${plan.id}-${index}`}
                className={`bg-slate-950 rounded-3xl p-8 border ${activePlan === plan.id ? 'border-indigo-500 shadow-xl shadow-indigo-500/5' : 'border-white/[0.04]'} flex flex-col justify-between hover:border-slate-800 transition-colors relative overflow-hidden group`}
              >
                {activePlan === plan.id && (
                  <div className="absolute top-0 right-0 bg-indigo-600 text-white font-mono font-bold text-[9px] uppercase tracking-wider px-3.5 py-1 rounded-bl-xl shadow-sm">
                    CURRENT NODE LEVEL
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight">{plan.name}</h3>
                  <div className="flex items-baseline gap-2.5 mt-4">
                    <span className="text-4xl font-extrabold text-white tracking-tighter">{plan.price}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-2 font-medium leading-relaxed">{plan.desc}</p>
                  
                  <ul className="space-y-3 mt-8 border-t border-white/[0.04] pt-6 text-xs text-slate-400 font-medium">
                    {plan.features.map((feat, i) => (
                      <li key={i} className="flex items-center gap-2.5">
                        <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-8">
                  <button 
                    onClick={() => setActivePlan(plan.id)}
                    className={`w-full py-2.5 text-xs font-semibold rounded-xl transition-all shadow-sm ${
                      activePlan === plan.id 
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                        : 'bg-slate-900 border border-white/[0.04] text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    {activePlan === plan.id ? 'Active Plan' : 'Request Upgrade'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-slate-950 p-6 rounded-2xl border border-white/[0.04]">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Recurring Billing Schedule</h3>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 bg-slate-900 border border-white/[0.02] rounded-xl text-xs gap-4 font-mono font-bold uppercase text-slate-400">
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-indigo-400" />
                <span>Next Billing Auto-Deduction Cycle: June 01, 2026 // 00:00 UTC</span>
              </div>
              <div>
                <span>Target Amount: <span className="text-white">$199.00</span></span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'invoices' && (
        <div className="bg-slate-950 border border-white/[0.04] rounded-2xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-white/[0.04] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight uppercase">Platform Invoice Settlements</h3>
              <p className="text-xs text-slate-400 mt-1">Audit, edit, and download invoice records compiled for node licenses.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs whitespace-nowrap">
              <thead>
                <tr className="border-b border-white/[0.04] text-slate-500 font-mono font-bold uppercase tracking-widest bg-slate-900/10">
                  <th className="p-4">Invoice ID</th>
                  <th className="p-4">Billing To</th>
                  <th className="p-4">Associated Node</th>
                  <th className="p-4">Issue Date</th>
                  <th className="p-4">Settlement Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv, index) => (
                  <tr key={`${inv.id}-${index}`} className="border-b border-white/[0.04] hover:bg-white/[0.01] transition-all">
                    <td className="p-4 font-mono font-bold text-white">{inv.id}</td>
                    <td className="p-4 font-semibold text-slate-300">{inv.company}</td>
                    <td className="p-4 font-semibold text-slate-400">{inv.plan}</td>
                    <td className="p-4 text-slate-400 font-mono">{inv.date}</td>
                    <td className="p-4 font-mono font-bold text-white">${inv.amount.toFixed(2)}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded font-mono font-bold uppercase text-[9px] ${
                        inv.status === 'PAID' ? 'bg-emerald-500/15 border border-emerald-500/20 text-emerald-400' : 'bg-red-500/15 border border-red-500/20 text-red-500 animate-pulse'
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2 text-slate-400">
                        <button className="p-1.5 hover:text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors">
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button className="p-1.5 hover:text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors">
                          <Mail className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <TransactionHistory />
      )}

      {activeTab === 'usage' && (
        <div className="space-y-8">
          <div className="bg-slate-950 p-6 border border-white/[0.04] rounded-2xl">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Traffic Resource Limits</h3>
            <div className="space-y-6 pt-2">
              {[
                { name: 'Gateway API Request Pool', used: 42150, limit: 100000, unit: 'requests' },
                { name: 'Active Reseller Node Terminals', used: 156, limit: 200, unit: 'nodes' },
                { name: 'WebSockets Live Synchronization Portals', used: 12, limit: 15, unit: 'concurrent ports' }
              ].map((res, i) => {
                const percent = (res.used / res.limit) * 100;
                return (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between items-baseline text-xs font-semibold">
                      <span className="text-slate-300">{res.name}</span>
                      <span className="text-slate-500 font-mono font-bold">{res.used.toLocaleString()} / {res.limit.toLocaleString()} {res.unit} ({percent.toFixed(1)}%)</span>
                    </div>
                    <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-white/[0.02]">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Invoice Generator Modal/Frame */}
      <AnimatePresence>
        {showInvoiceCreator && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowInvoiceCreator(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" 
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-xl bg-slate-950 border border-white/[0.04] rounded-2xl p-8 max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white tracking-tight">Issue Custom Tenant Invoice</h3>
                  <p className="text-xs text-slate-500 mt-1">Directly generate an immutable billing invoice for regional partners.</p>
                </div>
                <div className="w-10 h-10 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400">
                  <FileText className="w-5 h-5" />
                </div>
              </div>

              <form onSubmit={handleCreateInvoice} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest font-mono">Reseller / Tenant Organization</label>
                  <input 
                    required
                    value={newInvoice.company}
                    onChange={e => setNewInvoice({...newInvoice, company: e.target.value})}
                    placeholder="e.g. Infin_Link Corp"
                    className="w-full bg-slate-950 border border-white/[0.04] rounded-lg px-4 py-2.5 text-xs text-white placeholder:text-slate-400 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest font-mono">Invoice Plan Designation</label>
                    <select 
                      value={newInvoice.planName}
                      onChange={e => setNewInvoice({...newInvoice, planName: e.target.value})}
                      className="w-full bg-slate-950 border border-white/[0.04] rounded-lg px-4 py-2.5 text-xs text-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
                    >
                      <option>Bronze Base Node</option>
                      <option>Silver VIP Node</option>
                      <option>Gold Nexus Dedicated Executor</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest font-mono">Invoice Value ($)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium text-xs">$</span>
                      <input 
                        required
                        type="number"
                        value={newInvoice.amount}
                        onChange={e => setNewInvoice({...newInvoice, amount: Number(e.target.value)})}
                        className="w-full bg-slate-950 border border-white/[0.04] rounded-lg pl-8 pr-4 py-2.5 text-xs text-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest font-mono">Billing Email Dispatch Address</label>
                  <input 
                    required
                    type="email"
                    value={newInvoice.email}
                    onChange={e => setNewInvoice({...newInvoice, email: e.target.value})}
                    placeholder="reseller@organization.com"
                    className="w-full bg-slate-950 border border-white/[0.04] rounded-lg px-4 py-2.5 text-xs text-white placeholder:text-slate-400 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
                  />
                </div>

                <div className="pt-6 flex gap-4">
                  <button 
                    type="button"
                    onClick={() => setShowInvoiceCreator(false)}
                    className="flex-1 bg-slate-950 border border-white/[0.04] text-slate-300 hover:bg-slate-900 hover:text-white transition-colors py-2.5 rounded-lg text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 bg-indigo-600 text-white hover:bg-indigo-700 transition-colors py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 shadow-md"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Dispatch Settlement Invoice
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
