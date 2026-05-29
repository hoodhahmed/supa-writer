import { LogOut, Plus, Sparkles, LayoutGrid, Search, RotateCcw, Sliders, AlignJustify, X } from 'lucide-react';
import { useState } from 'react';
import { SignInForm } from '@/components/auth/SignInForm';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/services/useAuth';
import { SaveStatus } from './SaveStatus';
import { cn } from '@/lib/utils';

interface NotebookHeaderProps {
  onCreate?: () => unknown;
  onScan?: () => void;
  onQuillBotCheck?: () => void;
  onGrammarlyFullScan?: () => void;
  onToneScan?: () => void;
  onResetCache?: () => void;
  onToggleInspection?: () => void;
  showInspectionMode?: boolean;
  hasQualityData?: boolean;
  qualityScoreMode?: 'sentence' | 'paragraph';
  setQualityScoreMode?: (mode: 'sentence' | 'paragraph') => void;
  docScore?: any;
  saved?: boolean;
}

export function NotebookHeader({ 
  onCreate, onScan, onQuillBotCheck, onGrammarlyFullScan, onToneScan, onResetCache, 
  onToggleInspection, showInspectionMode, hasQualityData, 
  qualityScoreMode, setQualityScoreMode,
  docScore, saved 
}: NotebookHeaderProps) {
  const [openAuth, setOpenAuth] = useState(false);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
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
              onClick={onQuillBotCheck}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-blue-200 bg-blue-50 text-blue-600 text-[10px] font-black uppercase hover:bg-blue-100 transition-all hover:scale-105 active:scale-95"
              title="QuillBot AI Content Detector"
            >
              <Sparkles size={10} strokeWidth={3} />
              QuillBot Check
            </button>

            <button 
              onClick={onGrammarlyFullScan}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase hover:bg-emerald-100 transition-all hover:scale-105 active:scale-95"
              title="Full Grammarly AI Check (Paragraphs)"
            >
              <Search size={10} strokeWidth={3} />
              Grammarly Check
            </button>

            <div className="relative">
              <button 
                onClick={() => setShowQualityMenu(!showQualityMenu)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-black uppercase transition-all hover:scale-105 active:scale-95",
                  showQualityMenu ? "bg-indigo-600 text-white border-indigo-700 shadow-md" : "border-indigo-200 bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                )}
                title="Choose Quality Check Granularity"
              >
                <Sliders size={10} strokeWidth={3} />
                Quality Check
              </button>

              {showQualityMenu && (
                <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-48 bg-white border border-slate-200 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.1)] p-2 z-[100] animate-in fade-in zoom-in-95 duration-200">
                  <div className="px-2 py-1.5 mb-1 text-center border-b border-slate-50">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Analysis Mode</span>
                  </div>
                  <button 
                    onClick={() => {
                      setQualityScoreMode?.('sentence');
                      setShowQualityMenu(false);
                      onToneScan?.();
                    }}
                    className={cn(
                      "w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all",
                      qualityScoreMode === 'sentence' ? "bg-indigo-50 text-indigo-600" : "text-slate-600 hover:bg-slate-50"
                    )}
                  >
                    <LayoutGrid size={14} className={qualityScoreMode === 'sentence' ? "text-indigo-500" : "text-slate-400"} />
                    Sentence-wise
                  </button>
                  <button 
                    onClick={() => {
                      setQualityScoreMode?.('paragraph');
                      setShowQualityMenu(false);
                      onToneScan?.();
                    }}
                    className={cn(
                      "w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all",
                      qualityScoreMode === 'paragraph' ? "bg-indigo-50 text-indigo-600" : "text-slate-600 hover:bg-slate-50"
                    )}
                  >
                    <AlignJustify size={14} className={qualityScoreMode === 'paragraph' ? "text-indigo-500" : "text-slate-400"} />
                    Paragraph-wise
                  </button>
                </div>
              )}
            </div>

            {hasQualityData && (
              <button 
                onClick={onToggleInspection}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-black uppercase transition-all hover:scale-105 active:scale-95",
                  showInspectionMode 
                    ? "bg-indigo-600 text-white border-indigo-700 shadow-lg shadow-indigo-200" 
                    : "bg-white text-indigo-600 border-indigo-100"
                )}
                title={showInspectionMode ? "Close Inspection Sidebar" : "Open Inspection Sidebar"}
              >
                <LayoutGrid size={10} strokeWidth={3} />
                {showInspectionMode ? "Close Panel" : "Inspect"}
              </button>
            )}

            <button 
              onClick={onResetCache}
              className="flex items-center justify-center w-8 h-8 rounded-full border border-slate-200 bg-white text-slate-400 hover:text-red-500 hover:border-red-200 transition-all active:scale-90"
              title="Reset AI Cache & Results"
            >
              <RotateCcw size={12} strokeWidth={3} />
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
