import { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronLeft, Search, Plus, Trash2, MoreVertical, LayoutGrid, Clock } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState<'all' | 'recent'>('all');
  const [collapsed, setCollapsed] = useState(false);

  if (collapsed) {
    return (
      <aside className="napkin-sidebar-collapsed group">
        <button
          onClick={() => setCollapsed(false)}
          className="napkin-sidebar-toggle-btn napkin-sidebar-expand-btn group-hover:bg-[#F1F5F9] group-hover:text-[#1A1A1A]"
          title="Show sidebar"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <line x1="9" y1="3" x2="9" y2="21"/>
          </svg>
        </button>
        <div className="mt-4 flex flex-col items-center gap-4">
           <button onClick={onCreate} className="h-9 w-9 rounded-xl bg-[#33C3FF] text-white flex items-center justify-center shadow-lg shadow-[#33C3FF]/20 active:scale-95 transition-all">
             <Plus size={18} strokeWidth={3} />
           </button>
        </div>
      </aside>
    );
  }

  return (
    <aside className="napkin-sidebar">
      {/* Sidebar header */}
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5 font-bold text-[#1A1A1A] tracking-tight">
            <div className="bg-[#1A1A1A] p-1 rounded-lg">
               <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                 <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
               </svg>
            </div>
            <span>Library</span>
          </div>
          <button
            className="napkin-sidebar-toggle-btn hover:bg-[#F1F5F9] hover:text-[#1A1A1A]"
            onClick={() => setCollapsed(true)}
            title="Collapse sidebar"
          >
            <ChevronLeft size={18} strokeWidth={2.5} />
          </button>
        </div>

        {/* Search */}
        <div className="relative group mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8] group-focus-within:text-[#33C3FF] transition-colors" size={14} strokeWidth={3} />
          <input 
            type="text"
            placeholder="Search drafts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#F8FAFC] border-none rounded-xl py-2.5 pl-9 pr-4 text-sm font-medium text-[#1A1A1A] focus:ring-2 focus:ring-[#33C3FF]/20 focus:bg-white transition-all outline-none placeholder:text-[#94A3B8]"
          />
        </div>

        {/* Tabs */}
        <div className="flex p-1 bg-[#F8FAFC] rounded-xl gap-1 mb-4">
          <button
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all',
              activeTab === 'all' ? 'bg-white text-[#1A1A1A] shadow-sm' : 'text-[#64748B] hover:text-[#1A1A1A]'
            )}
            onClick={() => setActiveTab('all')}
          >
            <LayoutGrid size={12} strokeWidth={3} />
            All Drafts
          </button>
          <button
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all',
              activeTab === 'recent' ? 'bg-white text-[#1A1A1A] shadow-sm' : 'text-[#64748B] hover:text-[#1A1A1A]'
            )}
            onClick={() => setActiveTab('recent')}
          >
            <Clock size={12} strokeWidth={3} />
            Recent
          </button>
        </div>
      </div>

      {/* Document list */}
      <ScrollArea className="flex-1 px-3 pb-4">
        <div className="space-y-1">
          {documents.map((doc: any) => (
            <div
              key={doc.id}
              onClick={() => onSelect(doc.id)}
              className={cn(
                'group flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all border border-transparent',
                currentDocId === doc.id 
                  ? 'bg-white border-border-strong shadow-sm' 
                  : 'hover:bg-[#F8FAFC]'
              )}
            >
              <div className={cn(
                'h-8 w-8 rounded-lg flex items-center justify-center transition-all',
                currentDocId === doc.id ? 'bg-[#33C3FF] text-white' : 'bg-[#F1F5F9] text-[#94A3B8]'
              )}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                  <polyline points="14 2 14 8 20 8"/>
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className={cn(
                  'text-sm leading-tight line-clamp-2 break-words',
                  currentDocId === doc.id ? 'font-bold text-[#1A1A1A]' : 'font-medium text-[#475569]'
                )}>
                  {doc.title || 'Untitled'}
                </div>
                <div className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-wider mt-0.5">
                  {doc.lastModified ? new Date(doc.lastModified).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Draft'}
                </div>
              </div>
              <button
                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-50 hover:text-red-500 text-[#CBD5E1] transition-all"
                onClick={(e) => { e.stopPropagation(); onDelete(doc.id); }}
                title="Delete"
              >
                <Trash2 size={14} strokeWidth={2.5} />
              </button>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* New Document Footer */}
      <div className="p-4 border-t border-[#F1F5F9]">
        <button
          onClick={onCreate}
          className="w-full premium-btn-accent py-2.5 flex items-center justify-center gap-2 text-sm"
        >
          <Plus size={16} strokeWidth={3} />
          New Draft
        </button>
      </div>
    </aside>
  );
}

