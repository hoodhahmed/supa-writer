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
import { Sidebar, InspectionSidebar } from '@/features/editor/components/Sidebar';
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
    setFullQualityResults(null);
    toast("AI Cache and results cleared.", "success");
  }, [toast]);

  const [docScore, setDocScore] = useState<any | null>(null);
  const [grammarlyScore, setGrammarlyScore] = useState<any | null>(null);
  const [quillbotScore, setQuillbotScore] = useState<any | null>(null);
  const [fullGrammarlyResults, setFullGrammarlyResults] = useState<any[] | null>(null);
  const [fullQuillBotResults, setFullQuillBotResults] = useState<any[] | null>(null);
  const [fullQualityResults, setFullQualityResults] = useState<any[] | null>(null);
  const [qualityScoreMode, setQualityScoreMode] = useState<'sentence' | 'paragraph'>('sentence');
  const [selectionOffset, setSelectionOffset] = useState<number>(0);
  const [isSaved, setIsSaved] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [versions, setVersions] = useState<any[]>([]);
  const [versionIndex, setVersionIndex] = useState(0);
  const [showSuggestionPanel, setShowSuggestionPanel] = useState(false);
  const [showInspectionMode, setShowInspectionMode] = useState(false);
  const [activeQualityId, setActiveQualityId] = useState<number | null>(null);
  const [hoveredQualityId, setHoveredQualityId] = useState<number | null>(null);
  const [cardPos, setCardPos] = useState<{ x: number; y: number } | null>(null);

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

  const handleSentenceJump = useCallback((s: any) => {
    if (!editorRef.current) return;
    
    // 1. Set active state for highlighting and showing card
    setActiveQualityId(s.id);

    // Use a tiny timeout to let the DOM update (e.g. adding the card or changing highlight color)
    setTimeout(() => {
      if (!editorRef.current) return;
      const editor = editorRef.current;
      const textNodes: Text[] = [];
      const walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT, null);
      let node;
      while ((node = walker.nextNode())) { textNodes.push(node as Text); }

      const range = document.createRange();
      let currentLen = 0;
      let startNode: Node | null = null;
      let startNodeOffset = 0;
      let endNode: Node | null = null;
      let endNodeOffset = 0;

      for (const tNode of textNodes) {
        const nodeLen = tNode.textContent?.length || 0;
        if (!startNode && currentLen + nodeLen > s.offset) {
          startNode = tNode;
          startNodeOffset = s.offset - currentLen;
        }
        if (currentLen + nodeLen >= s.offset + s.text.length) {
          endNode = tNode;
          endNodeOffset = (s.offset + s.text.length) - currentLen;
          break;
        }
        currentLen += nodeLen;
      }

      if (startNode && endNode) {
        try {
          range.setStart(startNode, startNodeOffset);
          range.setEnd(endNode, endNodeOffset);
          
          const rect = range.getBoundingClientRect();
          
          // Update card position (viewport coordinates)
          setCardPos({
            x: rect.left + rect.width / 2,
            y: rect.top
          });

          // Accurate scrolling
          const container = document.querySelector('.napkin-canvas-wrapper');
          if (container) {
            const containerRect = container.getBoundingClientRect();
            const relativeTop = rect.top - containerRect.top + container.scrollTop;
            
            container.scrollTo({
              top: relativeTop - 200, // Move it higher so user can see context
              behavior: 'smooth'
            });
          }
        } catch (e) {
          console.error('Failed to jump to sentence', e);
        }
      }
    }, 50);
  }, []);
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

      // Get context for quality check
      const fullDocText = editorRef.current.innerText || "";
      const startOfSelection = selectionOffset;
      const endOfSelection = selectionOffset + (editorSelection?.length || 0);

      let preContext = undefined;
      if (startOfSelection > 0) {
        const beforeText = fullDocText.substring(0, startOfSelection).trim();
        const matches = beforeText.match(/[^.!?]+[.!?]\s*$/);
        if (matches) preContext = matches[0].trim();
      }

      let postContext = undefined;
      if (endOfSelection < fullDocText.length) {
        const afterText = fullDocText.substring(endOfSelection).trim();
        const matches = afterText.match(/^[^.!?]+[.!?]/);
        if (matches) postContext = matches[0].trim();
      }

      // Quality Check for humanized text
      let qualityResult = null;
      try {
        let payload: any[] = [];
        if (qualityScoreMode === 'sentence') {
          const sentences = humanizedText.split(/(?<=[.!?])\s+/).filter(Boolean);
          payload = sentences.map((s, i) => ({
            text: s,
            pre: i === 0 ? preContext : sentences[i-1],
            post: i === sentences.length - 1 ? postContext : sentences[i+1]
          }));
        } else {
          payload = [{ text: humanizedText, pre: preContext, post: postContext }];
        }
        const qRes = await api.getQualityScore(payload);
        qualityResult = qRes.data?.scores || null;
      } catch (e) {
        console.error('Quality check for humanize failed', e);
      }

      setVersions((prev: any[]) => {
        const next = [{ text: humanizedText, score: wh_score, quality: qualityResult }, ...prev];
        return next.slice(0, 8);
      });
      setVersionIndex(0);
      setShowSuggestionPanel(true);
    } catch (error) {
      console.error('Failed to humanize text:', error);
    } finally {
      setIsHumanizing(false);
    }
  }, [editorSelection, isHumanizing, selectedTone, selectionOffset, qualityScoreMode]);

  const handleQualityScoreCheck = useCallback(async () => {
    const textToCheck = (editorSelection || '').trim();
    if (!textToCheck || !editorRef.current) return;

    setIsScanning(true);
    try {
      const fullDocText = editorRef.current.innerText || "";
      const startOfSelection = selectionOffset;
      const endOfSelection = selectionOffset + (editorSelection?.length || 0);

      let sentencesPayload: { text: string; pre?: string; post?: string; offset: number }[] = [];
      
      if (qualityScoreMode === 'sentence') {
        // Split selection into sentences
        const splitSentences = textToCheck.split(/(?<=[.!?])\s+/).filter(Boolean);
        
        let currentRelativeOffset = 0;
        sentencesPayload = splitSentences.map((s, i) => {
          const itemOffset = startOfSelection + currentRelativeOffset;
          
          // Get external context from document
          let preContext = i > 0 ? splitSentences[i-1] : undefined;
          if (!preContext && startOfSelection > 0) {
            const beforeText = fullDocText.substring(0, startOfSelection).trim();
            const matches = beforeText.match(/[^.!?]+[.!?]\s*$/);
            if (matches) preContext = matches[0].trim();
          }

          let postContext = i < splitSentences.length - 1 ? splitSentences[i+1] : undefined;
          if (!postContext && endOfSelection < fullDocText.length) {
            const afterText = fullDocText.substring(endOfSelection).trim();
            const matches = afterText.match(/^[^.!?]+[.!?]/);
            if (matches) postContext = matches[0].trim();
          }

          currentRelativeOffset += s.length + (textToCheck.substring(currentRelativeOffset + s.length).match(/^\s+/) ? textToCheck.substring(currentRelativeOffset + s.length).match(/^\s+/)![0].length : 0);

          return {
            text: s,
            pre: preContext,
            post: postContext,
            offset: itemOffset
          };
        });
      } else {
        // Paragraph mode: split by newlines
        const splitParagraphs = textToCheck.split(/\n+/).filter(Boolean);
        let currentRelativeOffset = 0;
        sentencesPayload = splitParagraphs.map((p, i) => {
          const itemOffset = startOfSelection + currentRelativeOffset;

          let preContext = i > 0 ? splitParagraphs[i-1] : undefined;
          let postContext = i < splitParagraphs.length - 1 ? splitParagraphs[i+1] : undefined;

          currentRelativeOffset += p.length + (textToCheck.substring(currentRelativeOffset + p.length).match(/^\n+/) ? textToCheck.substring(currentRelativeOffset + p.length).match(/^\n+/)![0].length : 0);

          return {
            text: p,
            pre: preContext,
            post: postContext,
            offset: itemOffset
          };
        });
      }

      if (sentencesPayload.length === 0) return;

      const result = await api.getQualityScore(sentencesPayload.map(({ offset, ...rest }) => rest));
      if (result.data?.scores) {
        // Map scores back using our calculated offsets
        const scoresWithOffsets = result.data.scores.map((s: any, idx: number) => ({
          ...s,
          offset: sentencesPayload[idx].offset
        }));
        
        setFullQualityResults(scoresWithOffsets);
        toast(`Quality Check complete: ${result.data.scores.length} items analyzed.`, "success");
      }
    } catch (error) {
      console.error('Quality Score check failed', error);
      toast("Failed to analyze quality.", "error");
    } finally {
      setIsScanning(false);
      setToolbarPos(null);
      setEditorSelection('');
    }
  }, [editorSelection, qualityScoreMode, selectionOffset, toast]);

  const handleQualityFullScan = useCallback(async () => {
    if (!editorRef.current) return;
    setIsScanning(true);
    try {
      const editor = editorRef.current;
      const sections: { text: string; offset: number }[] = [];
      let cumulativeOffset = 0;
      const textNodes: Text[] = [];
      const walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT, null);
      let node;
      while ((node = walker.nextNode())) { textNodes.push(node as Text); }
      const fullText = textNodes.map(n => n.textContent || '').join('');

      const blockElements = editor.querySelectorAll('p, div, blockquote');
      blockElements.forEach((el) => {
        const blockText = el.textContent?.trim() || '';
        const isHeading = /h[1-6]/i.test(el.tagName);
        const isReference = blockText.toLowerCase().includes('reference') || blockText.toLowerCase().startsWith('[');
        
        if (blockText.length > 20 && !isHeading && !isReference) {
          const blockIdx = fullText.indexOf(blockText, cumulativeOffset);
          if (blockIdx !== -1) {
            if (qualityScoreMode === 'paragraph') {
              sections.push({ text: blockText, offset: blockIdx });
            } else {
              // Sentence mode: split block into sentences
              const sentences = blockText.split(/(?<=[.!?])\s+/).filter(Boolean);
              let relOffset = 0;
              sentences.forEach((s) => {
                sections.push({ text: s, offset: blockIdx + relOffset });
                relOffset += s.length + (blockText.substring(relOffset + s.length).match(/^\s+/) ? blockText.substring(relOffset + s.length).match(/^\s+/)![0].length : 0);
              });
            }
            cumulativeOffset = blockIdx + blockText.length;
          }
        }
      });

      if (sections.length === 0) {
        setIsScanning(false);
        return;
      }
      
      toast(`Analyzing quality for ${sections.length} ${qualityScoreMode}s...`, "info");

      const payload = sections.map((s, i) => ({
        text: s.text,
        pre: i > 0 ? sections[i-1].text : undefined,
        post: i < sections.length - 1 ? sections[i+1].text : undefined
      }));

      const CONCURRENCY_LIMIT = 5;
      const allScores: any[] = [];

      for (let i = 0; i < payload.length; i += CONCURRENCY_LIMIT) {
        const chunk = payload.slice(i, i + CONCURRENCY_LIMIT);
        try {
          const res = await api.getQualityScore(chunk);
          if (res.data?.scores) {
            res.data.scores.forEach((score: any, idx: number) => {
              allScores.push({ ...score, offset: sections[i + idx].offset });
            });
          }
        } catch (e) {
          console.error('Quality chunk scan failed', e);
        }
      }

      setFullQualityResults(allScores);
      setShowInspectionMode(true);
      toast("Quality analysis complete.", "success");
    } catch (error) {
      console.error('Quality scan failed', error);
    } finally {
      setIsScanning(false);
    }
  }, [qualityScoreMode, toast]);

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
    if (!base || !editorRef.current) return;
    setIsHumanizing(true);
    try {
      const result = await api.humanizeText(base.text, selectedTone);
      const humanizedText = result?.humanizedText?.trim() || base.text;
      const wh_score = result?.score ?? null;

      // Get context for quality check
      const fullDocText = editorRef.current.innerText || "";
      const startOfSelection = selectionOffset;
      const endOfSelection = selectionOffset + (editorSelection?.length || 0);

      let preContext = undefined;
      if (startOfSelection > 0) {
        const beforeText = fullDocText.substring(0, startOfSelection).trim();
        const matches = beforeText.match(/[^.!?]+[.!?]\s*$/);
        if (matches) preContext = matches[0].trim();
      }

      let postContext = undefined;
      if (endOfSelection < fullDocText.length) {
        const afterText = fullDocText.substring(endOfSelection).trim();
        const matches = afterText.match(/^[^.!?]+[.!?]/);
        if (matches) postContext = matches[0].trim();
      }

      // Quality Check for humanized text
      let qualityResult = null;
      try {
        let payload: any[] = [];
        if (qualityScoreMode === 'sentence') {
          const sentences = humanizedText.split(/(?<=[.!?])\s+/).filter(Boolean);
          payload = sentences.map((s, i) => ({
            text: s,
            pre: i === 0 ? preContext : sentences[i-1],
            post: i === sentences.length - 1 ? postContext : sentences[i+1]
          }));
        } else {
          payload = [{ text: humanizedText, pre: preContext, post: postContext }];
        }
        const qRes = await api.getQualityScore(payload);
        qualityResult = qRes.data?.scores || null;
      } catch (e) {
        console.error('Quality check for humanize failed', e);
      }

      setVersions((prev: any[]) => [{ text: humanizedText, score: wh_score, quality: qualityResult }, ...prev].slice(0, 8));
      setVersionIndex(0);
    } catch (e) {
      console.error('Regenerate failed', e);
    } finally {
      setIsHumanizing(false);
    }
  }, [versions, selectedTone, selectionOffset, editorSelection, qualityScoreMode]);

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
        onToneScan={handleQualityFullScan}
        onResetCache={handleResetCache}
        onToggleInspection={() => setShowInspectionMode(!showInspectionMode)}
        showInspectionMode={showInspectionMode}
        hasQualityData={!!fullQualityResults && fullQualityResults.length > 0}
        qualityScoreMode={qualityScoreMode}
        setQualityScoreMode={setQualityScoreMode}
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
              fullQualityResults={fullQualityResults}
              isScanning={isScanning}
              activeQualityId={activeQualityId}
              setActiveQualityId={setActiveQualityId}
              hoveredQualityId={hoveredQualityId}
              setHoveredQualityId={setHoveredQualityId}
              cardPos={cardPos}
              setCardPos={setCardPos}
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
              onToneCheck={() => { void handleQualityScoreCheck(); }}
              onTone={(tone: string) => setSelectedTone(tone)}
              selectedTone={selectedTone}
              qualityScoreMode={qualityScoreMode}
              setQualityScoreMode={setQualityScoreMode}
              onClose={() => { setEditorSelection(''); setToolbarPos(null); }}
              disabled={isHumanizing || isGrammarlyChecking}
            />
          ) : null}
        </main>

        {showInspectionMode && (
          <InspectionSidebar 
            sentences={fullQualityResults?.map((s, i) => ({ id: i, text: s.text, offset: s.offset, scores: s })) || null}
            onSentenceClick={handleSentenceJump}
            activeSentenceId={activeQualityId}
            hoveredSentenceId={hoveredQualityId}
            setHoveredSentenceId={setHoveredQualityId}
            onClose={() => setShowInspectionMode(false)}
          />
        )}
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
