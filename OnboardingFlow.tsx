import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, 
  Upload, 
  Palette, 
  Package, 
  Rocket, 
  ChevronRight, 
  Globe,
  Plus,
  Trash2,
  Loader2
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAuth } from '../../contexts/AuthContext';
import { tenantService } from '../../services/system/tenantService';
import { useNavigate } from 'react-router-dom';
import { PLATFORM_BRANDING } from '../../config/branding';

const steps = [
  { id: 'brand', title: 'Identity', icon: Palette },
  { id: 'inventory', title: 'Inventory', icon: Package },
  { id: 'launch', title: 'Launch', icon: Rocket }
];

export const OnboardingFlow = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isInitializing, setIsInitializing] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    logo: '',
    color: '#6366f1',
    syncDigiflazz: true
  });

  // Redirect if already onboarded
  React.useEffect(() => {
    if (profile?.agencyId) {
      navigate('/');
    }
  }, [profile, navigate]);

  const nextStep = () => {
    if (currentStep === steps.length - 1) {
      handleLaunch();
    } else {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    }
  };

  const handleLaunch = async () => {
    if (!user) return;
    setIsInitializing(true);
    try {
      setErrorDetails(null);
      await tenantService.createAgency({
        ownerUid: user.uid,
        name: formData.name || 'Nexus_Node',
        slug: (formData.name || 'nexus').toLowerCase().replace(/ /g, '_'),
        primaryColor: formData.color
      });
      
      navigate('/');
    } catch (error: any) {
      console.error('Launch failed:', error);
      setErrorDetails(error.message || 'Node established failed. Check connection.');
      setIsInitializing(false);
    }
  };
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 0));

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center py-20 px-6 font-sans selection:bg-blue-500/30">
      <div className="w-full max-w-xl mb-12 flex items-center justify-between">
        <div className="flex flex-col">
          <h1 className="text-2xl font-display font-bold text-white tracking-tight">Activate Platform</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">Configure your distribution infrastructure node</p>
        </div>
        <div className="flex gap-2">
          {steps.map((_, idx) => (
            <div 
              key={idx} 
              className={cn(
                "h-1.5 w-10 rounded-full transition-all duration-500",
                currentStep >= idx ? "bg-blue-600" : "bg-slate-800"
              )} 
            />
          ))}
        </div>
      </div>

      <div className="w-full max-w-xl bg-slate-950 shadow-2xl border border-white/[0.04] backdrop-blur-xl rounded-[2.5rem] overflow-hidden relative">
        <div className="p-10 sm:p-14">
          <AnimatePresence mode="wait">
            {currentStep === 0 && (
              <motion.div
                key="step-brand"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-10"
              >
                <div className="space-y-3">
                  <span className="section-label">01 — Core Identity</span>
                  <h2 className="text-3xl font-display font-bold text-white tracking-tight">Organization Branding</h2>
                  <p className="text-sm text-slate-400 font-medium">Define your administrative identity and visual parameters.</p>
                </div>

                <div className="space-y-6 pt-4">
                  {errorDetails && currentStep === 0 && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-500 font-medium text-center">
                      {errorDetails}
                    </div>
                  )}
                  <div className="space-y-2">
                    <label className="section-label px-1">Organization Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Nexus Multi-Link"
                      className="enterprise-input h-14"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-8 pt-4">
                    <div className="space-y-3">
                      <label className="section-label px-1">Primary Brand Color</label>
                      <div className="flex flex-wrap gap-2.5 pt-1">
                        {['#3b82f6', '#10b981', '#6366f1', '#f97316', '#ef4444', '#8b5cf6'].map(color => (
                          <button
                            key={color}
                            onClick={() => setFormData({...formData, color})}
                            className={cn(
                              "w-7 h-7 rounded-lg transition-all ring-offset-slate-900 ring-offset-2",
                              formData.color === color && "ring-2 ring-white scale-110 shadow-lg shadow-blue-500/20"
                            )}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="section-label px-1">Brand Asset (Logo)</label>
                      <button className="w-full h-24 rounded-2xl bg-slate-900 border-2 border-dashed border-white/[0.04] flex flex-col items-center justify-center gap-2 text-slate-500 hover:border-blue-500/40 hover:text-blue-500 transition-all group">
                        <Upload className="w-4 h-4 group-hover:-translate-y-1 transition-transform" />
                        <span className="text-xs font-bold tracking-tight leading-none">Upload Asset</span>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 1 && (
              <motion.div
                key="step-inventory"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-10"
              >
                <div className="space-y-3">
                  <span className="section-label">02 — Infrastructure</span>
                  <h2 className="text-3xl font-display font-bold text-white tracking-tight">Supply Configuration</h2>
                  <p className="text-sm text-slate-400 font-medium">Link your infrastructure to active resource distribution hubs.</p>
                </div>

                <div className="premium-card p-8 bg-slate-900/40 border-none shadow-2xl flex items-center justify-between gap-6 relative z-10">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-blue-600/10 rounded-2xl border border-blue-500/20 flex items-center justify-center">
                      <Package className="w-8 h-8 text-blue-500" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white uppercase tracking-[0.1em]">Global Asset Registry</h3>
                      <p className="text-xs text-slate-500 font-bold mt-1 tracking-tight">Connect 1.2k+ verified resources</p>
                    </div>
                  </div>
                  <div 
                    className={cn(
                      "w-12 h-6 rounded-full p-1 cursor-pointer transition-all duration-300",
                      formData.syncDigiflazz ? "bg-blue-600" : "bg-slate-800"
                    )}
                    onClick={() => setFormData({...formData, syncDigiflazz: !formData.syncDigiflazz})}
                  >
                    <div className={cn(
                      "w-4 h-4 rounded-full bg-slate-950 transition-all transform duration-300 shadow-lg",
                      formData.syncDigiflazz ? "translate-x-6" : "translate-x-0"
                    )} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 pt-4">
                  <div className="p-6 bg-slate-900/50 rounded-2xl border border-white/[0.04]">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-[10px] font-bold text-orange-400">NX</div>
                      <span className="text-xs font-bold text-white uppercase tracking-[0.1em]">Nexus Hub L1</span>
                    </div>
                    <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                       <div className="h-full bg-orange-500/50 w-full animate-pulse" />
                    </div>
                    <span className="text-[10px] text-orange-400 font-bold uppercase tracking-wider mt-3 block">Connected via Bridge</span>
                  </div>
                  <div className="p-6 bg-slate-900/50 rounded-2xl border border-white/[0.04] opacity-70">
                    <div className="flex items-center gap-3 mb-4">
                       <div className="w-8 h-8 rounded-lg bg-slate-800 border border-white/[0.08] flex items-center justify-center text-[10px] font-bold text-slate-400">AL</div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-[0.1em]">Regional Node</span>
                    </div>
                    <div className="h-1 w-full bg-slate-900 rounded-full" />
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mt-3 block">Awaiting Authorization</span>
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                key="step-launch"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-12 text-center"
              >
                <div className="w-24 h-24 bg-blue-600 rounded-[2.5rem] shadow-2xl shadow-blue-900/40 flex items-center justify-center mx-auto relative mb-6">
                   <div className="absolute inset-x-0 -bottom-4 h-12 bg-blue-600/20 blur-2xl rounded-full" />
                   <div className="absolute inset-0 bg-slate-950/20 rounded-[2.5rem] animate-ping opacity-10" />
                  <Rocket className="w-10 h-10 text-white" />
                </div>
                
                <div className="space-y-3">
                  <h2 className="text-4xl font-display font-bold text-white tracking-tight">Provisioning Ready</h2>
                  <p className="text-sm text-slate-400 max-w-sm mx-auto font-medium">Your dedicated infrastructure shard is allocated and ready for final deployment.</p>
                </div>

                <div className="p-8 bg-slate-900/40 border border-white/[0.04] rounded-3xl text-left relative overflow-hidden shadow-Inner">
                  <div className="space-y-6">
                    {errorDetails && (
                      <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-500 font-bold text-center">
                        {errorDetails}
                      </div>
                    )}
                    <div>
                      <span className="section-label block mb-3">Allocated Gateway Domain</span>
                      <div className="flex items-center gap-3 px-5 py-4 bg-blue-600/5 border border-blue-500/10 rounded-2xl">
                         <Globe className="w-4 h-4 text-blue-500" />
                         <span className="text-sm font-bold text-white tracking-tight">{(formData.name || 'portal').toLowerCase().replace(/ /g, '-')}.nexusinfra.net</span>
                      </div>
                    </div>
                    <div className="h-px bg-slate-950/[0.03]" />
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="section-label block mb-1">Architecture Standard</span>
                        <span className="text-xs font-bold text-white tracking-tight">Multi-Tenant v4.2</span>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                         <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                         <span className="text-xs font-bold text-emerald-500 tracking-tight">Encrypted</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="px-10 py-10 bg-slate-900/20 border-t border-white/[0.04] flex items-center gap-6">
          <button 
            disabled={currentStep === 0 || isInitializing}
            onClick={prevStep}
            className="px-6 py-4 text-sm font-bold text-slate-500 hover:text-white transition-colors disabled:opacity-0 active:scale-95"
          >
            Go Back
          </button>
          <button 
            onClick={() => {
              if (currentStep === 0 && !formData.name) {
                setErrorDetails("Organization identity verification required.");
                return;
              }
              nextStep();
            }}
            disabled={isInitializing}
            className={cn(
              "flex-1 btn-premium py-5 text-sm tracking-[0.1em]",
              currentStep === 2 ? "bg-blue-600 hover:bg-blue-500 shadow-2xl shadow-blue-900/40" : ""
            )}
          >
            {isInitializing ? (
              <div className="flex items-center justify-center gap-3">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="uppercase font-semibold text-xs">Initializing Architecture...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <span className="uppercase font-semibold text-xs">{currentStep === 2 ? 'Launch Infrastructure' : 'Continue Step'}</span>
                <ChevronRight className="w-4 h-4 ml-1" />
              </div>
            )}
          </button>
        </div>
      </div>


      <div className="mt-12 flex items-center gap-4 opacity-50">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Powered by {PLATFORM_BRANDING.companyName} Infrastructure</span>
      </div>
    </div>
  );
};
