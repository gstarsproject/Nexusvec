import React, { useState } from 'react';
import { SupplierModule } from '../modules/suppliers/SupplierModule';
import { 
  Database, 
  Activity, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight,
  ShieldAlert,
  Sliders,
  Webhook
} from 'lucide-react';

export const Suppliers = () => {
  const [retryQueue, setRetryQueue] = useState([
    { id: 'RT-101', provider: 'SupplierA v1', payload: 'Payload: SKU TopUp X', error: 'Gateway Timeout (504)', attempts: 2, nextRun: '10s' },
    { id: 'RT-102', provider: 'SupplierB Global', payload: 'Payload: SKU Steam 100', error: 'JSON Parse Err (500)', attempts: 1, nextRun: '45s' }
  ]);

  const [activeTab, setActiveTab] = useState<'connections' | 'health' | 'failover'>('connections');

  const [failoverRules, setFailoverRules] = useState([
    { id: 'rule-1', targetCategory: 'Game Recharge SKUs', primaryRoute: 'SupplierA v1', backupRoute: 'SupplierB Global', failoverTrigger: '3 consecutive gateway faults', autoSwitch: true },
    { id: 'rule-2', targetCategory: 'Streaming Subscriptions', primaryRoute: 'SupplierC Global Nexus', backupRoute: 'SupplierA v1', failoverTrigger: 'SLA delay > 2500ms', autoSwitch: true },
  ]);

  const handleForceRetry = (id: string) => {
    setRetryQueue(prev => prev.filter(item => item.id !== id));
  };

  const handleToggleAutoSwitch = (id: string) => {
    setFailoverRules(prev => prev.map(rule => rule.id === id ? { ...rule, autoSwitch: !rule.autoSwitch } : rule));
  };

  return (
    <div className="max-w-7xl mx-auto py-6 space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-4 border-b border-white/[0.04]">
        <div>
          <h1 className="text-3xl font-semibold text-white uppercase tracking-[0.2em]">Infrastructure_Control</h1>
          <p className="text-[11px] text-slate-500 font-mono uppercase tracking-[0.4em] mt-2 flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            Multi-Node Supplier Orchestration & Health System v4.5
          </p>
        </div>

        {/* Diagnostic tabs */}
        <div className="flex bg-slate-900 border border-white/[0.04] p-1 rounded-xl">
          {[
            { id: 'connections', label: 'Connections' },
            { id: 'health', label: 'Health Monitoring' },
            { id: 'failover', label: 'Failover Routing' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === tab.id 
                  ? 'bg-slate-950 text-white shadow-sm border border-white/[0.04]' 
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'connections' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <SupplierModule />
        </div>
      )}

      {activeTab === 'health' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-300">
          {/* Failure Retry Queue */}
          <div className="lg:col-span-2 bg-slate-950 border border-white/[0.04] rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center pb-4 border-b border-white/[0.04]">
              <h3 className="text-sm font-bold text-white tracking-tight uppercase flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500 animate-bounce" />
                Outgoing API Request Retry Queue
              </h3>
              <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-[9px] font-mono font-bold text-amber-500">
                {retryQueue.length} PENDING BACKOFFS
              </span>
            </div>

            {retryQueue.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-500 font-mono border border-dashed border-white/[0.04] rounded-xl uppercase">
                Retry Queue Empty. All outward requests resolved successfully.
              </div>
            ) : (
              <div className="space-y-3">
                {retryQueue.map(item => (
                  <div key={item.id} className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 bg-slate-900/30 rounded-xl border border-white/[0.02] text-xs gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white">{item.id}</span>
                        <span className="text-[10px] text-slate-400 font-medium font-sans">// Provider: {item.provider}</span>
                      </div>
                      <div className="text-slate-400 font-mono tracking-tight text-[11px] bg-slate-950 px-2 py-1 rounded border border-white/[0.4] mt-1">{item.payload}</div>
                      <div className="text-[10px] text-red-400 font-mono mt-1 flex items-center gap-1.5">
                        <ShieldAlert className="w-3.5 h-3.5" />
                        Last Fault: {item.error} (Attempts: {item.attempts})
                      </div>
                    </div>

                    <div className="flex items-center gap-4 self-stretch md:self-auto justify-between border-t md:border-t-0 pt-3 md:pt-0 border-white/[0.02]">
                      <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block font-sans">
                        Retrying in: <span className="text-amber-500">{item.nextRun}</span>
                      </span>
                      <button 
                        onClick={() => handleForceRetry(item.id)}
                        className="p-1.5 hover:text-white bg-slate-900 border border-white/[0.04] hover:bg-slate-800 rounded-lg text-slate-400 flex items-center gap-1.5 font-bold font-sans text-[10px] transition-all shrink-0 active:scale-95"
                      >
                        <RefreshCw className="w-3 h-3 text-emerald-400" />
                        Execute Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Webhook Synchronization Feed */}
          <div className="bg-slate-950 border border-white/[0.04] rounded-2xl p-6 space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Webhook className="w-4 h-4 text-purple-400" />
              Incoming Synced Webhooks
            </h3>
            
            <div className="space-y-3 font-mono text-[10px]">
              {[
                { time: '17:51:20', provider: 'SupplierA v1', event: 'ORDER_FULFILLED', result: 'OK' },
                { time: '17:48:02', provider: 'SupplierB Global', event: 'BALANCE_WARNING', result: 'WARN' },
                { time: '17:42:15', provider: 'SupplierA v1', event: 'RECHARGE_CALLBACK', result: 'OK' },
                { time: '17:30:10', provider: 'SupplierC Dedicated', event: 'OUTLET_HEARTBEAT', result: 'OK' }
              ].map((webhook, i) => (
                <div key={i} className="flex justify-between items-center p-3 bg-slate-900 border border-white/[0.01] rounded-xl">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-500">{webhook.time}</span>
                      <span className="text-slate-300 font-bold uppercase">{webhook.provider}</span>
                    </div>
                    <div className="text-slate-400 font-bold mt-1 uppercase tracking-tight">{webhook.event}</div>
                  </div>
                  <span className={`px-1 rounded font-bold ${
                    webhook.result === 'OK' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                  }`}>
                    {webhook.result}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'failover' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <div className="bg-slate-950 border border-white/[0.04] p-6 rounded-2xl">
            <h3 className="text-sm font-bold text-white tracking-tight uppercase mb-2">Automated Failover Routing Rules</h3>
            <p className="text-xs text-slate-400 max-w-2xl mb-6">
              Establish rules to dynamically reroute fulfillment transactions to alternative suppliers when primary nodes face elevated latencies or connection faults.
            </p>

            <div className="space-y-4">
              {failoverRules.map(rule => (
                <div key={rule.id} className="flex flex-col md:flex-row justify-between items-start md:items-center p-5 bg-slate-900/30 rounded-xl border border-white/[0.02] gap-6 text-xs">
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block">{rule.targetCategory}</span>
                    <div className="flex items-center gap-2.5 font-bold font-sans text-sm text-white">
                      <span>{rule.primaryRoute}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                      <span className="text-indigo-400">{rule.backupRoute}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold block">Failover trigger delay: {rule.failoverTrigger}</span>
                  </div>

                  <div className="flex items-center gap-3.5 self-stretch md:self-auto justify-between border-t md:border-t-0 pt-3 md:pt-0 border-white/[0.02]">
                    <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest font-sans">Automatic Rerouting</span>
                    <div 
                      onClick={() => handleToggleAutoSwitch(rule.id)}
                      className={`w-11 h-6 rounded-full p-1 cursor-pointer transition-all duration-300 ${
                        rule.autoSwitch ? 'bg-blue-600' : 'bg-slate-800'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-slate-950 transition-all transform duration-300 shadow ${
                        rule.autoSwitch ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Connection Security Metrics */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-950 border border-white/[0.04] rounded-2xl p-6">
          <h4 className="text-xs font-semibold text-slate-400 tracking-tight mb-4 uppercase">Connection_Security</h4>
          <p className="text-xs text-slate-500 leading-relaxed font-mono">
            All API keys and secrets are encrypted using AES-256-GCM before storage. 
            Transport is secured via TLS 1.3 with rotational handshake protocols.
          </p>
        </div>
        <div className="bg-slate-950 border border-white/[0.04] rounded-2xl p-6">
          <h4 className="text-xs font-semibold text-slate-400 tracking-tight mb-4 uppercase">Sync_Optimization</h4>
          <p className="text-xs text-slate-500 leading-relaxed font-mono">
            Real-time synchronization utilizes delta-compression to minimize latency. 
            Average heartbeat response time: &lt;45ms across global clusters.
          </p>
        </div>
        <div className="bg-slate-950 border border-white/[0.04] rounded-2xl p-6">
          <h4 className="text-xs font-semibold text-slate-400 tracking-tight mb-4 uppercase">Failover_Redundancy</h4>
          <p className="text-xs text-slate-500 leading-relaxed font-mono">
            Automatic node switching detects supplier maintenance windows. 
            Session persistence maintained across 99.99% of transaction cycles.
          </p>
        </div>
      </div>
    </div>
  );
};
