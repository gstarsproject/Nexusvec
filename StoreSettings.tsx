import React, { useState } from 'react';
import { 
  Globe, 
  Palette, 
  Layout, 
  Save, 
  CheckCircle2, 
  AlertCircle,
  Link as LinkIcon,
  MessageSquare,
  FileText,
  Zap
} from 'lucide-react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { useTenant } from '../contexts/TenantContext';
import { useAuth } from '../contexts/AuthContext';
import { PLATFORM_BRANDING } from '../config/branding';

export const StoreSettings = () => {
  const { t } = useTranslation();
  const { tenant, refreshTenant, updateTenant } = useTenant();
  const { role } = useAuth();
  
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: tenant?.name || '',
    logoUrl: tenant?.logoUrl || '',
    primaryColor: tenant?.theme?.primary || '#9333ea',
    secondaryColor: tenant?.theme?.secondary || '#0f172a',
    customDomain: tenant?.domain || '',
    siteTitle: tenant?.siteTitle || '', 
    supportTelegram: tenant?.supportTelegram || '',
    footerText: tenant?.footerText || `© 2026 ${tenant?.name || PLATFORM_BRANDING.companyName}. All rights reserved.`,
    language: tenant?.config?.language || 'en'
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccess(false);
    setError(null);

    try {
      await updateTenant({
        name: formData.name,
        logoUrl: formData.logoUrl,
        domain: formData.customDomain,
        siteTitle: formData.siteTitle,
        supportTelegram: formData.supportTelegram,
        footerText: formData.footerText,
        theme: {
          ...tenant?.theme,
          primary: formData.primaryColor,
          secondary: formData.secondaryColor,
          accent: formData.primaryColor
        },
        config: {
          ...tenant?.config,
          language: formData.language as 'en' | 'id'
        }
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || t('common.error_deploy'));
    } finally {
      setIsSaving(false);
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-display font-bold text-white tracking-tight">Organization Settings</h1>
        <p className="text-sm text-slate-500 font-medium">
          Manage your white-label infrastructure and branding assets
        </p>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main Configuration */}
        <div className="lg:col-span-2 space-y-8">
          <section className="premium-card bg-slate-950/60 p-0 border-none shadow-xl overflow-hidden">
            <div className="p-8 border-b border-white/[0.04] bg-slate-900/20 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-600/10 flex items-center justify-center border border-blue-500/20">
                <Layout className="w-6 h-6 text-blue-500" style={{ color: formData.primaryColor }} />
              </div>
              <div>
                <h2 className="text-xl font-display font-bold text-white tracking-tight">Organization Branding</h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Customize your storefront identity and visuals</p>
              </div>
            </div>
            
            <div className="p-10 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="section-label px-1">Organization Name</label>
                  <input 
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g. Nexus Digital"
                    className="enterprise-input"
                  />
                </div>
                <div className="space-y-2">
                  <label className="section-label px-1">Brand Logo URL</label>
                  <input 
                    type="url"
                    value={formData.logoUrl}
                    onChange={(e) => setFormData({...formData, logoUrl: e.target.value})}
                    placeholder="https://assets.nexus.io/logo.png"
                    className="enterprise-input text-slate-400"
                  />
                </div>
              </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="section-label px-1">Primary Brand Color</label>
                    <div className="flex items-center gap-4">
                      <input 
                        type="color"
                        value={formData.primaryColor || '#9333ea'}
                        onChange={(e) => setFormData({...formData, primaryColor: e.target.value})}
                        className="w-12 h-12 bg-slate-900 border-2 border-slate-700/50 rounded-xl cursor-pointer shadow-lg shrink-0"
                      />
                      <div className="flex-1">
                        <input 
                          type="text"
                          value={formData.primaryColor}
                          onChange={(e) => setFormData({...formData, primaryColor: e.target.value})}
                          className="enterprise-input uppercase font-mono"
                          placeholder="#9333ea"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="section-label px-1">Secondary Brand Color</label>
                    <div className="flex items-center gap-4">
                      <input 
                        type="color"
                        value={formData.secondaryColor || '#0f172a'}
                        onChange={(e) => setFormData({...formData, secondaryColor: e.target.value})}
                        className="w-12 h-12 bg-slate-900 border-2 border-slate-700/50 rounded-xl cursor-pointer shadow-lg shrink-0"
                      />
                      <div className="flex-1">
                        <input 
                          type="text"
                          value={formData.secondaryColor}
                          onChange={(e) => setFormData({...formData, secondaryColor: e.target.value})}
                          className="enterprise-input uppercase font-mono"
                          placeholder="#0f172a"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="section-label px-1">Default System Language</label>
                  <select 
                    value={tenant?.config?.language || 'en'}
                    onChange={(e) => setFormData({...formData, language: e.target.value})}
                    className="enterprise-input appearance-none"
                  >
                    <option value="en">English (US)</option>
                    <option value="id">Bahasa Indonesia (ID)</option>
                  </select>
                </div>
              </div>
          </section>

          <section className="premium-card bg-slate-950/60 p-0 border-none shadow-xl overflow-hidden">
            <div className="p-8 border-b border-white/[0.04] bg-slate-900/20 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                <Globe className="w-6 h-6 text-indigo-500" />
              </div>
              <div>
                <h2 className="text-xl font-display font-bold text-white tracking-tight">Custom Domain Gateway</h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Route your storefront through a vanity domain</p>
              </div>
            </div>
            
            <div className="p-10 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="section-label px-1">Distributed Domain</label>
                  <div className="flex items-center gap-2 px-2 py-0.5 bg-blue-600/10 rounded-full border border-blue-500/20">
                    <Zap className="w-2.5 h-2.5 text-blue-500" />
                    <span className="text-xs font-bold text-blue-500 tracking-tight">Enterprise Unlock</span>
                  </div>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                    <LinkIcon className="w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input 
                    type="text"
                    value={formData.customDomain}
                    onChange={(e) => setFormData({...formData, customDomain: e.target.value})}
                    placeholder="portal.yourorganization.com"
                    className="enterprise-input pl-14"
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="premium-card bg-slate-950/60 p-0 border-none shadow-xl overflow-hidden">
            <div className="p-8 border-b border-white/[0.04] bg-slate-900/20 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                <MessageSquare className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <h2 className="text-xl font-display font-bold text-white tracking-tight">Support Channels</h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Manage customer communication end-points</p>
              </div>
            </div>
            
            <div className="p-10 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="section-label px-1">Telegram Support Handle</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-slate-500 font-bold">@</div>
                    <input 
                      type="text"
                      value={formData.supportTelegram}
                      onChange={(e) => setFormData({...formData, supportTelegram: e.target.value})}
                      placeholder="SupportTeam"
                      className="enterprise-input pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="section-label px-1">Footer Legal Text</label>
                  <input 
                    type="text"
                    value={formData.footerText}
                    onChange={(e) => setFormData({...formData, footerText: e.target.value})}
                    className="enterprise-input"
                  />
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Sidebar / Deployment */}
        <div className="space-y-8">
          <div className="premium-card p-10 space-y-8 sticky top-24 shadow-2xl border-none">
            <div className="flex flex-col gap-1">
              <h3 className="text-base font-bold text-white tracking-tight">Changeset Execution</h3>
              <p className="text-xs text-slate-500 font-bold tracking-tight">Authorized as: {role}</p>
            </div>
            
            <div className="space-y-4">
              <button 
                type="submit"
                disabled={isSaving}
                className="w-full btn-premium py-5 shadow-2xl shadow-blue-900/40"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    Propagating Changes...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Push Configuration
                  </>
                )}
              </button>

              {success && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-500"
                >
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                  <span className="text-xs font-bold">Configuration applied successfully</span>
                </motion.div>
              )}

              {error && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500"
                >
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span className="text-xs font-bold">{error}</span>
                </motion.div>
              )}
            </div>

            <div className="pt-8 border-t border-white/[0.04] space-y-5">
              <div className="flex justify-between items-center text-xs font-medium">
                <span className="text-slate-500">Instance Status</span>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  <span className="text-white">Active</span>
                </div>
              </div>
              <div className="flex justify-between items-center text-xs font-medium">
                <span className="text-slate-500">Propogation Latency</span>
                <span className="text-white">1.2ms</span>
              </div>
              <div className="flex justify-between items-center text-xs font-medium">
                <span className="text-slate-500">Last Sync</span>
                <span className="text-blue-500 font-bold uppercase tracking-tight">Just Now</span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
