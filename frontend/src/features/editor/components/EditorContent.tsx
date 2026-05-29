import React, { forwardRef, type ForwardedRef, useState, useEffect } from 'react';
import { ForensicOverlay } from '@/components/forensic-overlay';
import { QualityCard } from '@/components/quality-card';
import { cn } from '@/lib/utils';
import type { Document as EditorDocument } from '@/types/editor';

interface EditorContentProps {
  currentDocId: string | null;
  documents: EditorDocument[];
  docScore: any | null;
  grammarlyScore: any | null;
  quillbotScore: any | null;
  fullGrammarlyResults: any[] | null;
  fullQuillBotResults: any[] | null;
  fullQualityResults: any[] | null;
  isScanning: boolean;
  activeQualityId: number | null;
  setActiveQualityId: (id: number | null) => void;
  hoveredQualityId: number | null;
  setHoveredQualityId: (id: number | null) => void;
  cardPos: { x: number; y: number } | null;
  setCardPos: (pos: { x: number; y: number } | null) => void;
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
      fullQualityResults,
      isScanning,
      activeQualityId,
      setActiveQualityId,
      hoveredQualityId,
      setHoveredQualityId,
      cardPos,
      setCardPos,
      onSelection,
      onInput,
      onPaste
    },
    ref
  ) => {
    // Sync editor content with current document
    useEffect(() => {
      if (ref && 'current' in ref && ref.current) {
        const activeDoc = documents.find(d => d.id === currentDocId);
        if (activeDoc && ref.current.innerHTML !== activeDoc.content) {
          ref.current.innerHTML = activeDoc.content;
        }
      }
    }, [currentDocId, documents, ref]);

    const [contentVersion, setContentVersion] = useState(0);
    
    useEffect(() => {
      const handleUpdate = () => setContentVersion(v => v + 1);
      window.addEventListener('resize', handleUpdate);
      window.addEventListener('scroll', handleUpdate, true);
      return () => {
        window.removeEventListener('resize', handleUpdate);
        window.removeEventListener('scroll', handleUpdate, true);
      };
    }, []);

    useEffect(() => {
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
      return editor.innerText || '';
    }, [contentVersion, ref]);

    // 1. Selection Results (Standard Overlays)
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

    // 3. Quality Data Mapping with Heatmap Rects
    const qualityHeatmap = React.useMemo(() => {
      if (!fullQualityResults || !ref || !('current' in ref) || !ref.current) return null;
      const editor = ref.current;
      const textNodes: Text[] = [];
      const walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT, null);
      let node;
      while ((node = walker.nextNode())) { textNodes.push(node as Text); }

      return fullQualityResults.map((res, i) => {
        const hasQuality = res.score !== undefined || res.engagementScore !== undefined;
        if (!hasQuality) return null;
        
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
            pRects = Array.from(range.getClientRects());
          } else return null;
        } catch (e) { return null; }

        return { id: i, rects: pRects, scores: res };
      }).filter(Boolean) as any[];
    }, [fullQualityResults, fullText, contentVersion, ref]);

    const handleHeatmapClick = (e: React.MouseEvent, id: number, rects: DOMRect[]) => {
      e.stopPropagation();
      setActiveQualityId(id);
      
      // Calculate card position: top center of the first rect
      if (rects.length > 0) {
        const firstRect = rects[0];
        setCardPos({
          x: firstRect.left + firstRect.width / 2,
          y: firstRect.top
        });
      }
    };

    return (
      <div className="relative w-full">
        <div ref={ref} contentEditable suppressContentEditableWarning className="editor-canvas" onMouseUp={onSelection} onInput={() => { setContentVersion(v => v + 1); onInput(); }} onPaste={onPaste} />

        <div className="absolute inset-0 pointer-events-none overflow-visible" style={{ zIndex: 40 }}>
          {!isScanning && qualityHeatmap?.map((data) => (
            <React.Fragment key={data.id}>
              {data.rects.map((r: DOMRect, idx: number) => (
                <div 
                  key={`${data.id}-${idx}`}
                  onClick={(e) => handleHeatmapClick(e, data.id, data.rects)}
                  onMouseEnter={() => setHoveredQualityId(data.id)}
                  onMouseLeave={() => setHoveredQualityId(null)}
                  className={cn(
                    "absolute pointer-events-auto cursor-pointer border-b transition-all duration-300",
                    activeQualityId === data.id 
                      ? "bg-indigo-500/20 border-indigo-500/40 ring-1 ring-indigo-500/10 shadow-[0_0_15px_rgba(99,102,241,0.1)]" 
                      : hoveredQualityId === data.id
                      ? "bg-indigo-500/15 border-indigo-400/30"
                      : "bg-indigo-500/5 border-transparent hover:bg-indigo-500/10"
                  )}
                  style={{
                    top: r.top - (ref as any).current.getBoundingClientRect().top,
                    left: r.left - (ref as any).current.getBoundingClientRect().left,
                    width: r.width,
                    height: r.height,
                    borderRadius: '2px',
                    zIndex: (activeQualityId === data.id || hoveredQualityId === data.id) ? 10 : 1
                  }}
                >
                  {/* Number marker for first rect of sentence */}
                  {idx === 0 && (activeQualityId === data.id || hoveredQualityId === data.id) && (
                    <div className="absolute -top-5 left-0 animate-in fade-in zoom-in-95 duration-200">
                      <span className="bg-indigo-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded shadow-sm">
                        #{data.id + 1}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>

        {activeQualityId !== null && cardPos && (
          <QualityCard 
            scores={qualityHeatmap?.find(d => d.id === activeQualityId)?.scores}
            x={cardPos.x}
            y={cardPos.y}
            onClose={() => setActiveQualityId(null)}
          />
        )}
        
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
