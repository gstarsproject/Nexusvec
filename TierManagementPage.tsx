import React from 'react';
import { ResellerTierModule } from '../modules/resellers/ResellerTierModule';

export const TierManagementPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-widest font-mono">
        <span>Administration / Partner Network / Tiers</span>
      </div>
      <ResellerTierModule />
    </div>
  );
};
