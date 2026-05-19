import { LogOut, Plus, Sparkles, LayoutGrid, Search } from 'lucide-react';
import { useState } from 'react';
import { SignInForm } from '@/components/auth/SignInForm';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/services/useAuth';
import { SaveStatus } from './SaveStatus';
import { cn } from '@/lib/utils';

interface NotebookHeaderProps {
  onCreate?: () => unknown;
  onScan?: () => void;
  onGrammarlyFullScan?: () => void;
  docScore?: any;
  saved?: boolean;
}

export function NotebookHeader({ onCreate, onScan, onGrammarlyFullScan, docScore, saved }: NotebookHeaderProps) {
  const [openAuth, setOpenAuth] = useState(false);
  const { token, signout } = useAuth();
  const location = useLocation();
  const isDashboard = location.pathname === '/dashboard';

  const getScoreColor = (confidence: number) => {
    const c = confidence > 1 ? confidence : confidence * 100;
    if (c < 20) return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
    if (c < 60) return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
    return 'bg-red-500/10 text-red-600 border-red-500/20';
  };

  return (
    <header className="napkin-header">
      {/* ... (logo section remains same) */}
      <div className="napkin-header-left">
        <Link to="/" className="flex items-center gap-2.5 group" title="Supa Write Home">
          <div className="bg-[#1A1A1A] p-1.5 rounded-lg group-hover:scale-110 transition-all">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
            </svg>
          </div>
          <span className="font-black text-xl tracking-tighter text-[#1A1A1A]">SupaWrite</span>
        </Link>
      </div>

      {/* ... (nav section remains same) */}

      {/* Right section: Auth/Actions */}
      <div className="napkin-header-right">
        {!isDashboard && (
          <div className="hidden lg:flex items-center gap-2 mr-4">
            <SaveStatus saved={saved ?? true} />
            
            {docScore?.confidence != null ? (
              <button 
                onClick={onScan}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-black uppercase transition-all hover:scale-105 active:scale-95",
                  getScoreColor(docScore.confidence)
                )}
                title="Click to re-scan AI score"
              >
                <Sparkles size={10} strokeWidth={3} />
                Score: {(() => {
                  const c = docScore.confidence;
                  const percent = c > 1 ? Math.round(c) : Math.round((c || 0) * 100);
                  return `${percent}%`;
                })()}
              </button>
            ) : (
              <button 
                onClick={onScan}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-slate-200 bg-white text-slate-500 text-[10px] font-black uppercase hover:bg-slate-50 transition-all hover:scale-105 active:scale-95"
                title="Manually trigger AI scan"
              >
                <Sparkles size={10} strokeWidth={3} />
                Check AI
              </button>
            )}

            <button 
              onClick={onGrammarlyFullScan}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase hover:bg-emerald-100 transition-all hover:scale-105 active:scale-95"
              title="Full Grammarly AI Check (Paragraphs)"
            >
              <Search size={10} strokeWidth={3} />
              Grammarly Check
            </button>
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
