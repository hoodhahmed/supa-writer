import { useState, useRef, useCallback, useEffect, type ClipboardEvent, type ComponentType } from 'react';
import { ParticleEffect } from '@/components/particle-effect';

import '@/assets/editor.css';
import { api } from '@/services/api';
import { useDocuments } from '@/features/editor/hooks/useDocuments';
import { useEditor } from '@/features/editor/hooks/useEditor';
import { NotebookHeader } from '@/features/editor/components/NotebookHeader';
import { NotebookCanvas } from '@/features/editor/components/NotebookCanvas';
import { SaveStatus } from '@/features/editor/components/SaveStatus';
import { SuggestionPanel } from '@/features/editor/components/SuggestionPanel';
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
  const { documents, currentDocId, saveCurrentDoc: persistDocument, createNewDoc, deleteDoc, setCurrentDocId } = useDocuments();
  const editorUI = useEditor();
  const [isScanning, setIsScanning] = useState(false);
  const [docScore, setDocScore] = useState<any | null>(null);
  const [isSaved, setIsSaved] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const editorRef = useRef<HTMLDivElement>(null);
  const selectionRangeRef = useRef<Range | null>(null);
  const scanTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const handleInput = () => {
    if (docScore) setDocScore(null);
    setIsSaved(false);
    if (scanTimeoutRef.current) clearTimeout(scanTimeoutRef.current);
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    scanTimeoutRef.current = setTimeout(() => handleScan(), 12000);
    saveTimeoutRef.current = setTimeout(() => {
      persistDocument(currentDocId, editorRef.current);
      setIsSaved(true);
    }, 1500);
  };

  const handlePaste = (e: ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
    handleInput();
  };

  const handleSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.toString().trim().length > 0) {
      const range = sel.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      editorUI.setToolbarPos({ x: rect.left + rect.width / 2, y: rect.top });
      editorUI.setSelection(sel.toString());
    } else {
      editorUI.setToolbarPos(null);
      editorUI.setSelection('');
    }
  };

  type Version = { text: string; score?: number | null };

  const handleHumanize = useCallback(async () => {
    if (!editorRef.current || editorUI.isHumanizing) return;

    const selection = window.getSelection();
    const selectedText = editorUI.selection.trim();

    // Only humanize when there's an explicit selection
    if (!selectedText) return;

    if (!selection || selection.rangeCount === 0) return;
    // Save the selection range so we can apply later
    selectionRangeRef.current = selection.getRangeAt(0).cloneRange();

    editorUI.setIsHumanizing(true);
    try {
      const result = await api.humanizeText(selectedText);
      const humanizedText = result?.humanizedText?.trim() || selectedText;
      const wh_score = result?.score ?? null;

      // push to versions and open suggestion panel
      setVersions((prev: Version[]) => {
        const next = [{ text: humanizedText, score: wh_score }, ...prev];
        return next.slice(0, 8);
      });
      setVersionIndex(0);
      setShowSuggestionPanel(true);
    } catch (error) {
      console.error('Failed to humanize text:', error);
    } finally {
      editorUI.setIsHumanizing(false);
    }
  }, [editorUI, handleInput]);

  // Suggestion/version state
  const [versions, setVersions] = useState<Version[]>([]);
  const [versionIndex, setVersionIndex] = useState(0);
  const [showSuggestionPanel, setShowSuggestionPanel] = useState(false);

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
    editorUI.setSelection('');
    editorUI.setToolbarPos(null);
    setDocScore(null);
    handleInput();
  }, [versions, editorUI, handleInput]);

  const rejectVersions = useCallback(() => {
    setShowSuggestionPanel(false);
    setVersions([]);
    setVersionIndex(0);
    editorUI.setSelection('');
    editorUI.setToolbarPos(null);
  }, [editorUI]);

  const regenerateVersion = useCallback(async (index: number) => {
    const base = versions[index];
    if (!base) return;
    editorUI.setIsHumanizing(true);
    try {
      const result = await api.humanizeText(base.text);
      const humanizedText = result?.humanizedText?.trim() || base.text;
      const wh_score = result?.score ?? null;

      setVersions((prev: Version[]) => {
        const next = [{ text: humanizedText, score: wh_score }, ...prev];
        return next.slice(0, 8);
      });
      setVersionIndex(0);
    } catch (e) {
      console.error('Regenerate failed', e);
    } finally {
      editorUI.setIsHumanizing(false);
    }
  }, [versions, editorUI]);

  const prevVersion = useCallback(() => {
    setVersionIndex((i: number) => Math.max(0, i - 1));
  }, []);

  const nextVersion = useCallback(() => {
    setVersionIndex((i: number) => Math.min(versions.length - 1, i + 1));
  }, [versions.length]);

  

  const filteredDocs = documents.filter((d: any) =>
    d.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="napkin-app">
      {/* Top header */}
      <NotebookHeader onCreate={createNewDoc} docScore={docScore} />

      {/* Body: sidebar + main */}
      <div className="napkin-body">
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
          <NotebookCanvas isRewriting={editorUI.isHumanizing}>
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

          {/* Floating AI button removed in favor of selection toolbar */}

          {/* Floating toolbar near selection */}
          {editorUI.toolbarPos && editorUI.selection ? (
            <FloatingToolbar
              x={editorUI.toolbarPos.x}
              y={editorUI.toolbarPos.y}
              onHumanize={() => { void handleHumanize(); }}
              onTone={() => { /* tone handler placeholder */ }}
              onClose={() => { editorUI.setSelection(''); editorUI.setToolbarPos(null); }}
              disabled={editorUI.isHumanizing}
            />
          ) : null}

          {/* Save status */}
          <div className="fixed bottom-8 right-8 z-40">
            <SaveStatus saved={isSaved} />
          </div>
        </main>
      </div>

      {/* Suggestion panel (versioned) - only show when there are versions and a selection */}
      {showSuggestionPanel && versions.length > 0 && editorUI.selection && (
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
      {editorUI.particleEffect && (
        <ParticleEffect
          text={editorUI.particleEffect.text}
          startX={editorUI.particleEffect.x}
          startY={editorUI.particleEffect.y}
          onComplete={() => editorUI.setParticleEffect(null)}
        />
      )}
    </div>
  );
}
