import { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { History, RotateCcw, Clock } from 'lucide-react';

interface HistoryDialogProps {
  docId: string;
  onRestore: (content: string) => void;
  getVersions: (docId: string) => Promise<any[]>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HistoryDialog({ docId, onRestore, getVersions, open, onOpenChange }: HistoryDialogProps) {
  const [versions, setVersions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<any | null>(null);

  useEffect(() => {
    if (open && docId) {
      setLoading(true);
      getVersions(docId).then(data => {
        setVersions(data);
        if (data.length > 0) setSelectedVersion(data[0]);
      }).finally(() => setLoading(false));
    }
  }, [open, docId, getVersions]);

  const handleRestore = () => {
    if (selectedVersion) {
      onRestore(selectedVersion.content);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History size={20} /> Version History
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 flex gap-6 overflow-hidden py-4">
          {/* Version List */}
          <div className="w-1/3 border-r border-border-strong pr-4 flex flex-col">
            <label className="text-[10px] font-black uppercase tracking-widest text-[#64748B] mb-3">Snapshots</label>
            <ScrollArea className="flex-1">
              <div className="space-y-2">
                {loading ? (
                   <div className="flex justify-center py-8"><div className="auth-spinner !h-6 !w-6" /></div>
                ) : versions.length === 0 ? (
                   <div className="text-xs text-[#94A3B8] italic py-8 text-center">No history found...</div>
                ) : (
                  versions.map((v, idx) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVersion(v)}
                      className={`w-full text-left p-3 rounded-xl transition-all border ${
                        selectedVersion?.id === v.id 
                          ? 'bg-[#33C3FF]/10 border-[#33C3FF]/20 text-[#1A1A1A]' 
                          : 'hover:bg-[#F8FAFC] border-transparent text-[#64748B]'
                      }`}
                    >
                      <div className="text-xs font-bold flex items-center gap-2">
                        <Clock size={12} />
                        {idx === 0 ? 'Latest (Now)' : new Date(v.created_at).toLocaleString()}
                      </div>
                      <div className="text-[10px] mt-1 opacity-60 line-clamp-1">
                        {v.content.replace(/<[^>]*>/g, '').substring(0, 40)}...
                      </div>
                    </button>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Preview */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <label className="text-[10px] font-black uppercase tracking-widest text-[#64748B] mb-3">Preview</label>
            <ScrollArea className="flex-1 bg-[#F8FAFC] rounded-2xl border border-border-strong p-6">
               <div 
                 className="prose prose-sm max-w-none text-slate-700 editor-content"
                 dangerouslySetInnerHTML={{ __html: selectedVersion?.content || '' }}
               />
            </ScrollArea>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">
            Cancel
          </Button>
          <Button 
            onClick={handleRestore} 
            disabled={!selectedVersion}
            className="premium-btn-accent flex items-center gap-2"
          >
            <RotateCcw size={16} /> Restore this version
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
