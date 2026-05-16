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
    transform: 'translate(-50%, -120%)',
    zIndex: 60,
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: 10,
    boxShadow: '0 4px 16px rgba(8,22,33,0.10), 0 1px 4px rgba(8,22,33,0.06)',
    padding: '5px 6px',
    display: 'flex',
    gap: 4,
    alignItems: 'center',
  };

  const btnBase: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    padding: '5px 10px',
    borderRadius: 7,
    border: 'none',
    fontSize: 12,
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'background 0.12s, opacity 0.12s',
    letterSpacing: '-0.1px',
    whiteSpace: 'nowrap',
  };

  const divider: React.CSSProperties = {
    width: 1,
    height: 18,
    background: '#e2e8f0',
    margin: '0 2px',
    flexShrink: 0,
  };

  return (
    <div style={style} role="toolbar" aria-label="Selection toolbar">
      {/* Format group */}
      <button
        title="Bold"
        style={{ ...btnBase, background: 'transparent', color: '#374151', fontWeight: 700, padding: '5px 8px', fontSize: 13 }}
        onMouseEnter={e => (e.currentTarget.style.background = '#f3f4f6')}
        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
      >B</button>
      <button
        title="Italic"
        style={{ ...btnBase, background: 'transparent', color: '#374151', fontStyle: 'italic', padding: '5px 8px', fontSize: 13 }}
        onMouseEnter={e => (e.currentTarget.style.background = '#f3f4f6')}
        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
      >I</button>
      <button
        title="Underline"
        style={{ ...btnBase, background: 'transparent', color: '#374151', textDecoration: 'underline', padding: '5px 8px', fontSize: 13 }}
        onMouseEnter={e => (e.currentTarget.style.background = '#f3f4f6')}
        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
      >U</button>

      <div style={divider} />

      {/* Humanize */}
      <button
        onClick={onHumanize}
        disabled={disabled}
        title="Humanize selected text"
        style={{
          ...btnBase,
          background: disabled ? '#b2e8fb' : '#33C3FF',
          color: '#fff',
          opacity: disabled ? 0.7 : 1,
        }}
        onMouseEnter={e => { if (!disabled) e.currentTarget.style.background = '#0db3f0'; }}
        onMouseLeave={e => { if (!disabled) e.currentTarget.style.background = '#33C3FF'; }}
      >
        <Sparkles size={12} strokeWidth={2} />
        Humanize
      </button>

      {/* Tone */}
      <button
        onClick={onTone}
        disabled={disabled}
        title="Change tone"
        style={{
          ...btnBase,
          background: 'transparent',
          color: '#374151',
          border: '1px solid #e2e8f0',
          opacity: disabled ? 0.7 : 1,
        }}
        onMouseEnter={e => { if (!disabled) e.currentTarget.style.background = '#f3f4f6'; }}
        onMouseLeave={e => { if (!disabled) e.currentTarget.style.background = 'transparent'; }}
      >
        <Sliders size={12} strokeWidth={2} />
        Tone
      </button>

      <div style={divider} />

      {/* Close */}
      <button
        onClick={onClose}
        title="Dismiss"
        style={{
          ...btnBase,
          background: 'transparent',
          color: '#9ca3af',
          padding: '5px 6px',
          fontSize: 14,
          lineHeight: 1,
          border: 'none',
        }}
        onMouseEnter={e => (e.currentTarget.style.color = '#374151')}
        onMouseLeave={e => (e.currentTarget.style.color = '#9ca3af')}
      >✕</button>
    </div>
  );
}

export default FloatingToolbar;
