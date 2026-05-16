import { Zap } from 'lucide-react';

interface FloatingActionsProps {
  onAIClick?: () => void;
}

export function FloatingActions({ onAIClick }: FloatingActionsProps) {
  return (
    <>
      {/* Napkin-style AI floating button: blue circle with lightning bolt, left-center of editor */}
      <button
        onClick={onAIClick}
        className="fixed z-50 flex items-center justify-center text-white transition-all"
        title="AI Assistant"
        style={{
          left: '50%',
          top: '50%',
          transform: 'translate(-640px, -50%)',
          width: '42px',
          height: '42px',
          borderRadius: '50%',
          background: '#1AABF0',
          boxShadow: '0 2px 12px rgba(26,171,240,0.35)',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        <Zap size={20} fill="white" stroke="white" />
      </button>
    </>
  );
}
