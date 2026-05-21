import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useAuth } from '@/services/useAuth';
import { AppProvider } from '@/context/AppContext';
import { ToastProvider } from '@/hooks/useToast';

// Lazy load components
const EssenceEditor = lazy(() => import('@/components/essence-editor').then(m => ({ default: m.EssenceEditor })));
const AuthPage = lazy(() => import('@/components/auth/AuthPage').then(m => ({ default: m.AuthPage })));
const ProfilePage = lazy(() => import('@/components/auth/ProfilePage'));
const Dashboard = lazy(() => import('@/components/dashboard/Dashboard'));
const LandingPage = lazy(() => import('@/components/marketing/site-pages').then(m => ({ default: m.LandingPage })));
const AboutPage = lazy(() => import('@/components/marketing/site-pages').then(m => ({ default: m.AboutPage })));
const PricingPage = lazy(() => import('@/components/marketing/site-pages').then(m => ({ default: m.PricingPage })));

const PageWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="w-full min-h-screen overflow-x-hidden">
    {children}
  </div>
);

const LoadingFallback = () => (
  <div className="min-h-screen w-full flex items-center justify-center bg-[#f7f7f7]">
    <div className="auth-spinner" />
  </div>
);

function AppRoutes() {
  const { token, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingFallback />;

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes location={location} key={location.pathname}>
        <Route
          path="/auth"
          element={token ? <Navigate to="/app" replace /> : <PageWrapper><AuthPage /></PageWrapper>}
        />

        <Route path="/" element={<PageWrapper><LandingPage /></PageWrapper>} />
        <Route path="/about" element={<PageWrapper><AboutPage /></PageWrapper>} />
        <Route path="/pricing" element={<PageWrapper><PricingPage /></PageWrapper>} />

        <Route
          path="/app"
          element={token ? <PageWrapper><EssenceEditor /></PageWrapper> : <Navigate to="/auth" replace />}
        />

        <Route
          path="/dashboard"
          element={token ? <PageWrapper><Dashboard /></PageWrapper> : <Navigate to="/auth" replace />}
        />

        <Route
          path="/profile"
          element={token ? <PageWrapper><ProfilePage /></PageWrapper> : <Navigate to="/auth" replace />}
        />

        <Route path="/editor" element={<Navigate to="/app" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <ToastProvider>
          <TooltipProvider>
            <AppRoutes />
            <Toaster />
          </TooltipProvider>
        </ToastProvider>
      </AppProvider>
    </BrowserRouter>
  );
}
