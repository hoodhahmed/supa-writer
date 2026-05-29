import React, { useState, useMemo } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ChevronLeft, Search, Plus, Trash2, LayoutGrid, Clock, 
  SlidersHorizontal, ArrowRight, Gauge, AlertTriangle, Zap, X 
} from 'lucide-react';
import { cn } from '@/lib/utils';

// --- MAIN DOCUMENT SIDEBAR ---

export function Sidebar({
  documents,
  currentDocId,
  onCreate,
  onDelete,
  onSelect,
  searchQuery,
  setSearchQuery,
}: any) {
  const [activeTab, setActiveTab] = useState<'all' | 'recent'>('all');
  const [collapsed, setCollapsed] = useState(false);

  if (collapsed) {
    return (
      <aside className="napkin-sidebar-collapsed group">
        <button
          onClick={() => setCollapsed(false)}
          className="napkin-sidebar-toggle-btn napkin-sidebar-expand-btn group-hover:bg-[#F1F5F9] group-hover:text-[#1A1A1A]"
          title="Show sidebar"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <line x1="9" y1="3" x2="9" y2="21"/>
          </svg>
        </button>
        <div className="mt-4 flex flex-col items-center gap-4">
           <button onClick={onCreate} className="h-9 w-9 rounded-xl bg-[#33C3FF] text-white flex items-center justify-center shadow-lg shadow-[#33C3FF]/20 active:scale-95 transition-all">
             <Plus size={18} strokeWidth={3} />
           </button>
        </div>
      </aside>
    );
  }

  return (
    <aside className="napkin-sidebar">
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5 font-bold text-[#1A1A1A] tracking-tight">
            <div className="bg-[#1A1A1A] p-1 rounded-lg">
               <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                 <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
               </svg>
            </div>
            <span>Library</span>
          </div>
          <button
            className="napkin-sidebar-toggle-btn hover:bg-[#F1F5F9] hover:text-[#1A1A1A]"
            onClick={() => setCollapsed(true)}
            title="Collapse sidebar"
          >
            <ChevronLeft size={18} strokeWidth={2.5} />
          </button>
        </div>

        <div className="relative group mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8] group-focus-within:text-[#33C3FF] transition-colors" size={14} strokeWidth={3} />
          <input 
            type="text"
            placeholder="Search drafts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#F8FAFC] border-none rounded-xl py-2.5 pl-9 pr-4 text-sm font-medium text-[#1A1A1A] focus:ring-2 focus:ring-[#33C3FF]/20 focus:bg-white transition-all outline-none placeholder:text-[#94A3B8]"
          />
        </div>

        <div className="flex p-1 bg-[#F8FAFC] rounded-xl gap-1 mb-4">
          <button
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all',
              activeTab === 'all' ? 'bg-white text-[#1A1A1A] shadow-sm' : 'text-[#64748B] hover:text-[#1A1A1A]'
            )}
            onClick={() => setActiveTab('all')}
          >
            <LayoutGrid size={12} strokeWidth={3} />
            All Drafts
          </button>
          <button
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all',
              activeTab === 'recent' ? 'bg-white text-[#1A1A1A] shadow-sm' : 'text-[#64748B] hover:text-[#1A1A1A]'
            )}
            onClick={() => setActiveTab('recent')}
          >
            <Clock size={12} strokeWidth={3} />
            Recent
          </button>
        </div>
      </div>

      <ScrollArea className="flex-1 px-3 pb-4">
        <div className="space-y-1">
          {documents.map((doc: any) => (
            <div
              key={doc.id}
              onClick={() => onSelect(doc.id)}
              className={cn(
                'group flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all border border-transparent',
                currentDocId === doc.id 
                  ? 'bg-white border-border-strong shadow-sm' 
                  : 'hover:bg-[#F8FAFC]'
              )}
            >
              <div className={cn(
                'h-8 w-8 rounded-lg flex items-center justify-center transition-all',
                currentDocId === doc.id ? 'bg-[#33C3FF] text-white' : 'bg-[#F1F5F9] text-[#94A3B8]'
              )}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                  <polyline points="14 2 14 8 20 8"/>
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className={cn(
                  'text-sm leading-tight line-clamp-2 break-words',
                  currentDocId === doc.id ? 'font-bold text-[#1A1A1A]' : 'font-medium text-[#475569]'
                )}>
                  {doc.title || 'Untitled'}
                </div>
                <div className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-wider mt-0.5">
                  {doc.lastModified ? new Date(doc.lastModified).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Draft'}
                </div>
              </div>
              <button
                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-50 hover:text-red-500 text-[#CBD5E1] transition-all"
                onClick={(e) => { e.stopPropagation(); onDelete(doc.id); }}
                title="Delete"
              >
                <Trash2 size={14} strokeWidth={2.5} />
              </button>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-[#F1F5F9]">
        <button
          onClick={onCreate}
          className="w-full premium-btn-accent py-2.5 flex items-center justify-center gap-2 text-sm"
        >
          <Plus size={16} strokeWidth={3} />
          New Draft
        </button>
      </div>
    </aside>
  );
}


// --- INSPECTION PANEL ---

interface SentenceResult {
  id: number;
  text: string;
  offset: number;
  scores: {
    score: number;
    engagementScore: number;
    fluencyScore: number;
    clarityScore: number;
    deliveryScore: number;
    unclearScore: number;
  };
}

interface InspectionSidebarProps {
  sentences: SentenceResult[] | null;
  onSentenceClick: (sentence: SentenceResult) => void;
  activeSentenceId: number | null;
  hoveredSentenceId: number | null;
  setHoveredSentenceId: (id: number | null) => void;
  onClose: () => void;
}

export function InspectionSidebar({ 
  sentences, onSentenceClick, activeSentenceId, 
  hoveredSentenceId, setHoveredSentenceId, onClose 
}: InspectionSidebarProps) {
  const [useManual, setUseManual] = useState(false);
  const [thresholds, setThresholds] = useState({
    overall: 80,
    engagement: 80,
    fluency: 3,
    clarity: 20,
    delivery: 0
  });
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSentences = useMemo(() => {
    if (!sentences) return [];
    return sentences.filter(s => {
      if (!s || !s.scores) return false;
      
      const matchesSearch = s.text.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      if (!useManual) {
        return Math.round(s.scores.score * 100) <= thresholds.overall;
      }

      return (
        Math.round(s.scores.score * 100) <= thresholds.overall ||
        Math.round(s.scores.engagementScore * 100) <= thresholds.engagement ||
        Math.round(s.scores.fluencyScore * 100) <= thresholds.fluency ||
        Math.round(s.scores.clarityScore * 100) <= thresholds.clarity ||
        Math.round(s.scores.deliveryScore * 100) <= thresholds.delivery
      );
    }).sort((a, b) => (a.scores?.score || 0) - (b.scores?.score || 0));
  }, [sentences, thresholds, searchQuery, useManual]);

  const updateThreshold = (key: keyof typeof thresholds, val: number) => {
    setThresholds(prev => ({ ...prev, [key]: val }));
  };

  if (!sentences) return null;

  return (
    <aside 
      className="fixed right-8 top-24 w-[320px] max-h-[75vh] bg-white/95 backdrop-blur-sm flex flex-col shadow-[0_20px_50px_rgba(0,0,0,0.15)] z-[60] border border-slate-200/60 animate-in zoom-in-95 slide-in-from-right-4 duration-300 ease-out"
      style={{ borderRadius: '28px' }}
    >
      <div className="p-5 pb-3">
        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-col">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-0.5">Inspector</h3>
            <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <SlidersHorizontal size={13} className="text-indigo-500" />
              Quality Scan
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Mode Toggle */}
        <div className="flex p-1 bg-slate-50 rounded-xl gap-1 mb-5">
          <button
            className={cn(
              'flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all',
              !useManual ? 'bg-white text-indigo-600 shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600'
            )}
            onClick={() => setUseManual(false)}
          >
            Quick
          </button>
          <button
            className={cn(
              'flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all',
              useManual ? 'bg-white text-indigo-600 shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600'
            )}
            onClick={() => setUseManual(true)}
          >
            Manual
          </button>
        </div>

        {/* Threshold Sliders */}
        <div className="space-y-4 mb-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center text-[9px] font-bold uppercase">
              <span className="text-slate-400">Overall</span>
              <span className="text-indigo-600">≤ {thresholds.overall}%</span>
            </div>
            <input 
              type="range" min="0" max="100" 
              value={thresholds.overall} 
              onChange={(e) => updateThreshold('overall', parseInt(e.target.value))}
              className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>

          {useManual && (
            <div className="pt-3 border-t border-slate-50 space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">
              {[
                { label: 'Engagement', key: 'engagement', color: 'accent-indigo-500' },
                { label: 'Fluency', key: 'fluency', color: 'accent-purple-500' },
                { label: 'Clarity', key: 'clarity', color: 'accent-blue-500' },
                { label: 'Delivery', key: 'delivery', color: 'accent-amber-500' }
              ].map((m) => (
                <div key={m.key} className="space-y-1.5">
                  <div className="flex justify-between items-center text-[8px] font-bold uppercase">
                    <span className="text-slate-400">{m.label}</span>
                    <span className="text-slate-600">≤ {thresholds[m.key as keyof typeof thresholds]}%</span>
                  </div>
                  <input 
                    type="range" min="0" max="100" 
                    value={thresholds[m.key as keyof typeof thresholds]} 
                    onChange={(e) => updateThreshold(m.key as any, parseInt(e.target.value))}
                    className={cn("w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer", m.color)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="relative mb-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
          <input 
            type="text" placeholder="Search flagged text..." value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2 pl-9 pr-4 text-[11px] font-medium text-slate-900 focus:ring-1 focus:ring-indigo-500/20 outline-none"
          />
        </div>
      </div>

      {/* List */}
      <ScrollArea className="flex-1 px-3 pb-4">
        <div className="space-y-2">
          {filteredSentences.map((s) => {
            const score = Math.round(s.scores.score * 100);
            return (
              <div 
                key={s.id}
                onClick={() => onSentenceClick(s)}
                onMouseEnter={() => setHoveredSentenceId(s.id)}
                onMouseLeave={() => setHoveredSentenceId(null)}
                className={cn(
                  "p-3 rounded-2xl border transition-all cursor-pointer group relative overflow-hidden",
                  activeSentenceId === s.id 
                    ? "bg-white border-indigo-400 shadow-md ring-2 ring-indigo-500/5" 
                    : hoveredSentenceId === s.id
                    ? "bg-white border-indigo-200 shadow-sm"
                    : "bg-white border-slate-100 hover:border-slate-200 hover:shadow-sm"
                )}
              >
                {/* Index Badge */}
                <div className="absolute top-0 right-0 p-1">
                  <span className="text-[8px] font-black text-slate-300 px-1.5 py-0.5">#{s.id + 1}</span>
                </div>

                <div className="flex items-center justify-between mb-2">
                  <div className={cn(
                    "px-1.5 py-0.5 rounded text-[9px] font-black tracking-tight",
                    score > 80 ? "bg-emerald-50 text-emerald-600" :
                    score > 60 ? "bg-amber-50 text-amber-600" :
                    "bg-red-50 text-red-600"
                  )}>
                    {score}%
                  </div>
                  {s.scores.unclearScore > 0.5 && <AlertTriangle size={11} className="text-amber-500" />}
                </div>
                <p className="text-[10px] text-slate-600 line-clamp-3 leading-relaxed font-medium italic">
                  "{s.text}"
                </p>
              </div>
            );
          })}
          {filteredSentences.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-[10px] text-slate-400 font-medium italic">No sentences match filters.</p>
            </div>
          )}
        </div>
      </ScrollArea>
      
      <div className="p-3 border-t border-slate-50 bg-slate-50/50 flex items-center justify-center">
        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">
          {filteredSentences.length} sentences flagged
        </span>
      </div>
    </aside>
  );
}
