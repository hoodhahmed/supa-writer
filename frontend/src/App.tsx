import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { EssenceEditor } from '@/components/essence-editor';
import { AuthPage } from '@/components/auth/AuthPage';
import ProfilePage from '@/components/auth/ProfilePage';
import { Toaster } from '@/components/ui/toaster';
import { useAuth } from '@/services/useAuth';
import { LandingPage, AboutPage, PricingPage } from '@/components/marketing/site-pages';
import Dashboard from './components/dashboard/Dashboard';

function AppRoutes() {
  const { token, loading } = useAuth();

  // While restoring auth state from localStorage, show nothing (avoids flash)
  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#F4F8FB]">
        <div className="auth-spinner" />
      </div>
    );
  }

  return (
    <Routes>
      {/* Public: sign-in / sign-up page */}
      <Route
        path="/auth"
        element={token ? <Navigate to="/app" replace /> : <AuthPage />}
      />

      <Route path="/" element={<LandingPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/pricing" element={<PricingPage />} />

      {/* Protected: editor — redirect to /auth if not signed in */}
      <Route
        path="/app"
        element={
          token ? (
            <main className="h-screen w-screen bg-background">
              <EssenceEditor />
            </main>
          ) : (
            <Navigate to="/auth" replace />
          )
        }
      />

      {/* Dashboard */}
      <Route
        path="/dashboard"
        element={
          token ? (
            <main className="h-screen w-screen bg-background">
              <Dashboard />
            </main>
          ) : (
            <Navigate to="/auth" replace />
          )
        }
      />

      {/* Profile */}
      <Route
        path="/profile"
        element={
          token ? (
            <ProfilePage />
          ) : (
            <Navigate to="/auth" replace />
          )
        }
      />

      <Route
        path="/editor"
        element={<Navigate to="/app" replace />}
      />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
      <Toaster />
    </BrowserRouter>
  );
}
