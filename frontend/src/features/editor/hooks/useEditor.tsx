import { useState } from 'react';

export function useEditor() {
  const [selection, setSelection] = useState<string>('');
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [suggestionScore, setSuggestionScore] = useState<number | null>(null);
  const [toolbarPos, setToolbarPos] = useState<{ x: number; y: number } | null>(null);
  const [isHumanizing, setIsHumanizing] = useState(false);
  const [particleEffect, setParticleEffect] = useState<{ text: string; x: number; y: number } | null>(null);

  return {
    selection,
    setSelection,
    suggestion,
    setSuggestion,
    suggestionScore,
    setSuggestionScore,
    toolbarPos,
    setToolbarPos,
    isHumanizing,
    setIsHumanizing,
    particleEffect,
    setParticleEffect,
  } as const;
}
