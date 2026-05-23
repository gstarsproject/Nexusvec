import React from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { motion } from 'motion/react';
import { Activity, TrendingUp } from 'lucide-react';

const data = [
  { time: '00:00', volume: 45000 },
  { time: '04:00', volume: 32000 },
  { time: '08:00', volume: 68000 },
  { time: '12:00', volume: 94000 },
  { time: '16:00', volume: 125000 },
  { time: '20:00', volume: 110000 },
  { time: '23:59', volume: 98000 },
];

export const LiquidityChart = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="saas-card p-6 col-span-1 md:col-span-2 lg:col-span-3 bg-slate-950 border-white/[0.04]"
    >
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-[0.2em] mb-1">Liquidity_Flow</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-white tracking-tighter">1,402,842.12</span>
            <span className="text-xs text-emerald-500 font-bold tracking-tight">+12.4% Est.</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-1 bg-slate-950/5 rounded-md text-xs font-semibold text-slate-400 tracking-tight border border-white/[0.04]">24 Hours</button>
          <button className="px-3 py-1 text-xs font-semibold text-slate-400 tracking-tight">7 Days</button>
        </div>
      </div>

      <div className="h-[240px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis 
              dataKey="time" 
              stroke="#475569" 
              fontSize={9} 
              axisLine={false} 
              tickLine={false}
              dy={10}
            />
            <YAxis 
              stroke="#475569" 
              fontSize={9} 
              axisLine={false} 
              tickLine={false}
              tickFormatter={(value) => `$${value/1000}k`}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#0f172a', 
                border: '1px solid #1e293b', 
                borderRadius: '8px',
                fontSize: '10px',
                fontWeight: 'bold',
                fontFamily: 'monospace'
              }}
              itemStyle={{ color: '#fff' }}
            />
            <Area 
              type="monotone" 
              dataKey="volume" 
              stroke="#3b82f6" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorVolume)" 
              animationDuration={2000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 pt-6 border-t border-white/[0.04] grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Avg_Response', value: '142ms', color: 'text-blue-500' },
          { label: 'Success_Rate', value: '99.98%', color: 'text-emerald-500' },
          { label: 'Wait_Queue', value: '0 items', color: 'text-slate-400' },
          { label: 'Infrastructure', value: 'Optimized', color: 'text-orange-500' },
        ].map((stat, i) => (
          <div key={i}>
            <p className="text-xs text-slate-400 font-bold tracking-tight mb-1">{stat.label}</p>
            <p className={cn("text-xs font-semibold tracking-wider font-mono", stat.color)}>{stat.value}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');
