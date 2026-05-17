import { LogOut, Plus, Sparkles, LayoutGrid } from 'lucide-react';
import { useState } from 'react';
import { SignInForm } from '@/components/auth/SignInForm';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/services/useAuth';
import { SaveStatus } from './SaveStatus';
import { cn } from '@/lib/utils';

interface NotebookHeaderProps {
  onCreate?: () => unknown;
  docScore?: any;
  saved?: boolean;
}

export function NotebookHeader({ onCreate, docScore, saved }: NotebookHeaderProps) {
  const [openAuth, setOpenAuth] = useState(false);
  const { token, signout } = useAuth();
  const location = useLocation();
  const isDashboard = location.pathname === '/dashboard';

  return (
    <header className="napkin-header">
      {/* Left section: Logo */}
      <div className="napkin-header-left">
        <Link to="/" className="flex items-center gap-2.5 group" title="Supa Write Home">
          <div className="bg-[#1A1A1A] p-1.5 rounded-lg group-hover:scale-110 transition-all">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
            </svg>
          </div>
          <span className="font-black text-xl tracking-tighter text-[#1A1A1A]">Supa Write</span>
        </Link>
      </div>

      {/* Center section: Navigation */}
      <nav className="hidden md:flex items-center gap-8">
        <Link 
          to="/app" 
          className={cn(
            "text-sm font-bold transition-colors", 
            location.pathname === '/app' ? "text-[#1A1A1A]" : "text-[#64748B] hover:text-[#1A1A1A]"
          )}
        >
          Editor
        </Link>
        <Link 
          to="/dashboard" 
          className={cn(
            "text-sm font-bold transition-colors", 
            isDashboard ? "text-[#1A1A1A]" : "text-[#64748B] hover:text-[#1A1A1A]"
          )}
        >
          Dashboard
        </Link>
        <Link to="/pricing" className="text-sm font-bold text-[#64748B] hover:text-[#1A1A1A] transition-colors">Pricing</Link>
        <Link to="/about" className="text-sm font-bold text-[#64748B] hover:text-[#1A1A1A] transition-colors">About</Link>
      </nav>

      {/* Right section: Auth/Actions */}
      <div className="napkin-header-right">
        {!isDashboard && (
          <div className="hidden lg:flex items-center gap-2 mr-4">
            <SaveStatus saved={saved ?? true} />
            {docScore?.confidence != null && (
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-[#33C3FF]/10 text-[#33C3FF] text-[10px] font-black uppercase">
                <Sparkles size={10} strokeWidth={3} />
                Score: {(() => {
                  const c = docScore.confidence;
                  const percent = c > 1 ? Math.round(c) : Math.round((c || 0) * 100);
                  return `${percent}%`;
                })()}
              </div>
            )}
          </div>
        )}

        <div className="relative flex items-center gap-3">
          {!token ? (
            <>
              <button onClick={() => setOpenAuth(true)} className="text-sm font-bold text-[#1A1A1A] hover:opacity-80 px-2" aria-label="Sign in">
                Sign in
              </button>
              <button onClick={() => setOpenAuth(true)} className="premium-btn-primary !px-5 !py-2 !text-xs !rounded-full" aria-label="Sign up">
                Get Started Free
              </button>
            </>
          ) : (
            <div className="flex items-center gap-4">
              {location.pathname !== '/app' && (
                <button
                  onClick={() => { void onCreate?.(); }}
                  className="premium-btn-accent !px-5 !py-2 !text-xs !rounded-full !shadow-none flex items-center gap-2"
                >
                  <Plus size={14} strokeWidth={3} />
                  New Draft
                </button>
              )}
              
              <div className="h-6 w-px bg-border-strong hidden sm:block" />
              
              <Link to="/profile" className="napkin-avatar h-8 w-8 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center font-bold text-xs hover:scale-105 transition-transform" title="Account Settings">
                U
              </Link>
              <button 
                onClick={() => signout()} 
                className="h-9 w-9 flex items-center justify-center rounded-xl text-[#64748B] hover:text-red-500 hover:bg-red-50 transition-all" 
                aria-label="Sign out"
              >
                <LogOut size={16} strokeWidth={2.5} />
              </button>
            </div>
          )}

          {openAuth && (
            <div className="absolute right-0 top-full mt-4 z-50">
              <SignInForm onClose={() => setOpenAuth(false)} />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
