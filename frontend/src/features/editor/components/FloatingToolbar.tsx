import React from 'react';
import { Sparkles, Sliders } from 'lucide-react';

interface Props {
  x: number;
  y: number;
  onHumanize: () => void;
  onTone?: () => void;
  onClose?: () => void;
  disabled?: boolean;
}

export function FloatingToolbar({ x, y, onHumanize, onTone, onClose, disabled }: Props) {
  const style: React.CSSProperties = {
    position: 'fixed',
    left: x,
    top: y,
    zIndex: 60,
    background: '#1A1A1A',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 12,
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.3)',
    padding: '6px',
    display: 'flex',
    gap: 4,
    alignItems: 'center',
    color: '#FFFFFF',
  };

  const btnBase: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '6px 12px',
    borderRadius: 8,
    border: 'none',
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    letterSpacing: '-0.1px',
    whiteSpace: 'nowrap',
    color: '#E5E7EB',
    background: 'transparent',
  };

  const divider: React.CSSProperties = {
    width: 1,
    height: 18,
    background: 'rgba(255,255,255,0.15)',
    margin: '0 4px',
    flexShrink: 0,
  };

  return (
    <div style={style} className="floating-toolbar" role="toolbar" aria-label="Selection toolbar">
      {/* Format group */}
      <div style={{ display: 'flex', gap: 2 }}>
        <button
          title="Bold"
          style={{ ...btnBase, padding: '6px 10px', fontWeight: 700 }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#FFFFFF'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#E5E7EB'; }}
        >B</button>
        <button
          title="Italic"
          style={{ ...btnBase, padding: '6px 10px', fontStyle: 'italic' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#FFFFFF'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#E5E7EB'; }}
        >I</button>
      </div>

      <div style={divider} />

      {/* Humanize */}
      <button
        onClick={onHumanize}
        disabled={disabled}
        title="Humanize selected text"
        style={{
          ...btnBase,
          background: disabled ? 'rgba(51, 195, 255, 0.5)' : '#33C3FF',
          color: '#fff',
          opacity: disabled ? 0.7 : 1,
          padding: '6px 14px',
          boxShadow: '0 2px 4px rgba(51, 195, 255, 0.2)',
        }}
        onMouseEnter={e => { if (!disabled) { e.currentTarget.style.background = '#0db3f0'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
        onMouseLeave={e => { if (!disabled) { e.currentTarget.style.background = '#33C3FF'; e.currentTarget.style.transform = 'translateY(0)'; } }}
      >
        <Sparkles size={14} strokeWidth={2.5} />
        Humanize
      </button>

      {/* Tone */}
      <button
        onClick={onTone}
        disabled={disabled}
        title="Change tone"
        style={{
          ...btnBase,
        }}
        onMouseEnter={e => { if (!disabled) { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#FFFFFF'; } }}
        onMouseLeave={e => { if (!disabled) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#E5E7EB'; } }}
      >
        <Sliders size={14} strokeWidth={2} />
        Tone
      </button>

      <div style={divider} />

      {/* Close */}
      <button
        onClick={onClose}
        title="Dismiss"
        style={{
          ...btnBase,
          padding: '6px 8px',
          color: '#9ca3af',
        }}
        onMouseEnter={e => { e.currentTarget.style.color = '#FFFFFF'; e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
        onMouseLeave={e => { e.currentTarget.style.color = '#9ca3af'; e.currentTarget.style.background = 'transparent'; }}
      >✕</button>
    </div>
  );
}


export default FloatingToolbar;
