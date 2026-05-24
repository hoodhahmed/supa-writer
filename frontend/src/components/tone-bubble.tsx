import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface ToneScores {
  friendly: number;
  formal: number;
  clear: number;
  simple: number;
  concise: number;
}

interface ToneBubbleProps {
  tone: ToneScores;
  yPos: number;
  isActive: boolean;
  onClick: () => void;
  onClose: () => void;
}

export function ToneBubble({ tone, yPos, isActive, onClick, onClose }: ToneBubbleProps) {
  const bubbleRef = useRef<HTMLDivElement>(null);

  const sortedTones = Object.entries(tone)
    .sort((a, b) => b[1] - a[1])
    .map(([key, val]) => ({
      label: key.charAt(0).toUpperCase() + key.slice(1),
      score: Math.round(val * 100),
      key,
    }));

  // Close on outside click
  useEffect(() => {
    if (!isActive) return;
    const handler = (e: MouseEvent) => {
      if (bubbleRef.current && !bubbleRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isActive, onClose]);

  return (
    <div
      ref={bubbleRef}
      className="absolute left-[calc(100%+92px)] pointer-events-auto"
      style={{
        top: yPos,
        transform: 'translateY(-50%)',
        zIndex: isActive ? 100 : 50,
      }}
    >
      {/* Collapsed: subtle indicator circle */}
      {!isActive && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          className={cn(
            'group w-9 h-9 rounded-full flex items-center justify-center',
            'bg-[#E2E8F0] hover:bg-[#FFE600] border border-slate-300 shadow-sm',
            'transition-all duration-300 ease-out hover:scale-110',
            'cursor-pointer'
          )}
          aria-label="Show tone analysis"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-slate-500 group-hover:text-[#7a6a00] transition-colors"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </button>
      )}

      {/* Expanded: yellow speech bubble panel */}
      {isActive && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="animate-in fade-in zoom-in-95 duration-200 origin-left"
          style={{
            background: '#FFE600',
            borderRadius: '4px 16px 16px 16px',
            padding: '12px 14px 14px',
            minWidth: '184px',
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
          }}
        >
          {/* Header */}
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: '#7a6a00',
              letterSpacing: '0.04em',
              marginBottom: 10,
              display: 'flex',
              alignItems: 'center',
              gap: 5,
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" y1="6" x2="20" y2="6" /><line x1="4" y1="12" x2="14" y2="12" /><line x1="4" y1="18" x2="18" y2="18" />
            </svg>
            Tone analysis
          </div>

          {/* Tone rows */}
          <div className="flex flex-col gap-[7px]">
            {sortedTones.map((t) => (
              <div key={t.key} className="flex items-center gap-2">
                <span style={{ fontSize: 12, fontWeight: 500, color: '#3d3000', width: 62, flexShrink: 0 }}>
                  {t.label}
                </span>
                <div
                  style={{
                    flex: 1,
                    height: 5,
                    background: 'rgba(0,0,0,0.12)',
                    borderRadius: 99,
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${t.score}%`,
                      height: '100%',
                      background: '#3d3000',
                      borderRadius: 99,
                      transition: 'width 0.4s ease',
                    }}
                  />
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#3d3000', width: 30, textAlign: 'right' }}>
                  {t.score}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}