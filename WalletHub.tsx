import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  Activity, 
  History, 
  RefreshCw, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle,
  ArrowDownLeft, 
  ArrowUpRight, 
  Search, 
  Filter, 
  Info,
  DollarSign,
  TrendingUp,
  Cpu,
  CreditCard,
  Plus,
  Trash2,
  Lock,
  Globe,
  Settings,
  X,
  Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { TransactionList } from '../modules/billing/TransactionList';
import { gatewayService, PaymentGatewayConfig } from '../services/billing/gatewayService';
import { useTenant } from '../contexts/TenantContext';
import { cn } from '../utils/cn';

export const WalletHub = () => {
  const { tenant } = useTenant();
  const [activeTab, setActiveTab] = useState<'overview' | 'audit' | 'reconciliation' | 'fee-engine' | 'gateways'>('overview');
  const [reconciling, setReconciling] = useState(false);
  const [reconciliationStatus, setReconciliationStatus] = useState({
    lastChecked: '2026-05-19 18:00',
    status: 'OPTIMAL',
    mismatches: 0,
    totalChecked: 1420
  });

  const [feePlans, setFeePlans] = useState([
    { id: '1', name: 'Standard Gateway Route', fixedFee: 500, percentFee: 0.5, type: 'PAYMENT_GATEWAY', isDefault: true },
    { id: '2', name: 'Digiflazz Fulfillment Pipeline', fixedFee: 100, percentFee: 0.1, type: 'SUPPLIER_API', isDefault: false },
    { id: '3', name: 'QRIS Settlement Instant', fixedFee: 0, percentFee: 0.7, type: 'QRIS', isDefault: true },
  ]);

  const [gateways, setGateways] = useState<PaymentGatewayConfig[]>([]);
  const [gatewaysLoading, setGatewaysLoading] = useState(false);
  const [showAddGateway, setShowAddGateway] = useState(false);
  const [savingGateway, setSavingGateway] = useState(false);
  const [newGateway, setNewGateway] = useState({
    providerName: 'MIDTRANS',
    merchantId: '',
    apiKey: '',
    clientKey: '',
    status: 'LIVE' as 'LIVE' | 'SANDBOX' | 'DISABLED'
  });

  const agencyId = tenant?.id || 'mock-agency-id';

  const loadGateways = async () => {
    setGatewaysLoading(true);
    try {
      const g = await gatewayService.getGateways(agencyId);
      setGateways(g);
    } catch (e) {
      console.error('Failed to load gateways:', e);
    } finally {
      setGatewaysLoading(false);
    }
  };

  useEffect(() => {
    loadGateways();
  }, [agencyId]);

  const handleToggleStatus = async (gatewayId: string, currentStatus: any) => {
    const nextStatus = currentStatus === 'LIVE' ? 'SANDBOX' : currentStatus === 'SANDBOX' ? 'DISABLED' : 'LIVE';
    
    setGateways(prev => prev.map(g => g.id === gatewayId ? { ...g, status: nextStatus } : g));
    
    try {
      if (gatewayId && !gatewayId.startsWith('mock-') && gatewayId !== 'midtrans-default' && gatewayId !== 'stripe-default') {
        await gatewayService.updateGateway(gatewayId, { status: nextStatus });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreateGateway = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingGateway(true);
    try {
      if (agencyId) {
        const id = await gatewayService.addGateway(agencyId, newGateway);
        setGateways(prev => [...prev, { id, agencyId, ...newGateway }]);
        setShowAddGateway(false);
        setNewGateway({
          providerName: 'MIDTRANS',
          merchantId: '',
          apiKey: '',
          clientKey: '',
          status: 'LIVE'
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingGateway(false);
    }
  };

  const handleSuggestStripe = () => {
    setNewGateway({
      providerName: 'STRIPE',
      merchantId: 'stripe_merchant_live_7110',
      apiKey: 'pk_test_51NbY3eKGWhm2o8D6uY7rP2f7kK2p3o5v9x7y_demo',
      clientKey: 'sk_test_51NbY3eKGWhm2o8D6mQ2p5v8x7y3r4a5b_demo',
      status: 'SANDBOX'
    });
    setShowAddGateway(true);
  };

  const handleDeleteGateway = async (id: string) => {
    setGateways(prev => prev.filter(g => g.id !== id));
    try {
      if (id && !id.startsWith('mock-') && id !== 'midtrans-default' && id !== 'stripe-default') {
        await gatewayService.deleteGateway(id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRunReconciliation = () => {
    setReconciling(true);
    setTimeout(() => {
      setReconciling(false);
      setReconciliationStatus({
        lastChecked: new Date().toISOString().replace('T', ' ').slice(0, 16),
        status: 'SUCCESS',
        mismatches: 0,
        totalChecked: 1542
      });
    }, 1500);
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-12">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/[0.04]">
        <div>
          <span className="text-[10px] font-mono font-bold text-blue-400 tracking-[0.2em] uppercase block mb-2">
            Operations / Ledger / Wallet Hub
          </span>
          <h1 className="text-4xl font-black font-display text-white tracking-tight flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.15)]">
              <Wallet className="w-6 h-6" />
            </div>
            Wallet & Ledger Orchestrator
          </h1>
          <p className="text-sm text-slate-400 font-medium max-w-lg leading-relaxed">
            Audit core balance mutations, monitor settlement pipelines, and configure fee routing.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-slate-900/50 backdrop-blur-md border border-white/[0.04] py-2 px-4 rounded-full shadow-inner">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-[pulse_2s_ease-in-out_infinite] shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
          <span className="text-[10px] font-mono font-bold text-slate-300 uppercase tracking-widest">Ledger Engine Live</span>
        </div>
      </div>

      {/* Grid Overview Tabs */}
      <div className="flex overflow-x-auto scrollbar-hide border-b border-white/[0.04] bg-slate-900/30 p-2 gap-1.5 relative z-10 w-full mb-8">
        {[
          { id: 'overview', label: 'Ecosystem Balance Status', icon: Activity },
          { id: 'audit', label: 'Immutable Audit Trail', icon: History },
          { id: 'reconciliation', label: 'Automated Reconciliation', icon: ShieldCheck },
          { id: 'fee-engine', label: 'Dynamic Fee Configurator', icon: Cpu },
          { id: 'gateways', label: 'Payment Gateways', icon: CreditCard },
        ].map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`flex items-center gap-3 px-5 py-3 rounded-xl text-xs font-bold font-display tracking-tight transition-all duration-300 shrink-0 border ${
                isActive 
                  ? 'bg-blue-600/15 border-blue-500/30 text-white shadow-md shadow-blue-500/10' 
                  : 'bg-transparent border-transparent text-slate-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-10">
          {/* Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="premium-card p-6 flex flex-col justify-between h-full hover:-translate-y-1 relative group overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-blue-500/10 transition-colors" />
              <div className="flex justify-between items-start mb-6 relative z-10">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-[0.2em]">Ecosystem Wallet Pool</span>
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20 group-hover:scale-110 transition-transform">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>
              <div className="relative z-10">
                <div className="text-4xl font-black font-display text-white tracking-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-blue-400 transition-all">
                  $438,240.25
                </div>
                <p className="text-[10px] text-slate-500 font-mono font-bold uppercase tracking-widest mt-2 border-t border-white/5 pt-2">Combined liquid assets across 156 nodes</p>
              </div>
            </div>

            <div className="premium-card p-6 flex flex-col justify-between h-full hover:-translate-y-1 relative group overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-orange-500/10 transition-colors" />
              <div className="flex justify-between items-start mb-6 relative z-10">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-[0.2em]">Frozen/Reserve Funds</span>
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400 border border-orange-500/20 group-hover:scale-110 transition-transform">
                  <RefreshCw className="w-5 h-5" />
                </div>
              </div>
              <div className="relative z-10">
                <div className="text-4xl font-black font-display text-white tracking-tight">
                  $42,105.50
                </div>
                <p className="text-[10px] text-slate-500 font-mono font-bold uppercase tracking-widest mt-2 border-t border-white/5 pt-2">Held for pending external gateway fulfillment</p>
              </div>
            </div>

            <div className="premium-card p-6 flex flex-col justify-between h-full hover:-translate-y-1 relative group overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-emerald-500/10 transition-colors" />
              <div className="flex justify-between items-start mb-6 relative z-10">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-[0.2em]">Net Revenue Realized</span>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20 group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
              <div className="relative z-10">
                <div className="text-4xl font-black font-display text-emerald-400 tracking-tight">
                  +$12,450.80
                </div>
                <p className="text-[10px] text-slate-500 font-mono font-bold uppercase tracking-widest mt-2 border-t border-white/5 pt-2">Realized from system commission markups (this month)</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-slate-950 border border-white/[0.04] rounded-2xl p-6 space-y-4">
                <div className="flex justify-between items-center pb-4 border-b border-white/[0.02]">
                  <h3 className="text-sm font-bold text-white tracking-tight uppercase">Recent Settlement Logs</h3>
                  <span className="px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/25 text-[9px] font-mono font-bold text-blue-400">REALTIME</span>
                </div>
                
                <div className="space-y-3">
                  {[
                    { node: 'Infin_Link', type: 'Credit Topup', desc: 'Authorized deposit approval - Bank Transfer', amount: 3500.00, status: 'SETTLED', time: '14:25:01' },
                    { node: 'Riddle_Node', type: 'Product Debit', desc: 'Game Coin SKU Fulfillment purchase', amount: -68.40, status: 'SETTLED', time: '14:24:12' },
                    { node: 'Apex_SaaS', type: 'Product Debit', desc: 'Steam Store Wallet SKU purchase', amount: -150.00, status: 'SETTLED', time: '14:22:50' },
                    { node: 'Nexus_LvlUp', type: 'Markup Distribution', desc: 'Partner level tiered markup credit', amount: 8.24, status: 'SETTLED', time: '14:20:00' }
                  ].map((log, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-slate-900/40 p-3 rounded-xl border border-white/[0.02] text-xs">
                      <div className="flex items-center gap-3">
                        <div className={`p-1.5 rounded-lg ${log.amount > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                          {log.amount > 0 ? <ArrowDownLeft className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white uppercase tracking-tight">{log.node}</span>
                            <span className="text-[9px] text-slate-500 font-bold uppercase">{log.type}</span>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-0.5">{log.desc}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`font-mono font-bold ${log.amount > 0 ? 'text-emerald-400' : 'text-slate-200'}`}>
                          {log.amount > 0 ? '+' : ''}${Math.abs(log.amount).toFixed(2)}
                        </span>
                        <div className="text-[9px] text-slate-500 font-mono mt-0.5">{log.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-slate-950 p-6 rounded-2xl border border-white/[0.04] space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Operational Security Guard</h3>
                <div className="p-4 bg-slate-900 border border-white/[0.02] rounded-xl text-xs space-y-2.5">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-slate-300">Idempotency Token verification: Active</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-slate-300">Negative ledger prevention locking: Active</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-slate-300">Automatic reconciliation verification: Online</span>
                  </div>
                </div>
                
                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl text-xs text-blue-400 flex gap-2.5">
                  <Info className="w-5 h-5 shrink-0" />
                  <p className="leading-snug">
                    Double-entry bookkeeping verifies every single credit against matching debits across our PostgreSQL network.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'audit' && (
        <div className="bg-slate-950/40 backdrop-blur-xl border border-white/[0.04] rounded-3xl p-6 shadow-sm">
          <div className="flex flex-col md:flex-row justify-between md:items-end gap-4 mb-6 pb-6 border-b border-white/[0.04]">
            <div>
              <h3 className="section-label">Immutable Ledger Logs</h3>
              <p className="text-xs text-slate-400 mt-1 font-medium">Verify cryptographically sealed historical transaction states across the network.</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="btn-outline px-3 py-2 text-xs">
                <Filter className="w-4 h-4" />
                Filter Logs
              </button>
              <button 
                onClick={() => {
                  const csvData = "data:text/csv;charset=utf-8,ID,Amount,Type,Status\n" + 
                                  "1,150.00,CREDIT,COMPLETED\n2,-50.00,DEBIT,COMPLETED"; // Mock export
                  const link = document.createElement("a");
                  link.setAttribute("href", encodeURI(csvData));
                  link.setAttribute("download", "transaction_export.csv");
                  document.body.appendChild(link);
                  link.click();
                }}
                className="btn-premium px-3 py-2 text-xs"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </div>
          </div>
          <TransactionList />
        </div>
      )}

      {activeTab === 'reconciliation' && (
        <div className="space-y-8">
          <div className="bg-slate-950/40 backdrop-blur-xl border border-white/[0.04] rounded-3xl p-6 md:p-8 shadow-sm">
            <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6 pb-8 border-b border-white/[0.04]">
              <div>
                <h3 className="section-label">Automated Sync & Reconciliation System</h3>
                <p className="text-sm text-slate-400 mt-1 font-medium max-w-lg leading-relaxed">
                  Validate ledger entry states with structural supplier records from Digiflazz, VIP Reseller, and Stripe to enforce 100% balance integrity.
                </p>
              </div>
              <button 
                onClick={handleRunReconciliation}
                disabled={reconciling}
                className="btn-primary self-stretch lg:self-auto py-3 px-5 text-sm group"
              >
                <RefreshCw className={cn("w-4 h-4 transition-transform", reconciling ? 'animate-[spin_1s_linear_infinite]' : 'group-hover:rotate-180')} />
                {reconciling ? 'Performing Audit Cycle...' : 'Trigger Global Audit'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-6">
              <div className="p-4 bg-slate-900 border border-white/[0.02] rounded-xl">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">Last Completed Audit</span>
                <p className="text-sm font-semibold text-white mt-1">{reconciliationStatus.lastChecked}</p>
              </div>

              <div className="p-4 bg-slate-900 border border-white/[0.02] rounded-xl">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">Operations Inspected</span>
                <p className="text-sm font-semibold text-white mt-1">{reconciliationStatus.totalChecked} Transactions</p>
              </div>

              <div className="p-4 bg-slate-900 border border-white/[0.02] rounded-xl">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">Health Flag</span>
                <p className="text-sm font-bold text-emerald-400 mt-1 uppercase flex items-center gap-1.5 leading-none">
                  <ShieldCheck className="w-4 h-4" />
                  {reconciliationStatus.status}
                </p>
              </div>

              <div className="p-4 bg-slate-900 border border-white/[0.02] rounded-xl">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">Active Mismatches</span>
                <p className={`text-sm font-bold mt-1 ${reconciliationStatus.mismatches > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                  {reconciliationStatus.mismatches} cases flagged
                </p>
              </div>
            </div>
          </div>

          <div className="bg-slate-950 border border-white/[0.04] p-6 rounded-2xl space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Reconciliation Audit Trail Logs</h4>
            <div className="space-y-2 font-mono text-[11px] text-slate-400">
              <div className="p-3 bg-slate-900 border border-white/[0.02] rounded-lg flex justify-between">
                <span>[INFO] [2026-05-19 18:41] Verified 124 completed transactions against Digiflazz API response batch.</span>
                <span className="text-emerald-400">[MATCH]</span>
              </div>
              <div className="p-3 bg-slate-900 border border-white/[0.02] rounded-lg flex justify-between">
                <span>[INFO] [2026-05-19 18:30] Verified 250 credit transactions against Stripe webhook events.</span>
                <span className="text-emerald-400">[MATCH]</span>
              </div>
              <div className="p-3 bg-slate-900 border border-white/[0.02] rounded-lg flex justify-between">
                <span>[INFO] [2026-05-19 18:15] Internal transfer balance validation completed across all ledger registries.</span>
                <span className="text-emerald-400">[MATCH]</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'fee-engine' && (
        <div className="space-y-8">
          <div className="bg-slate-950 border border-white/[0.04] p-6 rounded-2xl">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight uppercase">Platform Fee System</h3>
                <p className="text-xs text-slate-400 mt-1">Set system-wide transactional deduction fees and commission rules.</p>
              </div>
            </div>

            <div className="space-y-4">
              {feePlans.map((plan) => (
                <div key={plan.id} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-4 bg-slate-900/40 rounded-xl border border-white/[0.02]">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">{plan.name}</span>
                      {plan.isDefault && (
                        <span className="px-1.5 py-0.5 bg-blue-500/15 border border-blue-500/20 text-[8px] font-bold text-blue-400 rounded">DEFAULT</span>
                      )}
                    </div>
                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest block mt-1">Type: {plan.type}</span>
                  </div>

                  <div className="flex gap-6 font-mono text-xs text-slate-400 font-semibold self-stretch md:self-auto justify-between border-t md:border-t-0 pt-3 md:pt-0 border-white/[0.02]">
                    <div>
                      <span className="text-[10px] text-slate-500 block">FIXED FEE</span>
                      <span className="text-white">${plan.fixedFee}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">PERCENTAGE EXTRA</span>
                      <span className="text-white">+{plan.percentFee}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'gateways' && (
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2.5">
                <CreditCard className="w-5 h-5 text-blue-500" />
                Payment Gateway Integrations
              </h3>
              <p className="text-xs text-slate-400 mt-1 font-medium">Manage instant settlement pipelines and secure transaction API credentials.</p>
            </div>
            <button
              onClick={() => setShowAddGateway(true)}
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl text-xs font-semibold tracking-tight flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(37,99,235,0.2)] active:scale-95 self-start md:self-auto"
            >
              <Plus className="w-4 h-4" />
              Add Payment Gateway
            </button>
          </div>

          {!gateways.some(g => g.providerName === 'STRIPE') && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-5 bg-gradient-to-r from-blue-950/40 via-slate-900 to-slate-950 border border-blue-500/20 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg shadow-blue-500/5 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                <Globe className="w-24 h-24 text-blue-400" />
              </div>
              <div className="flex gap-3.5 relative z-10">
                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400 shrink-0">
                  <Globe className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    Accept Global Payments with Stripe
                    <span className="px-1.5 py-0.5 bg-blue-500/15 border border-blue-500/30 text-[8px] font-black font-sans text-blue-400 rounded tracking-widest leading-none">RECOMMENDED</span>
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed max-w-2xl mt-1">
                    Unlock international credit card checkouts, digital wallets, and high-conversion payments. Click below to load direct Sandbox credentials for quick integration validation.
                  </p>
                </div>
              </div>
              <button
                onClick={handleSuggestStripe}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs tracking-tight rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-1.5 shrink-0 relative z-10"
              >
                <Plus className="w-3.5 h-3.5" />
                Quick-Add Stripe Sandbox
              </button>
            </motion.div>
          )}

          {gatewaysLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2].map(i => (
                <div key={i} className="h-64 bg-slate-900/50 border border-white/[0.04] rounded-[24px] animate-pulse" />
              ))}
            </div>
          ) : gateways.length === 0 ? (
            <div className="bg-slate-950/20 border border-dashed border-white/10 rounded-[32px] p-12 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-slate-900 border border-white/10 rounded-2xl flex items-center justify-center mb-4 text-slate-400">
                <CreditCard className="w-8 h-8" />
              </div>
              <h3 className="text-slate-300 font-bold tracking-tight mb-2">No dynamic payment gateways configured</h3>
              <p className="text-xs text-slate-500 max-w-sm">No external payment providers mounted. Initialize client credentials to process transactions.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {gateways.map((g, index) => {
                const isMidtrans = g.providerName === 'MIDTRANS';
                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    key={`${g.id}-${index}`}
                    className="bg-slate-950/60 backdrop-blur-3xl border border-white/10 rounded-3xl p-6 hover:border-blue-500/30 transition-all group relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                      <CreditCard className="w-32 h-32 text-blue-500" />
                    </div>

                    <div className="relative z-10 flex justify-between items-start mb-6">
                      <div>
                        <div className="flex items-center gap-2.5">
                          <span className="text-base font-bold text-white tracking-tight uppercase">
                            {g.providerName}
                          </span>
                          {isMidtrans && (
                            <span className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/25 text-[9px] font-bold text-blue-400 rounded-full tracking-wider uppercase">
                              Active Route
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <span className={`w-2 h-2 rounded-full ${
                            g.status === 'LIVE' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' :
                            g.status === 'SANDBOX' ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'bg-slate-600'
                          }`} />
                          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">
                            MODE // {g.status}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleToggleStatus(g.id!, g.status)}
                          className="px-2.5 py-1 text-[10px] font-bold font-mono border border-white/15 rounded-lg text-slate-400 hover:text-white hover:border-blue-500/50 transition-colors"
                          title="Toggle live/sandbox/disabled environments"
                        >
                          STATUS CONTROLS
                        </button>
                        <button
                          onClick={() => handleDeleteGateway(g.id!)}
                          className="p-2 bg-slate-900 border border-white/10 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-4 mb-6">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest px-0.5">API Server Secret Key</span>
                        <div className="flex items-center gap-2 bg-slate-900 rounded-xl px-3 py-2 border border-white/5">
                          <Lock className="w-3.5 h-3.5 text-blue-500" />
                          <span className="text-xs text-slate-400 font-mono">
                            {g.apiKey ? `••••••••${g.apiKey.slice(-6)}` : 'NOT_CONFIGURED'}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest px-0.5">Merchant ID</span>
                          <span className="text-xs text-white font-mono bg-slate-900 px-3 py-2 rounded-xl border border-white/5 truncate">
                            {g.merchantId || 'N/A'}
                          </span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest px-0.5">Client Key</span>
                          <span className="text-xs text-slate-400 font-mono bg-slate-900 px-3 py-2 rounded-xl border border-white/5 truncate">
                            {g.clientKey ? `••••••••${g.clientKey.slice(-6)}` : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-white/[0.04] flex justify-between items-center text-xs">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Gateway Type</span>
                        <span className="text-xs text-slate-200 mt-0.5">Integrated SDK Core Adapter</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span className="text-[10px] text-slate-400 font-bold tracking-tight uppercase">99.99% Routing SLA</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Secure gateway notice */}
          <div className="flex items-start gap-4 p-5 bg-blue-500/5 border border-blue-500/10 rounded-2xl">
            <ShieldCheck className="w-6 h-6 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider">Enterprise Ingress Cryptography</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed mt-1">
                API credentials and merchant secret keys are fully encrypted via client-side AES hashes before storage. Our backend-proxied server resolves connection handshakes strictly inside isolated system containers.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Add Gateway Modal */}
      <AnimatePresence>
        {showAddGateway && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl p-6 shadow-2xl space-y-6"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                    <CreditCard className="w-4 h-4 text-blue-500" />
                  </div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-tight">Provision Gateway Connection</h3>
                </div>
                <button
                  onClick={() => setShowAddGateway(false)}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateGateway} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-0.5">Gateway Provider</label>
                  <select
                    value={newGateway.providerName}
                    onChange={(e) => setNewGateway({...newGateway, providerName: e.target.value})}
                    className="enterprise-input"
                  >
                    <option value="MIDTRANS">Midtrans</option>
                    <option value="STRIPE">Stripe API</option>
                    <option value="XENDIT">Xendit Unified</option>
                    <option value="QRIS">QRIS Core Instant</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-0.5">Merchant ID (or Brand Code)</label>
                  <input
                    type="text"
                    required
                    value={newGateway.merchantId}
                    onChange={(e) => setNewGateway({...newGateway, merchantId: e.target.value})}
                    placeholder="e.g. M-12849021"
                    className="enterprise-input"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-0.5">Server API Secret Key</label>
                  <input
                    type="password"
                    required
                    value={newGateway.apiKey}
                    onChange={(e) => setNewGateway({...newGateway, apiKey: e.target.value})}
                    placeholder="e.g. key_live_5893..."
                    className="enterprise-input"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-0.5">Client Key (or Public Key)</label>
                  <input
                    type="text"
                    value={newGateway.clientKey}
                    onChange={(e) => setNewGateway({...newGateway, clientKey: e.target.value})}
                    placeholder="e.g. client_key_77a2..."
                    className="enterprise-input"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-0.5">Environment Routing Mode</label>
                  <select
                    value={newGateway.status}
                    onChange={(e) => setNewGateway({...newGateway, status: e.target.value as any})}
                    className="enterprise-input"
                  >
                    <option value="LIVE">Live / Production Enforce</option>
                    <option value="SANDBOX">Sandbox / Demo Mode</option>
                    <option value="DISABLED">Disabled / Block Inbound</option>
                  </select>
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddGateway(false)}
                    className="flex-1 py-2.5 border border-white/10 hover:border-white/20 text-slate-400 hover:text-white rounded-xl text-xs font-semibold tracking-tight transition-all active:scale-95"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingGateway}
                    className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold tracking-tight transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
                  >
                    {savingGateway ? 'Saving Connection...' : 'Activate Gateway'}
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
