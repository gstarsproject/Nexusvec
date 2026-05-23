import React, { useState } from 'react';
import { Sidebar } from '../components/common/Sidebar';
import { Topbar } from '../components/common/Topbar';
import { useAuth } from '../contexts/AuthContext';
import { useTenant } from '../contexts/TenantContext';
import { authService } from '../services/authService';
import { Menu, X, Layers, Bell, LogOut, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { Logo } from '../components/common/Logo';
import { cn } from '../utils/cn';
import { useNavigate, useLocation } from 'react-router-dom';
import { PLATFORM_BRANDING } from '../config/branding';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { tenant } = useTenant();
  const { role, user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      return localStorage.getItem('sidebar-collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const handleToggleCollapse = () => {
    setIsCollapsed(prev => {
      const next = !prev;
      try {
        localStorage.setItem('sidebar-collapsed', String(next));
      } catch (e) {}
      return next;
    });
  };

  const navigate = useNavigate();
  const location = useLocation();

  const isRootPath = location.pathname === '/' || location.pathname === '/dashboard';

  return (
    <div className="h-screen w-full bg-[#020617] flex overflow-hidden font-sans selection:bg-blue-500/30 text-slate-300">
      {/* Desktop & Tablet Sidebar */}
      <div className={cn(
        "hidden md:block h-full transition-all duration-300 shrink-0",
        isCollapsed ? "w-20" : "w-[260px]"
      )}>
        <Sidebar isCollapsed={isCollapsed} onToggleCollapse={handleToggleCollapse} />
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-[#020617]/80 backdrop-blur-sm z-[100] md:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-[260px] bg-[#050505] z-[101] md:hidden shadow-2xl border-r border-white/[0.04]"
            >
              <div className="absolute top-4 right-4 z-50">
                 <button onClick={() => setIsSidebarOpen(false)} className="p-2 bg-white/[0.04] rounded-md text-slate-400 hover:text-white">
                   <X className="w-5 h-5" />
                 </button>
              </div>
              <Sidebar onItemClick={() => setIsSidebarOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        {/* Mobile Unified Sticky Topbar */}
        <div className="flex items-center md:hidden bg-[#020617]/90 backdrop-blur-md border-b border-white/[0.04] px-4 h-16 shrink-0 z-30 justify-between sticky top-0">
           <div className="flex items-center gap-2">
            {!isRootPath ? (
              <button 
                onClick={() => navigate(-1)}
                className="p-2 -ml-2 text-slate-400 hover:text-white transition-colors"
                title="Go Back"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            ) : (
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 -ml-2 text-slate-400 hover:text-white transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
            <div className="font-medium text-white tracking-tight text-sm truncate max-w-[150px]">
              {tenant?.name || PLATFORM_BRANDING.name}
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {role === 'RESELLER' && (
              <span className="hidden sm:inline-flex text-[10px] font-bold font-mono px-2 py-1 bg-primary-brand/10 text-primary-brand border border-primary-brand/20 rounded-md">
                $12.4K
              </span>
            )}
            
            <button className="p-1.5 text-slate-400 hover:text-white rounded-lg relative">
              <Bell className="w-[18px] h-[18px]" />
              <span className="absolute top-1 right-1.5 w-1.5 h-1.5 bg-primary-brand rounded-full border-[1.5px] border-[#020617]" />
            </button>

            <div className="w-7 h-7 rounded-md bg-[#0A0A0B] border border-white/[0.08] flex items-center justify-center overflow-hidden">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-[10px] text-slate-400 font-bold uppercase">{user?.email?.[0] || 'U'}</span>
              )}
            </div>
          </div>
        </div>
        
        {/* Desktop Custom Topbar (Hidden on Mobile) */}
        <div className="hidden md:block shrink-0">
          <Topbar />
        </div>
        
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-[#020617] relative scroll-smooth">
          {/* Subtle background glow effect */}
          <div className="absolute top-0 left-0 right-0 h-[400px] bg-primary-brand/5 blur-[120px] pointer-events-none" />
          
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 space-y-6 md:space-y-8 max-w-7xl relative z-10 pb-[env(safe-area-inset-bottom)]">
            {children}
            {/* Safe area padding */}
            <div className="h-6 md:hidden" />
          </div>
        </main>
      </div>
    </div>
  );
};
