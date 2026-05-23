import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Role } from '../../types/index';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles 
}) => {
  const { user, role, loading, profile, isSimulated } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-900 font-mono text-blue-500">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs uppercase tracking-[0.2em] animate-pulse">Initializing Nexus Security...</span>
        </div>
      </div>
    );
  }

  if (!user && !isSimulated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Mandatory onboarding for agencies and owners without an assigned agency node
  if ((role === 'TENANT_OWNER' || role === 'ADMIN') && !profile?.agencyId && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};
