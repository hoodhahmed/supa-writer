import React, { useEffect, useRef, useState } from 'react';
import { Sparkles, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';

interface Version {
  text: string;
  score?: number | null;
}

interface SuggestionPanelProps {
  versions: Version[];
  index: number;
  onApply: (index: number) => void;
  onReject: () => void;
  onRegenerate: (index: number) => void;
  onPrev: () => void;
  onNext: () => void;
}

function computeAIScore(wh_score?: number | null) {
  if (wh_score == null) return null;
  const pct = Math.round((1 - wh_score) * 100);
  return Math.min(100, Math.max(0, pct));
}

function scoreColor(score: number | null) {
  if (score == null) return '#999999';
  if (score >= 70) return '#FF3B30';
  if (score <= 30) return '#10B981';
  return '#F59E0B';
}

export function SuggestionPanel({ versions, index, onApply, onReject, onRegenerate, onPrev, onNext }: SuggestionPanelProps) {
  const current = versions[index];
  const aiScore = computeAIScore(current?.score ?? null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef(false);

  // Smaller default size
  const DEFAULT_W = 620;
  const DEFAULT_H = 190;

  const [pos, setPos] = useState<{ left: number; top: number } | null>(null);
  const resizingRef = useRef(false);
  const [size, setSize] = useState<{ width: number; height: number }>({ width: DEFAULT_W, height: DEFAULT_H });
  const startRef = useRef({ x: 0, y: 0, left: 0, top: 0, width: DEFAULT_W, height: DEFAULT_H });

  useEffect(() => {
    if (pos == null) {
      const w = window.innerWidth;
      const h = window.innerHeight;
      setPos({ left: Math.round(w / 2 - DEFAULT_W / 2), top: Math.round(h - (DEFAULT_H + 32)) });
    }
  }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!panelRef.current) return;
      if (draggingRef.current) {
        const dx = e.clientX - startRef.current.x;
        const dy = e.clientY - startRef.current.y;
        const newLeft = Math.min(Math.max(10, startRef.current.left + dx), window.innerWidth - size.width - 10);
        const newTop = Math.min(Math.max(10, startRef.current.top + dy), window.innerHeight - size.height - 10);
        setPos({ left: newLeft, top: newTop });
      } else if (resizingRef.current) {
        const dx = e.clientX - startRef.current.x;
        const dy = e.clientY - startRef.current.y;
        const maxW = Math.max(340, window.innerWidth - (startRef.current.left + 20));
        const maxH = Math.max(150, window.innerHeight - (startRef.current.top + 20));
        setSize({
          width: Math.max(340, Math.min(maxW, startRef.current.width + dx)),
          height: Math.max(150, Math.min(maxH, startRef.current.height + dy)),
        });
      }
    };
    const onUp = () => { draggingRef.current = false; resizingRef.current = false; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, [size.width, size.height]);

  const startDrag = (e: React.MouseEvent) => {
    e.stopPropagation();
    draggingRef.current = true;
    startRef.current.x = e.clientX;
    startRef.current.y = e.clientY;
    startRef.current.left = pos?.left ?? 0;
    startRef.current.top = pos?.top ?? 0;
  };

  const startResize = (e: React.MouseEvent) => {
    e.stopPropagation();
    resizingRef.current = true;
    startRef.current.x = e.clientX;
    startRef.current.y = e.clientY;
    startRef.current.width = size.width;
    startRef.current.height = size.height;
    startRef.current.left = pos?.left ?? startRef.current.left;
    startRef.current.top = pos?.top ?? startRef.current.top;
  };

  const textAreaHeight = Math.max(56, size.height - 118);

  return (
    <div style={{
      position: 'fixed',
      zIndex: 60,
      left: pos ? pos.left : '50%',
      top: pos ? pos.top : 'auto',
      transform: pos ? 'none' : 'translateX(-50%)',
      width: size.width,
      filter: 'drop-shadow(0 8px 24px rgba(8,22,33,0.12))',
    }}>
      <div
        ref={panelRef}
        style={{
          position: 'relative',
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: 14,
          height: size.height,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
        onMouseDown={e => e.stopPropagation()}
      >
        {/* Left cyan accent bar */}
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: '#33C3FF', borderRadius: '14px 0 0 14px' }} />

        {/* Header — draggable */}
        <div
          onMouseDown={startDrag}
          style={{
            cursor: 'grab',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 14px 8px 18px',
            borderBottom: '1px solid #f1f5f9',
            flexShrink: 0,
            userSelect: 'none',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Sparkles size={13} color="#0d95d8" strokeWidth={2} />
            <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#0d95d8' }}>
              Variation Proposed
            </span>
            <span style={{ marginLeft: 4, fontSize: 10, color: '#6b7280' }}>
              {index + 1}/{versions.length}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {aiScore != null && (
              <span style={{
                fontSize: 10, fontWeight: 600, padding: '2px 8px',
                borderRadius: 20, background: '#f8fafc',
                border: `1px solid ${scoreColor(aiScore)}22`,
                color: scoreColor(aiScore),
                letterSpacing: '0.02em',
              }}>
                AI {aiScore}%
              </span>
            )}
            <span style={{
              fontSize: 10, fontWeight: 500, padding: '2px 8px',
              borderRadius: 20, background: '#FFF8ED',
              border: '1px solid #fde68a', color: '#D97706',
              letterSpacing: '0.02em',
            }}>ACADEMIC</span>

            {/* Close */}
            <button
              onClick={onReject}
              style={{
                background: 'transparent', border: 'none', cursor: 'pointer',
                color: '#9ca3af', fontSize: 14, lineHeight: 1,
                padding: '2px 4px', borderRadius: 4,
                display: 'flex', alignItems: 'center',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
              onMouseLeave={e => (e.currentTarget.style.color = '#9ca3af')}
              title="Reject"
            >✕</button>
          </div>
        </div>

        {/* Text preview area */}
        <div style={{
          flex: 1,
          margin: '8px 14px 0 18px',
          padding: '8px 12px',
          borderRadius: 8,
          background: '#f9fbfd',
          border: '1px solid #e8f0f7',
          overflow: 'auto',
          height: textAreaHeight,
        }}>
          <p style={{
            fontSize: 13,
            lineHeight: 1.6,
            color: '#1f2937',
            margin: 0,
            fontStyle: 'italic',
          }}>
            "{current?.text}"
          </p>
        </div>

        {/* Footer actions */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 14px 10px 18px',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button
              onClick={() => onRegenerate(index)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                padding: '4px 10px', borderRadius: 6, border: '1px solid #e2e8f0',
                background: '#fff', fontSize: 11, color: '#374151',
                cursor: 'pointer', fontWeight: 500,
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#f9fafb')}
              onMouseLeave={e => (e.currentTarget.style.background = '#fff')}
            >
              <RefreshCw size={11} /> Regenerate
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <button
                onClick={onPrev}
                disabled={index === 0}
                style={{
                  padding: '4px 6px', borderRadius: 6, border: '1px solid #e2e8f0',
                  background: '#fff', cursor: index === 0 ? 'default' : 'pointer',
                  color: index === 0 ? '#d1d5db' : '#374151', display: 'flex', alignItems: 'center',
                }}
              ><ChevronLeft size={13} /></button>
              <button
                onClick={onNext}
                disabled={index === versions.length - 1}
                style={{
                  padding: '4px 6px', borderRadius: 6, border: '1px solid #e2e8f0',
                  background: '#fff', cursor: index === versions.length - 1 ? 'default' : 'pointer',
                  color: index === versions.length - 1 ? '#d1d5db' : '#374151', display: 'flex', alignItems: 'center',
                }}
              ><ChevronRight size={13} /></button>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={() => onApply(index)}
              style={{
                padding: '5px 16px', background: '#0d95d8', color: '#fff',
                border: 'none', borderRadius: 7, fontSize: 12, fontWeight: 600,
                cursor: 'pointer', letterSpacing: '-0.1px',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#0b86c9')}
              onMouseLeave={e => (e.currentTarget.style.background = '#0d95d8')}
            >Apply Change</button>
          </div>
        </div>

        {/* Resize handle */}
        <div
          onMouseDown={startResize}
          style={{
            position: 'absolute', right: 8, bottom: 8,
            width: 14, height: 14, cursor: 'nwse-resize',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: 0.4,
          }}
          aria-hidden
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M9 1L1 9M9 5L5 9M9 9" stroke="#0d95d8" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
      </div>
    </div>
  );
}

export default SuggestionPanel;
