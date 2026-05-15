import { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '@/services/api';

export interface Document {
  id: string;
  title: string;
  content: string;
  lastModified: number;
}

export function useDocuments() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [currentDocId, setCurrentDocId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      try {
        const docs = await api.getDocuments();
        if (!mounted) return;
        setDocuments(docs);
        if (docs.length > 0 && !currentDocId) setCurrentDocId(docs[0].id);
        if (docs.length === 0) createNewDoc();
      } catch (error) {
        console.error('Failed to load documents', error);
      }
    };
    loadData();
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveCurrentDoc = useCallback(async (id: string | null, contentRef?: HTMLDivElement | null) => {
    if (!id || !contentRef) return;
    const content = contentRef.innerHTML;
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    const h1 = tempDiv.querySelector('h1')?.innerText || 'Untitled Project';

    const updatedDoc = { id, title: h1, content, lastModified: Date.now() } as Document;

    setDocuments((prev: Document[]) => {
      const exists = prev.find((d: Document) => d.id === id);
      if (exists) return prev.map((d: Document) => d.id === id ? updatedDoc : d);
      return [updatedDoc, ...prev];
    });

    try {
      await api.saveDocument(updatedDoc);
    } catch (e) {
      console.error('Failed to save', e);
    }
  }, []);

  const createNewDoc = useCallback(async () => {
    const newDoc: Document = {
      id: Math.random().toString(36).substring(7),
      title: 'Untitled Project',
      content: '<h1>Untitled</h1><p>Start writing human-authentic content...</p>',
      lastModified: Date.now()
    };
    setDocuments((prev: Document[]) => [newDoc, ...prev]);
    setCurrentDocId(newDoc.id);
    try { await api.saveDocument(newDoc); } catch (e) { console.error(e); }
    return newDoc;
  }, []);

  const deleteDoc = useCallback(async (id: string) => {
    setDocuments((prev: Document[]) => prev.filter((doc: Document) => doc.id !== id));
    if (currentDocId === id) setCurrentDocId(null);
    try { await api.deleteDocument(id); } catch (e) { console.error(e); }
  }, [currentDocId]);

  return {
    documents,
    currentDocId,
    setCurrentDocId,
    createNewDoc,
    deleteDoc,
    saveCurrentDoc,
    setDocuments,
  } as const;
}
