import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Sparkles, Zap, MessageSquare, Gauge, CheckCircle2, X } from 'lucide-react';

interface QualityScores {
  score: number;
  engagementScore: number;
  fluencyScore: number;
  clarityScore: number;
  deliveryScore: number;
  unclearScore: number;
}

interface QualityCardProps {
  scores: QualityScores;
  x: number;
  y: number;
  onClose: () => void;
}

export function QualityCard({ scores, x, y, onClose }: QualityCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [adjustedX, setAdjustedX] = React.useState(x);

  useEffect(() => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const padding = 20;
      let newX = x;

      if (x - rect.width / 2 < padding) {
        newX = rect.width / 2 + padding;
      } else if (x + rect.width / 2 > window.innerWidth - padding) {
        newX = window.innerWidth - rect.width / 2 - padding;
      }
      setAdjustedX(newX);
    }
  }, [x]);

  if (!scores) return null;

  const metrics = [
    { label: 'Overall Quality', score: Math.round(scores.score * 100), icon: <Gauge size={14} />, color: '#10B981' },
    { label: 'Engagement', score: Math.round(scores.engagementScore * 100), icon: <Sparkles size={14} />, color: '#6366F1' },
    { label: 'Fluency', score: Math.round(scores.fluencyScore * 100), icon: <Zap size={14} />, color: '#8B5CF6' },
    { label: 'Clarity', score: Math.round(scores.clarityScore * 100), icon: <CheckCircle2 size={14} />, color: '#3B82F6' },
    { label: 'Delivery', score: Math.round(scores.deliveryScore * 100), icon: <MessageSquare size={14} />, color: '#F59E0B' },
  ];

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handler, true);
    return () => document.removeEventListener('mousedown', handler, true);
  }, [onClose]);

  return (
    <div
      ref={cardRef}
      className="fixed z-[100] shadow-2xl overflow-hidden pointer-events-auto"
      style={{
        left: adjustedX,
        top: y,
        transform: 'translate(-50%, -100%) translateY(-12px)',
        background: '#FFFFFF',
        borderRadius: '16px',
        border: '1px solid #E2E8F0',
        width: '240px',
        animation: 'quality-card-pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
      }}
    >
      <style>{`
        @keyframes quality-card-pop {
          0% { opacity: 0; transform: translate(-50%, -90%) translateY(-12px) scale(0.9); }
          100% { opacity: 1; transform: translate(-50%, -100%) translateY(-12px) scale(1); }
        }
      `}</style>
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-2 text-slate-800 font-bold text-xs uppercase tracking-wider">
          <Gauge size={14} className="text-indigo-500" />
          Quality Score
        </div>
        <button 
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X size={14} />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-4">
        {metrics.map((m) => (
          <div key={m.label} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-600 font-semibold text-[11px]">
                <span style={{ color: m.color }}>{m.icon}</span>
                {m.label}
              </div>
              <span className="text-slate-900 font-bold text-[11px]">
                {m.score}%
              </span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                style={{
                  width: `${m.score}%`,
                  height: '100%',
                  background: m.color,
                  borderRadius: 99,
                  transition: 'width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
                }}
              />
            </div>
          </div>
        ))}

        {scores.unclearScore > 0.5 && (
          <div className="mt-1 p-2 bg-amber-50 rounded-lg border border-amber-100 flex items-start gap-2">
            <span className="text-amber-500 mt-0.5">⚠️</span>
            <div className="text-[10px] text-amber-700 font-medium leading-relaxed">
              This sentence might be unclear. Consider simplifying.
            </div>
          </div>
        )}
      </div>

      {/* Arrow */}
      <div 
        className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-r border-b border-slate-200 rotate-45"
      />
    </div>
  );
}
