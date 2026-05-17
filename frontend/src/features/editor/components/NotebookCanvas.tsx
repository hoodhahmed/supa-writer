import React from 'react';

interface NotebookCanvasProps {
  children?: React.ReactNode;
  isRewriting?: boolean;
  isScanning?: boolean;
}

export function NotebookCanvas({ children, isRewriting = false, isScanning = false }: NotebookCanvasProps) {
  return (
    <div className="napkin-canvas-wrapper">
      <div className={`napkin-paper${(isRewriting || isScanning) ? ' is-rewriting' : ''}`}>
        <div className="napkin-paper-accent" />
        <div className="napkin-paper-content">
          {children}
        </div>
      </div>
    </div>
  );
}
