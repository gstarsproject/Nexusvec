import { Agency } from '../../types';

export const tenantService = {
  async resolveTenant(hostname: string): Promise<Agency | null> {
    try {
      const response = await fetch('/api/tenant/current');
      if (response.ok) {
        const data = await response.json();
        if (data) {
          return {
            id: data.id || 'nexus-core-prod',
            name: data.name || 'NexusCore Global Store',
            slug: data.slug || 'nexus',
            domain: data.customDomain || 'nexuscore.io',
            logoUrl: data.logoUrl || null,
            siteTitle: data.whiteLabelConfig?.siteTitle || 'NexusCore Platform',
            supportTelegram: data.whiteLabelConfig?.supportTelegram || null,
            termsUrl: data.whiteLabelConfig?.termsUrl || null,
            footerText: data.whiteLabelConfig?.footerText || '© 2026 NexusCore Platform. Enterprise multi-tenant SaaS ledger.',
            theme: {
              primary: data.primaryColor || '#9333ea',
              secondary: '#1e1b4b',
              accent: '#3b82f6'
            },
            status: data.status || 'ACTIVE',
            createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
            config: data.settings || {}
          } as any;
        }
      }
    } catch (err) {
      console.warn("Could not query live tenant API, using offline enterprise defaults:", err);
    }

    return {
      id: 'nexus-core-prod',
      name: 'NexusCore Global Store',
      slug: 'nexus',
      domain: 'nexuscore.io',
      status: 'ACTIVE',
      theme: {
        primary: '#9333ea',
        secondary: '#1e1b4b',
        accent: '#3b82f6'
      },
      createdAt: new Date(),
      siteTitle: 'NexusCore Platform',
      footerText: '© 2026 NexusCore Platform. Enterprise multi-tenant SaaS ledger.'
    } as any;
  },

  async getAllAgencies(): Promise<Agency[]> {
    try {
      const response = await fetch('/api/agencies');
      if (response.ok) return response.json();
    } catch (e) {}
    return [];
  },

  async createAgency(data: any): Promise<string> {
    try {
      const response = await fetch('/api/agencies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (response.ok) {
        const res = await response.json();
        return res.id;
      }
    } catch (e) {}
    return 'nexus-core-prod';
  },

  async updateAgency(id: string, updates: Partial<Agency>): Promise<void> {
    try {
      await fetch(`/api/agencies/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
    } catch (e) {}
  },

  async getAgencyById(id: string): Promise<Agency | null> {
    try {
      const response = await fetch(`/api/agencies/${id}`);
      if (response.ok) return response.json();
    } catch (e) {}
    return null;
  }
};
