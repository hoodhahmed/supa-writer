import React, { useEffect, useRef, useState } from 'react';
import { Sparkles, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Version {
  text: string;
  score?: number | null; // wh_score from backend
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
  // AI score = (1 - wh_score) * 100
  const pct = Math.round((1 - wh_score) * 100);
  return Math.min(100, Math.max(0, pct));
}

function scoreColor(score: number | null) {
  if (score == null) return '#999999';
  if (score >= 70) return '#FF3B30'; // red
  if (score <= 30) return '#10B981'; // green
  return '#F59E0B'; // yellow
}

export function SuggestionPanel({ versions, index, onApply, onReject, onRegenerate, onPrev, onNext }: SuggestionPanelProps) {
  const current = versions[index];
  const aiScore = computeAIScore(current?.score ?? null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef(false);
  // position state
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null);
  // resize state
  const resizingRef = useRef(false);
  const [size, setSize] = useState<{ width: number; height: number }>({ width: 760, height: 220 });
  const startRef = useRef({ x: 0, y: 0, left: 0, top: 0, width: 760, height: 220 });

  useEffect(() => {
    // initialize center bottom position if not set
    if (pos == null) {
      const w = window.innerWidth;
      const h = window.innerHeight;
      setPos({ left: Math.round(w / 2 - size.width / 2), top: Math.round(h - (size.height + 40)) });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!panelRef.current) return;
      const clientX = e.clientX;
      const clientY = e.clientY;
      if (draggingRef.current) {
        const dx = clientX - startRef.current.x;
        const dy = clientY - startRef.current.y;
        const newLeft = startRef.current.left + dx;
        const newTop = startRef.current.top + dy;
        // clamp to viewport with 10px padding
        const clampedLeft = Math.min(Math.max(10, newLeft), Math.max(10, window.innerWidth - (size.width + 10)));
        const clampedTop = Math.min(Math.max(10, newTop), Math.max(10, window.innerHeight - (size.height + 10)));
        setPos({ left: clampedLeft, top: clampedTop });
      } else if (resizingRef.current) {
        const dx = clientX - startRef.current.x;
        const dy = clientY - startRef.current.y;
        // compute available max size based on current position
        const maxW = Math.max(320, window.innerWidth - (startRef.current.left + 20));
        const maxH = Math.max(160, window.innerHeight - (startRef.current.top + 20));
        const newW = Math.max(320, Math.min(maxW, startRef.current.width + dx));
        const newH = Math.max(160, Math.min(maxH, startRef.current.height + dy));
        setSize({ width: newW, height: newH });
      }
    };
    const onUp = () => { draggingRef.current = false; resizingRef.current = false; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, []);
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
    // ensure startRef has current left/top for max size calculations
    startRef.current.left = pos?.left ?? startRef.current.left;
    startRef.current.top = pos?.top ?? startRef.current.top;
  };
  return (
    <div style={{ position: 'fixed', zIndex: 60, left: pos ? pos.left : '50%', top: pos ? pos.top : 'auto', transform: pos ? 'none' : 'translateX(-50%)', width: size.width }}>
      <div ref={panelRef} className="relative bg-white border rounded-2xl shadow-lg p-6" onMouseDown={(e) => e.stopPropagation()} style={{ height: size.height }}>
        {/* left cyan bar */}
        <div style={{ position: 'absolute', left: 14, top: 18, bottom: 18, width: 4, background: '#33C3FF', borderRadius: 4 }} />

        <div className="flex items-start justify-between" onMouseDown={startDrag} style={{ cursor: 'grab' }}>
          <div className="flex items-center gap-3">
            <div className="text-xs font-semibold uppercase text-[#0d95d8] flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              VARIATION PROPOSED
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-2 py-1 text-xs rounded-full bg-[#F0FBFF]" style={{ color: scoreColor(aiScore ?? null) }}>
              AI SCORE: {aiScore != null ? `${aiScore}%` : '—'}
            </div>
            <div className="px-2 py-1 text-xs rounded-full bg-[#FFF4E6] text-[#D97706]">ACADEMIC</div>
          </div>
        </div>

        <div className="mt-4 p-6 rounded-lg bg-white border" style={{ height: Math.max(80, size.height - 140), overflow: 'auto' }}>
          <blockquote className="text-lg italic text-[#111827]">“{current?.text} ”</blockquote>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => onRegenerate(index)} className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-white border text-sm">
              <RefreshCw className="h-4 w-4" /> Regenerate
            </button>

            <div className="flex items-center gap-2">
              <button onClick={onPrev} className="p-2 rounded-md bg-white border"><ChevronLeft /></button>
              <button onClick={onNext} className="p-2 rounded-md bg-white border"><ChevronRight /></button>
              <div className="text-sm text-[#6B7280]">{index + 1}/{versions.length}</div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={onReject} className="text-sm text-[#EF4444] flex items-center gap-2">✖ Reject</button>
            <button onClick={() => onApply(index)} className="px-4 py-2 bg-[#0d95d8] hover:bg-[#0b86c9] text-white rounded-md">Apply Change</button>
          </div>
        </div>

        {/* resize handle */}
        <div
          onMouseDown={startResize}
          style={{ position: 'absolute', right: 12, bottom: 12, width: 18, height: 18, cursor: 'nwse-resize', borderRadius: 3, background: '#E6F6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          aria-hidden
        >
          <div style={{ width: 10, height: 10, transform: 'rotate(45deg)', borderBottom: '2px solid #0d95d8', borderRight: '2px solid #0d95d8' }} />
        </div>
      </div>
    </div>
  );
}

export default SuggestionPanel;
