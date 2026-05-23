import React from 'react';
import { Users, ChevronRight } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { SectionHeader } from '../../components/ui/SectionHeader';

export const UserRoles = () => (
  <Card className="flex-1">
    <SectionHeader title="02. TENANCE STRUCTURE" icon={Users} />
    <div className="space-y-2">
      {[
        { role: 'SUPPLIER', desc: 'Liquidity Bridge (REST/gRPC)' },
        { role: 'AGENCY', desc: 'White-Label Instance Owner' },
        { role: 'RESELLER', desc: 'Sub-Agent Network' },
        { role: 'CLIENT', desc: 'Target Consumption Endpoint' }
      ].map((u, i) => (
        <div key={i} className="flex items-center justify-between p-2 rounded bg-slate-800/20 border border-white/[0.04]">
          <span className="text-xs font-semibold text-slate-200 tracking-tight">{u.role}</span>
          <ChevronRight className="w-3 h-3 text-slate-400 italic" />
        </div>
      ))}
    </div>
  </Card>
);
