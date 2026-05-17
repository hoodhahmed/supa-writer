import { useState, useRef, useCallback, useEffect, type ClipboardEvent, type ComponentType } from 'react';
import { ParticleEffect } from '@/components/particle-effect';

import '@/assets/editor.css';
import { api } from '@/services/api';
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
  const [docScore, setDocScore] = useState<any | null>(null);
  const [isSaved, setIsSaved] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [versions, setVersions] = useState<any[]>([]);
  const [versionIndex, setVersionIndex] = useState(0);
  const [showSuggestionPanel, setShowSuggestionPanel] = useState(false);

  const editorRef = useRef<HTMLDivElement>(null);
  const selectionRangeRef = useRef<Range | null>(null);
  const scanTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 2. Callbacks
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

  const handleInput = useCallback(() => {
    if (docScore) setDocScore(null);
    setIsSaved(false);
    if (scanTimeoutRef.current) clearTimeout(scanTimeoutRef.current);
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    scanTimeoutRef.current = setTimeout(() => handleScan(), 12000);
    saveTimeoutRef.current = setTimeout(() => {
      persistDocument(currentDocId, editorRef.current);
      setIsSaved(true);
    }, 1500);
  }, [currentDocId, docScore, handleScan, persistDocument]);

  const handlePaste = (e: ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const html = e.clipboardData.getData('text/html');
    const text = e.clipboardData.getData('text/plain');

    if (html) {
      // Clean up junk but keep semantic tags AND alignment styles
      const cleanHtml = html
        .replace(/<o:p>.*?<\/o:p>/g, '') // remove office tags
        .replace(/(?:style|class)="[^"]*"/g, (match) => {
          // Keep text-align in style attribute
          if (match.includes('text-align')) {
            const alignMatch = match.match(/text-align\s*:\s*([^;"]+)/);
            if (alignMatch) return `style="text-align: ${alignMatch[1]}"`;
          }
          return ''; // strip everything else
        })
        .replace(/<span[^>]*>/g, '') // remove spans
        .replace(/<\/span>/g, '');

      document.execCommand('insertHTML', false, cleanHtml);
    } else {
      document.execCommand('insertText', false, text);
    }
    handleInput();
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleInput(); // triggers save
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        // Browser handles native undo in contentEditable, 
        // but we ensure it doesn't trigger other app-level behaviors.
        // If we needed custom undo stack, we'd implement it here.
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleInput]);

  const handleSelection = useCallback(() => {
    // Don't clear selection while suggestion panel is active to prevent unmounting it
    if (showSuggestionPanel) return;

    const sel = window.getSelection();
    if (sel && sel.toString().trim().length > 0) {
      // Check if selection is within the editor
      const isInsideEditor = editorRef.current?.contains(sel.anchorNode);
      if (isInsideEditor) {
        const range = sel.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        setToolbarPos({ x: rect.left + rect.width / 2, y: rect.top });
        setEditorSelection(sel.toString());
      }
    } else {
      // Only clear if we are not humanizing or if there is no selection
      if (!isHumanizing) {
        setToolbarPos(null);
        setEditorSelection('');
      }
    }
  }, [isHumanizing, showSuggestionPanel, setToolbarPos, setEditorSelection]);

  useEffect(() => {
    const onSelectionChange = () => {
      handleSelection();
    };
    document.addEventListener('selectionchange', onSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', onSelectionChange);
    };
  }, [handleSelection]);

  const handleHumanize = useCallback(async () => {
    if (!editorRef.current || isHumanizing) return;

    const selection = window.getSelection();
    const selectedText = (editorSelection || '').trim();

    // Only humanize when there's an explicit selection
    if (!selectedText) return;

    if (!selection || selection.rangeCount === 0) return;
    // Save the selection range so we can apply later
    selectionRangeRef.current = selection.getRangeAt(0).cloneRange();

    setIsHumanizing(true);
    try {
      const result = await api.humanizeText(selectedText, selectedTone);
      const humanizedText = result?.humanizedText?.trim() || selectedText;
      const wh_score = result?.score ?? null;

      // push to versions and open suggestion panel
      setVersions((prev: any[]) => {
        const next = [{ text: humanizedText, score: wh_score }, ...prev];
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

  // keep suggestion panel visibility in sync: hide when there are no versions or no selection
  useEffect(() => {
    if (versions.length === 0 && showSuggestionPanel) {
      setShowSuggestionPanel(false);
    }
  }, [versions, showSuggestionPanel]);

  const applyVersion = useCallback((index: number) => {
    const v = versions[index];
    if (!v) return;

    try {
      const range = selectionRangeRef.current;
      if (range) {
        range.deleteContents();
        range.insertNode(textToHtmlFragment(v.text));
      } else {
        // fallback: replace entire selection if no saved range
        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0) {
          const r = sel.getRangeAt(0);
          r.deleteContents();
          r.insertNode(textToHtmlFragment(v.text));
          sel.removeAllRanges();
        }
      }
    } catch (e) {
      console.error('Failed to apply version:', e);
    }

    setShowSuggestionPanel(false);
    setVersions([]);
    setVersionIndex(0);
    setEditorSelection('');
    setToolbarPos(null);
    setDocScore(null);
    handleInput();
  }, [versions, setEditorSelection, setToolbarPos, handleInput]);

  const rejectVersions = useCallback(() => {
    setShowSuggestionPanel(false);
    setVersions([]);
    setVersionIndex(0);
    setEditorSelection('');
    setToolbarPos(null);
  }, [setEditorSelection, setToolbarPos]);

  const regenerateVersion = useCallback(async (index: number) => {
    const base = versions[index];
    if (!base) return;
    setIsHumanizing(true);
    try {
      const result = await api.humanizeText(base.text, selectedTone);
      const humanizedText = result?.humanizedText?.trim() || base.text;
      const wh_score = result?.score ?? null;

      setVersions((prev: any[]) => {
        const next = [{ text: humanizedText, score: wh_score }, ...prev];
        return next.slice(0, 8);
      });
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
      {/* Top header */}
      <NotebookHeader onCreate={createNewDoc} onScan={handleScan} docScore={docScore} saved={isSaved} />

      {/* Body: sidebar + main */}
      <div className="napkin-body overflow-hidden">
        {/* Left sidebar */}
        <Sidebar
          documents={filteredDocs}
          currentDocId={currentDocId}
          onCreate={createNewDoc}
          onDelete={deleteDoc}
          onSelect={setCurrentDocId}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        {/* Main content area */}
        <main className="napkin-main">
          <NotebookCanvas isRewriting={isHumanizing}>
            <EditorContent
              ref={editorRef}
              currentDocId={currentDocId}
              documents={documents}
              docScore={docScore}
              isScanning={isScanning}
              onSelection={handleSelection}
              onInput={handleInput}
              onPaste={handlePaste}
            />
          </NotebookCanvas>

          {/* Floating toolbar near selection */}
          {toolbarPos && editorSelection ? (
            <FloatingToolbar
              x={toolbarPos.x}
              y={toolbarPos.y}
              onHumanize={() => { void handleHumanize(); }}
              onTone={(tone: string) => setSelectedTone(tone)}
              selectedTone={selectedTone}
              onClose={() => { setEditorSelection(''); setToolbarPos(null); }}
              disabled={isHumanizing}
            />
          ) : null}
        </main>
      </div>

      {/* Suggestion panel (versioned) - only show when there are versions and a selection */}
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

      {/* Particles */}
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
