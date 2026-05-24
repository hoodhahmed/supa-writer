import React, { forwardRef, type ForwardedRef, useState, useEffect } from 'react';
import { ForensicOverlay } from '@/components/forensic-overlay';
import { ToneBubble } from '@/components/tone-bubble';
import type { Document as EditorDocument } from '@/types/editor';

interface EditorContentProps {
  currentDocId: string | null;
  documents: EditorDocument[];
  docScore: any | null;
  grammarlyScore: any | null;
  quillbotScore: any | null;
  fullGrammarlyResults: any[] | null;
  fullQuillBotResults: any[] | null;
  fullToneResults: any[] | null;
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
      fullToneResults,
      isScanning,
      onSelection,
      onInput,
      onPaste
    },
    ref
  ) => {
    const [activeToneIdx, setActiveToneIdx] = useState<number | null>(null);

    // Close active highlight on global click
    useEffect(() => {
      if (activeToneIdx === null) return;
      const handleGlobalClick = () => setActiveToneIdx(null);
      window.addEventListener('click', handleGlobalClick);
      return () => window.removeEventListener('click', handleGlobalClick);
    }, [activeToneIdx]);

    // Sync editor content with current document
    useEffect(() => {
      if (ref && 'current' in ref && ref.current) {
        const activeDoc = documents.find(d => d.id === currentDocId);
        if (activeDoc && ref.current.innerHTML !== activeDoc.content) {
          ref.current.innerHTML = activeDoc.content;
        }
      }
    }, [currentDocId, documents, ref]);

    // 0. Consistent plain-text representation for offset mapping
    // We use a small state trick to force update when needed
    const [contentVersion, setContentVersion] = useState(0);
    
    // Force update on resize and scroll to keep overlays aligned
    useEffect(() => {
      const handleUpdate = () => setContentVersion(v => v + 1);
      window.addEventListener('resize', handleUpdate);
      // Use capture: true to catch scrolls on any parent container (like .napkin-canvas-wrapper)
      window.addEventListener('scroll', handleUpdate, true);
      return () => {
        window.removeEventListener('resize', handleUpdate);
        window.removeEventListener('scroll', handleUpdate, true);
      };
    }, []);

    useEffect(() => {
      // Sync editor content with current document
      if (ref && 'current' in ref && ref.current) {
        const activeDoc = documents.find(d => d.id === currentDocId);
        if (activeDoc && ref.current.innerHTML !== activeDoc.content) {
          ref.current.innerHTML = activeDoc.content;
          setContentVersion(v => v + 1);
        }
      }
    }, [currentDocId, documents, ref]);

    const fullText = React.useMemo(() => {
      if (!ref || !('current' in ref) || !ref.current) return '';
      const editor = ref.current;
      return editor.innerText || ''; // Simpler way to get text for matching
    }, [contentVersion, ref]);

    // 1. Selection Results (Grammarly fixed to use fullText)
    const quillbotSentences = React.useMemo(() => {
      if (!quillbotScore?.data?.value?.chunks) return null;
      return quillbotScore.data.value.chunks.map((chunk: any) => ({
        text: chunk.text,
        aiProbability: chunk.aiScore * 100,
        isAI: chunk.aiScore > 0.2,
      }));
    }, [quillbotScore]);

    const grammarlySentences = React.useMemo(() => {
      if (!grammarlyScore?.alertRanges || !fullText) return null;
      const offset = grammarlyScore.offset || 0;
      return grammarlyScore.alertRanges.map((alert: any) => ({
        text: fullText.substring(alert.begin + offset, alert.end + offset),
        aiProbability: alert.score,
        isAI: alert.score > 50,
      }));
    }, [grammarlyScore, fullText]);

    // 2. Full Scan Results
    const fullGrammarlySentences = React.useMemo(() => {
      if (!fullGrammarlyResults) return null;
      const allSentences: any[] = [];
      fullGrammarlyResults.forEach(res => {
        if (!res.alertRanges) return;
        res.alertRanges.forEach((alert: any) => {
          const text = res.text?.substring(alert.begin, alert.end) || "";
          allSentences.push({
            text,
            aiProbability: alert.score,
            isAI: alert.score > 50
          });
        });
      });
      return allSentences;
    }, [fullGrammarlyResults]);

    const fullQuillBotSentences = React.useMemo(() => {
      if (!fullQuillBotResults) return null;
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
    }, [fullQuillBotResults]);

    // 3. Consolidated Tone Bubbles
    const toneData = React.useMemo(() => {
      if (!fullToneResults || !ref || !('current' in ref) || !ref.current) return null;
      const editor = ref.current;
      const textNodes: Text[] = [];
      const walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT, null);
      let node;
      while ((node = walker.nextNode())) { textNodes.push(node as Text); }

      return fullToneResults.map((res, i) => {
        if (!res.tone) return null;
        
        let yCenter = 0;
        let pRects: DOMRect[] = [];
        try {
          const range = document.createRange();
          const startOffset = res.offset;
          const endOffset = res.offset + (res.text?.length || 1);
          
          let startNode: Node | null = null;
          let startNodeOffset = 0;
          let endNode: Node | null = null;
          let endNodeOffset = 0;
          
          let currentLen = 0;
          for (const tNode of textNodes) {
            const nodeLen = tNode.textContent?.length || 0;
            const nodeEnd = currentLen + nodeLen;

            if (!startNode && nodeEnd > startOffset) {
              startNode = tNode;
              startNodeOffset = startOffset - currentLen;
            }
            if (nodeEnd >= endOffset) {
              endNode = tNode;
              endNodeOffset = endOffset - currentLen;
              break;
            }
            currentLen = nodeEnd;
          }

          if (startNode && endNode) {
            range.setStart(startNode, startNodeOffset);
            range.setEnd(endNode, endNodeOffset);
            
            const rect = range.getBoundingClientRect();
            const editorRect = editor.getBoundingClientRect();
            yCenter = (rect.top + rect.height / 2) - editorRect.top;
            pRects = Array.from(range.getClientRects());
          } else {
            return null;
          }
        } catch (e) { return null; }

        return { i, yCenter, rects: pRects, tone: res.tone };
      });
    }, [fullToneResults, fullText, contentVersion, ref]);

    const activeParagraphHighlight = React.useMemo(() => {
      if (activeToneIdx === null || !toneData || !ref || !('current' in ref) || !ref.current) return null;
      const editor = ref.current;
      const editorRect = editor.getBoundingClientRect();
      const data = toneData.find(d => d?.i === activeToneIdx);
      if (!data || !data.rects) return null;

      return data.rects.map((r, idx) => (
        <div 
          key={idx}
          className="absolute bg-indigo-500/5 border-b-2 border-indigo-400/20 pointer-events-none z-0"
          style={{
            top: r.top - editorRect.top,
            left: r.left - editorRect.left,
            width: r.width,
            height: r.height,
          }}
        />
      ));
    }, [activeToneIdx, toneData, contentVersion, ref]);

    return (
      <div className="relative w-full">
        <div
          ref={ref}
          contentEditable
          suppressContentEditableWarning
          className="editor-canvas"
          onMouseUp={onSelection}
          onInput={() => { setContentVersion(v => v + 1); onInput(); }}
          onPaste={onPaste}
        />

        {/* Overlays Container */}
        <div className="absolute inset-0 pointer-events-none overflow-visible" style={{ zIndex: 40 }}>
          {activeParagraphHighlight}

          {!isScanning && toneData?.map((data) => data && (
            <ToneBubble 
              key={data.i}
              tone={data.tone}
              yPos={data.yCenter}
              isActive={activeToneIdx === data.i}
              onClick={() => setActiveToneIdx(activeToneIdx === data.i ? null : data.i)}
              onClose={() => setActiveToneIdx(null)}
            />
          ))}
        </div>
        
        {docScore?.sentences && !isScanning && (
          <ForensicOverlay color="yellow" sentences={docScore.sentences} editorRef={ref as ForwardedRef<HTMLDivElement>} contentVersion={contentVersion} />
        )}
        {quillbotSentences && (
          <ForensicOverlay color="blue" sentences={quillbotSentences} editorRef={ref as ForwardedRef<HTMLDivElement>} contentVersion={contentVersion} />
        )}
        {grammarlySentences && (
          <ForensicOverlay color="orange" sentences={grammarlySentences} editorRef={ref as ForwardedRef<HTMLDivElement>} contentVersion={contentVersion} />
        )}
        {fullGrammarlySentences && (
          <ForensicOverlay color="orange" sentences={fullGrammarlySentences} editorRef={ref as ForwardedRef<HTMLDivElement>} contentVersion={contentVersion} />
        )}
        {fullQuillBotSentences && (
          <ForensicOverlay color="blue" sentences={fullQuillBotSentences} editorRef={ref as ForwardedRef<HTMLDivElement>} contentVersion={contentVersion} />
        )}
      </div>
    );
  }
);

EditorContent.displayName = 'EditorContent';