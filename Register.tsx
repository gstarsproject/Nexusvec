import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, UserPlus, Shield, Globe } from 'lucide-react';
import { authService } from '../../services/authService';
import { cn } from '../../utils/cn';
import { motion } from 'motion/react';
import { Role } from '../../types/index';
import { useTenant } from '../../contexts/TenantContext';

import { Logo } from '../../components/common/Logo';

export const Register = () => {
  const { tenant } = useTenant();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>(tenant ? 'RESELLER' : 'TENANT_OWNER');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await authService.register(email, password, tenant?.id, role);
      window.location.href = '/';
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
        <div 
          className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full blur-[120px]" 
          style={{ backgroundColor: tenant?.theme?.primary || '#10b981' }}
        />
        <div 
          className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full blur-[120px]" 
          style={{ backgroundColor: tenant?.theme?.secondary || '#3b82f6' }}
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl relative">
          <div className="flex flex-col items-center mb-8">
            <Logo variant="auth" />
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded text-xs text-red-400 font-mono flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-lg px-10 py-2.5 text-sm text-white outline-none focus:border-emerald-500 transition-all font-sans"
                  placeholder="name@company.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-lg px-10 py-2.5 text-sm text-white outline-none focus:border-emerald-500 transition-all font-sans"
                  placeholder="••••••••••••"
                  required
                />
              </div>
            </div>

            {!tenant && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300">Account Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['TENANT_OWNER', 'RESELLER'] as Role[]).map((r) => (
                    <button 
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={cn(
                        "py-2 text-sm font-medium rounded-lg border transition-all capitalize",
                        role === r 
                          ? "bg-emerald-600 border-emerald-500 text-white" 
                          : "bg-slate-900 border-white/10 text-slate-400 hover:text-white hover:border-white/20"
                      )}
                    >
                      {r.toLowerCase()}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button 
              type="submit"
              disabled={isLoading}
              className={cn(
                "w-full py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 mt-4",
                isLoading 
                  ? "bg-slate-800 text-slate-500 cursor-not-allowed" 
                  : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.15)] active:scale-[0.98]"
              )}
            >
              {isLoading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-slate-400">
            Already have an account? {' '}
            <Link to="/login" className="text-emerald-400 font-medium hover:text-emerald-300 transition-colors">
              Sign In
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
