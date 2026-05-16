import { Button } from '@/components/ui/button';
import { Share2, Settings, LogOut } from 'lucide-react';
import { useState } from 'react';
import { SignInForm } from '@/components/auth/SignInForm';
import { Link } from 'react-router-dom';
import { useAuth } from '@/services/useAuth';
import { SaveStatus } from './SaveStatus';

interface NotebookHeaderProps {
  onCreate?: () => unknown;
  docScore?: any;
  saved?: boolean;
}

export function NotebookHeader({ onCreate, docScore, saved }: NotebookHeaderProps) {
  const [openAuth, setOpenAuth] = useState(false);
  const { token, signout } = useAuth();

  return (
    <header className="napkin-header">
      {/* Left section */}
      <div className="napkin-header-left">
        <button
          aria-label="Create document"
          className="napkin-new-btn"
          onClick={() => { void onCreate?.(); }}
        >
          <span className="napkin-new-icon" aria-hidden>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14"/>
            </svg>
          </span>
          <span>New Document</span>
        </button>
        
        <div style={{ marginLeft: '12px', opacity: 0.8 }}>
          <SaveStatus saved={saved ?? true} />
        </div>
      </div>

      {/* Right section */}
      <div className="napkin-header-right">
        <button className="napkin-header-action-btn">
          <Share2 size={14} />
          <span>Share</span>
        </button>

        <button className="napkin-header-action-btn napkin-brand-studio-btn" title="Document AI score">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          <span>AI Score</span>
          {docScore?.confidence != null && (
            <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-[#F0FBFF] text-[#0d95d8]">
              {(() => {
                const c = docScore.confidence;
                const percent = c > 1 ? Math.round(c) : Math.round((c || 0) * 100);
                return `${percent}%`;
              })()}
            </span>
          )}
        </button>
        
        <Link to="/dashboard" className="napkin-header-action-btn focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#33C3FF]" title="Dashboard" aria-label="Open dashboard">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zM13 21h8v-10h-8v10zM13 3v6h8V3h-8z" />
          </svg>
          <span>Dashboard</span>
        </Link>
        <button className="napkin-icon-btn" title="Settings">
          <Settings size={15} />
        </button>

        <div className="relative">
          {!token ? (
            <button onClick={() => setOpenAuth(true)} className="napkin-signin-btn focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#33C3FF]" aria-label="Sign in">
              Sign in
            </button>
          ) : (
              <div className="flex items-center gap-2">
              <Link to="/profile" className="napkin-avatar focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#33C3FF]" title="Profile" aria-label="Profile">
                U
              </Link>
              <Button variant="ghost" size="icon" onClick={() => signout()} className="h-7 w-7 text-[#888] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#33C3FF]" aria-label="Sign out">
                <LogOut size={14} />
              </Button>
            </div>
          )}

          {openAuth && (
            <div className="absolute right-0 top-full mt-2 z-50">
              <SignInForm onClose={() => setOpenAuth(false)} />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
