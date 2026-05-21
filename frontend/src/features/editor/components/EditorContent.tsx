import React, { useEffect, forwardRef, type ForwardedRef } from 'react';
import { ForensicOverlay } from '@/components/forensic-overlay';
import type { Document as EditorDocument } from '@/types/editor';

interface EditorContentProps {
  currentDocId: string | null;
  documents: EditorDocument[];
  docScore: any | null;
  grammarlyScore: any | null;
  quillbotScore: any | null;
  fullGrammarlyResults: any[] | null;
  fullQuillBotResults: any[] | null;
  isScanning: boolean;
  onSelection: () => void;
  onInput: () => void;
  onPaste: (e: React.ClipboardEvent<HTMLDivElement>) => void;
}

export const EditorContent = forwardRef<HTMLDivElement, EditorContentProps>(
  (
    {
      currentDocId,
      documents,
      docScore,
      grammarlyScore,
      quillbotScore,
      fullGrammarlyResults,
      fullQuillBotResults,
      isScanning,
      onSelection,
      onInput,
      onPaste
    },
    ref
  ) => {
    useEffect(() => {
      if (currentDocId && ref && 'current' in ref) {
        const activeDoc = documents.find((d: EditorDocument) => d.id === currentDocId);
        if (activeDoc && ref.current && ref.current.innerHTML !== activeDoc.content) {
          ref.current.innerHTML = activeDoc.content;
        }
      }
    }, [currentDocId, documents, ref]);

    // Convert QuillBot chunks to sentences format for ForensicOverlay
    const quillbotSentences = React.useMemo(() => {
      if (!quillbotScore?.data?.value?.chunks) return null;
      
      return quillbotScore.data.value.chunks.map((chunk: any) => ({
        text: chunk.text,
        aiProbability: chunk.aiScore * 100,
        isAI: chunk.aiScore > 0.2 // threshold for AI detection display
      }));
    }, [quillbotScore]);

    // Convert Grammarly alertRanges to sentences format for ForensicOverlay
    const grammarlySentences = React.useMemo(() => {
      if (!grammarlyScore?.alertRanges || !ref || !('current' in ref) || !ref.current) return null;
      
      const editor = ref.current;
      const textNodes: Text[] = [];
      const walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT, null);
      let node;
      while ((node = walker.nextNode())) {
        textNodes.push(node as Text);
      }
      const fullText = textNodes.map(n => n.textContent || '').join('');

      return grammarlyScore.alertRanges.map((range: any) => {
        // Adjust for selection offset if present in grammarlyScore
        const begin = (grammarlyScore.offset || 0) + range.begin;
        const end = (grammarlyScore.offset || 0) + range.end;
        
        return {
          text: fullText.substring(begin, end),
          aiProbability: range.score,
          isAI: range.score > 50
        };
      });
    }, [grammarlyScore, ref]);

    // Convert full Grammarly scan results (multi-paragraph) to sentences
    const fullGrammarlySentences = React.useMemo(() => {
      if (!fullGrammarlyResults || !ref || !('current' in ref) || !ref.current) return null;
      
      const editor = ref.current;
      const textNodes: Text[] = [];
      const walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT, null);
      let node;
      while ((node = walker.nextNode())) {
        textNodes.push(node as Text);
      }
      const fullText = textNodes.map(n => n.textContent || '').join('');

      const allSentences: any[] = [];
      fullGrammarlyResults.forEach(res => {
        if (!res.alertRanges) return;
        res.alertRanges.forEach((range: any) => {
          const begin = (res.offset || 0) + range.begin;
          const end = (res.offset || 0) + range.end;
          allSentences.push({
            text: fullText.substring(begin, end),
            aiProbability: range.score,
            isAI: range.score > 50
          });
        });
      });
      return allSentences;
    }, [fullGrammarlyResults, ref]);

    // Convert full QuillBot scan results (multi-paragraph) to sentences
    const fullQuillBotSentences = React.useMemo(() => {
      if (!fullQuillBotResults || !ref || !('current' in ref) || !ref.current) return null;
      
      const allSentences: any[] = [];
      fullQuillBotResults.forEach(res => {
        if (!res.data?.value?.chunks) return;
        res.data.value.chunks.forEach((chunk: any) => {
          allSentences.push({
            text: chunk.text,
            aiProbability: chunk.aiScore * 100,
            isAI: chunk.aiScore > 0.2
          });
        });
      });
      return allSentences;
    }, [fullQuillBotResults, ref]);

    return (
      <div className="relative w-full">
        <div
          ref={ref}
          contentEditable
          suppressContentEditableWarning
          className="editor-canvas"
          onMouseUp={onSelection}
          onInput={onInput}
          onPaste={onPaste}
        />
        {docScore?.sentences && !isScanning && (
          <ForensicOverlay sentences={docScore.sentences} editorRef={ref as ForwardedRef<HTMLDivElement>} />
        )}
        {quillbotSentences && (
          <ForensicOverlay sentences={quillbotSentences} editorRef={ref as ForwardedRef<HTMLDivElement>} />
        )}
        {grammarlySentences && (
          <ForensicOverlay sentences={grammarlySentences} editorRef={ref as ForwardedRef<HTMLDivElement>} />
        )}
        {fullGrammarlySentences && (
          <ForensicOverlay sentences={fullGrammarlySentences} editorRef={ref as ForwardedRef<HTMLDivElement>} />
        )}
        {fullQuillBotSentences && (
          <ForensicOverlay sentences={fullQuillBotSentences} editorRef={ref as ForwardedRef<HTMLDivElement>} />
        )}
      </div>
    );
  }
);

EditorContent.displayName = 'EditorContent';
