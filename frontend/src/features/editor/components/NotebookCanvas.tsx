import React from 'react';

interface NotebookCanvasProps {
  children?: React.ReactNode;
}

export function NotebookCanvas({ children }: NotebookCanvasProps) {
  return (
    <div className="notebook-canvas-wrapper">
      <div className="notebook-paper">
        {/* Ruled lines background */}
        <div className="notebook-lines" />

        {/* Pink vertical margin line */}
        <div className="notebook-margin" />

        {/* Content container with padding */}
        <div className="notebook-content">
          {children}
        </div>
      </div>
    </div>
  );
}
