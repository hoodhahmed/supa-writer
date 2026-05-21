import { useState, useRef, useCallback, useEffect, type ClipboardEvent, type ComponentType } from 'react';
import { ParticleEffect } from '@/components/particle-effect';

import '@/assets/editor.css';
import { api } from '@/services/api';
import { useToast } from '@/hooks/useToast';
import { useDocuments } from '@/features/editor/hooks/useDocuments';
import { useEditor } from '@/features/editor/hooks/useEditor';
import { NotebookHeader } from '@/features/editor/components/NotebookHeader';
import { NotebookCanvas } from '@/features/editor/components/NotebookCanvas';
import SuggestionPanel from '@/features/editor/components/SuggestionPanel';
import { EditorContent } from '@/features/editor/components/EditorContent';
import { Sidebar } from '@/features/editor/components/Sidebar';
import FloatingToolbar from '@/features/editor/components/FloatingToolbar';

function textToHtmlFragment(text: string) {
  const fragment = document.createDocumentFragment();
  const paragraphs = text.trim().split(/\n{2,}/).filter(Boolean);

  if (paragraphs.length === 0) {
    fragment.appendChild(document.createTextNode(text));
    return fragment;
  }

  paragraphs.forEach((paragraph, paragraphIndex) => {
    if (paragraphIndex > 0) {
      fragment.appendChild(document.createElement('br'));
      fragment.appendChild(document.createElement('br'));
    }

    paragraph.split(/\n/).forEach((line, lineIndex) => {
      if (lineIndex > 0) fragment.appendChild(document.createElement('br'));
      fragment.appendChild(document.createTextNode(line));
    });
  });

  return fragment;
}

export function EssenceEditor() {
  const SuggestionPanelAny = SuggestionPanel as unknown as ComponentType<any>;
  const { toast } = useToast();
  
  // 1. All Hooks & State at the top
  const { documents, currentDocId, saveCurrentDoc: persistDocument, createNewDoc, deleteDoc, setCurrentDocId, loading: docsLoading } = useDocuments();
  
  const {
    selection: editorSelection,
    setSelection: setEditorSelection,
    toolbarPos,
    setToolbarPos,
    isHumanizing,
    setIsHumanizing,
    selectedTone,
    setSelectedTone,
    particleEffect,
    setParticleEffect
  } = useEditor();

  const [isScanning, setIsScanning] = useState(false);
  const [isGrammarlyChecking, setIsGrammarlyChecking] = useState(false);
  const [isQuillBotChecking, setIsQuillBotChecking] = useState(false);

  // Persistent cache using localStorage
  const aiCache = useRef<Map<string, any>>(new Map());

  useEffect(() => {
    try {
      const saved = localStorage.getItem('ai_results_cache');
      if (saved) {
        const parsed = JSON.parse(saved);
        aiCache.current = new Map(Object.entries(parsed));
      }
    } catch (e) {
      console.error('Failed to load AI cache', e);
    }
  }, []);

  const saveCache = useCallback(() => {
    try {
      const obj = Object.fromEntries(aiCache.current.entries());
      localStorage.setItem('ai_results_cache', JSON.stringify(obj));
    } catch (e) {
      console.error('Failed to save AI cache', e);
    }
  }, []);

  const handleResetCache = useCallback(() => {
    aiCache.current.clear();
    localStorage.removeItem('ai_results_cache');
    setDocScore(null);
    setGrammarlyScore(null);
    setQuillbotScore(null);
    setFullGrammarlyResults(null);
    setFullQuillBotResults(null);
    toast("AI Cache and results cleared.", "success");
  }, [toast]);

  const [docScore, setDocScore] = useState<any | null>(null);
  const [grammarlyScore, setGrammarlyScore] = useState<any | null>(null);
  const [quillbotScore, setQuillbotScore] = useState<any | null>(null);
  const [fullGrammarlyResults, setFullGrammarlyResults] = useState<any[] | null>(null);
  const [fullQuillBotResults, setFullQuillBotResults] = useState<any[] | null>(null);
  const [fullToneResults, setFullToneResults] = useState<any[] | null>(null);
  const [selectionOffset, setSelectionOffset] = useState<number>(0);
  const [isSaved, setIsSaved] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [versions, setVersions] = useState<any[]>([]);
  const [versionIndex, setVersionIndex] = useState(0);
  const [showSuggestionPanel, setShowSuggestionPanel] = useState(false);

  const editorRef = useRef<HTMLDivElement>(null);
  const selectionRangeRef = useRef<Range | null>(null);
  const scanTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 2. Callbacks (Ordered correctly to avoid TDZ)
  
  const handleQuillBotFullScan = useCallback(async () => {
    if (!editorRef.current) return;
    
    setIsQuillBotChecking(true);
    // Don't clear results here to allow surgical updates

    try {
      const editor = editorRef.current;
      const paragraphs: { text: string; offset: number }[] = [];
      
      let cumulativeOffset = 0;
      const textNodes: Text[] = [];
      const walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT, null);
      let node;
      while ((node = walker.nextNode())) {
        textNodes.push(node as Text);
      }
      const fullText = textNodes.map(n => n.textContent || '').join('');

      const blockElements = editor.querySelectorAll('p, div, blockquote');
      blockElements.forEach((el) => {
        const text = el.textContent?.trim() || '';
        const isHeading = /h[1-6]/i.test(el.tagName);
        const isReference = text.toLowerCase().includes('reference') || text.toLowerCase().startsWith('[');
        
        if (text.length > 20 && !isHeading && !isReference) {
          const idx = fullText.indexOf(text, cumulativeOffset);
          if (idx !== -1) {
            paragraphs.push({ text, offset: idx });
            cumulativeOffset = idx + text.length;
          }
        }
      });

      if (paragraphs.length === 0) {
        setIsQuillBotChecking(false);
        return;
      }

      // Check how many are actually new (dirty)
      const dirtyParagraphs = paragraphs.filter(p => !aiCache.current.has(`quillbot:${p.text}`));
      
      if (dirtyParagraphs.length > 0) {
        toast(`QuillBot: Scanning ${dirtyParagraphs.length} new sections (Total: ${paragraphs.length})...`, "info");
      }

      const CONCURRENCY_LIMIT = 15;
      const scanResults: any[] = [];
      
      for (let i = 0; i < paragraphs.length; i += CONCURRENCY_LIMIT) {
        const chunk = paragraphs.slice(i, i + CONCURRENCY_LIMIT);
        
        const chunkResults = await Promise.all(
          chunk.map(async (p) => {
            if (aiCache.current.has(`quillbot:${p.text}`)) {
              return { ...aiCache.current.get(`quillbot:${p.text}`), offset: p.offset, text: p.text };
            }
            try {
              const res = await api.getQuillBotScore(p.text);
              aiCache.current.set(`quillbot:${p.text}`, res);
              saveCache();
              return { ...res, offset: p.offset, text: p.text };
            } catch (e) {
              console.error('QuillBot paragraph scan failed', e);
              return null;
            }
          })
        );
        scanResults.push(...chunkResults);
      }

      const validResults = scanResults.filter(Boolean);
      setFullQuillBotResults(validResults);
      
      const totalAI = validResults.filter(r => (r.data?.value?.aiScore || 0) > 0.5).length;
      
      // Only toast completion if we actually did a scan
      if (dirtyParagraphs.length > 0) {
        toast(`QuillBot scan complete. Found AI in ${totalAI}/${paragraphs.length} sections.`, totalAI > 0 ? "error" : "success");
      }

    } catch (error) {
      console.error('Full QuillBot scan failed:', error);
    } finally {
      setIsQuillBotChecking(false);
    }
  }, [saveCache]);

  const handleGrammarlyFullScan = useCallback(async () => {
    if (!editorRef.current) return;
    
    setIsGrammarlyChecking(true);
    // Don't clear results here to allow surgical updates

    try {
      const editor = editorRef.current;
      const paragraphs: { text: string; offset: number }[] = [];
      
      let cumulativeOffset = 0;
      const textNodes: Text[] = [];
      const walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT, null);
      let node;
      while ((node = walker.nextNode())) {
        textNodes.push(node as Text);
      }
      const fullText = textNodes.map(n => n.textContent || '').join('');

      const blockElements = editor.querySelectorAll('p, div, blockquote');
      blockElements.forEach((el) => {
        const text = el.textContent?.trim() || '';
        const isHeading = /h[1-6]/i.test(el.tagName);
        const isReference = text.toLowerCase().includes('reference') || text.toLowerCase().startsWith('[');
        
        if (text.length > 20 && !isHeading && !isReference) {
          const idx = fullText.indexOf(text, cumulativeOffset);
          if (idx !== -1) {
            paragraphs.push({ text, offset: idx });
            cumulativeOffset = idx + text.length;
          }
        }
      });

      if (paragraphs.length === 0) {
        setIsGrammarlyChecking(false);
        return;
      }

      // Check how many are actually new (dirty)
      const dirtyParagraphs = paragraphs.filter(p => !aiCache.current.has(`grammarly:${p.text}`));

      if (dirtyParagraphs.length > 0) {
        toast(`Grammarly: Scanning ${dirtyParagraphs.length} new sections (Total: ${paragraphs.length})...`, "info");
      }

      const CONCURRENCY_LIMIT = 15;
      const scanResults: any[] = [];
      
      for (let i = 0; i < paragraphs.length; i += CONCURRENCY_LIMIT) {
        const chunk = paragraphs.slice(i, i + CONCURRENCY_LIMIT);
        
        const chunkResults = await Promise.all(
          chunk.map(async (p) => {
            if (aiCache.current.has(`grammarly:${p.text}`)) {
              return { ...aiCache.current.get(`grammarly:${p.text}`), offset: p.offset, text: p.text };
            }
            try {
              const res = await api.getGrammarlyScore(p.text);
              aiCache.current.set(`grammarly:${p.text}`, res);
              saveCache();
              return { ...res, offset: p.offset, text: p.text };
            } catch (e) {
              console.error('Paragraph scan failed', e);
              return null;
            }
          })
        );
        scanResults.push(...chunkResults);
      }

      const validResults = scanResults.filter(Boolean);
      setFullGrammarlyResults(validResults);
      
      const totalAI = validResults.filter(r => r.score > 50).length;
      
      // Only toast completion if we actually did a scan
      if (dirtyParagraphs.length > 0) {
        toast(`Grammarly scan complete. Found AI in ${totalAI}/${paragraphs.length} sections.`, totalAI > 0 ? "error" : "success");
      }

    } catch (error) {
      console.error('Full scan failed:', error);
      toast("Failed to perform full Grammarly scan.", "error");
    } finally {
      setIsGrammarlyChecking(false);
    }
  }, [saveCache]);

  const handleInput = useCallback(() => {
    setIsSaved(false);
    
    if (scanTimeoutRef.current) clearTimeout(scanTimeoutRef.current);
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    
    scanTimeoutRef.current = setTimeout(() => {
      void handleQuillBotFullScan();
      void handleGrammarlyFullScan();
    }, 15000);

    saveTimeoutRef.current = setTimeout(() => {
      persistDocument(currentDocId, editorRef.current);
      setIsSaved(true);
    }, 1500);
  }, [currentDocId, persistDocument, handleQuillBotFullScan, handleGrammarlyFullScan]);

  const handleScan = useCallback(async () => {
    const textToScan = editorRef.current?.innerText || "";
    if (!textToScan.trim() || textToScan.length < 5) return;
    setIsScanning(true);
    try {
      const result = await api.getAIScore(textToScan);
      setDocScore(result);
    } catch (error) {
      console.error('Failed to scan document:', error);
    } finally {
      setIsScanning(false);
    }
  }, []);

  const handleQuillBotCheck = useCallback(async () => {
    const textToCheck = (editorSelection || '').trim();
    if (!textToCheck) return;

    setIsQuillBotChecking(true);
    setQuillbotScore(null);
    setGrammarlyScore(null);
    const offsetAtTrigger = selectionOffset;
    try {
      const result = await api.getQuillBotScore(textToCheck);
      setQuillbotScore({ ...result, offset: offsetAtTrigger });
      const score = Math.round((result.data?.value?.aiScore || 0) * 100);
      toast(
        `QuillBot AI Score: ${score}%`,
        score > 50 ? "error" : "success"
      );
    } catch (error) {
      console.error('Failed QuillBot AI check:', error);
      toast("Failed to perform QuillBot AI check.", "error");
    } finally {
      setIsQuillBotChecking(false);
      setToolbarPos(null);
      setEditorSelection('');
    }
  }, [editorSelection, selectionOffset, toast, setToolbarPos, setEditorSelection]);

  const handleGrammarlyCheck = useCallback(async () => {
    const textToCheck = (editorSelection || '').trim();
    if (!textToCheck) return;

    setIsGrammarlyChecking(true);
    setGrammarlyScore(null);
    setQuillbotScore(null);
    const offsetAtTrigger = selectionOffset;
    try {
      const result = await api.getGrammarlyScore(textToCheck);
      setGrammarlyScore({ ...result, offset: offsetAtTrigger });
      toast(
        `AI Probability Score: ${result.score}%`,
        result.score > 50 ? "error" : "success"
      );
    } catch (error) {
      console.error('Failed Grammarly AI check:', error);
      toast("Failed to perform Grammarly AI check.", "error");
    } finally {
      setIsGrammarlyChecking(false);
      setToolbarPos(null);
      setEditorSelection('');
    }
  }, [editorSelection, selectionOffset, toast, setToolbarPos, setEditorSelection]);

  const handlePaste = (e: ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const html = e.clipboardData.getData('text/html');
    const text = e.clipboardData.getData('text/plain');

    if (html) {
      const cleanHtml = html
        .replace(/<o:p>.*?<\/o:p>/g, '') 
        .replace(/(?:style|class)="[^"]*"/g, (match) => {
          if (match.includes('text-align')) {
            const alignMatch = match.match(/text-align\s*:\s*([^;"]+)/);
            if (alignMatch) return `style="text-align: ${alignMatch[1]}"`;
          }
          return '';
        })
        .replace(/<span[^>]*>/g, '')
        .replace(/<\/span>/g, '');

      document.execCommand('insertHTML', false, cleanHtml);
    } else {
      document.execCommand('insertText', false, text);
    }
    handleInput();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleInput();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleInput]);

  const handleSelection = useCallback(() => {
    if (showSuggestionPanel) return;

    const sel = window.getSelection();
    if (sel && sel.toString().trim().length > 0) {
      const isInsideEditor = editorRef.current?.contains(sel.anchorNode);
      if (isInsideEditor && editorRef.current) {
        const range = sel.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        
        let offset = 0;
        const preRange = document.createRange();
        preRange.selectNodeContents(editorRef.current);
        preRange.setEnd(range.startContainer, range.startOffset);
        offset = preRange.toString().length;

        setSelectionOffset(offset);
        setToolbarPos({ x: rect.left + rect.width / 2, y: rect.top });
        setEditorSelection(sel.toString());
      }
    } else {
      if (!isHumanizing) {
        setToolbarPos(null);
        setEditorSelection('');
      }
    }
  }, [isHumanizing, showSuggestionPanel, setToolbarPos, setEditorSelection]);

  useEffect(() => {
    const onSelectionChange = () => { handleSelection(); };
    document.addEventListener('selectionchange', onSelectionChange);
    return () => { document.removeEventListener('selectionchange', onSelectionChange); };
  }, [handleSelection]);

  const handleHumanize = useCallback(async () => {
    if (!editorRef.current || isHumanizing) return;
    const selectedText = (editorSelection || '').trim();
    if (!selectedText) return;
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    selectionRangeRef.current = selection.getRangeAt(0).cloneRange();

    setIsHumanizing(true);
    try {
      const result = await api.humanizeText(selectedText, selectedTone);
      const humanizedText = result?.humanizedText?.trim() || selectedText;
      const wh_score = result?.score ?? null;
      const tone_scores = result?.tone ?? null;

      setVersions((prev: any[]) => {
        const next = [{ text: humanizedText, score: wh_score, tone: tone_scores }, ...prev];
        return next.slice(0, 8);
      });
      setVersionIndex(0);
      setShowSuggestionPanel(true);
    } catch (error) {
      console.error('Failed to humanize text:', error);
    } finally {
      setIsHumanizing(false);
    }
  }, [editorSelection, isHumanizing, selectedTone]);

  const handleToneCheck = useCallback(async () => {
    const textToCheck = (editorSelection || '').trim();
    if (!textToCheck) return;

    setIsScanning(true);
    try {
      const result = await api.getToneAnalysis(textToCheck);
      const tone = result.data?.averageScore;
      if (tone) {
        const top = Object.entries(tone).reduce((a: any, b: any) => a[1] > b[1] ? a : b);
        toast(`Tone Detected: ${top[0].toUpperCase()} (${Math.round(top[1] * 100)}%)`, "info");
      }
    } catch (error) {
      console.error('Tone check failed', error);
      toast("Failed to analyze tone.", "error");
    } finally {
      setIsScanning(false);
      setToolbarPos(null);
      setEditorSelection('');
    }
  }, [editorSelection, toast]);

  const handleToneFullScan = useCallback(async () => {
    if (!editorRef.current) return;
    setIsScanning(true);
    try {
      const editor = editorRef.current;
      const paragraphs: { text: string; offset: number }[] = [];
      let cumulativeOffset = 0;
      const textNodes: Text[] = [];
      const walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT, null);
      let node;
      while ((node = walker.nextNode())) { textNodes.push(node as Text); }
      const fullText = textNodes.map(n => n.textContent || '').join('');

      const blockElements = editor.querySelectorAll('p, div, blockquote');
      blockElements.forEach((el) => {
        const text = el.textContent?.trim() || '';
        if (text.length > 20 && !/h[1-6]/i.test(el.tagName)) {
          const idx = fullText.indexOf(text, cumulativeOffset);
          if (idx !== -1) {
            paragraphs.push({ text, offset: idx });
            cumulativeOffset = idx + text.length;
          }
        }
      });

      if (paragraphs.length === 0) return;
      toast(`Analyzing tone for ${paragraphs.length} paragraphs...`, "info");

      const results = await Promise.all(
        paragraphs.map(async (p) => {
          try {
            const res = await api.getToneAnalysis(p.text);
            return { tone: res.data?.averageScore, offset: p.offset, text: p.text };
          } catch { return null; }
        })
      );
      setFullToneResults(results.filter(Boolean));
      toast("Tone analysis complete.", "success");
    } catch (error) {
      console.error('Tone scan failed', error);
    } finally {
      setIsScanning(false);
    }
  }, [toast]);

  useEffect(() => {
    if (versions.length === 0 && showSuggestionPanel) {
      setShowSuggestionPanel(false);
    }
  }, [versions, showSuggestionPanel]);

  const applyVersion = useCallback((index: number) => {
    const v = versions[index];
    if (!v) return;

    const oldText = (editorSelection || '');
    const newText = v.text;
    const offset = selectionOffset;

    try {
      const range = selectionRangeRef.current;
      if (range) {
        range.deleteContents();
        range.insertNode(textToHtmlFragment(newText));
      } else {
        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0) {
          const r = sel.getRangeAt(0);
          r.deleteContents();
          r.insertNode(textToHtmlFragment(newText));
          sel.removeAllRanges();
        }
      }
    } catch (e) {
      console.error('Failed to apply version:', e);
    }

    const shiftResults = (results: any[] | null) => {
      if (!results) return null;
      const diff = newText.length - oldText.length;
      const rangeEnd = offset + oldText.length;
      return results
        .filter(res => !(res.offset >= offset && res.offset < rangeEnd))
        .map(res => {
          if (res.offset >= rangeEnd) return { ...res, offset: res.offset + diff };
          return res;
        });
    };

    setFullGrammarlyResults(prev => shiftResults(prev));
    setFullQuillBotResults(prev => shiftResults(prev));
    setGrammarlyScore(null);
    setQuillbotScore(null);
    
    setShowSuggestionPanel(false);
    setVersions([]);
    setVersionIndex(0);
    setEditorSelection('');
    setToolbarPos(null);
    handleInput();
  }, [versions, editorSelection, selectionOffset, handleInput]);

  const rejectVersions = useCallback(() => {
    setShowSuggestionPanel(false);
    setVersions([]);
    setVersionIndex(0);
    setEditorSelection('');
    setToolbarPos(null);
    setQuillbotScore(null);
  }, [setEditorSelection, setToolbarPos]);

  const regenerateVersion = useCallback(async (index: number) => {
    const base = versions[index];
    if (!base) return;
    setIsHumanizing(true);
    try {
      const result = await api.humanizeText(base.text, selectedTone);
      const humanizedText = result?.humanizedText?.trim() || base.text;
      const wh_score = result?.score ?? null;
      const tone_scores = result?.tone ?? null;

      setVersions((prev: any[]) => [{ text: humanizedText, score: wh_score, tone: tone_scores }, ...prev].slice(0, 8));
      setVersionIndex(0);
    } catch (e) {
      console.error('Regenerate failed', e);
    } finally {
      setIsHumanizing(false);
    }
  }, [versions, selectedTone]);

  const prevVersion = useCallback(() => {
    setVersionIndex((i: number) => Math.max(0, i - 1));
  }, []);

  const nextVersion = useCallback(() => {
    setVersionIndex((i: number) => Math.min(versions.length - 1, i + 1));
  }, [versions.length]);

  if (docsLoading) {
    return (
      <div className="napkin-app h-screen w-screen flex flex-col">
        <NotebookHeader onCreate={createNewDoc} onScan={handleScan} docScore={docScore} saved={isSaved} />
        <div className="flex-1 flex items-center justify-center bg-[#F4F8FB]">
          <div className="auth-spinner" />
        </div>
      </div>
    );
  }

  const filteredDocs = documents.filter((d: any) =>
    (d.title || '').toLowerCase().includes((searchQuery || '').toLowerCase())
  );

  return (
    <div className="napkin-app h-screen overflow-hidden">
      <NotebookHeader 
        onCreate={createNewDoc} 
        onScan={handleScan} 
        onQuillBotCheck={handleQuillBotFullScan}
        onGrammarlyFullScan={handleGrammarlyFullScan}
        onToneScan={handleToneFullScan}
        onResetCache={handleResetCache}
        docScore={docScore} 
        saved={isSaved} 
      />

      <div className="napkin-body overflow-hidden">
        <Sidebar
          documents={filteredDocs}
          currentDocId={currentDocId}
          onCreate={createNewDoc}
          onDelete={deleteDoc}
          onSelect={setCurrentDocId}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        <main className="napkin-main">
          <NotebookCanvas isRewriting={isHumanizing} isScanning={isScanning || isGrammarlyChecking || isQuillBotChecking}>
            <EditorContent
              ref={editorRef}
              currentDocId={currentDocId}
              documents={documents}
              docScore={docScore}
              grammarlyScore={grammarlyScore}
              quillbotScore={quillbotScore}
              fullGrammarlyResults={fullGrammarlyResults}
              fullQuillBotResults={fullQuillBotResults}
              fullToneResults={fullToneResults}
              isScanning={isScanning}
              onSelection={handleSelection}
              onInput={handleInput}
              onPaste={handlePaste}
            />
          </NotebookCanvas>

          {toolbarPos && editorSelection ? (
            <FloatingToolbar
              x={toolbarPos.x}
              y={toolbarPos.y}
              onHumanize={() => { void handleHumanize(); }}
              onGrammarlyCheck={() => { void handleGrammarlyCheck(); }}
              onQuillBotCheck={() => { void handleQuillBotCheck(); }}
              onToneCheck={() => { void handleToneCheck(); }}
              onTone={(tone: string) => setSelectedTone(tone)}
              selectedTone={selectedTone}
              onClose={() => { setEditorSelection(''); setToolbarPos(null); }}
              disabled={isHumanizing || isGrammarlyChecking}
            />
          ) : null}
        </main>
      </div>

      {showSuggestionPanel && versions.length > 0 && editorSelection && (
        <SuggestionPanelAny
          versions={versions}
          index={versionIndex}
          onApply={applyVersion}
          onReject={rejectVersions}
          onRegenerate={regenerateVersion}
          onPrev={prevVersion}
          onNext={nextVersion}
        />
      )}

      {particleEffect && (
        <ParticleEffect
          text={particleEffect.text}
          startX={particleEffect.x}
          startY={particleEffect.y}
          onComplete={() => setParticleEffect(null)}
        />
      )}
    </div>
  );
}
