import React from 'react';
import { AnnouncementManager } from '../modules/System/AnnouncementManager';
import { GlobalLimitsCard } from '../modules/System/GlobalLimitsCard';
import { TechnicalArchitecture } from '../modules/System/TechnicalArchitecture';
import { cn } from '../utils/cn';
import { 
  Settings, 
  Database, 
  ShieldCheck, 
  Terminal, 
  Cpu, 
  Globe,
  Bell
} from 'lucide-react';

export const SystemConfigPage = () => {
  return (
    <div className="max-w-7xl mx-auto py-8 px-4 space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-3xl font-semibold text-white tracking-tight">System Configuration</h1>
          <p className="text-sm text-slate-400 mt-2 flex items-center gap-2">
            <Settings className="w-4 h-4 text-blue-500" />
            Platform Control Plane
          </p>
        </div>
        
        <div className="flex gap-3 bg-slate-900 border border-white/5 p-2 rounded-xl">
          <div className="px-3 py-1.5 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span className="text-sm font-medium text-white">All Systems Operational</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Communications */}
        <div className="lg:col-span-2 space-y-8">
          <AnnouncementManager />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="bg-slate-900/40 border border-white/[0.04] rounded-[32px] p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                    <Database className="w-5 h-5 text-blue-500" />
                  </div>
                  <span className="text-xs font-semibold text-emerald-500 border border-emerald-500/20 px-2 py-0.5 rounded bg-emerald-500/5">HEALTHY</span>
                </div>
                <h3 className="text-sm font-semibold text-white tracking-tight">Storage Provisioning</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Managed Database Cluster [PRD-ALPHA-01]
                  <br />
                  Current usage: 12.4 GB / 50 GB
                </p>
                <div className="pt-2">
                  <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-full w-[24%]" />
                  </div>
                </div>
             </div>

             <div className="bg-slate-900/40 border border-white/[0.04] rounded-[32px] p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 text-purple-500" />
                  </div>
                  <span className="text-xs font-semibold text-blue-500 border border-blue-500/20 px-2 py-0.5 rounded bg-blue-500/5">ENFORCED</span>
                </div>
                <h3 className="text-sm font-semibold text-white tracking-tight">Security Protocol</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Biometric 2FA & WebAuthn Key Security
                  <br />
                  Last login attempt: 4h ago
                </p>
                <button className="text-sm text-purple-400 font-medium hover:text-purple-300 transition-colors mt-2">
                  Review Security Logs {'->'}
                </button>
             </div>

             <GlobalLimitsCard />
          </div>
        </div>

        {/* Right Column: Quick Status */}
        <div className="space-y-6">
          <div className="bg-slate-950/60 border border-white/10 rounded-[40px] p-8 backdrop-blur-2xl shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <Cpu className="w-40 h-40 text-blue-500" />
            </div>
            
            <div className="relative z-10 space-y-6">
              <h3 className="text-sm font-medium text-slate-400 uppercase tracking-widest">Platform Metrics</h3>
              
              <div className="space-y-4">
                {[
                  { label: 'CPU Utilization', value: '14%', color: 'bg-emerald-500' },
                  { label: 'Memory Usage', value: '42%', color: 'bg-blue-500' },
                  { label: 'Average Latency', value: '0.8ms', color: 'bg-purple-500' }
                ].map((metric) => (
                  <div key={metric.label} className="space-y-2">
                    <div className="flex justify-between text-sm font-medium">
                      <span className="text-slate-300">{metric.label}</span>
                      <span className="text-white bg-slate-800 font-mono px-2 py-0.5 rounded">{metric.value}</span>
                    </div>
                    <div className="w-full bg-slate-900 border border-white/5 h-2 rounded-full overflow-hidden">
                      <div className={cn("h-full", metric.color)} style={{ width: metric.value === '0.8ms' ? '12%' : metric.value }} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-6 border-t border-white/10 grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-sm text-slate-400 font-medium">Active Services</div>
                  <div className="text-2xl font-semibold text-white">128</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-slate-400 font-medium">System Uptime</div>
                  <div className="text-2xl font-semibold text-white">99.98%</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[40px] p-8 shadow-xl shadow-indigo-500/20 text-white space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-950/20 flex items-center justify-center">
              <Globe className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold tracking-tight">Expand Infrastructure</h3>
            <p className="text-sm text-indigo-200 leading-relaxed mt-2">
              Ready to deploy to new regions. Provisioning new zones will decrease overall latency.
            </p>
            <button className="w-full bg-white text-indigo-700 py-3 mt-4 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors shadow-lg">
              Initialize Deployment
            </button>
          </div>
        </div>
      </div>

      <TechnicalArchitecture />
    </div>
  );
};
