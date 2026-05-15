import React from 'react';

interface Sentence {
  text: string;
  score: number;
}

interface ForensicOverlayProps {
  sentences?: Sentence[];
  editorRef?: React.RefObject<HTMLDivElement | null>;
}

export function ForensicOverlay(_props: ForensicOverlayProps): React.ReactNode {
  return <div>Forensic Overlay</div>;
}
