import { Check } from 'lucide-react';
import { useEffect, useState } from 'react';

interface SaveStatusProps {
  saved: boolean;
  autoHideDelay?: number;
}

export function SaveStatus({ saved, autoHideDelay = 2000 }: SaveStatusProps) {
  const [visible, setVisible] = useState(false);
  const [isHiding, setIsHiding] = useState(false);

  useEffect(() => {
    if (saved) {
      setIsHiding(false);
      setVisible(true);
      const timer = setTimeout(() => {
        setIsHiding(true);
        setTimeout(() => setVisible(false), 300);
      }, autoHideDelay);
      return () => clearTimeout(timer);
    }
  }, [saved, autoHideDelay]);

  if (!visible) return null;

  return (
    <div className={`save-indicator ${isHiding ? 'fading' : ''}`}>
      <Check className="h-3.5 w-3.5" />
      <span>Saved</span>
    </div>
  );
}
