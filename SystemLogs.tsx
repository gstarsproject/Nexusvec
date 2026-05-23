import React from 'react';
import { Activity } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { SectionHeader } from '../../components/ui/SectionHeader';

export const SystemLogs = () => (
  <Card className="flex-1 bg-slate-900/40">
    <SectionHeader title="REALTIME_SYSTEM_LOGS" icon={Activity} colorClass="text-slate-500" />
    <div className="space-y-2 font-mono text-xs">
      <div className="flex gap-2 text-emerald-500/80">
        <span>[14:22:02]</span>
        <span className="font-bold">THEME_INT:</span>
        <span className="text-slate-400">Primary color injected to CDN cache</span>
      </div>
      <div className="flex gap-2 text-blue-500/80">
        <span>[12:41:15]</span>
        <span className="font-bold">TENANT_HIT:</span>
        <span className="text-slate-400">Routed 'store.game.id' via Edge_Node_04</span>
      </div>
    </div>
  </Card>
);
