import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { 
  Mail, 
  Lock, 
  Chrome, 
  Globe, 
  ShieldAlert, 
  Server, 
  Activity, 
  CheckCircle2, 
  Wifi, 
  Cpu, 
  Layers, 
  LockKeyhole, 
  Compass, 
  Network, 
  Database, 
  Users, 
  LayoutDashboard 
} from 'lucide-react';
import { authService } from '../../services/authService';
import { cn } from '../../utils/cn';
import { motion } from 'motion/react';
import { useTenant } from '../../contexts/TenantContext';
import { Logo } from '../../components/common/Logo';
import { useTranslation } from 'react-i18next';

export const Login = () => {
  const { t } = useTranslation(['auth']);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Dynamic latency fluctuator for absolute immersion
  const [latency, setLatency] = useState(12);
  const [uptime, setUptime] = useState(99.99);

  const { tenant, isLoading: tenantLoading } = useTenant();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    const latencyInterval = setInterval(() => {
      setLatency(prev => {
        const delta = Math.random() > 0.5 ? 1 : -1;
        const next = prev + delta;
        return next >= 8 && next <= 16 ? next : prev;
      });
    }, 3000);

    const uptimeInterval = setInterval(() => {
      setUptime(prev => {
        const delta = (Math.random() * 0.001);
        const next = 99.991 - delta;
        return Number(next.toFixed(3));
      });
    }, 12000);

    return () => {
      clearInterval(latencyInterval);
      clearInterval(uptimeInterval);
    };
  }, []);

  if (tenantLoading) return null;

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await authService.login(email, password, tenant?.id);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await authService.loginWithGoogle(tenant?.id);
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error(err);
      if (err.message && err.message.includes('Pending promise was never set')) {
        setError('Popup was blocked by your browser. Please allow popups for this site OR open the app in a new tab to sign in.');
      } else {
        setError(err.message || 'Google Login failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020305] text-slate-300 font-sans relative flex flex-col justify-center items-center overflow-x-hidden p-4 sm:p-6 lg:p-8">
      
      {/* Premium Subtle Ambient Grid and Lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(15,23,42,0.1)_0%,rgba(2,3,5,1)_95%)] pointer-events-none z-0" />
      <div className="absolute inset-0 cyber-grid opacity-[0.02] pointer-events-none z-0" />
      
      {/* Light topology paths & nodal indicators */}
      <div className="absolute inset-x-0 top-0 h-[500px] pointer-events-none z-0 overflow-hidden opacity-30 select-none">
        {/* Soft blue glow centered to back */}
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[80%] max-w-[900px] h-[350px] bg-blue-500/5 rounded-full blur-[100px]" />
        
        {/* Vector topology vectors */}
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <line x1="10%" y1="15%" x2="40%" y2="55%" stroke="rgba(255,255,255,0.015)" strokeWidth="1" />
          <line x1="40%" y1="55%" x2="60%" y2="10%" stroke="rgba(255,255,255,0.015)" strokeWidth="1" />
          <line x1="60%" y1="10%" x2="90%" y2="80%" stroke="rgba(255,255,255,0.015)" strokeWidth="1" />
          <circle cx="10%" cy="15%" r="2" fill="rgba(59,130,246,0.1)" />
          <circle cx="40%" cy="55%" r="3" fill="rgba(59,130,246,0.15)" className="animate-pulse" />
          <circle cx="60%" cy="10%" r="2" fill="rgba(59,130,246,0.1)" />
          <circle cx="90%" cy="80%" r="3.5" fill="rgba(59,130,246,0.15)" className="animate-pulse" />
        </svg>
      </div>

      {/* Corporate Grid Split Screen */}
      <div className="w-full max-w-6xl bg-[#080a10]/50 border border-white/[0.04] rounded-3xl overflow-hidden shadow-[2xl] backdrop-blur-md relative z-10 grid grid-cols-1 lg:grid-cols-12">
        
        {/* Left Column: Security Authentication Gateway Panel */}
        <div className="lg:col-span-5 p-6 sm:p-8 lg:p-12 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-white/[0.05]">
          <div>
            {/* Header Brand */}
            <div className="flex flex-col items-start mb-8">
              <Logo variant="full" />
            </div>

            {/* Subtext description */}
            <div className="mb-8">
              <h2 className="text-xl font-bold tracking-tight text-white font-display mb-2 border-b border-transparent">
                {t('auth:title')}
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                {t('auth:subtitle')}
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-500/5 border border-red-500/10 rounded-xl text-xs text-red-400 font-mono space-y-1">
                <div className="flex items-center gap-2 font-bold text-red-300">
                  <ShieldAlert className="w-4 h-4 text-red-500 shrink-0" />
                  GATEWAY_AUTH_FAILURE
                </div>
                <p className="pl-6 text-[11px] leading-relaxed text-red-400/90">{error}</p>
              </div>
            )}

            {/* Authentication Form */}
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 font-mono">{t('auth:credentials_header')}</span>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#040508]/60 border border-white/[0.05] rounded-xl px-10 py-3 text-sm text-white placeholder:text-slate-600 outline-none focus:border-blue-500/50 shadow-inner font-mono transition-all"
                    placeholder="admin@nexuscore.io"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 font-mono">{t('auth:passphrase_header')}</span>
                  <Link to="/forgot-password" className="text-[10px] text-blue-400/80 hover:text-blue-300 transition-colors">
                    Passphrase Recovery_
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#040508]/60 border border-white/[0.05] rounded-xl px-10 py-3 text-sm text-white placeholder:text-slate-600 outline-none focus:border-blue-500/50 shadow-inner font-mono transition-all"
                    placeholder="••••••••••••"
                    required
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={isLoading}
                className={cn(
                  "w-full py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2",
                  isLoading 
                    ? "bg-slate-900 text-slate-500 cursor-not-allowed border border-white/5" 
                    : "bg-blue-600 hover:bg-blue-500 text-white shadow-[0_4px_20px_rgba(37,99,235,0.15)] hover:shadow-[0_4px_24px_rgba(37,99,235,0.25)] border border-blue-500 active:scale-[0.98]"
                )}
              >
                {isLoading ? 'Decrypting Session...' : t('auth:sign_in')}
              </button>
            </form>

            <div className="my-6 flex items-center gap-3">
              <div className="h-[1px] flex-1 bg-white/[0.04]" />
              <span className="text-[9px] text-slate-500 font-bold tracking-widest uppercase font-mono">FEDERATED INTEGRATION</span>
              <div className="h-[1px] flex-1 bg-white/[0.04]" />
            </div>

            <button 
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full py-2.5 bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.05] rounded-xl text-xs font-bold uppercase tracking-wide text-slate-300 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              <Chrome className="w-4 h-4 text-blue-400" />
              {t('auth:sign_in_google')}
            </button>
          </div>

          {/* Secure gateway diagnostics metadata */}
          <div className="mt-8 pt-6 border-t border-white/[0.04]">
            <span className="text-[10px] font-mono font-bold tracking-widest text-slate-500 uppercase block mb-3">{t('auth:gateway_status')}</span>
            <div className="grid grid-cols-2 gap-3 text-[10px] font-mono text-slate-400">
              <div className="flex items-center gap-2">
                <Wifi className="w-3.5 h-3.5 text-blue-400" />
                <span>Gateway: <strong className="text-white">{latency}ms</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>{t('auth:status_verified')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                <span>Core Uptime: {uptime}%</span>
              </div>
              <div className="flex items-center gap-2">
                <LockKeyhole className="w-3.5 h-3.5 text-blue-400" />
                <span>AES-256 Recipient</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Premium Multi-Tenant Enterprise Ecosystem / Persona Matrix */}
        <div className="lg:col-span-7 bg-[#04060b]/30 p-6 sm:p-8 lg:p-12 flex flex-col justify-between">
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-mono font-bold text-blue-400 tracking-widest uppercase px-2 py-0.5 rounded bg-blue-500/15 border border-blue-500/20">
                  GLOBAL CO-OPERATOR PROTOCOL
                </span>
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">
                Federated Ecosystem Matrix
              </h3>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                NexusCore operates as an orchestration suite connecting digital supply lines, white-label nodes, downstream distribution channels, and regional reseller groups in absolute unison.
              </p>
            </div>

            {/* Premium Enterprise Card Layout for Persona Matrix */}
            <div className="space-y-3.5">
              {[
                {
                  role: 'OWNER',
                  title: 'Platform Owner (Super Administrator)',
                  desc: 'Controls full ecosystem infrastructure operations, route optimization profiles, global escrow thresholds, and sovereign ledger audits.',
                  badge: 'ROOT AUTHORITY',
                  color: 'border-red-500/25 bg-red-500/5',
                  textStyle: 'text-red-400',
                  dot: 'bg-red-500'
                },
                {
                  role: 'SUPPLIER',
                  title: 'Liquidity Supplier (Direct Provider)',
                  desc: 'Manages bulk digital stockpile inventories, updates wholesale endpoint APIs, checks transactional webhook deliveries, and guarantees bridge SLAs.',
                  badge: 'SUPPLY CHANNELS',
                  color: 'border-yellow-500/25 bg-yellow-500/5',
                  textStyle: 'text-yellow-400',
                  dot: 'bg-yellow-500'
                },
                {
                  role: 'AGENCY',
                  title: 'White-Label Agency (Network Partner)',
                  desc: 'Orchestrates proprietary regional portals on licensed sub-nodes, registers downstream sellers, sets secondary markup rules, and schedules distribution logs.',
                  badge: 'PORTAL LEASING',
                  color: 'border-emerald-500/25 bg-emerald-500/5',
                  textStyle: 'text-emerald-400',
                  dot: 'bg-emerald-500'
                },
                {
                  role: 'RESELLER',
                  title: 'Retail Distributor (Sales Reseller)',
                  desc: 'Executes store catalog checkouts via sub-domain platforms, purchases prepaid core credits, and connects custom checkout webhooks.',
                  badge: 'RETAIL POOLS',
                  color: 'border-blue-500/25 bg-blue-500/5',
                  textStyle: 'text-blue-400',
                  dot: 'bg-blue-500'
                },
                {
                  role: 'CUSTOMER',
                  title: 'Default Guest (End-User Visitor)',
                  desc: 'Browses localized public voucher inventories, validates product checkouts, reviews server pings, and executes checkout webhooks.',
                  badge: 'CONSUMER NODE',
                  color: 'border-slate-500/25 bg-slate-500/5',
                  textStyle: 'text-slate-400',
                  dot: 'bg-slate-400'
                }
              ].map((matrix) => (
                <div 
                  key={matrix.role}
                  className={cn(
                    "p-4 border rounded-xl transition-all hover:bg-slate-900/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-left relative overflow-hidden group"
                  )}
                >
                  <div className="absolute top-0 right-0 h-full w-[2px] opacity-0 group-hover:opacity-100 transition-opacity bg-blue-500" />
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className={cn("w-1.5 h-1.5 rounded-full", matrix.dot)} />
                      <span className="text-xs font-bold text-white font-sans">{matrix.title}</span>
                      <span className="text-[8px] font-mono tracking-tight uppercase px-1.5 py-0.2 rounded bg-white/5 border border-white/10 text-slate-400 ml-1">
                        {matrix.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-normal pl-3">{matrix.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Prompt footer indicating creation constraint */}
          <div className="mt-8 pt-6 border-t border-white/[0.04] flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] text-slate-500 font-mono">
            <span>PLATFORM: NEXUSCORE DIGITAL INSTANCE v4.12_</span>
            <div className="flex items-center gap-1.1">
              <span>Security Tier: </span>
              <span className="text-emerald-400 font-semibold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">ISO-27001 ACTIVE</span>
            </div>
          </div>
        </div>
        
      </div>

      {/* Direct links to register or generic help */}
      <div className="mt-8 text-center text-xs text-slate-500 z-10 font-sans">
        <span>{t('auth:license_prompt')} </span>
        <Link to="/register" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
          {t('auth:register_license')}
        </Link>
      </div>

    </div>
  );
};
