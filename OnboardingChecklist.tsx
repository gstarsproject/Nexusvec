import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  ArrowRight, 
  Rocket, 
  ChevronDown, 
  ChevronUp, 
  Sparkles,
  Link as LinkIcon 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

export const OnboardingChecklist = () => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [steps, setSteps] = useState([
    { id: 'workspace', title: 'Create Workspace', desc: 'Administrative shards established and custom subdomains created.', checked: true, actionPath: '/settings' },
    { id: 'supplier', title: 'Connect Supplier', desc: 'Link resource APIs to active distribution backbones.', checked: false, actionPath: '/suppliers' },
    { id: 'wallet', title: 'Configure Wallet Hub', desc: 'Establish master ledger security parameters and fee commission layers.', checked: false, actionPath: '/wallet' },
    { id: 'billing', title: 'Setup Node Billing', desc: 'Select subscription licenses and organize tenant invoice tables.', checked: false, actionPath: '/transactions' },
    { id: 'catalog', title: 'Activate Catalog', desc: 'Enable, synchronize, and specify markup margins on digital SKUs.', checked: false, actionPath: '/catalog' },
    { id: 'operations', title: 'Launch Live Operations', desc: 'Flag global node endpoints as live for API consumption.', checked: false, actionPath: '/' }
  ]);

  const handleToggleCheck = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSteps(prev => prev.map(step => step.id === id ? { ...step, checked: !step.checked } : step));
  };

  const completedCount = steps.filter(s => s.checked).length;
  const progressPercent = Math.round((completedCount / steps.length) * 100);

  return (
    <div className="bg-slate-950 border border-white/[0.04] rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all">
      {/* Banner / Header */}
      <div 
        onClick={() => setCollapsed(!collapsed)}
        className="p-6 md:p-8 bg-gradient-to-r from-blue-900/10 via-slate-950 to-slate-950 border-b border-white/[0.02] flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer select-none"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Rocket className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-tight">Onboarding & Setup Checklist</h3>
              <span className="px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[9px] font-mono font-bold text-blue-400 uppercase tracking-wider">
                GUIDED SETUP
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium mt-1">Complete these modules to establish a live production digital commerce network.</p>
          </div>
        </div>

        <div className="flex items-center gap-6 self-stretch md:self-auto justify-between md:justify-end">
          <div className="flex flex-col md:items-end gap-1.5 font-mono">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none">PROGRESS</span>
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-white leading-none">{completedCount} / {steps.length} METRIC_UNITS</span>
              <div className="h-2 w-24 bg-slate-900 border border-white/[0.04] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 rounded-full transition-all duration-500" 
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>
          
          <button className="p-2 hover:bg-slate-900 rounded-lg text-slate-500 hover:text-slate-300 transition-colors">
            {collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {!collapsed && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-slate-950/40">
              {steps.map((step, idx) => (
                <div 
                  key={step.id}
                  onClick={() => navigate(step.actionPath)}
                  className={`p-5 bg-slate-900/10 border rounded-2xl flex flex-col justify-between gap-4 transition-all hover:bg-slate-900/30 group cursor-pointer relative overflow-hidden ${
                    step.checked ? 'border-white/[0.02] opacity-75' : 'border-white/[0.05] hover:border-blue-500/30 shadow-sm'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">
                        STEP_0{idx + 1}
                      </span>
                      <button 
                        onClick={(e) => handleToggleCheck(step.id, e)}
                        className={`p-1 rounded-md transition-all ${step.checked ? 'text-emerald-400' : 'text-slate-600 hover:text-slate-400'}`}
                      >
                        {step.checked ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                      </button>
                    </div>

                    <h4 className="text-sm font-bold text-white tracking-tight mt-2.5 block group-hover:text-blue-400 transition-colors">
                      {step.title}
                    </h4>
                    <p className="text-xs text-slate-400 font-medium leading-relaxed mt-1">{step.desc}</p>
                  </div>

                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2 group-hover:text-white transition-colors">
                    <span>Configure Node</span>
                    <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
