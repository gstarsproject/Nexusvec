import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { SectionHeader } from '../../components/ui/SectionHeader';

export const SecurityLog = () => (
  <Card className="border-white/[0.04] bg-slate-900/40">
    <SectionHeader title="16. SECURITY_AUDIT_TRAIL" icon={ShieldCheck} colorClass="text-amber-500" />
    <div className="space-y-2">
      {[
        { action: 'API_KEY_ROTATED', user: 'admin_sys', time: '14:20:01', status: 'VERIFIED' },
        { action: 'THEME_OVERRIDE', user: 'agency_04', time: '14:15:22', status: 'APPLIED' },
        { action: 'THRESHOLD_CHANGE', user: 'risk_mgr', time: '13:45:10', status: 'LOGGED' }
      ].map((log, i) => (
        <div key={i} className="flex items-center justify-between p-1.5 border-l-2 border-amber-500 bg-slate-900/50 rounded-r">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-slate-200">{log.action}</span>
            <span className="text-[7px] text-slate-400 font-mono italic">{log.user} @ {log.time}</span>
          </div>
          <div className="px-1 py-0.5 rounded bg-amber-500/10 text-amber-500 text-[6px] font-semibold tracking-wider">
            {log.status}
          </div>
        </div>
      ))}
    </div>
  </Card>
);
