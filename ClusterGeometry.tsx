import React from 'react';
import { Layers } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { SectionHeader } from '../../components/ui/SectionHeader';

export const ClusterGeometry = () => (
  <Card className="border-white/[0.04] bg-slate-950/10">
    <SectionHeader title="22. CLUSTER_GEOMETRY_v4" icon={Layers} colorClass="text-slate-400" />
    <div className="relative h-24 flex items-center justify-center">
       <div className="relative w-16 h-16">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-emerald-500 rounded shadow-[0_0_15px_#10b981]" />
          <div className="absolute bottom-0 left-0 w-4 h-4 bg-emerald-500 rounded" />
          <div className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 rounded" />
          <div className="absolute top-1/2 left-0 -translate-y-1/2 w-4 h-4 bg-emerald-500 rounded animate-pulse" />
          <div className="absolute top-1/2 right-0 -translate-y-1/2 w-4 h-4 bg-red-500/50 rounded border border-red-500/50" />
          
          <svg className="absolute inset-0 w-full h-full -z-10 opacity-20" viewBox="0 0 100 100">
            <line x1="50" y1="10" x2="10" y2="90" stroke="white" strokeWidth="1" />
            <line x1="50" y1="10" x2="90" y2="90" stroke="white" strokeWidth="1" />
            <line x1="10" y1="90" x2="90" y2="90" stroke="white" strokeWidth="1" />
            <line x1="50" y1="10" x2="10" y2="50" stroke="white" strokeWidth="1" />
            <line x1="50" y1="10" x2="90" y2="50" stroke="white" strokeWidth="1" />
          </svg>
       </div>
       <div className="absolute top-2 right-2 text-right">
          <p className="text-[7px] text-emerald-500 font-semibold uppercase">SYNC_OK</p>
          <p className="text-[6px] text-slate-400 font-mono">12/13 Nodes Up</p>
       </div>
    </div>
  </Card>
);
