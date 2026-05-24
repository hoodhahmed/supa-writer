import React, { useState } from 'react';
import { useAuth } from '@/services/useAuth';
import { NotebookHeader } from '@/features/editor/components/NotebookHeader';
import { useDocuments } from '@/features/editor/hooks/useDocuments';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CreditCard, ChevronRight, User, Shield, Sliders } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const sectionVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

export default function ProfilePage() {
  const { signout } = useAuth();
  const { createNewDoc } = useDocuments();
  const navigate = useNavigate();

  const [name, setName] = useState('User');
  const [email, setEmail] = useState('user@example.com');
  const [bio, setBio] = useState('I love writing clear and concise copy.');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [timezone, setTimezone] = useState('UTC');
  const [emailNotifications, setEmailNotifications] = useState(true);
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // For demonstration: track if email has been changed in this session
  const [initialEmail] = useState('user@example.com');

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    // Basic validation for sensitive changes
    const emailChanged = email !== initialEmail;
    const passwordChanged = newPassword.length > 0;

    if ((emailChanged || passwordChanged) && !currentPassword) {
      setMessage({ type: 'error', text: 'Current password is required to change email or password.' });
      setLoading(false);
      return;
    }
    
    // Simulate API call
    setTimeout(() => {
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setLoading(false);
      setCurrentPassword('');
      setNewPassword('');
    }, 1000);
  };

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full max-w-4xl">
        <NotebookHeader onCreate={() => { createNewDoc(); navigate('/app'); }} />
      </div>
      
      <main className="w-full max-w-4xl py-16 px-6">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="w-full"
        >
          <motion.div variants={sectionVariants} className="mb-12 text-center">
            <h1 className="text-5xl font-black tracking-tighter leading-tight text-[#484848] font-creative">Settings</h1>
            <p className="text-lg text-[#64748B] mt-2 font-medium">Manage your personal information and preferences.</p>
          </motion.div>
          
          <form onSubmit={handleUpdateProfile} className="space-y-10 pb-20">
            {/* Profile Section */}
            <motion.div variants={sectionVariants} className="premium-card p-10 space-y-8 bg-white border border-border-strong !rounded-[32px] shadow-sm">
              <div className="flex items-center gap-3">
                <div className="bg-[#faf0fe] p-2 rounded-lg text-[#b960e2]">
                   <User size={20} />
                </div>
                <h2 className="text-2xl font-black text-[#484848] tracking-tight font-creative">Profile Details</h2>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#64748B] uppercase tracking-[0.2em] ml-1">Full Name</label>
                  <input 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    className="auth-input"
                    placeholder="Your name"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#64748B] uppercase tracking-[0.2em] ml-1">Bio</label>
                  <textarea 
                    value={bio} 
                    onChange={(e) => setBio(e.target.value)}
                    rows={4}
                    className="auth-input min-h-[120px] resize-none py-4"
                    placeholder="Tell us a bit about yourself..."
                  />
                </div>
              </div>
            </motion.div>

            {/* Account & Security Section */}
            <motion.div variants={sectionVariants} className="premium-card p-10 space-y-8 bg-white border border-border-strong !rounded-[32px] shadow-sm">
              <div className="flex items-center gap-3">
                <div className="bg-[#e8f9ff] p-2 rounded-lg text-[#1ac6ff]">
                   <Shield size={20} />
                </div>
                <h2 className="text-2xl font-black text-[#484848] tracking-tight font-creative">Security</h2>
              </div>

              <div className="space-y-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#64748B] uppercase tracking-[0.2em] ml-1">Email Address</label>
                  <input 
                    type="email"
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    className="auth-input"
                  />
                  {email !== initialEmail && (
                    <div className="flex items-center gap-2 text-[#1ac6ff] mt-2">
                      <p className="text-[10px] font-black uppercase tracking-wider">Requires current password confirmation</p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-[#64748B] uppercase tracking-[0.2em] ml-1">Current Password</label>
                    <input 
                      type="password" 
                      placeholder="••••••••"
                      value={currentPassword} 
                      onChange={(e) => setCurrentPassword(e.target.value)} 
                      className="auth-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-[#64748B] uppercase tracking-[0.2em] ml-1">New Password</label>
                    <input 
                      type="password" 
                      placeholder="••••••••"
                      value={newPassword} 
                      onChange={(e) => setNewPassword(e.target.value)} 
                      className="auth-input"
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Preferences Section */}
            <motion.div variants={sectionVariants} className="premium-card p-10 space-y-8 bg-white border border-border-strong !rounded-[32px] shadow-sm">
              <div className="flex items-center gap-3">
                <div className="bg-[#fef4eb] p-2 rounded-lg text-[#f9b239]">
                   <Sliders size={20} />
                </div>
                <h2 className="text-2xl font-black text-[#484848] tracking-tight font-creative">Preferences</h2>
              </div>

              <div className="space-y-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#64748B] uppercase tracking-[0.2em] ml-1">Timezone</label>
                  <select 
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="auth-input appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748B%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:20px_20px] bg-[right_16px_center] bg-no-repeat"
                  >
                    <option value="UTC">UTC (Coordinated Universal Time)</option>
                    <option value="EST">EST (Eastern Standard Time)</option>
                    <option value="PST">PST (Pacific Standard Time)</option>
                    <option value="GMT">GMT (Greenwich Mean Time)</option>
                  </select>
                </div>

                <div className="flex items-center justify-between p-6 bg-[#f7f7f7] rounded-2xl border border-border-strong">
                  <div className="space-y-1">
                    <label className="text-base font-bold text-[#484848]">Email Notifications</label>
                    <p className="text-sm text-[#64748B] font-medium">Receive updates about your documents and AI credits.</p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setEmailNotifications(!emailNotifications)}
                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-4 focus:ring-[#1ac6ff]/20 ${emailNotifications ? 'bg-[#1ac6ff]' : 'bg-[#E2E8F0]'}`}
                  >
                    <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${emailNotifications ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
              </div>
            </motion.div>

            {message && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`p-6 rounded-2xl text-sm font-bold flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}
              >
                {message.text}
              </motion.div>
            )}

            <motion.div variants={sectionVariants} className="pt-8 flex flex-col md:flex-row items-center justify-between gap-6 border-t border-border-strong">
              <button 
                type="submit" 
                disabled={loading}
                className="premium-btn-primary !px-12 !py-4 text-base w-full md:w-auto"
              >
                {loading ? 'Saving Changes...' : 'Save All Changes'}
              </button>
              
              <button 
                onClick={() => { signout(); navigate('/auth'); }}
                className="px-6 py-2.5 rounded-xl text-red-500 hover:bg-red-50 font-bold transition-all"
              >
                Sign Out of Account
              </button>
            </motion.div>
          </form>
        </motion.div>
      </main>
    </div>
  );
}
