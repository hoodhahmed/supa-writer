import { useState, useRef, useCallback } from 'react';
import { ParticleEffect } from '@/components/particle-effect';

import '@/assets/editor.css';
import { api } from '@/services/api';
import { useDocuments } from '@/features/editor/hooks/useDocuments';
import { useEditor } from '@/features/editor/hooks/useEditor';
import { NotebookHeader } from '@/features/editor/components/NotebookHeader';
import { NotebookCanvas } from '@/features/editor/components/NotebookCanvas';
import { FloatingActions } from '@/features/editor/components/FloatingActions';
import { SaveStatus } from '@/features/editor/components/SaveStatus';
import { SuggestionPanel } from '@/features/editor/components/SuggestionPanel';
import { EditorContent } from '@/features/editor/components/EditorContent';

/**
 * EssenceEditor - Main editor component with premium notebook aesthetic
 * 
 * Layout Structure:
 * - NotebookHeader (top navigation)
 * - NotebookCanvas (main editor area with ruled lines and margin)
 *   - EditorContent (editable area)
 * - FloatingActions (AI, toolbar, help buttons)
 * - SaveStatus (bottom-right indicator)
 * - SuggestionPanel (floating suggestion popup)
 * - ParticleEffect (animation effects)
 */
export function EssenceEditor() {
  // State Management
  const { documents, currentDocId, saveCurrentDoc: persistDocument } = useDocuments();
  const editorUI = useEditor();
  const [isScanning, setIsScanning] = useState(false);
  const [docScore, setDocScore] = useState<any | null>(null);
  const [isSaved, setIsSaved] = useState(true);

  // Refs
  const editorRef = useRef<HTMLDivElement>(null);
  const scanTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ============================================================
  // AI & Scoring Logic
  // ============================================================

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

  // ============================================================
  // Input & Auto-save Logic
  // ============================================================

  const handleInput = () => {
    if (docScore) setDocScore(null);
    setIsSaved(false);

    // Clear existing timers
    if (scanTimeoutRef.current) clearTimeout(scanTimeoutRef.current);
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    // Auto-scan after 12 seconds of inactivity
    scanTimeoutRef.current = setTimeout(() => handleScan(), 12000);

    // Auto-save after 1.5 seconds of inactivity
    saveTimeoutRef.current = setTimeout(() => {
      persistDocument(currentDocId, editorRef.current);
      setIsSaved(true);
    }, 1500);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
    handleInput();
  };

  // ============================================================
  // Selection & Suggestion Logic
  // ============================================================

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

  const handleAcceptSuggestion = () => {
    if (!editorUI.suggestion || !editorRef.current) return;

    const pending = document.querySelector('.highlight-pending-change');
    if (pending) {
      pending.outerHTML = editorUI.suggestion;
    }

    editorUI.setSuggestion(null);
    editorUI.setSuggestionScore(null);
    editorUI.setSelection('');
    handleInput();
  };

  const handleRejectSuggestion = () => {
    editorUI.setSuggestion(null);
    const pending = document.querySelector('.highlight-pending-change');
    if (pending) {
      pending.outerHTML = pending.innerHTML;
    }
  };

  // ============================================================
  // Render
  // ============================================================

  return (
    <div className="notebook-container">
      {/* Header Navigation */}
      <NotebookHeader />

      {/* Main Editor Canvas */}
      <NotebookCanvas>
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

      {/* Floating Action Buttons */}
      <FloatingActions />

      {/* Save Status Indicator - Bottom Right */}
      <div className="fixed bottom-8 right-8 z-40">
        <SaveStatus saved={isSaved} />
      </div>

      {/* Suggestion Panel - Bottom Center */}
      {editorUI.suggestion && (
        <SuggestionPanel
          suggestion={editorUI.suggestion}
          score={editorUI.suggestionScore}
          onAccept={handleAcceptSuggestion}
          onReject={handleRejectSuggestion}
        />
      )}

      {/* Particle Effects */}
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