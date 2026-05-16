import React from 'react';

interface Props {
  x: number;
  y: number;
  onHumanize: () => void;
  onClose?: () => void;
  disabled?: boolean;
}

export function FloatingToolbar({ x, y, onHumanize, onClose, disabled }: Props) {
  const style: React.CSSProperties = {
    position: 'fixed',
    left: x,
    top: y,
    transform: 'translate(-50%, -120%)',
    zIndex: 60,
    background: '#ffffff',
    border: '1px solid #e6eef5',
    borderRadius: 8,
    boxShadow: '0 6px 20px rgba(8,22,33,0.08)',
    padding: '6px 8px',
    display: 'flex',
    gap: 8,
    alignItems: 'center',
  };

  return (
    <div style={style} role="toolbar" aria-label="Selection toolbar">
      <button
        onClick={onHumanize}
        disabled={disabled}
        className="px-3 py-1 rounded bg-[#33C3FF] text-white text-sm"
      >
        Humanize
      </button>
      <button
        onClick={onClose}
        className="px-2 py-1 rounded bg-transparent text-sm text-[#444] border border-transparent hover:border-[#e6eef5]"
      >
        Close
      </button>
    </div>
  );
}

export default FloatingToolbar;
