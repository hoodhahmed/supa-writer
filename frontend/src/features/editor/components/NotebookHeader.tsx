import { Button } from '@/components/ui/button';
import { Library, Plus, Share2, Settings, HelpCircle, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { SignInForm } from '@/components/auth/SignInForm';
import { useAuth } from '@/services/useAuth';

export function NotebookHeader() {
  const [openAuth, setOpenAuth] = useState(false);
  const { token, signout } = useAuth();

  return (
    <header className="h-16 border-b border-[#EAEAEA] bg-white flex items-center justify-between px-8 sticky top-0 z-40">
      {/* Left section */}
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-xs font-medium text-[#555555] hover:text-[#111111] hover:bg-[#F5F5F5]"
        >
          <Library className="h-4 w-4 mr-2" />
          Library
        </Button>
        <Button 
          className="bg-[#111111] hover:bg-[#333333] text-white rounded-full px-4 py-2 text-sm font-semibold transition-all"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Napkin
        </Button>
      </div>

      {/* Center - spacer */}
      <div className="flex-1" />

      {/* Right section */}
      <div className="flex items-center gap-6">
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-xs font-medium text-[#555555] hover:text-[#111111] gap-2"
        >
          <Share2 className="h-4 w-4" />
          Share
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-xs font-medium text-[#555555] hover:text-[#111111]"
        >
          Brand Studio
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 text-[#555555] hover:text-[#111111] hover:bg-[#F5F5F5]"
        >
          <Settings className="h-4 w-4" />
        </Button>
        <div className="relative">
          {!token ? (
            <Button onClick={() => setOpenAuth(true)} variant="ghost" size="sm">
              Sign in
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#33C3FF] to-[#0099CC] flex items-center justify-center text-white text-xs font-bold">
                U
              </div>
              <Button variant="ghost" size="icon" onClick={() => signout()}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          )}

          {openAuth && (
            <div className="absolute right-0 mt-2">
              <SignInForm onClose={() => setOpenAuth(false)} />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
