import React from 'react';

interface NotebookCanvasProps {
  children?: React.ReactNode;
  isRewriting?: boolean;
}

export function NotebookCanvas({ children, isRewriting = false }: NotebookCanvasProps) {
  return (
    <div className="napkin-canvas-wrapper">
      <div className={`napkin-paper${isRewriting ? ' is-rewriting' : ''}`}>
        <div className="napkin-paper-accent" />
        <div className="napkin-paper-content">
          {children}
        </div>
      </div>
    </div>
  );
}
