import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Plus, Trash2, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Sidebar({
  documents,
  currentDocId,
  onCreate,
  onDelete,
  onSelect,
  searchQuery,
  setSearchQuery,
}: any) {
  return (
    <aside className="w-72 border-r border-gray-200/50 bg-white flex flex-col shadow-sm">
      <div className="p-6 border-b border-gray-100">
        <div className="flex flex-col mb-6">
          <h1 className="text-2xl font-black text-primary tracking-tighter bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">SUPAWRITER</h1>
          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Writing Forensic Lab</span>
        </div>
        <Button className="w-full justify-start gap-2 bg-gradient-to-r from-primary to-primary/80 hover:shadow-lg hover:shadow-primary/20 rounded-xl transition-all duration-300" onClick={onCreate}>
          <Plus className="h-4 w-4" /> New Session
        </Button>
      </div>

      <div className="px-6 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-400/60" />
          <Input placeholder="Search history..." className="pl-9 bg-gray-50 border-gray-200/50 text-xs rounded-lg h-9 focus:ring-accent/50 focus:border-accent/50 transition-all" value={searchQuery} onChange={(e:any) => setSearchQuery(e.target.value)} />
        </div>
      </div>

      <ScrollArea className="flex-1 px-3">
        <div className="space-y-1">
          {documents.map((doc: any) => (
            <div key={doc.id} onClick={() => onSelect(doc.id)} className={cn("group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-200", currentDocId === doc.id ? "bg-accent/10 text-accent font-semibold shadow-sm ring-1 ring-accent/20" : "hover:bg-gray-50/60 text-foreground/70 hover:text-foreground")}>
              <div className="flex items-center gap-3 overflow-hidden">
                <FileText className={cn("h-4 w-4 shrink-0 transition-colors", currentDocId === doc.id ? "text-accent" : "text-foreground/30")} />
                <span className="text-xs truncate">{doc.title}</span>
              </div>
              <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 hover:text-rose-600 hover:bg-rose-50/50 rounded-md transition-all" onClick={(e:any) => { e.stopPropagation(); onDelete(doc.id); }}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>
    </aside>
  );
}
