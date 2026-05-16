import React from 'react';

interface NotebookCanvasProps {
  children?: React.ReactNode;
  isRewriting?: boolean;
}

export function NotebookCanvas({ children, isRewriting = false }: NotebookCanvasProps) {
  return (
    <div className="napkin-canvas-wrapper">
      <div className={`napkin-paper${isRewriting ? ' is-rewriting' : ''}`}>
        {/* Blue left accent bar */}
        <div className="napkin-paper-accent" />
        {/* Content */}
        <div className="napkin-paper-content">
          {children}
        </div>
      </div>
      {/* Chat bubble button */}
      <button className="napkin-chat-btn" title="AI Chat">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
      </button>
    </div>
  );
}
