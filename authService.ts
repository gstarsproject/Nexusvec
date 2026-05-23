import { Role, User } from '../types/index';

const API_BASE = '/api/auth';
const OWNER_EMAIL = 'gstars.business@gmail.com';

const getHeaders = () => {
  const token = localStorage.getItem('nexus_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

const enrichUser = (user: any): User | null => {
  if (!user) return null;
  return {
    ...user,
    uid: user.id || user.uid || 'mock-user-id',
    agencyId: user.tenantId || user.agencyId || 'nexus-core-prod',
    tenantId: user.tenantId || user.agencyId || 'nexus-core-prod',
    displayName: user.displayName || user.name || (user.email ? user.email.split('@')[0] : 'User')
  };
};

export const authService = {
  async loginWithGoogle(agencyId?: string) {
    const defaultEmail = 'gstars.business@gmail.com';
    const res = await fetch(`${API_BASE}/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: defaultEmail, tenantId: agencyId })
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => null);
      throw new Error(errData?.error?.message || 'Google Login failed');
    }

    const data = await res.json();
    if (data.token) {
      localStorage.setItem('nexus_token', data.token);
    }
    return enrichUser(data.user);
  },

  async register(email: string, pass: string, agencyId?: string, role: Role = 'RESELLER') {
    const res = await fetch(`${API_BASE}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: pass, tenantId: agencyId, role })
    });
    
    if (!res.ok) {
      const errData = await res.json().catch(() => null);
      throw new Error(errData?.error?.message || 'Registration failed');
    }

    const data = await res.json();
    if (data.token) {
      localStorage.setItem('nexus_token', data.token);
    }
    return enrichUser(data.user);
  },

  async login(email: string, pass: string, agencyId?: string) {
    const res = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: pass, tenantId: agencyId })
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => null);
      throw new Error(errData?.error?.message || 'Authentication failed');
    }

    const data = await res.json();
    if (data.token) {
      localStorage.setItem('nexus_token', data.token);
    }

    const user = enrichUser(data.user);
    if (agencyId && user && user.role !== 'SUPER_OWNER') {
      if (user.agencyId && user.agencyId !== agencyId) {
        await this.logout();
        throw new Error('This account is registered with a different agency.');
      }
    }

    return user;
  },

  async resetPassword(email: string) {
    throw new Error('Password reset disabled during migration. Contact support.');
  },

  async logout() {
    try {
      await fetch(`${API_BASE}/logout`, {
        method: 'POST',
        headers: getHeaders()
      });
    } catch (e) {
      // ignore
    } finally {
      localStorage.removeItem('nexus_token');
    }
  },

  async getCurrentUser() {
    const token = localStorage.getItem('nexus_token');
    if (!token) return null;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
        const res = await fetch(`${API_BASE}/me`, {
          method: 'GET',
          headers: getHeaders(),
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (!res.ok) {
            if (res.status === 401) {
                localStorage.removeItem('nexus_token');
            }
            return null;
        }

        const data = await res.json();
        return enrichUser(data.user);
    } catch (e) {
        clearTimeout(timeoutId);
        console.error("AuthService: getCurrentUser failed", e);
        return null;
    }
  },

  async syncUser() {
    // Migration: Not needed anymore as backend handles user creation
  },

  async getUserRole(uid: string): Promise<Role | null> {
    // Legacy helper
    return null;
  }
};
