import React, { useState } from 'react';
import { useAuth } from '@/services/useAuth';

export function AuthPage() {
  const { signin, signup } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      if (mode === 'signup') {
        await signup(email, password);
        setInfo('Account created! Check your email to confirm, then sign in.');
        setMode('signin');
      } else {
        await signin(email, password);
        // App.tsx re-renders automatically because token changes
      }
    } catch (err: any) {
      const msg = err?.message || err?.error_description || JSON.stringify(err);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Background dot grid */}
      <div className="auth-bg-dots" />

      <div className="auth-card">
        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
            </svg>
          </div>
          <span className="auth-logo-text">Supa Write</span>
        </div>

        <h1 className="auth-title">
          {mode === 'signin' ? 'Welcome back' : 'Create your account'}
        </h1>
        <p className="auth-subtitle">
          {mode === 'signin'
            ? 'Sign in to continue writing'
            : 'Start shaping clear, on-brand copy'}
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label className="auth-label">Email</label>
            <input
              type="email"
              className="auth-input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="auth-field">
            <label className="auth-label">Password</label>
            <input
              type="password"
              className="auth-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              minLength={6}
            />
          </div>

          {error && <div className="auth-error">{error}</div>}
          {info  && <div className="auth-info">{info}</div>}

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading
              ? 'Please wait…'
              : mode === 'signin' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <div className="auth-switch">
          {mode === 'signin' ? (
            <>
              Don't have an account?{' '}
              <button className="auth-switch-btn" onClick={() => { setMode('signup'); setError(null); setInfo(null); }}>
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button className="auth-switch-btn" onClick={() => { setMode('signin'); setError(null); setInfo(null); }}>
                Sign in
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
