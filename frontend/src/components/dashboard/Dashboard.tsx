import { useNavigate } from 'react-router-dom';
import { useDocuments } from '@/features/editor/hooks/useDocuments';
import { NotebookHeader } from '@/features/editor/components/NotebookHeader';
import { useApp } from '@/context/AppContext';
import { Clock, ChevronRight, FileText, CreditCard, ArrowUpRight, Zap, Database, BarChart3, Plus } from 'lucide-react';
import { useState } from 'react';

export default function Dashboard() {
  const { documents = [], createNewDoc, loading: docsLoading } = useDocuments();
  const { stats, loadingStats } = useApp();
  const [searchQuery] = useState('');
  const navigate = useNavigate();

  // Robust safety checks for stats
  const aiUsed = stats?.aiCreditsUsed ?? 0;
  const aiLimit = stats?.aiCreditsLimit ?? 5000;
  const storageUsed = stats?.storageUsedMB ?? 0;
  const storageLimit = stats?.storageLimitMB ?? 100;

  // Percentage calculations with safety
  const aiPercent = Math.min(100, Math.max(0, (aiUsed / Math.max(1, aiLimit)) * 100));
  const storagePercent = Math.min(100, Math.max(0, (storageUsed / Math.max(0.1, storageLimit)) * 100));

  const filteredDocs = (documents || []).filter((d: any) =>
    (d.title || '').toLowerCase().includes((searchQuery || '').toLowerCase())
  );

  return (
    <div className="w-full">
      <NotebookHeader onCreate={() => { createNewDoc(); navigate('/app'); }} />
      
      <div className="max-w-6xl mx-auto py-12 px-8">
        {/* Minimal Header */}
        <div className="mb-10 text-center">
           <h1 className="text-[48px] font-black tracking-tighter leading-tight text-[#484848] font-creative">Workspace</h1>
           <p className="text-[#64748B] text-lg font-medium mt-2">Manage your drafts and account health.</p>
        </div>

        {/* Top Row: Executive Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
           <div className="premium-card box-2 !rounded-3xl p-8 border-none flex flex-col gap-4 shadow-sm">
              <div className="flex items-center justify-between">
                 <div className="bg-white h-10 w-10 rounded-xl flex items-center justify-center text-[#1ac6ff] shadow-sm">
                    <Zap size={20} className="fill-current" />
                 </div>
                 <span className="text-[10px] font-black text-[#1ac6ff] uppercase tracking-widest text-right">AI Credits</span>
              </div>
              <div>
                 <div className="text-3xl font-black text-[#484848] tracking-tighter">{loadingStats ? '--' : aiUsed.toLocaleString()}</div>
                 <p className="text-[11px] font-bold text-[#64748B] mt-1 opacity-70">Limit: {aiLimit.toLocaleString()}</p>
              </div>
           </div>

           <div className="premium-card box-1 !rounded-3xl p-8 border-none flex flex-col gap-4 shadow-sm">
              <div className="flex items-center justify-between">
                 <div className="bg-white h-10 w-10 rounded-xl flex items-center justify-center text-[#b960e2] shadow-sm">
                    <Database size={20} />
                 </div>
                 <span className="text-[10px] font-black text-[#b960e2] uppercase tracking-widest text-right">Storage</span>
              </div>
              <div>
                 <div className="text-3xl font-black text-[#484848] tracking-tighter">{loadingStats ? '--' : `${storageUsed} MB`}</div>
                 <p className="text-[11px] font-bold text-[#64748B] mt-1 opacity-70">Capacity: {storageLimit} MB</p>
              </div>
           </div>

           <div className="premium-card box-3 !rounded-3xl p-8 border-none flex flex-col gap-4 shadow-sm">
              <div className="flex items-center justify-between">
                 <div className="bg-white h-10 w-10 rounded-xl flex items-center justify-center text-[#f9b239] shadow-sm">
                    <BarChart3 size={20} />
                 </div>
                 <span className="text-[10px] font-black text-[#f9b239] uppercase tracking-widest text-right">Library</span>
              </div>
              <div>
                 <div className="text-3xl font-black text-[#484848] tracking-tighter">{docsLoading ? '--' : documents.length}</div>
                 <p className="text-[11px] font-bold text-[#64748B] mt-1 opacity-70">Total active drafts</p>
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Recent Activity */}
          <div className="lg:col-span-8 space-y-8">
            <div className="premium-card !rounded-[32px] shadow-sm bg-white border border-border-strong overflow-hidden">
              <div className="p-10 pb-4 flex items-center justify-between">
                 <h2 className="text-2xl font-black tracking-tight text-[#484848] font-creative">Recent Activity</h2>
                 <button onClick={() => navigate('/app')} className="text-[10px] font-black uppercase tracking-widest text-[#1ac6ff] hover:opacity-80 transition-opacity">Open Library</button>
              </div>

              <div className="mt-2">
                {docsLoading ? (
                  <div className="p-8 space-y-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-16 w-full rounded-2xl bg-[#F8FAFC] animate-pulse" />
                    ))}
                  </div>
                ) : filteredDocs.length === 0 ? (
                  <div className="mx-6 mb-10 text-center py-20 bg-[#F8FAFC] rounded-[32px] border-2 border-dashed border-[#E2E8F0]">
                    <p className="text-base font-bold text-[#64748B]">No documents found. Start your journey.</p>
                    <button onClick={() => { createNewDoc(); navigate('/app'); }} className="mt-6 premium-btn-accent !py-2.5 !px-8 !text-xs !rounded-full">
                       Create First Draft
                    </button>
                  </div>
                ) : (
                  <ul role="list" className="px-6 pb-6 space-y-1">
                    {filteredDocs.slice(0, 8).map((doc: any) => (
                      <li key={doc.id}>
                        <div 
                          className="group flex items-center justify-between p-5 rounded-2xl hover:bg-[#faf0fe] transition-all cursor-pointer border border-transparent hover:border-[#b960e2]/10"
                          onClick={() => navigate(`/app?doc=${encodeURIComponent(doc.id)}`)}
                        >
                          <div className="flex items-center gap-6 min-w-0">
                            <div className="h-12 w-12 rounded-2xl bg-[#f7f7f7] border border-border-strong flex items-center justify-center text-[#484848] group-hover:bg-[#1ac6ff] group-hover:text-white group-hover:border-[#1ac6ff] transition-all duration-300 shadow-sm">
                               <FileText size={20} />
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-[#484848] text-[17px] truncate tracking-tight">{doc.title || 'Untitled Draft'}</div>
                              <div className="text-[11px] font-black text-[#94A3B8] uppercase tracking-[0.1em] mt-1.5 flex items-center gap-2">
                                <Clock size={11} strokeWidth={3} />
                                {doc.lastModified ? new Date(doc.lastModified).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Just now'}
                              </div>
                            </div>
                          </div>
                          <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-[#f7f7f7] text-[#94A3B8] group-hover:text-[#484848] group-hover:bg-white group-hover:shadow-md transition-all">
                             <ArrowUpRight size={18} strokeWidth={3} />
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Account & Usage */}
          <div className="lg:col-span-4 space-y-8">
            <div className="premium-card !rounded-[32px] p-10 bg-white shadow-sm border border-border-strong flex flex-col">
              <div className="mb-12">
                 <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#64748B] mb-3">Subscription</div>
                 <div className="flex items-center justify-between">
                    <h2 className="text-4xl font-black tracking-tighter text-[#484848] font-creative">Standard</h2>
                    <span className="px-3 py-1 rounded-full bg-[#e8f9ff] text-[#1ac6ff] text-[10px] font-black uppercase tracking-wider border border-[#1ac6ff]/20">Active</span>
                 </div>
              </div>

              <div className="space-y-12 mb-12">
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-black text-[#64748B] uppercase tracking-[0.2em]">AI Credits</span>
                    <div className="text-right">
                       <span className="text-2xl font-black text-[#484848] tracking-tight">{loadingStats ? '--' : aiUsed.toLocaleString()}</span>
                       <span className="text-[11px] font-bold text-[#94A3B8]"> / {aiLimit.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="h-2 w-full bg-[#F1F5F9] rounded-full overflow-hidden border border-white shadow-inner">
                    <div 
                      style={{ width: loadingStats ? 0 : `${aiPercent}%` }}
                      className="h-full bg-gradient-to-r from-[#1ac6ff] to-[#0db3f0] rounded-full shadow-sm transition-all duration-1000" 
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-end text-sm">
                    <span className="text-[10px] font-black text-[#64748B] uppercase tracking-[0.2em]">Storage</span>
                    <div className="text-right">
                       <span className="text-2xl font-black text-[#484848] tracking-tight">{loadingStats ? '--' : storageUsed}</span>
                       <span className="text-[11px] font-bold text-[#94A3B8]"> MB / {storageLimit} MB</span>
                    </div>
                  </div>
                  <div className="h-2 w-full bg-[#F1F5F9] rounded-full overflow-hidden border border-white shadow-inner">
                    <div 
                      style={{ width: loadingStats ? 0 : `${storagePercent}%` }}
                      className="h-full bg-[#484848] rounded-full transition-all duration-1000" 
                    />
                  </div>
                </div>
              </div>

              <button 
                onClick={() => navigate('/pricing')}
                className="w-full premium-btn-primary !py-4.5 flex items-center justify-center gap-3 !rounded-[20px] shadow-xl shadow-black/5 text-base"
              >
                <ArrowUpRight size={20} strokeWidth={3} />
                Upgrade Plan
              </button>
            </div>

            {/* Support Card */}
            <div className="premium-card !rounded-[32px] p-8 bg-[#faf0fe] border-none text-center group">
               <div className="h-12 w-12 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-5 border border-[#b960e2]/10 group-hover:scale-110 transition-transform duration-500">
                  <CreditCard size={24} className="text-[#b960e2]" />
               </div>
               <h4 className="font-black text-[#484848] text-base uppercase tracking-tight font-creative">Need Help?</h4>
               <p className="text-sm font-medium text-[#64748B] mt-2 mb-8 px-4 leading-relaxed">Questions about your billing or features? We're here.</p>
               <button className="text-[11px] font-black uppercase tracking-[0.2em] text-[#b960e2] hover:opacity-80 transition-opacity flex items-center justify-center gap-2 mx-auto">
                  Support Center
                  <ChevronRight size={12} strokeWidth={4} />
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
