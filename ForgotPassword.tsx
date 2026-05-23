import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Zap, Mail, ArrowLeft, RefreshCw } from 'lucide-react';
import { authService } from '../../services/authService';
import { cn } from '../../utils/cn';
import { motion } from 'motion/react';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setMessage(null);
    try {
      await authService.resetPassword(email);
      setMessage('Recovery protocol initiated. Check your inbox.');
    } catch (err: any) {
      setError(err.message || 'Failed to send recovery email');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-500 rounded-full blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl relative">
          <Link to="/login" className="absolute top-6 left-6 text-slate-500 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>

          <div className="flex flex-col items-center mb-8 pt-4">
            <div className="w-12 h-12 bg-amber-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(217,119,6,0.4)] mb-4">
              <RefreshCw className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-semibold text-white tracking-wider uppercase text-center leading-tight">Access_Recovery</h1>
            <p className="text-xs text-slate-500 font-mono uppercase tracking-[0.3em] mt-1">NEXUS Security Protocol</p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded text-xs text-red-400 font-mono">
              {error}
            </div>
          )}

          {message && (
            <div className="mb-6 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded text-xs text-emerald-400 font-mono">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs text-slate-500 font-semibold tracking-tight pl-1">Target_Email_Identify</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-white/[0.04] rounded-lg px-10 py-3 text-xs text-white outline-none focus:border-amber-500 transition-all font-mono"
                  placeholder="admin@nexuscore.io"
                  required
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading || !!message}
              className={cn(
                "w-full py-3.5 rounded-lg text-xs font-semibold uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2",
                (isLoading || !!message)
                  ? "bg-slate-800 text-slate-500 cursor-not-allowed" 
                  : "bg-amber-600 hover:bg-amber-500 text-white shadow-[0_0_20px_rgba(217,119,6,0.2)] active:scale-[0.98]"
              )}
            >
              <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
              {isLoading ? 'Decrypting...' : message ? 'Packet_Dispatched' : 'Request_Key_Rotation'}
            </button>
          </form>

          <div className="mt-8 text-center text-xs text-slate-500 font-mono">
            Remembered Protocol? {' '}
            <Link to="/login" className="text-amber-400 font-semibold hover:text-amber-300 transition-colors uppercase italic font-sans tracking-tighter">
              Login_Console
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
