import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/services/useAuth';

export function SignInForm({ onClose }: { onClose?: () => void }) {
  const { signin, signup } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === 'signin') {
        await signin(email, password);
      } else {
        await signup(email, password);
        await signin(email, password);
      }
      onClose?.();
    } catch (err: any) {
      let msg = err?.detail || err?.message || JSON.stringify(err);
      if (typeof msg === 'string' && msg.startsWith('{')) {
        try {
          const parsed = JSON.parse(msg);
          msg = parsed.msg || parsed.detail || msg;
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
    <div className="p-4 w-80 bg-white border rounded shadow-md">
      <h3 className="text-sm font-semibold mb-3">{mode === 'signin' ? 'Sign in' : 'Create account'}</h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <div className="text-xs text-red-600">{error}</div>}
        <div className="flex items-center justify-between">
          <Button type="submit" disabled={loading}>
            {loading ? 'Please wait...' : mode === 'signin' ? 'Sign in' : 'Create'}
          </Button>
          <Button variant="ghost" onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}>
            {mode === 'signin' ? 'Create account' : 'Have an account?'}
          </Button>
        </div>
      </form>
    </div>
  );
}
