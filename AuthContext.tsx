import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Role, Permissions, User } from '../types/index';
import { PERMISSIONS } from '../config/constants';
import { authService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  profile: User | null;
  role: Role | null;
  permissions: Permissions | null;
  loading: boolean;
  actualRole: Role | null;
  setVision: (role: Role | null) => void;
  isSimulated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<User | null>(null);
  const [masqueradeRole, setMasqueradeRole] = useState<Role | null>(() => {
    return sessionStorage.getItem('nexus_vision_role') as Role | null;
  });
  const [loading, setLoading] = useState(true);

  const setVision = (newRole: Role | null) => {
    setMasqueradeRole(newRole);
    if (newRole) {
      sessionStorage.setItem('nexus_vision_role', newRole);
    } else {
      sessionStorage.removeItem('nexus_vision_role');
    }
  };

  useEffect(() => {
    let mounted = true;

    async function initializeAuth() {
      try {
        const currentUser = await authService.getCurrentUser();
        if (mounted) {
          if (currentUser) {
            setUser(currentUser);
            setProfile(currentUser);
          } else {
            setUser(null);
            setProfile(null);
          }
        }
      } catch (err) {
        if (mounted) {
          setUser(null);
          setProfile(null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    initializeAuth();

    // Setup an interval to periodically refresh/check session
    const interval = setInterval(() => {
      authService.getCurrentUser().then(currentUser => {
        if (mounted) {
          setUser(prev => {
            if (!currentUser && prev) {
              setProfile(null);
              return null;
            } else if (currentUser && !prev) {
              setProfile(currentUser);
              return currentUser;
            }
            return prev;
          });
        }
      }).catch(() => {});
    }, 60000); // Check every minute

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const actualRole = profile?.role || null;
  const role = masqueradeRole || actualRole;
  const permissions = role ? PERMISSIONS[role] : null;

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      role, 
      permissions, 
      loading, 
      actualRole, 
      setVision,
      isSimulated: !!masqueradeRole 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

