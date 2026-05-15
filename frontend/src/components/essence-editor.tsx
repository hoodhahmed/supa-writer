import { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Sparkles, ShieldCheck, Check, X, Loader2, Bold, Italic, 
  RefreshCw, Type, Heading1, Heading2, Heading3, Quote, ChevronDown, 
  Layers, History as HistoryIcon, Fingerprint
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { ForensicOverlay } from '@/components/forensic-overlay';
import { ScrollArea } from '@/components/ui/scroll-area';
// Sidebar handles input; no direct Input usage here
import { ParticleEffect } from '@/components/particle-effect';

import { api } from '@/services/api';
import { useDocuments } from '@/features/editor/hooks/useDocuments';
import type { Document as EditorDocument } from '@/types/editor';
import { useEditor } from '@/features/editor/hooks/useEditor';
import { TONES, ROASTS } from '@/features/editor/constants';
import { Sidebar } from '@/features/editor/components/Sidebar';

// TONES and ROASTS moved to features/editor/constants.ts

export function EssenceEditor() {
  const { documents, currentDocId, setCurrentDocId, createNewDoc, deleteDoc, saveCurrentDoc: persistDocument } = useDocuments();
  const editorUI = useEditor();
  const [isScanning, setIsScanning] = useState(false);
  const [docScore, setDocScore] = useState<any | null>(null);
  const [selectedTone, setSelectedTone] = useState('Academic');
  const [searchQuery, setSearchQuery] = useState('');
  const [sessionRoast, setSessionRoast] = useState<string | null>(null);
  
  const editorRef = useRef<HTMLDivElement>(null);
  const scanTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (currentDocId && editorRef.current) {
      const activeDoc = documents.find((d: EditorDocument) => d.id === currentDocId);
      if (activeDoc && editorRef.current.innerHTML !== activeDoc.content) {
        editorRef.current.innerHTML = activeDoc.content;
        setDocScore(null);
      }
    }
  }, [currentDocId]);

  const handleScan = useCallback(async () => {
    const textToScan = editorRef.current?.innerText || "";
    if (!textToScan.trim() || textToScan.length < 5) return;

    setIsScanning(true);
    setSessionRoast(null);
    try {
      const result = await api.getAIScore(textToScan);
      setDocScore(result);
    } catch (error) {
      setSessionRoast(ROASTS[Math.floor(Math.random() * ROASTS.length)]);
    } finally {
      setIsScanning(false);
    }
  }, []);

  const onInput = () => {
    if (docScore) setDocScore(null);
    if (sessionRoast) setSessionRoast(null);
    if (scanTimeoutRef.current) clearTimeout(scanTimeoutRef.current);
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    scanTimeoutRef.current = setTimeout(() => handleScan(), 12000);
    saveTimeoutRef.current = setTimeout(() => persistDocument(currentDocId, editorRef.current), 1500);
  };

  

  const handleSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.toString().trim().length > 0) {
      const range = sel.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      editorUI.setToolbarPos({ x: rect.left + rect.width / 2, y: rect.top - 60 });
      editorUI.setSelection(sel.toString());
    } else {
      editorUI.setToolbarPos(null);
      editorUI.setSelection('');
    }
  };

  const handleHumanize = async () => {
    const textToHumanize = editorUI.selection || editorUI.suggestion;
    if (!textToHumanize) return;

    editorUI.setIsHumanizing(true);
    setSessionRoast(null);
    
    // Get the position of selected text for particle effect
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      editorUI.setParticleEffect({
        text: textToHumanize,
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      });
    }
    
    let pendingSpan = document.querySelector('.highlight-pending-change');
    if (!pendingSpan) {
      if (sel && sel.rangeCount > 0) {
        const range = sel.getRangeAt(0).cloneRange();
        pendingSpan = document.createElement('span');
        pendingSpan.className = 'highlight-pending-change';
        try { range.surroundContents(pendingSpan); } catch {
          document.execCommand('insertHTML', false, `<span class="highlight-pending-change">${textToHumanize}</span>`);
        }
      }
    }

    try {
      const result = await api.humanizeText(textToHumanize, selectedTone);
      editorUI.setSuggestion(result.humanizedText);
      editorUI.setSuggestionScore(result.score || null);
    } catch (error) {
      setSessionRoast(ROASTS[Math.floor(Math.random() * ROASTS.length)]);
      const pending = document.querySelector('.highlight-pending-change');
      if (pending) pending.outerHTML = pending.innerHTML;
    } finally {
      editorUI.setIsHumanizing(false);
    }
  };

  const handleAcceptSuggestion = () => {
    if (!editorUI.suggestion) return;
    const pending = document.querySelector('.highlight-pending-change');
    if (pending) pending.outerHTML = editorUI.suggestion;
    editorUI.setSuggestion(null);
    editorUI.setSuggestionScore(null);
    editorUI.setSelection('');
    onInput();
  };

  const handleRejectSuggestion = () => {
    editorUI.setSuggestion(null);
    const pending = document.querySelector('.highlight-pending-change');
    if (pending) pending.outerHTML = pending.innerHTML;
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return "bg-emerald-50 text-emerald-700 border-emerald-200/60";
    if (score >= 70) return "bg-amber-50 text-amber-700 border-amber-200/60";
    if (score >= 50) return "bg-orange-50 text-orange-700 border-orange-200/60";
    return "bg-rose-50 text-rose-700 border-rose-200/60";
  };

  const filteredDocs = documents.filter((d: any) => 
    d.title.toLowerCase().includes(searchQuery.toLowerCase())
  ).sort((a: any, b: any) => b.lastModified - a.lastModified);

  return (
    <div className="flex h-screen w-full bg-gradient-to-br from-white via-white to-gray-50">
      <Sidebar
        documents={filteredDocs}
        currentDocId={currentDocId}
        onCreate={async () => { const nd = await createNewDoc(); setDocScore(null); if (editorRef.current && nd) editorRef.current.innerHTML = nd.content; }}
        onDelete={deleteDoc}
        onSelect={setCurrentDocId}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      <main className="flex-1 flex flex-col relative overflow-hidden bg-gradient-to-b from-white/80 to-white/40">
        <header className="h-16 border-b border-gray-200/50 bg-white/50 backdrop-blur-md flex items-center justify-between px-10 z-30 shadow-sm">
          <div className="flex items-center gap-4">
             <HistoryIcon className="h-4 w-4 text-primary/60" />
             <span className="text-xs font-semibold text-foreground/70 uppercase tracking-wider truncate max-w-[200px]">
               {documents.find(d => d.id === currentDocId)?.title || "Select a Project"}
             </span>
          </div>

          <div className="flex items-center gap-6">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    onClick={handleScan}
                    disabled={isScanning}
                    className={cn(
                      "px-4 py-1.5 h-auto rounded-full text-[10px] font-semibold border flex items-center gap-3 transition-all duration-300 shadow-sm hover:shadow-md",
                      docScore 
                        ? (docScore.classification.includes('HUMAN') ? "bg-emerald-50 border-emerald-200/60 text-emerald-700 hover:bg-emerald-100/80 hover:shadow-emerald-200/50" : "bg-rose-50 border-rose-200/60 text-rose-700 hover:bg-rose-100/80 hover:shadow-rose-200/50") 
                        : "bg-gray-50 border-gray-200/60 text-gray-600 hover:bg-gray-100/80 hover:shadow-gray-200/50"
                    )}
                  >
                    {isScanning ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-accent" />
                    ) : docScore ? (
                      <ShieldCheck className={cn("h-3.5 w-3.5", docScore.classification.includes('HUMAN') ? "text-emerald-500" : "text-rose-500")} />
                    ) : (
                      <Fingerprint className="h-3.5 w-3.5 text-gray-400/70" />
                    )}
                    <span className="font-medium">
                      {isScanning 
                        ? "SCANNING..." 
                        : docScore 
                          ? `${docScore.classification} (${docScore.confidence.toFixed(0)}%)` 
                          : "FORENSIC IDLE"
                      }
                    </span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">{docScore?.feedback || "Click to manually initiate a forensic AI check"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </header>

        <ScrollArea className="flex-1">
          <div className="max-w-4xl mx-auto py-16 px-10 relative min-h-screen">
            <div className={cn("writing-surface rounded-2xl transition-all duration-500", (editorUI.isHumanizing || isScanning) && "sparkle-ai shadow-[0_40px_80px_-20px_rgba(10,174,239,0.15)] ring-1 ring-accent/10")}>
              {docScore?.sentences && !isScanning && (
                <ForensicOverlay sentences={docScore.sentences} editorRef={editorRef} />
              )}
              
              <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                className="editor-typo min-h-[75vh] focus:outline-none z-20 relative px-8 py-8"
                onMouseUp={handleSelection}
                onInput={onInput}
                onPaste={(e) => {
                  e.preventDefault();
                  const text = e.clipboardData.getData('text/plain');
                  document.execCommand('insertText', false, text);
                  onInput();
                }}
              />
            </div>
          </div>
        </ScrollArea>

        {editorUI.suggestion && (
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-white/98 backdrop-blur-xl shadow-[0_25px_70px_rgba(0,0,0,0.18)] border border-accent/15 rounded-2xl p-6 w-full max-w-lg animate-in slide-in-from-bottom-8 z-50 ring-1 ring-white/50">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="text-[10px] font-bold text-accent uppercase tracking-widest flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5" /> Variation Proposed
                </div>
                <div className="flex items-center gap-2">
                  {editorUI.suggestionScore !== null && (
                    <div className={cn("text-[9px] px-2.5 py-1 rounded-full font-semibold border transition-all", getScoreColor(editorUI.suggestionScore || 0))}>
                      WH SCORE: {editorUI.suggestionScore}
                    </div>
                  )}
                  <div className={cn("text-[9px] px-2.5 py-1 rounded-full font-semibold border uppercase transition-all", editorUI.suggestionScore ? getScoreColor(editorUI.suggestionScore) : "bg-accent/10 text-accent border-accent/20")}>
                    {selectedTone}
                  </div>
                </div>
              </div>
              <p className="text-base text-foreground font-medium leading-relaxed italic border-l-4 border-accent/40 pl-4 text-gray-700">
                "{editorUI.suggestion}"
              </p>
              <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100/50">
                <Button variant="outline" size="sm" onClick={handleHumanize} disabled={editorUI.isHumanizing} className="rounded-full h-9 px-4 text-[10px] font-semibold transition-all hover:shadow-md">
                  {editorUI.isHumanizing ? <Loader2 className="h-3 w-3 animate-spin mr-1.5" /> : <RefreshCw className="h-3 w-3 mr-1.5" />}
                  Regenerate
                </Button>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={handleRejectSuggestion} className="rounded-full h-9 px-4 text-[10px] font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50/80 transition-all">
                    <X className="h-3 w-3 mr-1.5" /> Reject
                  </Button>
                  <Button size="sm" onClick={handleAcceptSuggestion} className="rounded-full bg-gradient-to-r from-accent to-accent/80 hover:shadow-lg hover:shadow-accent/30 h-9 px-4 text-[10px] font-semibold text-white transition-all">
                    <Check className="h-3 w-3 mr-1.5" /> Apply Change
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {editorUI.toolbarPos && !editorUI.suggestion && (
          <div 
            className="fixed z-[100] bg-white/95 backdrop-blur-md text-foreground rounded-xl shadow-[0_12px_50px_rgba(0,0,0,0.15)] px-2 py-1.5 flex items-center gap-1 animate-in fade-in zoom-in-95 duration-200 border border-white/80 ring-1 ring-black/5 hover:shadow-[0_16px_60px_rgba(0,0,0,0.2)] transition-all"
            style={{ top: `${editorUI.toolbarPos?.y}px`, left: `${editorUI.toolbarPos?.x}px`, transform: 'translateX(-50%)' }}
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 px-2 text-xs font-bold gap-1">
                  <Type className="h-3.5 w-3.5" /> Block <ChevronDown className="h-3 w-3 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-44 rounded-xl p-1 shadow-2xl">
                <DropdownMenuItem className="gap-2 rounded-lg py-2" onClick={() => document.execCommand('formatBlock', false, 'p')}>
                  <Type className="h-3.5 w-3.5" /> <span className="text-xs font-medium">Text</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2 rounded-lg py-2" onClick={() => document.execCommand('formatBlock', false, 'h1')}>
                   <Heading1 className="h-3.5 w-3.5" /> <span className="text-xs font-medium">Heading 1</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2 rounded-lg py-2" onClick={() => document.execCommand('formatBlock', false, 'h2')}>
                   <Heading2 className="h-3.5 w-3.5" /> <span className="text-xs font-medium">Heading 2</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2 rounded-lg py-2" onClick={() => document.execCommand('formatBlock', false, 'h3')}>
                   <Heading3 className="h-3.5 w-3.5" /> <span className="text-xs font-medium">Heading 3</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2 rounded-lg py-2" onClick={() => document.execCommand('formatBlock', false, 'blockquote')}>
                   <Quote className="h-3.5 w-3.5" /> <span className="text-xs font-medium">Quote</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="w-[1px] h-4 bg-border mx-1" />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 px-2 text-xs font-bold gap-1 text-accent">
                      <Layers className="h-3.5 w-3.5" /> {selectedTone} <ChevronDown className="h-3 w-3 opacity-50" />
                    </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-44 rounded-xl p-1 shadow-2xl">
                <DropdownMenuLabel className="text-[9px] font-black uppercase tracking-widest text-muted-foreground px-3 py-2">Select Voice Tone</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {TONES.map(t => (
                  <DropdownMenuItem key={t} className="gap-2 rounded-lg py-2" onClick={() => setSelectedTone(t)}>
                    <span className={cn("text-xs font-medium", selectedTone === t && "text-accent font-bold")}>{t}</span>
                    {selectedTone === t && <Check className="h-3 w-3 ml-auto text-accent" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="w-[1px] h-4 bg-border mx-1" />

            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => document.execCommand('bold')}>
              <Bold className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => document.execCommand('italic')}>
              <Italic className="h-3.5 w-3.5" />
            </Button>

            <div className="w-[1px] h-4 bg-border mx-1" />

            <Button variant="ghost" size="sm" className="h-8 px-3 text-[10px] font-semibold tracking-wider text-accent hover:bg-accent hover:text-white rounded-lg transition-all duration-200" onClick={handleHumanize} disabled={editorUI.isHumanizing}>
              {editorUI.isHumanizing ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <Sparkles className="h-3 w-3 mr-2" />}
              HUMANIZE
            </Button>
          </div>
        )}

        {editorUI.particleEffect && (
          <ParticleEffect
            text={editorUI.particleEffect.text}
            startX={editorUI.particleEffect.x}
            startY={editorUI.particleEffect.y}
            onComplete={() => editorUI.setParticleEffect(null)}
          />
        )}
      </main>
    </div>
  );
}