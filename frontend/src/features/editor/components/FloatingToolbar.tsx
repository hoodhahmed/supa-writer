import React from 'react';
import { Sparkles, Sliders, AlignLeft, AlignCenter, AlignRight, AlignJustify, Bold, Italic, Search } from 'lucide-react';

interface Props {
  x: number;
  y: number;
  onHumanize: () => void;
  onGrammarlyCheck: () => void;
  onTone: (tone: string) => void;
  selectedTone?: string;
  onClose?: () => void;
  disabled?: boolean;
}

export function FloatingToolbar({ x, y, onHumanize, onGrammarlyCheck, onTone, selectedTone = 'Standard', onClose, disabled }: Props) {
  const [showToneMenu, setShowToneMenu] = React.useState(false);
  
  const tones = [
    { label: 'Standard', value: 'Standard' },
    { label: 'Professional', value: 'Professional' },
    { label: 'Academic', value: 'Academic' },
    { label: 'Casual', value: 'Casual' },
    { label: 'Creative', value: 'Creative' },
    { label: 'Concise', value: 'Concise' },
  ];

  const style: React.CSSProperties = {
    position: 'fixed',
    left: x,
    top: y,
    zIndex: 60,
    background: '#333333',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 12,
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.3)',
    padding: '6px',
    display: 'flex',
    gap: 2,
    alignItems: 'center',
    color: '#FFFFFF',
  };

  const btnBase: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: '6px 10px',
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

  const applyFormat = (cmd: string) => {
    document.execCommand(cmd, false);
  };

  return (
    <div style={style} className="floating-toolbar" role="toolbar" aria-label="Selection toolbar">
      {/* Format group */}
      <div style={{ display: 'flex', gap: 1 }}>
        <button
          title="Bold"
          style={btnBase}
          onClick={() => applyFormat('bold')}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#FFFFFF'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#E5E7EB'; }}
        >
          <Bold size={14} />
        </button>
        <button
          title="Italic"
          style={btnBase}
          onClick={() => applyFormat('italic')}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#FFFFFF'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#E5E7EB'; }}
        >
          <Italic size={14} />
        </button>
      </div>

      <div style={divider} />

      {/* Justification Group */}
      <div style={{ display: 'flex', gap: 1 }}>
        <button
          title="Align Left"
          style={btnBase}
          onClick={() => applyFormat('justifyLeft')}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#FFFFFF'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#E5E7EB'; }}
        >
          <AlignLeft size={14} />
        </button>
        <button
          title="Align Center"
          style={btnBase}
          onClick={() => applyFormat('justifyCenter')}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#FFFFFF'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#E5E7EB'; }}
        >
          <AlignCenter size={14} />
        </button>
        <button
          title="Align Right"
          style={btnBase}
          onClick={() => applyFormat('justifyRight')}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#FFFFFF'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#E5E7EB'; }}
        >
          <AlignRight size={14} />
        </button>
        <button
          title="Justify"
          style={btnBase}
          onClick={() => applyFormat('justifyFull')}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#FFFFFF'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#E5E7EB'; }}
        >
          <AlignJustify size={14} />
        </button>
      </div>

      <div style={divider} />

      {/* Humanize */}
      <div style={{ display: 'flex', gap: 4 }}>
        <button
          onClick={onHumanize}
          disabled={disabled}
          title={`Humanize selected text as ${selectedTone}`}
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
          {selectedTone === 'Standard' ? 'Humanize' : `Write as ${selectedTone}`}
        </button>

        <button
          onClick={onGrammarlyCheck}
          disabled={disabled}
          title="Grammarly AI Check"
          style={{
            ...btnBase,
            background: disabled ? 'rgba(16, 185, 129, 0.5)' : '#10B981',
            color: '#fff',
            opacity: disabled ? 0.7 : 1,
            padding: '6px 14px',
            boxShadow: '0 2px 4px rgba(16, 185, 129, 0.2)',
          }}
          onMouseEnter={e => { if (!disabled) { e.currentTarget.style.background = '#059669'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
          onMouseLeave={e => { if (!disabled) { e.currentTarget.style.background = '#10B981'; e.currentTarget.style.transform = 'translateY(0)'; } }}
        >
          <Search size={14} strokeWidth={2.5} />
          Grammarly AI
        </button>
      </div>

      {/* Tone */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setShowToneMenu(!showToneMenu)}
          disabled={disabled}
          title="Change tone"
          style={{
            ...btnBase,
            background: showToneMenu ? 'rgba(255,255,255,0.1)' : 'transparent',
            color: showToneMenu ? '#FFFFFF' : '#E5E7EB',
          }}
          onMouseEnter={e => { if (!disabled && !showToneMenu) { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#FFFFFF'; } }}
          onMouseLeave={e => { if (!disabled && !showToneMenu) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#E5E7EB'; } }}
        >
          <Sliders size={14} strokeWidth={2} />
          Tone
        </button>

        {showToneMenu && (
          <div style={{
            position: 'absolute',
            bottom: '100%',
            left: '50%',
            transform: 'translateX(-50%) translateY(-8px)',
            background: '#333333',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 10,
            padding: '4px',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            minWidth: 120,
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.4)',
          }}>
            {tones.map(t => (
              <button
                key={t.value}
                onClick={() => {
                  onTone(t.value);
                  setShowToneMenu(false);
                }}
                style={{
                  ...btnBase,
                  textAlign: 'left',
                  padding: '6px 10px',
                  width: '100%',
                  background: selectedTone === t.value ? 'rgba(51, 195, 255, 0.15)' : 'transparent',
                  color: selectedTone === t.value ? '#33C3FF' : '#E5E7EB',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = selectedTone === t.value ? 'rgba(51, 195, 255, 0.15)' : 'transparent'; }}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}
      </div>

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
