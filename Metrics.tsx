import React from 'react';
import { TrendingUp, Activity } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card } from '../../components/ui/Card';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { MOCK_METRICS } from '../../config/constants';

export const Metrics = () => (
  <Card className="col-span-1 md:col-span-2 min-h-[300px] flex flex-col bg-slate-950 border border-white/[0.04] rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
    <div className="flex items-center justify-between mb-8">
      <div>
        <h3 className="text-lg font-bold text-white tracking-tight">Throughput Analysis</h3>
        <p className="text-xs text-slate-500 font-bold tracking-tight mt-1">Real-time ledger processing volume</p>
      </div>
      <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-xs font-bold text-emerald-400 tracking-tight">Live Node</span>
      </div>
    </div>
    <div className="flex-1 w-full h-[220px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={MOCK_METRICS}>
          <defs>
            <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" vertical={false} />
          <XAxis 
            dataKey="name" 
            stroke="#64748b" 
            fontSize={10} 
            tickLine={false} 
            axisLine={false}
            dy={10}
            fontWeight={600}
          />
          <YAxis hide />
          <Tooltip 
            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10', fontSize: '12px', borderRadius: '12px', color: '#f8fafc', fontWeight: 'bold' }}
            itemStyle={{ color: '#3b82f6' }}
          />
          <Area 
            type="monotone" 
            dataKey="volume" 
            stroke="#3b82f6" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorVolume)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
    <div className="grid grid-cols-3 gap-8 mt-10 pt-8 border-t border-white/[0.04]">
      <div>
        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-2">Peak Capacity</p>
        <p className="text-xl font-bold text-white">4.2k <span className="text-xs text-slate-500 font-medium tracking-normal">tx/s</span></p>
      </div>
      <div>
        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-2">Process Velocity</p>
        <p className="text-xl font-bold text-white">124 <span className="text-xs text-slate-500 font-medium tracking-normal">ms</span></p>
      </div>
      <div>
        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-2">Cluster Uptime</p>
        <p className="text-xl font-bold text-blue-400">99.9% <span className="text-xs text-slate-500 font-medium tracking-normal">SLAS</span></p>
      </div>
    </div>
  </Card>
);
