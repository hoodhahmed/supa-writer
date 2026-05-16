import { useEffect, forwardRef, type ForwardedRef } from 'react';
import { ForensicOverlay } from '@/components/forensic-overlay';
import type { Document as EditorDocument } from '@/types/editor';

interface EditorContentProps {
  currentDocId: string | null;
  documents: EditorDocument[];
  docScore: any | null;
  isScanning: boolean;
  onSelection: () => void;
  onInput: () => void;
  onPaste: (e: React.ClipboardEvent<HTMLDivElement>) => void;
}

export const EditorContent = forwardRef<HTMLDivElement, EditorContentProps>(
  (
    {
      currentDocId,
      documents,
      docScore,
      isScanning,
      onSelection,
      onInput,
      onPaste
    },
    ref
  ) => {
    useEffect(() => {
      if (currentDocId && ref && 'current' in ref) {
        const activeDoc = documents.find((d: EditorDocument) => d.id === currentDocId);
        if (activeDoc && ref.current && ref.current.innerHTML !== activeDoc.content) {
          ref.current.innerHTML = activeDoc.content;
        }
      }
    }, [currentDocId, documents, ref]);

    return (
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        className="editor-canvas"
        onMouseUp={onSelection}
        onInput={onInput}
        onPaste={onPaste}
      >
        {docScore?.sentences && !isScanning && (
          <ForensicOverlay sentences={docScore.sentences} editorRef={ref as ForwardedRef<HTMLDivElement>} />
        )}
      </div>
    );
  }
);

EditorContent.displayName = 'EditorContent';
