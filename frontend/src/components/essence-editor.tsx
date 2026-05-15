import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Sparkles, ShieldCheck, Check, X, Loader2, Bold, Italic, 
  RefreshCw, Type, Heading1, Heading2, Heading3, Quote, ChevronDown, 
  Layers, History as HistoryIcon, FileText, Plus, Trash2, Search, 
  Fingerprint
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { ForensicOverlay } from '@/components/forensic-overlay';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';

// NEW API IMPORT
import { api } from '@/services/api';

const TONES = [
  "Standard", "Professional", "Academic", "Blog", 
  "Casual", "Creative", "Scientific", "Technical"
];

interface Document {
  id: string;
  title: string;
  content: string;
  lastModified: number;
}

const ROASTS = [
  "Cookie's crumbled. Check the backend vault.",
  "Session expired. The AI isn't a mind reader.",
  "Auth ghosted you. Check your API connections."
];

export function EssenceEditor() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [currentDocId, setCurrentDocId] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [docScore, setDocScore] = useState<any | null>(null);
  const [isHumanizing, setIsHumanizing] = useState(false);
  const [selection, setSelection] = useState<string>("");
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [suggestionScore, setSuggestionScore] = useState<number | null>(null);
  const [toolbarPos, setToolbarPos] = useState<{ x: number, y: number } | null>(null);
  const [selectedTone, setSelectedTone] = useState("Academic");
  const [searchQuery, setSearchQuery] = useState("");
  const [sessionRoast, setSessionRoast] = useState<string | null>(null);
  
  const editorRef = useRef<HTMLDivElement>(null);
  const scanTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const docs = await api.getDocuments();
        setDocuments(docs);
        if (docs.length > 0 && !currentDocId) {
          setCurrentDocId(docs[0].id);
        } else if (docs.length === 0) {
          createNewDoc();
        }
      } catch (error) {
        console.error("Failed to load documents", error);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (currentDocId && editorRef.current) {
      const activeDoc = documents.find((d: Document) => d.id === currentDocId);
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
    saveTimeoutRef.current = setTimeout(() => saveCurrentDoc(), 1500);
  };

  const saveCurrentDoc = async () => {
    if (!currentDocId || !editorRef.current) return;
    const content = editorRef.current.innerHTML;
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    const h1 = tempDiv.querySelector('h1')?.innerText || "Untitled Project";
    
    const updatedDoc = { id: currentDocId, title: h1, content, lastModified: Date.now() };
    
    setDocuments((prev: Document[]) => {
      const exists = prev.find((d: Document) => d.id === currentDocId);
      if (exists) return prev.map((d: Document) => d.id === currentDocId ? updatedDoc : d);
      return [updatedDoc, ...prev];
    });
    
    try {
        await api.saveDocument(updatedDoc);
    } catch (e) {
        console.error("Failed to save", e);
    }
  };

  const createNewDoc = async () => {
    const newDoc: Document = {
      id: Math.random().toString(36).substring(7),
      title: "Untitled Project",
      content: "<h1>Untitled</h1><p>Start writing human-authentic content...</p>",
      lastModified: Date.now()
    };
    setDocuments((prev: Document[]) => [newDoc, ...prev]);
    setCurrentDocId(newDoc.id);
    setDocScore(null);
    await api.saveDocument(newDoc);
    if (editorRef.current) editorRef.current.innerHTML = newDoc.content;
  };

  const deleteDoc = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDocuments((prev: Document[]) => prev.filter((doc: Document) => doc.id !== id));
    if (currentDocId === id) {
      setCurrentDocId(null);
      if (editorRef.current) editorRef.current.innerHTML = "";
    }
    await api.deleteDocument(id);
  };

  const handleSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.toString().trim().length > 0) {
      const range = sel.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setToolbarPos({ x: rect.left + rect.width / 2, y: rect.top - 60 });
      setSelection(sel.toString());
    } else {
      setToolbarPos(null);
      setSelection("");
    }
  };

  const handleHumanize = async () => {
    const textToHumanize = selection || suggestion;
    if (!textToHumanize) return;
    
    setIsHumanizing(true);
    setSessionRoast(null);
    let pendingSpan = document.querySelector('.highlight-pending-change');
    if (!pendingSpan) {
      const sel = window.getSelection();
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
      setSuggestion(result.humanizedText);
      setSuggestionScore(result.score || null);
    } catch (error) {
      setSessionRoast(ROASTS[Math.floor(Math.random() * ROASTS.length)]);
      const pending = document.querySelector('.highlight-pending-change');
      if (pending) pending.outerHTML = pending.innerHTML;
    } finally {
      setIsHumanizing(false);
    }
  };

  const handleAcceptSuggestion = () => {
    if (!suggestion) return;
    const pending = document.querySelector('.highlight-pending-change');
    if (pending) pending.outerHTML = suggestion;
    setSuggestion(null);
    setSuggestionScore(null);
    setSelection("");
    onInput();
  };

  const handleRejectSuggestion = () => {
    setSuggestion(null);
    const pending = document.querySelector('.highlight-pending-change');
    if (pending) pending.outerHTML = pending.innerHTML;
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return "bg-green-100 text-green-700 border-green-200";
    if (score >= 70) return "bg-yellow-100 text-yellow-700 border-yellow-200";
    if (score >= 50) return "bg-orange-100 text-orange-700 border-orange-200";
    return "bg-red-100 text-red-700 border-red-200";
  };

  const filteredDocs = documents.filter((d: Document) => 
    d.title.toLowerCase().includes(searchQuery.toLowerCase())
  ).sort((a: Document, b: Document) => b.lastModified - a.lastModified);

  return (
    <div className="flex h-screen w-full bg-[#f9fafb]">
      <aside className="w-72 border-r bg-white flex flex-col">
        <div className="p-6">
          <div className="flex flex-col mb-6">
            <h1 className="text-xl font-black text-primary tracking-tighter">SUPAWRITER</h1>
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Writing Forensic Lab</span>
          </div>
          <Button className="w-full justify-start gap-2 bg-primary hover:bg-primary/90 rounded-xl" onClick={createNewDoc}>
            <Plus className="h-4 w-4" /> New Session
          </Button>
        </div>

        <div className="px-6 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input 
              placeholder="Search history..." 
              className="pl-9 bg-muted/50 border-transparent text-xs rounded-lg h-9"
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <ScrollArea className="flex-1 px-3">
          <div className="space-y-1">
            {filteredDocs.map((doc: Document) => (
              <div 
                key={doc.id}
                onClick={() => setCurrentDocId(doc.id)}
                className={cn(
                  "group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all",
                  currentDocId === doc.id ? "bg-accent/10 text-accent font-bold shadow-sm" : "hover:bg-muted/50 text-muted-foreground"
                )}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <FileText className={cn("h-4 w-4 shrink-0", currentDocId === doc.id ? "text-accent" : "text-muted-foreground/50")} />
                  <span className="text-xs truncate">{doc.title}</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 hover:text-red-500 rounded-md"
                  onClick={(e: React.MouseEvent) => deleteDoc(e, doc.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      </aside>

      <main className="flex-1 flex flex-col relative overflow-hidden">
        <header className="h-16 border-b bg-white/50 backdrop-blur flex items-center justify-between px-10 z-30">
          <div className="flex items-center gap-4">
             <HistoryIcon className="h-4 w-4 text-muted-foreground" />
             <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider truncate max-w-[200px]">
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
                      "px-4 py-1.5 h-auto rounded-full text-[10px] font-black border flex items-center gap-3 transition-all",
                      docScore 
                        ? (docScore.classification.includes('HUMAN') ? "bg-green-50 border-green-200 text-green-700 hover:bg-green-100" : "bg-red-50 border-red-200 text-red-700 hover:bg-red-100") 
                        : "bg-muted border-border text-muted-foreground hover:bg-muted/80"
                    )}
                  >
                    {isScanning ? (
                      <Loader2 className="h-3 w-3 animate-spin text-accent" />
                    ) : docScore ? (
                      <ShieldCheck className={cn("h-3.5 w-3.5", docScore.classification.includes('HUMAN') ? "text-green-500" : "text-red-500")} />
                    ) : (
                      <Fingerprint className="h-3.5 w-3.5 text-muted-foreground/50" />
                    )}
                    <span>
                      {isScanning 
                        ? "SCANNING..." 
                        : docScore 
                          ? `${docScore.classification} (${docScore.confidence.toFixed(0)}%)` 
                          : "FORENSIC IDLE (CLICK TO CHECK)"
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
          <div className="max-w-4xl mx-auto py-12 px-10 relative min-h-screen">
            <div className={cn("writing-surface", (isHumanizing || isScanning) && "sparkle-ai shadow-[0_30px_60px_-15px_rgba(0,174,239,0.1)]")}>
              {docScore?.sentences && !isScanning && (
                <ForensicOverlay sentences={docScore.sentences} editorRef={editorRef} />
              )}
              
              <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                className="editor-typo min-h-[75vh] focus:outline-none z-20 relative"
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

        {suggestion && (
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-accent/20 rounded-2xl p-6 w-full max-w-lg animate-in slide-in-from-bottom-8 z-50">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="text-[10px] font-bold text-accent uppercase tracking-widest flex items-center gap-2">
                  <Sparkles className="h-3 w-3" /> Variation Proposed
                </div>
                <div className="flex items-center gap-2">
                  {suggestionScore !== null && (
                    <div className={cn("text-[9px] px-2 py-0.5 rounded-full font-black border", getScoreColor(suggestionScore))}>
                      WH SCORE: {suggestionScore}
                    </div>
                  )}
                  <div className={cn("text-[9px] px-2 py-0.5 rounded-full font-black border uppercase", suggestionScore ? getScoreColor(suggestionScore) : "bg-accent/10 text-accent border-accent/20")}>
                    {selectedTone}
                  </div>
                </div>
              </div>
              <p className="text-base text-foreground font-medium leading-relaxed italic border-l-4 border-accent pl-4">
                "{suggestion}"
              </p>
              <div className="flex items-center justify-between mt-2">
                <Button variant="outline" size="sm" onClick={handleHumanize} disabled={isHumanizing} className="rounded-full h-8 px-4 text-[10px] font-bold">
                  {isHumanizing ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <RefreshCw className="h-3 w-3 mr-1" />}
                  Regenerate
                </Button>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={handleRejectSuggestion} className="rounded-full h-8 px-4 text-[10px] font-bold text-red-600 hover:text-red-700 hover:bg-red-50">
                    <X className="h-3 w-3 mr-1" /> Reject
                  </Button>
                  <Button size="sm" onClick={handleAcceptSuggestion} className="rounded-full bg-accent hover:bg-accent/90 h-8 px-4 text-[10px] font-bold">
                    <Check className="h-3 w-3 mr-1" /> Apply Change
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {toolbarPos && !suggestion && (
          <div 
            className="fixed z-[100] bg-white text-primary rounded-xl shadow-[0_8px_40px_rgb(0,0,0,0.1)] px-2 py-1.5 flex items-center gap-1 animate-in fade-in zoom-in-95 duration-200 border border-border"
            style={{ top: `${toolbarPos.y}px`, left: `${toolbarPos.x}px`, transform: 'translateX(-50%)' }}
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

            <Button variant="ghost" size="sm" className="h-8 px-3 text-[10px] font-black tracking-widest text-accent hover:bg-accent hover:text-white rounded-lg transition-colors" onClick={handleHumanize} disabled={isHumanizing}>
              {isHumanizing ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <Sparkles className="h-3 w-3 mr-2" />}
              HUMANIZE
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}