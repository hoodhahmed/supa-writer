import React, { useState } from 'react';
import { useAuth } from '@/services/useAuth';
import { X, Check } from 'lucide-react';

import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.23, 1, 0.32, 1],
      staggerChildren: 0.08
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 }
};

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
      let msg = err?.detail || err?.message || err?.error_description || JSON.stringify(err);
      
      // If the error is a JSON string (common with FastAPI/Supabase), try to parse it
      if (typeof msg === 'string' && msg.startsWith('{')) {
        try {
          const parsed = JSON.parse(msg);
          msg = parsed.msg || parsed.detail || msg;
          // Sometimes it's double nested
          if (typeof msg === 'string' && msg.startsWith('{')) {
            const inner = JSON.parse(msg);
            msg = inner.msg || inner.error_description || msg;
          }
        } catch (e) {}
      }
      
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Background dot grid */}
      <div className="auth-bg-dots" />

      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="auth-card"
      >
        {/* Logo */}
        <motion.div variants={itemVariants} className="flex flex-col items-center mb-10">
          <div className="bg-[#1A1A1A] p-2.5 rounded-2xl shadow-xl shadow-black/10 mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
            </svg>
          </div>
          <span className="font-black text-2xl tracking-tighter text-[#1A1A1A]">Supa Write</span>
        </motion.div>

        <motion.div variants={itemVariants} className="text-center mb-8">
          <h1 className="text-2xl font-black tracking-tight text-[#1A1A1A] mb-2">
            {mode === 'signin' ? 'Welcome back' : 'Create account'}
          </h1>
          <p className="text-[#64748B] font-medium text-sm">
            {mode === 'signin'
              ? 'Enter your details to access your drafts'
              : 'Start your 14-day free trial today'}
          </p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <motion.div variants={itemVariants} className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-[#64748B] ml-1">Email Address</label>
            <input
              type="email"
              className="auth-input"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-[#64748B] ml-1">Password</label>
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
          </motion.div>

          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 rounded-xl bg-red-50 text-red-600 text-xs font-bold border border-red-100 flex gap-2 items-center">
               <X size={14} strokeWidth={3} /> {error}
            </motion.div>
          )}
          {info && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 rounded-xl bg-green-50 text-green-600 text-xs font-bold border border-green-100 flex gap-2 items-center">
               <Check size={14} strokeWidth={3} /> {info}
            </motion.div>
          )}

          <motion.button 
            variants={itemVariants} 
            type="submit" 
            className="w-full premium-btn-primary py-3.5 text-sm" 
            disabled={loading}
          >
            {loading
              ? 'Processing...'
              : mode === 'signin' ? 'Sign In' : 'Create Account'}
          </motion.button>
        </form>

        <motion.div variants={itemVariants} className="mt-8 text-center">
          <p className="text-[#64748B] text-sm font-medium">
            {mode === 'signin' ? "Don't have an account?" : "Already have an account?"}
            <button 
              className="ml-2 text-[#1A1A1A] font-black hover:text-[#33C3FF] transition-colors underline decoration-2 underline-offset-4" 
              onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(null); setInfo(null); }}
            >
              {mode === 'signin' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
