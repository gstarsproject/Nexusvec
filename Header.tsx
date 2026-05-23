import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Zap, 
  Activity, 
  LogOut, 
  User as UserIcon, 
  LayoutDashboard, 
  Database, 
  Users, 
  Box, 
  Package, 
  Settings, 
  LifeBuoy,
  Menu,
  X,
  Shield,
  Languages
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Role } from '../../types/index';
import { cn } from '../../utils/cn';
import { useAuth } from '../../contexts/AuthContext';
import { useTenant } from '../../contexts/TenantContext';
import { authService } from '../../services/authService';
import { LanguageSwitcher } from './LanguageSwitcher';
import { PLATFORM_BRANDING } from '../../config/branding';

import { Logo } from './Logo';

export const Header = () => {
  const { t } = useTranslation();
  const { role, user, isSimulated, setVision, actualRole } = useAuth();
  const { tenant } = useTenant();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const navItems = [
    { label: t('common.dashboard'), path: '/', icon: LayoutDashboard },
    { label: t('common.suppliers'), path: '/suppliers', icon: Database, roles: ['SUPER_OWNER', 'TENANT_OWNER'] },
    { label: t('common.catalog'), path: '/catalog', icon: Package, roles: ['SUPER_OWNER', 'TENANT_OWNER'] },
    { label: t('common.resellers'), path: '/resellers', icon: Users, roles: ['SUPER_OWNER', 'TENANT_OWNER'] },
    { label: t('common.settings'), path: '/settings', icon: Settings, roles: ['SUPER_OWNER', 'TENANT_OWNER', 'RESELLER'] },
    { label: t('common.services'), path: '/services', icon: Box, roles: ['SUPER_OWNER', 'TENANT_OWNER'] },
    { label: t('common.system'), path: '/system', icon: Shield, roles: ['SUPER_OWNER', 'ADMIN'] },
    { label: t('common.support'), path: '/support', icon: LifeBuoy },
  ];

  const primaryColor = tenant?.theme?.primary || '#3b82f6';

  return (
    <>
      {isSimulated && (
        <div className="bg-orange-600 text-white px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.3em] flex items-center justify-center gap-4 animate-pulse">
          <span>{t('dashboard.simulation_active')}: {t('dashboard.acting_as')} {role?.replace('_', ' ')}</span>
          <button 
            onClick={() => {
              setVision(null);
              window.location.href = '/';
            }}
            className="px-3 py-0.5 bg-black/20 hover:bg-black/40 rounded-full border border-white/20 transition-all"
          >
            {t('dashboard.exit_simulation')}
          </button>
        </div>
      )}
      <header className="bg-slate-950 border-b border-white/[0.04] px-4 sm:px-6 py-4 flex justify-between items-center shrink-0 sticky top-0 z-50 overflow-hidden">
        {/* Subtle background glow based on tenant theme */}
        <div 
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ 
            background: `radial-gradient(circle at 0% 0%, ${primaryColor}44, transparent 50%)`
          }}
        />

        <div className="flex items-center gap-4 sm:gap-10 relative z-10">
        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          className="md:hidden p-2 text-slate-500 hover:text-white"
        >
          <Menu className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2">
              <Logo variant="full" className="scale-75 origin-left" />
            </Link>
            <div className="h-4 w-px bg-slate-800 hidden sm:block" />
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-sm font-medium text-slate-300">
                {tenant?.name || PLATFORM_BRANDING.name}
              </span>
              <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-[10px] font-semibold text-emerald-500 tracking-tight uppercase">Live</span>
              </div>
            </div>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="hidden lg:flex items-center flex-1 max-w-md mx-8 group">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Activity className="w-3.5 h-3.5 text-slate-400 group-focus-within:text-primary transition-colors" style={ { '--tw-text-opacity': '1' } as any } />
            </div>
            <input 
              type="text" 
              placeholder="Search platform..." 
              className="w-full bg-slate-900/40 border border-white/5 rounded-full py-1.5 pl-10 pr-12 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-white/10 focus:bg-slate-900/60 transition-all font-sans"
            />
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
              <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-slate-400">
                <span className="text-[10px] font-semibold">⌘</span>
                <span className="text-[10px] font-semibold">K</span>
              </div>
            </div>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            if (item.roles && role && !item.roles.includes(role)) return null;
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold tracking-tight transition-all",
                  isActive 
                    ? "text-white bg-slate-950/5 border border-white/10" 
                    : "text-slate-500 hover:text-white hover:bg-slate-950/5"
                )}
              >
                <Icon className={cn("w-4 h-4", isActive ? "text-primary" : "text-slate-400")} style={isActive ? { color: primaryColor } : {}} />
                {item.label}
              </Link>
            );
          })}
        </nav>


        <div className="flex items-center gap-6 relative z-10">
        <div className="flex items-center gap-4 pr-6 border-r border-white/[0.04] hidden lg:flex">
          <LanguageSwitcher />
        </div>
        <div className="flex items-center gap-4 pr-6 border-r border-white/[0.04] hidden sm:flex">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <UserIcon className="w-4 h-4 text-slate-500" />
                )}
              </div>
              <div className={cn(
                "absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-slate-900",
                role === 'SUPER_OWNER' ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" : 
                role === 'TENANT_OWNER' ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : 
                "bg-primary-brand"
              )} 
              style={role !== 'SUPER_OWNER' && role !== 'TENANT_OWNER' ? { boxShadow: '0 0 8px var(--primary)' } : undefined}
              />
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-white font-semibold truncate max-w-[120px] leading-tight font-mono tracking-tighter">
                {user?.email?.split('@')[0].toUpperCase()}
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className={cn(
                  "flex items-center gap-1 px-1.5 py-0.5 rounded border leading-none transition-all",
                  role === 'SUPER_OWNER' ? "bg-red-500/10 border-red-500/20 text-red-500 shadow-[0_0_10px_rgba(239,68,68,0.1)]" : 
                  role === 'TENANT_OWNER' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.1)]" : 
                  "bg-primary-brand/10 border-primary-brand/20 text-primary-brand"
                )}>
                  {role === 'SUPER_OWNER' && <Shield className="w-2 h-2" />}
                  {role === 'TENANT_OWNER' && <Database className="w-2 h-2" />}
                  {role === 'RESELLER' && <Box className="w-2 h-2" />}
                  <span className="text-[7px] font-semibold tracking-tight">
                    {role?.replace('_', ' ') || 'IDENTIFYING...'}
                  </span>
                </div>
                {tenant && (role === 'RESELLER' || role === 'TENANT_OWNER') && (
                  <div className="flex items-center gap-1 px-1 py-0.5 border border-white/[0.04] bg-slate-950/5 rounded">
                    <Zap className="w-1.5 h-1.5 text-slate-400" />
                    <span className="text-[6px] text-slate-500 uppercase font-mono">
                      {tenant.slug.toUpperCase()}
                    </span>
                  </div>
                )}
                {actualRole && role !== actualRole && (
                  <span className="text-[6px] bg-red-500/20 px-1.5 py-0.5 rounded text-red-500 font-semibold border border-red-500/30 animate-pulse">SIM</span>
                )}
              </div>
            </div>
          </div>
          
          <button 
            onClick={handleLogout}
            className="p-2 hover:bg-slate-950/5 rounded-lg text-slate-500 hover:text-red-500 transition-all group"
            title="Terminate Session"
          >
            <LogOut className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          </button>
        </div>

        <div className="flex gap-8 border-l border-white/[0.04] pl-6">
          <div className="text-right">
            <p className="text-xs text-slate-400 uppercase font-semibold tracking-wider mb-0.5">Session_Latency</p>
            <div className="flex items-center justify-end gap-1.5">
              <span className="text-xs text-slate-400 font-bold font-mono">24ms</span>
              <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
            </div>
          </div>
          <div className="text-right hidden lg:block">
            <p className="text-xs text-slate-400 uppercase font-semibold tracking-wider mb-0.5">Node_Integrity</p>
            <div className="flex items-center justify-end gap-1.5">
              <span className="text-xs text-blue-400 font-bold font-mono">99.9%</span>
              <div className="w-1 h-1 rounded-full bg-blue-500" />
            </div>
          </div>
        </div>
      </div>
      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-950 backdrop-blur-sm z-[100] md:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-72 bg-slate-950 border-r border-white/[0.04] z-[101] md:hidden flex flex-col shadow-2xl"
            >
              <div className="p-6 border-b border-white/[0.04] flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md flex items-center justify-center text-white" style={{ backgroundColor: primaryColor }}>
                    <Zap className="w-3.5 h-3.5 fill-current" />
                  </div>
                  <span className="text-sm font-semibold text-white tracking-wider uppercase">Nexus_Menu</span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="text-slate-500 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-1">
                {navItems.map((item) => {
                  if (item.roles && role && !item.roles.includes(role)) return null;
                  const isActive = location.pathname === item.path;
                  const Icon = item.icon;
                  
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-tight transition-all",
                        isActive 
                          ? "text-white bg-slate-950/5 border border-white/10 shadow-lg" 
                          : "text-slate-500 hover:text-white hover:bg-slate-950/5"
                      )}
                    >
                      <Icon className={cn("w-4 h-4", isActive ? "text-primary" : "text-slate-400")} style={isActive ? { color: primaryColor } : {}} />
                      {item.label}
                    </Link>
                  );
                })}
              </div>

              <div className="p-4 border-t border-white/[0.04] mt-auto">
                <div className="flex items-center gap-3 p-3 bg-slate-950/5 rounded-xl border border-white/[0.04]">
                  <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden">
                    {user?.photoURL ? (
                      <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <UserIcon className="w-4 h-4 text-slate-500" />
                    )}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs text-white font-semibold truncate">{user?.email?.split('@')[0].toUpperCase()}</span>
                    <span className="text-[7px] text-primary uppercase font-bold tracking-wider">{role?.replace('_', ' ')}</span>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="ml-auto p-2 text-slate-500 hover:text-red-500"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
    </>
  );
};
