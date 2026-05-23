import React, { useState } from 'react';
import { 
  Eye, 
  Shield, 
  Users, 
  ShoppingCart, 
  RefreshCcw, 
  Database,
  Cpu,
  Layers,
  Sparkles,
  Command,
  Building
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Role } from '../../types';
import { cn } from '../../utils/cn';

export const VisionSwitcher = () => {
  const { role, setVision, isSimulated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const visionOptions: { 
    role: Role; 
    label: string; 
    sub: string;
    metrics: string;
    icon: any; 
    color: string; 
    badge: string; 
  }[] = [
    { 
      role: 'SUPER_OWNER', 
      label: 'Platform Root (Super)', 
      sub: 'Sovereign root managing overall regional instances, licenses, and core billing configs.',
      metrics: 'PERMISSIONS: SUPER_ROOT',
      icon: Command, 
      color: 'text-red-400 bg-red-400/5 border-red-500/20',
      badge: 'SUPER' 
    },
    { 
      role: 'TENANT_OWNER', 
      label: 'Tenant Owner', 
      sub: 'Enterprise workspace owner managing general store configuration, billing, integrations & brand properties.',
      metrics: 'PERMISSIONS: ALL_ACCESS',
      icon: Shield, 
      color: 'text-purple-400 bg-purple-400/5 border-purple-500/20',
      badge: 'OWNER' 
    },
    { 
      role: 'ADMIN', 
      label: 'Tenant Admin', 
      sub: 'Administrative agent managing resellers, catalogs, markups, and handling support flow tickets.',
      metrics: 'PERMISSIONS: ADMIN',
      icon: Building, 
      color: 'text-emerald-400 bg-emerald-400/5 border-emerald-500/20',
      badge: 'ADMIN' 
    },
    { 
      role: 'RESELLER', 
      label: 'Merchant Reseller', 
      sub: 'Distributor who registers on tenant storefront, loads balance, fulfills bulk checkouts & views orders.',
      metrics: 'PERMISSIONS: MERCHANTS',
      icon: Users, 
      color: 'text-blue-400 bg-blue-400/5 border-blue-500/20',
      badge: 'RESELLER' 
    },
    { 
      role: 'MEMBER', 
      label: 'Team Member', 
      sub: 'Assigned operator with streamlined console access to products catalog and user support queries.',
      metrics: 'PERMISSIONS: OPERATOR',
      icon: Users, 
      color: 'text-amber-400 bg-amber-400/5 border-amber-500/20',
      badge: 'MEMBER' 
    },
    { 
      role: 'CUSTOMER', 
      label: 'Regional Guest', 
      sub: 'Browses general marketplace storefront, reviews ping maps & samples basic catalogs.',
      metrics: 'PERMISSIONS: READ_ONLY',
      icon: ShoppingCart, 
      color: 'text-slate-400 bg-slate-400/5 border-slate-500/10',
      badge: 'PUBLIC' 
    },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-[9999] font-sans selection:bg-blue-500/30">
      {isOpen && (
        <div className="absolute bottom-16 right-0 mb-2 w-[420px] max-w-[calc(90vw-2rem)] bg-[#04060b] border border-white/10 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.8)] overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          
          {/* Header */}
          <div className="p-4 border-b border-white/[0.04] bg-[#080d16]/80 backdrop-blur-md flex items-center justify-between">
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
                <Command className="w-3.5 h-3.5 text-blue-400" />
                Ecosystem Perspective Simulator
              </h4>
              <p className="text-[10px] text-slate-400 font-mono">Select a deployment hierarchy to test role structures.</p>
            </div>
            
            <span className="text-[9px] font-bold font-mono tracking-wide px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400">
              EXPLORER ACTIVE
            </span>
          </div>
          
          {/* Simulation Content Node List */}
          <div className="p-3 space-y-2 max-h-[460px] overflow-y-auto">
            {visionOptions.map((opt) => {
              const isSelected = role === opt.role;
              return (
                <button
                  key={opt.role}
                  onClick={() => {
                    setVision(opt.role);
                    setIsOpen(false);
                    // Standard action to flush states
                    window.location.href = '/';
                  }}
                  className={cn(
                    "w-full text-left p-3.5 rounded-xl transition-all border block relative group overflow-hidden",
                    isSelected 
                      ? "bg-blue-600/5 border-blue-500/30 shadow-[inner]" 
                      : "bg-[#06080d] border-white/[0.03] hover:border-white/[0.08] hover:bg-slate-900/60"
                  )}
                >
                  {/* Selected Indicator Glow Stem */}
                  {isSelected && (
                    <div className="absolute top-0 bottom-0 left-0 w-[3px] bg-blue-500" />
                  )}

                  <div className="flex items-start gap-3.5">
                    {/* Icon Container */}
                    <div className={cn(
                      "p-2 rounded-lg border shrink-0 transition-transform group-hover:scale-105", 
                      opt.color
                    )}>
                      <opt.icon className="w-4 h-4" />
                    </div>

                    {/* Descriptors */}
                    <div className="space-y-1 flex-1 leading-tight">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-white tracking-tight">{opt.label}</span>
                        <span className="text-[8px] font-mono font-bold uppercase px-1.5 py-0.2 rounded bg-white/5 border border-white/10 text-slate-400">
                          {opt.badge}
                        </span>
                      </div>
                      
                      <p className="text-[10px] text-slate-400 leading-normal font-sans">
                        {opt.sub}
                      </p>

                      <div className="pt-1.5 flex items-center justify-between text-[8px] font-mono tracking-tight text-slate-500">
                        <span>{opt.metrics}</span>
                        {isSelected && (
                          <span className="text-blue-400 flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5" /> ACTIVE CO-OPERATING
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Reset Action Area */}
          <div className="p-3 border-t border-white/[0.04] bg-[#020305]/50 flex gap-2">
            <button
              onClick={() => {
                setVision(null);
                setIsOpen(false);
                window.location.href = '/';
              }}
              className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl hover:bg-red-500/10 text-red-400 transition-all border border-transparent hover:border-red-500/20 text-xs font-bold tracking-widest uppercase font-mono"
            >
              <RefreshCcw className="w-3.5 h-3.5" />
              RESTORE ACCOUNT ROLE
            </button>
          </div>
        </div>
      )}

      {/* Main Switcher Toggle Badge */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "h-12 flex items-center gap-3 px-5 rounded-full shadow-[0_6px_28px_rgba(0,0,0,0.6)] hover:shadow-[0_8px_32px_rgba(59,130,246,0.15)] transition-all duration-300 border font-mono",
          isSimulated 
            ? "bg-blue-600/90 border-blue-500 text-white animate-pulse" 
            : "bg-slate-950 border-white/10 text-slate-400 hover:text-white hover:border-white/20"
        )}
      >
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] hidden sm:block">
          {isSimulated ? `SIMULATING: [${role}]` : "SIMULATE PERCEPTIONS"}
        </span>
        <Eye className={cn("w-4 h-4", isOpen && "rotate-180 transition-transform")} />
      </button>
    </div>
  );
};
