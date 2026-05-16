import { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Sidebar({
  documents,
  currentDocId,
  onDelete,
  onSelect,
}: any) {
  const [activeTab, setActiveTab] = useState<'my' | 'recent'>('my');
  const [collapsed, setCollapsed] = useState(false);

  if (collapsed) {
    return (
      <aside className="napkin-sidebar-collapsed">
        <button
          onClick={() => setCollapsed(false)}
          className="napkin-sidebar-toggle-btn napkin-sidebar-expand-btn"
          title="Show sidebar"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <line x1="9" y1="3" x2="9" y2="21"/>
          </svg>
        </button>
      </aside>
    );
  }

  return (
    <aside className="napkin-sidebar">
      {/* Sidebar header: Library + collapse */}
      <div className="napkin-sidebar-header">
        <div className="napkin-sidebar-library-btn">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <line x1="9" y1="3" x2="9" y2="21"/>
          </svg>
          <span>Library</span>
        </div>
        <button
          className="napkin-sidebar-toggle-btn"
          onClick={() => setCollapsed(true)}
          title="Collapse sidebar"
        >
          <ChevronLeft size={15} />
        </button>
      </div>

      {/* Tabs: My drafts / Recent */}
      <div className="napkin-sidebar-tabs">
        <button
          className={cn('napkin-sidebar-tab', activeTab === 'my' && 'napkin-sidebar-tab-active')}
          onClick={() => setActiveTab('my')}
        >
          My drafts
        </button>
        <button
          className={cn('napkin-sidebar-tab', activeTab === 'recent' && 'napkin-sidebar-tab-active')}
          onClick={() => setActiveTab('recent')}
        >
          Recent
        </button>
      </div>

      {/* Document list */}
      <ScrollArea className="flex-1">
        <div className="napkin-doc-list">
          {documents.map((doc: any) => (
            <div
              key={doc.id}
              onClick={() => onSelect(doc.id)}
              className={cn(
                'napkin-doc-item',
                currentDocId === doc.id && 'napkin-doc-item-active'
              )}
            >
              {/* Napkin-style squiggly icon */}
              <span className="napkin-doc-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <path d="M8 13h2M8 17h2M14 13h2"/>
                </svg>
              </span>
              <span className="napkin-doc-title">{doc.title || 'Untitled'}</span>
              <button
                className="napkin-doc-menu"
                onClick={(e) => { e.stopPropagation(); onDelete(doc.id); }}
                title="Delete"
              >
                ···
              </button>
            </div>
          ))}
        </div>
      </ScrollArea>
    </aside>
  );
}
