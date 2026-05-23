import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Globe, ArrowLeft } from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { TenantProvider, useTenant } from './contexts/TenantContext';
import { OperationalIntelligenceProvider } from './contexts/OperationalIntelligenceContext';
import { DashboardLayout } from './layouts/DashboardLayout';
import { Dashboard } from './pages/Dashboard';
import { Suppliers } from './pages/Suppliers';
import { ResellersPage } from './pages/Resellers';
import { ServicesPage } from './pages/Services';
import { ProductDashboard } from './pages/products/ProductDashboard';
import { SystemConfigPage } from './pages/SystemConfig';
import { StoreSettings } from './pages/StoreSettings';
import { SupportPage } from './pages/Support';
import { WalletHub } from './pages/WalletHub';
import { BillingDashboard } from './pages/BillingDashboard';
import { TierManagementPage } from './pages/TierManagementPage';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

import { OnboardingFlow } from './pages/onboarding/OnboardingFlow';
import { VisionSwitcher } from './components/debug/VisionSwitcher';
import { PublicCatalog } from './pages/PublicCatalog';
import { LandingPage } from './pages/LandingPage';
import { Logo } from './components/common/Logo';

const AppRoutes = () => {
  const { user, loading: authLoading } = useAuth();
  const { tenant, isLoading: tenantLoading, isNotFound } = useTenant();
  const [forceLanding, setForceLanding] = React.useState(false);

  const isAuthRoute = ['/login', '/register', '/forgot-password'].includes(window.location.pathname);

  if (forceLanding) {
    return <LandingPage />;
  }

  if (authLoading || tenantLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-6">
          <Logo variant="auth" />
          <div className="flex items-center gap-4">
            <div className="w-5 h-5 border-2 border-white/10 border-t-blue-500 rounded-full animate-spin" />
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-[0.4em] animate-pulse">
              {tenantLoading ? "Synchronizing_Context" : "Authenticating_Session"}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Fallback UI when tenant cannot be resolved and no user is logged in
  if (isNotFound && !user && !isAuthRoute) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-950 text-white font-mono p-8 text-center animate-in fade-in duration-500">
        <div className="max-w-md bg-slate-900/50 backdrop-blur-2xl border border-white/[0.04] p-8 md:p-10 rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-40 bg-red-500/5 blur-[80px] pointer-events-none rounded-t-[2.5rem]" />
          
          <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.15)]">
            <Globe className="w-8 h-8 text-red-500" />
          </div>
          
          <h1 className="text-2xl font-black font-display text-white tracking-tight mb-2">
            Node Resolution Failure
          </h1>
          <p className="text-[10px] uppercase tracking-[0.2em] text-red-400 font-mono font-bold mb-4">
            [Error Code: NODE_RESOLUTION_FAILED]
          </p>
          
          <p className="text-sm text-slate-400 font-sans leading-relaxed mb-8">
            The platform domain <span className="text-slate-200 font-mono break-all font-semibold">{window.location.hostname}</span> could not be resolved. This instance could be de-provisioned, archived, or misconfigured.
          </p>
          
          <button 
            type="button"
            onClick={() => setForceLanding(true)}
            className="w-full btn-primary py-3.5 flex items-center justify-center gap-2 group text-xs uppercase tracking-widest font-mono font-bold"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Go to Landing Page
          </button>
        </div>
      </div>
    );
  }

  // Domain not resolved to any agency - Show the Platform Landing Page
  if (!tenant && !user && !isAuthRoute) {
    return <LandingPage />;
  }

  // Handle errors or missing tenant configurations in production
  if (isNotFound && !isAuthRoute) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-950 text-white font-mono p-8 text-center animate-in fade-in duration-500">
        <div className="max-w-md bg-slate-900/50 backdrop-blur-2xl border border-white/[0.04] p-8 md:p-10 rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-40 bg-red-500/5 blur-[80px] pointer-events-none rounded-t-[2.5rem]" />
          
          <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.15)]">
            <Globe className="w-8 h-8 text-red-500" />
          </div>
          
          <h1 className="text-2xl font-black font-display text-white tracking-tight mb-2">Terminal Offline</h1>
          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-mono font-bold mb-4">
            [Error Code: CONTEXT_INACTIVE]
          </p>
          
          <p className="text-sm text-slate-400 font-sans leading-relaxed mb-8">
            The domain <span className="text-red-400 font-mono font-semibold">{window.location.hostname}</span> is not mapped to any active Nexus Node.
          </p>
          
          <a 
            href="/"
            className="w-full btn-secondary py-3.5 flex items-center justify-center gap-2 text-xs uppercase tracking-widest font-mono font-bold"
          >
            Return to Core
          </a>
        </div>
      </div>
    );
  }

  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/onboarding" element={<OnboardingFlow />} />
        
        <Route
          path="/"
          element={
            user ? (
              <DashboardLayout>
                <Dashboard />
              </DashboardLayout>
            ) : tenant ? (
              <PublicCatalog />
            ) : (
              <LandingPage />
            )
          }
        />

        <Route
          path="/suppliers"
          element={
            <ProtectedRoute allowedRoles={['SUPER_OWNER', 'TENANT_OWNER', 'ADMIN']}>
              <DashboardLayout>
                <Suppliers />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/agencies"
          element={
            <ProtectedRoute allowedRoles={['SUPER_OWNER']}>
              <DashboardLayout>
                <div className="p-8"><h1 className="text-2xl font-bold text-white mb-2">Agencies & Tenants</h1><p className="text-slate-400">Manage platform tenants, billing cycles, and system allocations.</p></div>
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/api-settings"
          element={
            <ProtectedRoute allowedRoles={['SUPPLIER']}>
              <DashboardLayout>
                <div className="p-8"><h1 className="text-2xl font-bold text-white mb-2">API Integrations</h1><p className="text-slate-400">Manage webhook endpoints and API performance.</p></div>
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/buy"
          element={
            <ProtectedRoute allowedRoles={['RESELLER', 'MEMBER']}>
              <DashboardLayout>
                <PublicCatalog />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/wallet"
          element={
            <ProtectedRoute allowedRoles={['SUPER_OWNER', 'TENANT_OWNER', 'ADMIN', 'RESELLER']}>
              <DashboardLayout>
                <WalletHub />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/transactions"
          element={
            <ProtectedRoute allowedRoles={['SUPER_OWNER', 'TENANT_OWNER', 'ADMIN', 'SUPPLIER', 'RESELLER', 'MEMBER']}>
              <DashboardLayout>
                <BillingDashboard />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/resellers/tiers"
          element={
            <ProtectedRoute allowedRoles={['SUPER_OWNER', 'TENANT_OWNER', 'ADMIN']}>
              <DashboardLayout>
                <TierManagementPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/resellers"
          element={
            <ProtectedRoute allowedRoles={['SUPER_OWNER', 'TENANT_OWNER', 'ADMIN']}>
              <DashboardLayout>
                <ResellersPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/services"
          element={
            <ProtectedRoute allowedRoles={['SUPER_OWNER', 'TENANT_OWNER', 'ADMIN']}>
              <DashboardLayout>
                <ServicesPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/catalog"
          element={
            <ProtectedRoute allowedRoles={['SUPER_OWNER', 'TENANT_OWNER', 'ADMIN', 'SUPPLIER', 'MEMBER']}>
              <DashboardLayout>
                <ProductDashboard />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute allowedRoles={['SUPER_OWNER', 'TENANT_OWNER', 'ADMIN', 'SUPPLIER', 'RESELLER', 'MEMBER']}>
              <DashboardLayout>
                <StoreSettings />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/system"
          element={
            <ProtectedRoute allowedRoles={['SUPER_OWNER', 'TENANT_OWNER']}>
              <DashboardLayout>
                <SystemConfigPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/support"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <SupportPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route path="/unauthorized" element={
          <div className="h-screen w-full flex items-center justify-center bg-slate-950 text-red-500 font-mono p-8 text-center">
            <div>
              <h1 className="text-4xl font-semibold mb-4 uppercase">Access_Denied</h1>
              <p className="text-xs uppercase tracking-[0.3em] opacity-50">Your Security Clearance is Insufficient for this Node.</p>
              <button 
                onClick={() => window.location.href = '/'}
                className="mt-8 px-6 py-2 border border-red-500/20 hover:bg-red-500/10 transition-all uppercase text-xs font-semibold"
              >
                Re-Authorize
              </button>
            </div>
          </div>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <VisionSwitcher />
    </>
  );
};

export default function App() {
  return (
    <BrowserRouter>
        <ErrorBoundary fallbackText="TenantProvider">
          <TenantProvider>
            <ErrorBoundary fallbackText="OperationalIntelligenceProvider">
              <OperationalIntelligenceProvider>
                <ErrorBoundary fallbackText="AuthProvider">
                  <AuthProvider>
                    <AppRoutes />
                  </AuthProvider>
                </ErrorBoundary>
              </OperationalIntelligenceProvider>
            </ErrorBoundary>
          </TenantProvider>
        </ErrorBoundary>
    </BrowserRouter>
  );
}
