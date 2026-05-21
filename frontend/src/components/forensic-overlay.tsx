import React, { useEffect, useState, useCallback } from 'react';

interface Sentence {
  text: string;
  aiProbability?: number;
  isAI?: boolean;
}

interface ForensicOverlayProps {
  sentences?: Sentence[];
  editorRef: any;
  color?: 'yellow' | 'blue' | 'orange';
  contentVersion?: number;
}

interface HighlightRect {
  id: string;
  sentenceIdx: number;
  top: number;
  left: number;
  width: number;
  height: number;
  probability: number;
  isFirstOfSentence?: boolean;
}

const COLOR_MAP = {
  yellow: {
    bg: 'rgba(251, 191, 36, 0.18)',
    border: 'rgba(251, 191, 36, 0.5)',
    label: '#D97706',
    hover: 'rgba(251, 191, 36, 0.3)'
  },
  blue: {
    bg: 'rgba(59, 130, 246, 0.15)',
    border: 'rgba(59, 130, 246, 0.4)',
    label: '#2563EB',
    hover: 'rgba(59, 130, 246, 0.25)'
  },
  orange: {
    bg: 'rgba(255, 87, 34, 0.12)',
    border: 'rgba(255, 87, 34, 0.3)',
    label: '#EA580C',
    hover: 'rgba(255, 87, 34, 0.2)'
  }
};

export function ForensicOverlay({ sentences, editorRef, color = 'orange', contentVersion = 0 }: ForensicOverlayProps) {
  const [highlights, setHighlights] = useState<HighlightRect[]>([]);
  const [hoveredSentenceIdx, setHoveredSentenceIdx] = useState<number | null>(null);
  const colors = COLOR_MAP[color];

  const calculateHighlights = useCallback(() => {
    const editor = editorRef && 'current' in editorRef ? editorRef.current : editorRef;
    if (!sentences || !editor) return;

    const editorRect = editor.getBoundingClientRect();
    const textNodes: Text[] = [];
    const walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT, null);
    
    let node;
    while ((node = walker.nextNode())) {
      textNodes.push(node as Text);
    }

    const fullText = textNodes.map(n => n.textContent || '').join('');
    const newHighlights: HighlightRect[] = [];
    let currentSearchIndex = 0;

    sentences.forEach((sentence, sIdx) => {
      const normalizedSentence = sentence.text.trim();
      if (!normalizedSentence) return;

      const idx = fullText.indexOf(normalizedSentence, currentSearchIndex);
      
      if (idx !== -1 && sentence.isAI) {
        const range = document.createRange();
        
        let startNode: Text | null = null;
        let startOffset = 0;
        let endNode: Text | null = null;
        let endOffset = 0;
        let cumulativeLen = 0;

        for (const tNode of textNodes) {
          const len = tNode.textContent?.length || 0;
          if (!startNode && cumulativeLen + len > idx) {
            startNode = tNode;
            startOffset = idx - cumulativeLen;
          }
          if (cumulativeLen + len >= idx + normalizedSentence.length) {
            endNode = tNode;
            endOffset = (idx + normalizedSentence.length) - cumulativeLen;
            break;
          }
          cumulativeLen += len;
        }

        if (startNode && endNode) {
          try {
            range.setStart(startNode, startOffset);
            range.setEnd(endNode, endOffset);
            
            const rects = range.getClientRects();
            for (let i = 0; i < rects.length; i++) {
              const r = rects[i];
              if (r.width === 0 || r.height === 0) continue;
              
              newHighlights.push({
                id: `s-${sIdx}-r-${i}`,
                sentenceIdx: sIdx,
                top: r.top - editorRect.top,
                left: r.left - editorRect.left,
                width: r.width,
                height: r.height,
                probability: sentence.aiProbability || 100,
                isFirstOfSentence: i === 0,
              });
            }
          } catch (e) {
            // Silently fail for individual sentences
          }
        }
        currentSearchIndex = idx + normalizedSentence.length;
      } else if (idx !== -1) {
        currentSearchIndex = idx + normalizedSentence.length;
      }
    });

    setHighlights(newHighlights);
  }, [sentences, editorRef]);

  useEffect(() => {
    calculateHighlights();
    const timer = setTimeout(calculateHighlights, 100);
    window.addEventListener('resize', calculateHighlights);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', calculateHighlights);
    };
  }, [calculateHighlights, contentVersion]);

  const handleHighlightClick = useCallback((sentenceIdx: number) => {
    const editor = editorRef && 'current' in editorRef ? editorRef.current : editorRef;
    if (!sentences || !sentences[sentenceIdx] || !editor) return;

    const sentence = sentences[sentenceIdx];
    const normalizedSentence = sentence.text.trim();
    
    const textNodes: Text[] = [];
    const walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT, null);
    let node;
    while ((node = walker.nextNode())) {
      textNodes.push(node as Text);
    }

    const fullText = textNodes.map(n => n.textContent || '').join('');
    
    // We need to find the correct occurrence. Since we scan once and sentences are ordered, 
    // we can find the N-th occurrence or use a similar logic to calculateHighlights.
    // To be precise, let's just find the occurrence that matches our current search index.
    let searchIndex = 0;
    for (let i = 0; i < sentenceIdx; i++) {
      const s = sentences[i].text.trim();
      const foundIdx = fullText.indexOf(s, searchIndex);
      if (foundIdx !== -1) searchIndex = foundIdx + s.length;
    }

    const idx = fullText.indexOf(normalizedSentence, searchIndex);
    
    if (idx !== -1) {
      const range = document.createRange();
      let startNode: Text | null = null;
      let startOffset = 0;
      let endNode: Text | null = null;
      let endOffset = 0;
      let cumulativeLen = 0;

      for (const tNode of textNodes) {
        const len = tNode.textContent?.length || 0;
        if (!startNode && cumulativeLen + len > idx) {
          startNode = tNode;
          startOffset = idx - cumulativeLen;
        }
        if (cumulativeLen + len >= idx + normalizedSentence.length) {
          endNode = tNode;
          endOffset = (idx + normalizedSentence.length) - cumulativeLen;
          break;
        }
        cumulativeLen += len;
      }

      if (startNode && endNode) {
        range.setStart(startNode, startOffset);
        range.setEnd(endNode, endOffset);
        
        const sel = window.getSelection();
        if (sel) {
          sel.removeAllRanges();
          sel.addRange(range);
          // Manually trigger selection change event if needed, 
          // but browser usually does this.
        }
      }
    }
  }, [sentences, editorRef]);

  if (!sentences || sentences.length === 0) return null;

  return (
    <div 
      className="forensic-overlay-layer"
      contentEditable={false}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 10,
        overflow: 'visible',
      }}
    >
      {highlights.map((h) => (
        <React.Fragment key={h.id}>
          <div
            className="ai-highlight-box"
            onMouseEnter={() => setHoveredSentenceIdx(h.sentenceIdx)}
            onMouseLeave={() => setHoveredSentenceIdx(null)}
            onClick={(e) => {
              e.stopPropagation();
              handleHighlightClick(h.sentenceIdx);
            }}
            style={{
              position: 'absolute',
              top: h.top,
              left: h.left,
              width: h.width,
              height: h.height,
              pointerEvents: 'auto',
              cursor: 'pointer',
              backgroundColor: hoveredSentenceIdx === h.sentenceIdx ? colors.hover : colors.bg,
              borderBottom: `2px solid ${colors.border}`,
              borderRadius: '2px',
              zIndex: 1,
            }}
          />
          
          {/* Label centered over the first segment of the hovered sentence */}
          {hoveredSentenceIdx === h.sentenceIdx && h.isFirstOfSentence && (
            <div
              className="absolute z-[100] pointer-events-none"
              style={{
                top: h.top - 22,
                left: h.left + (h.width / 2),
                transform: 'translateX(-50%)',
              }}
            >
              <div 
                className="text-white text-[10px] font-black px-1.5 py-0.5 rounded shadow-sm flex items-center gap-1 border"
                style={{
                  backgroundColor: colors.label,
                  borderColor: `${colors.label}80` // 50% opacity
                }}
              >
                <span className="opacity-80">AI</span>
                {Math.round(h.probability)}%
              </div>
              {/* Little arrow down */}
              <div 
                className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent mx-auto" 
                style={{
                  borderTop: `4px solid ${colors.label}`
                }}
              />
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
