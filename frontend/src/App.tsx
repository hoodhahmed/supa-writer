import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { EssenceEditor } from '@/components/essence-editor';
import { AuthPage } from '@/components/auth/AuthPage';
import { Toaster } from '@/components/ui/toaster';
import { useAuth } from '@/services/useAuth';

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
        element={token ? <Navigate to="/" replace /> : <AuthPage />}
      />

      {/* Protected: editor — redirect to /auth if not signed in */}
      <Route
        path="/"
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
