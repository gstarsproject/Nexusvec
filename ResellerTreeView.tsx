import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, ChevronDown, User, Users, ShieldCheck, ShieldAlert, Award, ChevronRight as ChevronRightIcon } from 'lucide-react';
import { Reseller, ResellerTier } from '../../types/index';
import { cn } from '../../utils/cn';

interface ResellerNodeProps {
  reseller: Reseller;
  resellers: Reseller[];
  tiers: ResellerTier[];
  level: number;
}

const ResellerNode: React.FC<ResellerNodeProps> = ({ reseller, resellers, tiers, level }) => {
  const [isExpanded, setIsExpanded] = useState(level < 1);
  const children = resellers.filter(r => r.parentId === reseller.id);
  const hasChildren = children.length > 0;
  
  const currentTier = tiers.find(t => t.id === reseller.tierId);
  
  return (
    <div className="w-full">
      <div 
        className={cn(
          "flex items-center gap-3 p-3 rounded-xl border border-transparent transition-all group hover:bg-slate-900 relative",
        )}
      >
        {/* Indentation lines */}
        {level > 0 && Array.from({ length: level }).map((_, i) => (
          <div 
            key={i} 
            className="absolute top-0 bottom-0 border-l border-white/[0.04]"
            style={{ left: `${(i * 32) + 24}px` }}
          />
        ))}

        {/* Padding for indent */}
        <div style={{ width: `${level * 32}px` }} className="shrink-0" />

        {/* Expand/Collapse Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            "w-6 h-6 flex items-center justify-center rounded-lg transition-colors shrink-0",
            hasChildren ? "hover:bg-white/[0.04] text-slate-500 cursor-pointer" : "text-slate-400 cursor-default opacity-50"
          )}
          disabled={!hasChildren}
        >
          {hasChildren ? (
            isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
          ) : (
            <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
          )}
        </button>

        {/* Node Content */}
        <div className="flex-grow flex items-center justify-between gap-4 bg-slate-950 border border-white/[0.04] rounded-xl p-3 shadow-sm group-hover:border-blue-200 transition-colors">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
              reseller.status === 'ACTIVE' ? "bg-blue-500/10 text-blue-400" : "bg-slate-800 text-slate-500"
            )}>
              {hasChildren ? <Users className="w-4 h-4" /> : <User className="w-4 h-4" />}
            </div>
            
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white text-sm tracking-tight">{reseller.name}</span>
                {reseller.status === 'ACTIVE' ? (
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <ShieldAlert className="w-3.5 h-3.5 text-red-500" />
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                <span className="font-mono">{reseller.id.slice(0, 8)}</span>
                {currentTier && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1 font-medium" style={{ color: currentTier.color }}>
                      <Award className="w-3 h-3" />
                      {currentTier.name}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right hidden sm:block">
              <div className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-0.5">Balance</div>
              <div className="text-sm font-semibold text-white">${reseller.balance.toLocaleString()}</div>
            </div>
            {hasChildren && (
              <div className="bg-slate-900 border border-white/[0.04] px-2 py-1 rounded-md text-xs font-medium text-slate-400 flex items-center gap-1">
                <Users className="w-3 h-3" />
                {children.length}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Children Nodes */}
      <AnimatePresence>
        {isExpanded && hasChildren && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {children.map(child => (
              <ResellerNode 
                key={child.id} 
                reseller={child} 
                resellers={resellers} 
                tiers={tiers}
                level={level + 1} 
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const ResellerTreeView: React.FC<{ resellers: Reseller[], tiers: ResellerTier[] }> = ({ resellers, tiers }) => {
  // Find root resellers (those without a parentId)
  const rootResellers = resellers.filter(r => !r.parentId);

  if (rootResellers.length === 0) {
    return (
      <div className="bg-slate-950 border border-white/[0.04] rounded-2xl p-12 text-center shadow-sm">
        <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
        <h3 className="text-white font-semibold tracking-tight mb-1 text-sm">No Network Found</h3>
        <p className="text-sm text-slate-500">The reseller network is currently empty.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-950 border border-white/[0.04] rounded-2xl p-1 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-white/[0.04] flex items-center justify-between bg-slate-900/50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-500/10 text-blue-400 rounded-lg flex items-center justify-center border border-blue-500/20">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Network Map</h3>
            <p className="text-xs text-slate-500">Visual hierarchy of all partner relationships</p>
          </div>
        </div>
        <div className="text-sm font-medium text-slate-400 bg-slate-950 border border-white/[0.04] px-3 py-1.5 rounded-lg shadow-sm">
          {resellers.length} Total Partners
        </div>
      </div>
      <div className="py-2">
        {rootResellers.map(reseller => (
          <ResellerNode 
            key={reseller.id} 
            reseller={reseller} 
            resellers={resellers} 
            tiers={tiers}
            level={0} 
          />
        ))}
      </div>
    </div>
  );
};

