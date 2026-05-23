import React, { createContext, useContext, useEffect, useState } from 'react';
import { Agency } from '../types';
import { tenantService } from '../services/system/tenantService';
import { PLATFORM_BRANDING } from '../config/branding';

interface TenantContextType {
  tenant: Agency | null;
  isLoading: boolean;
  isNotFound: boolean;
  refreshTenant: () => Promise<void>;
  updateTenant: (data: Partial<Agency>) => Promise<void>;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tenant, setTenant] = useState<Agency | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isNotFound, setIsNotFound] = useState(false);

  const resolve = async () => {
    const hostname = window.location.hostname;
    const resolved = await tenantService.resolveTenant(hostname);
    
    if (resolved) {
      setTenant(resolved);
      updateBranding(resolved);
      
      // Sync language from tenant config
      if (resolved.config?.language) {
        import('../i18n/config').then(module => {
           module.default.changeLanguage(resolved.config!.language!);
        });
      }
    } else {
      // In preview/dev mode, don't show "Not Found" easily
      const isDev = hostname === 'localhost' || hostname.includes('run.app');
      setIsNotFound(!isDev && hostname.includes('.') && !hostname.includes('localhost'));
    }
  };

  useEffect(() => {
    setIsLoading(true);
    resolve().finally(() => setIsLoading(false));
  }, []);

  const refreshTenant = async () => {
    await resolve();
  };

  const updateTenant = async (data: Partial<Agency>) => {
    if (!tenant?.id) return;
    await tenantService.updateAgency(tenant.id, data);
    await resolve();
  };

  const updateBranding = (agency: Agency) => {
    const root = document.documentElement;
    if (agency.theme) {
      root.style.setProperty('--primary', agency.theme.primary);
      root.style.setProperty('--secondary', agency.theme.secondary);
      root.style.setProperty('--accent', agency.theme.accent);
    }
    document.title = agency.siteTitle || agency.name || PLATFORM_BRANDING.companyName;
  };

  return (
    <TenantContext.Provider value={{ tenant, isLoading, isNotFound, refreshTenant, updateTenant }}>
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};
