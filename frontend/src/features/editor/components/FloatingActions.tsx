import { Button } from '@/components/ui/button';
import { Zap, Sparkles, Pencil, Image, HelpCircle } from 'lucide-react';

interface FloatingActionsProps {
  onAIClick?: () => void;
  onFormatClick?: () => void;
  onHelpClick?: () => void;
}

export function FloatingActions({ onAIClick, onFormatClick, onHelpClick }: FloatingActionsProps) {
  return (
    <>
      {/* Left floating AI button */}
      <button
        onClick={onAIClick}
        className="fixed left-8 top-1/2 -translate-y-1/2 z-50 w-14 h-14 rounded-full bg-[#33C3FF] hover:bg-[#1FA8E0] shadow-lg hover:shadow-xl transition-all flex items-center justify-center text-white"
        title="AI Assistant"
      >
        <Zap className="h-6 w-6" />
      </button>

      {/* Bottom center floating toolbar */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-white/80 backdrop-blur-md border border-[#EAEAEA] rounded-full px-2 py-2 shadow-lg flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-full hover:bg-[#F5F5F5] text-[#555555] hover:text-[#111111]"
          title="Format"
        >
          <Sparkles className="h-5 w-5" />
        </Button>
        <div className="w-px h-6 bg-[#EAEAEA]" />
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-full hover:bg-[#F5F5F5] text-[#555555] hover:text-[#111111]"
          title="Edit"
        >
          <Pencil className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-full hover:bg-[#F5F5F5] text-[#555555] hover:text-[#111111]"
          title="Image"
        >
          <Image className="h-5 w-5" />
        </Button>
      </div>

      {/* Bottom right help button */}
      <button
        onClick={onHelpClick}
        className="fixed right-8 bottom-8 z-50 w-14 h-14 rounded-full bg-[#111111] hover:bg-[#333333] shadow-lg hover:shadow-xl transition-all flex items-center justify-center text-white"
        title="Help"
      >
        <HelpCircle className="h-6 w-6" />
      </button>
    </>
  );
}
