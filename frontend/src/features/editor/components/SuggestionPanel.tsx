import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SuggestionPanelProps {
  suggestion: string;
  score: number | null;
  onAccept: () => void;
  onReject: () => void;
}

export function SuggestionPanel({
  suggestion,
  score,
  onAccept,
  onReject
}: SuggestionPanelProps) {
  return (
    <div className="suggestion-panel">
      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold text-[#33C3FF] uppercase tracking-widest flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5" /> Variation
          </div>
          {score !== null && (
            <div className="text-xs font-semibold text-[#555555]">
              Score: {score}
            </div>
          )}
        </div>

        {/* Suggestion Text */}
        <p className="text-sm text-[#555555] italic">
          "{suggestion}"
        </p>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onReject}
            className="text-xs text-[#555555]"
          >
            Reject
          </Button>
          <Button
            size="sm"
            onClick={onAccept}
            className="bg-[#33C3FF] hover:bg-[#1FA8E0] text-white text-xs"
          >
            Apply
          </Button>
        </div>
      </div>
    </div>
  );
}
