import React, { useState, useEffect } from 'react';
import { useAuth } from '@/services/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NotebookHeader } from '@/features/editor/components/NotebookHeader';
import { Sidebar } from '@/features/editor/components/Sidebar';
import { useDocuments } from '@/features/editor/hooks/useDocuments';
import { useNavigate } from 'react-router-dom';

export default function ProfilePage() {
  const { token, signout } = useAuth();
  const { documents, currentDocId, createNewDoc, deleteDoc, setCurrentDocId } = useDocuments();
  const navigate = useNavigate();

  const [name, setName] = useState('User');
  const [username, setUsername] = useState('user@example.com');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    if (!token) {
      navigate('/auth');
    }
  }, [token, navigate]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    
    // Simulate API call
    setTimeout(() => {
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="napkin-app">
      <NotebookHeader onCreate={() => { createNewDoc(); navigate('/app'); }} />
      
      <div className="napkin-body">
        <Sidebar
          documents={documents}
          currentDocId={currentDocId}
          onCreate={() => { createNewDoc(); navigate('/app'); }}
          onDelete={deleteDoc}
          onSelect={(id: string) => { setCurrentDocId(id); navigate('/app'); }}
        />

        <main className="napkin-main overflow-y-auto">
          <div className="max-w-2xl mx-auto py-12 px-6">
            <h1 className="text-3xl font-bold mb-8 text-[#1A1A1A] tracking-tight">Account Settings</h1>
            
            <div className="bg-white rounded-xl border border-rgba(0,0,0,0.06) p-8 shadow-sm">
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#64748B]">Full Name</label>
                  <Input 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    className="h-11 rounded-lg border-rgba(0,0,0,0.08) focus:ring-[#33C3FF] focus:border-[#33C3FF]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#64748B]">Username / Email</label>
                  <Input 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)} 
                    className="h-11 rounded-lg border-rgba(0,0,0,0.08) focus:ring-[#33C3FF] focus:border-[#33C3FF]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#64748B]">New Password</label>
                  <Input 
                    type="password" 
                    placeholder="Leave blank to keep current password"
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    className="h-11 rounded-lg border-rgba(0,0,0,0.08) focus:ring-[#33C3FF] focus:border-[#33C3FF]"
                  />
                </div>

                {message && (
                  <div className={`p-4 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                    {message.text}
                  </div>
                )}

                <div className="pt-4 flex items-center justify-between border-t border-rgba(0,0,0,0.04)">
                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="bg-[#33C3FF] hover:bg-[#0db3f0] text-white px-8 h-11 rounded-lg font-semibold transition-all shadow-sm"
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Button>
                  
                  <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={() => { signout(); navigate('/auth'); }}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 font-medium"
                  >
                    Sign Out
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
