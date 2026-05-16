import { Button } from '@/components/ui/button';
import { Share2, Settings, LogOut } from 'lucide-react';
import { useState } from 'react';
import { SignInForm } from '@/components/auth/SignInForm';
import { useAuth } from '@/services/useAuth';

interface NotebookHeaderProps {
  onCreate?: () => unknown;
}

export function NotebookHeader({ onCreate }: NotebookHeaderProps) {
  const [openAuth, setOpenAuth] = useState(false);
  const { token, signout } = useAuth();

  return (
    <header className="napkin-header">
      {/* Left section */}
      <div className="napkin-header-left">
        <button className="napkin-new-btn" onClick={() => { void onCreate?.(); }}>
          <span className="napkin-new-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14"/>
            </svg>
          </span>
          New Napkin
        </button>
      </div>

      {/* Right section */}
      <div className="napkin-header-right">
        <button className="napkin-header-action-btn">
          <Share2 size={14} />
          <span>Share</span>
        </button>

        <button className="napkin-header-action-btn napkin-brand-studio-btn">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          <span>Brand Studio</span>
        </button>

        <button className="napkin-icon-btn" title="Settings">
          <Settings size={15} />
        </button>

        <div className="relative">
          {!token ? (
            <button onClick={() => setOpenAuth(true)} className="napkin-signin-btn">
              Sign in
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button className="napkin-avatar" title="Profile">U</button>
              <Button variant="ghost" size="icon" onClick={() => signout()} className="h-7 w-7 text-[#888]">
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
