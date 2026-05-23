import React from 'react';
import { Cpu } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { SectionHeader } from '../../components/ui/SectionHeader';

export const TechStack = () => (
  <Card className="min-h-[150px]">
    <SectionHeader title="03. CORE_TECH_STACK" icon={Cpu} colorClass="text-purple-400" />
    <div className="space-y-3 font-mono">
      <div className="flex justify-between items-end border-b border-white/[0.04] pb-2">
        <span className="text-xs text-slate-500 uppercase">Engine</span>
        <span className="text-xs text-white">Node.js / Express</span>
      </div>
      <div className="flex justify-between items-end border-b border-white/[0.04] pb-2">
        <span className="text-xs text-slate-500 uppercase">Storage</span>
        <span className="text-xs text-white">PostgreSQL</span>
      </div>
      <div className="flex justify-between items-end border-b border-white/[0.04] pb-2">
        <span className="text-xs text-slate-500 uppercase">Bus</span>
        <span className="text-xs text-white">Redis Pub/Sub</span>
      </div>
    </div>
  </Card>
);
