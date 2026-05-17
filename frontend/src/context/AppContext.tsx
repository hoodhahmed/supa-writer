import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '@/services/api';

export interface Document {
  id: string;
  title: string;
  content: string;
  lastModified: number;
}

export interface UserStats {
  checksDone: number;
  rephrasedCount: number;
  wordsRephrased: number;
  humanContent: string;
  aiContent: string;
  aiCreditsUsed: number;
  aiCreditsLimit: number;
  storageUsedMB: number;
  storageLimitMB: number;
}

interface AppContextType {
  documents: Document[];
  currentDocId: string | null;
  setCurrentDocId: (id: string | null) => void;
  loadingDocs: boolean;
  createNewDoc: () => Promise<Document>;
  deleteDoc: (id: string) => Promise<void>;
  saveCurrentDoc: (id: string | null, contentRef?: HTMLDivElement | null) => Promise<void>;
  stats: UserStats;
  loadingStats: boolean;
  refreshStats: () => Promise<void>;
  incrementChecks: (humanScore?: number, aiScore?: number) => Promise<void>;
  incrementRephrases: (words: number, humanScore?: number, aiScore?: number) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [currentDocId, setCurrentDocId] = useState<string | null>(null);
  const [loadingDocs, setLoadingDocs] = useState(true);
  
  const [stats, setStats] = useState<UserStats>({
    checksDone: 0,
    rephrasedCount: 0,
    wordsRephrased: 0,
    humanContent: '0%',
    aiContent: '0%',
    aiCreditsUsed: 0,
    aiCreditsLimit: 5000,
    storageUsedMB: 0,
    storageLimitMB: 100
  });
  const [loadingStats, setLoadingStats] = useState(true);

  // Load documents
  const loadDocuments = useCallback(async () => {
    setLoadingDocs(true);
    try {
      const docs = await api.getDocuments(20);
      setDocuments(docs);
      // Only set initial currentDocId if one isn't already selected
      setCurrentDocId(prev => {
        if (!prev && docs.length > 0) return docs[0].id;
        return prev;
      });
    } catch (error) {
      console.error('Failed to load documents', error);
    } finally {
      setLoadingDocs(false);
    }
  }, []);

  // Load stats
  const refreshStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const data = await api.getStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats', error);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  useEffect(() => {
    loadDocuments();
    refreshStats();
  }, [loadDocuments, refreshStats]);

  const createNewDoc = useCallback(async () => {
    const newDoc: Document = {
      id: Math.random().toString(36).substring(7),
      title: 'Supa Write draft',
      content: '<h1>Supa Write</h1><p>Turn rough notes, AI drafts, and plain text into clean, natural copy that still sounds like you.</p><h2>What it fixes</h2><p>It smooths rhythm, trims repetition, and keeps the meaning intact so the result reads confidently across product copy, emails, and long-form writing.</p><h2>Best for</h2><p>Use Supa Write when you need polished drafts for blogs, reports, landing pages, and everyday communication.</p>',
      lastModified: Date.now()
    };
    setDocuments(prev => [newDoc, ...prev]);
    setCurrentDocId(newDoc.id);
    try { 
      await api.saveDocument(newDoc); 
      refreshStats();
    } catch (e) { console.error(e); }
    return newDoc;
  }, [refreshStats]);

  const deleteDoc = useCallback(async (id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
    if (currentDocId === id) setCurrentDocId(null);
    try { 
      await api.deleteDocument(id); 
      refreshStats();
    } catch (e) { console.error(e); }
  }, [currentDocId, refreshStats]);

  const saveCurrentDoc = useCallback(async (id: string | null, contentRef?: HTMLDivElement | null) => {
    if (!id || !contentRef) return;
    const content = contentRef.innerHTML;
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    const h1 = tempDiv.querySelector('h1')?.innerText || 'Supa Write draft';

    const updatedDoc = { id, title: h1, content, lastModified: Date.now() } as Document;

    setDocuments(prev => {
      const exists = prev.find(d => d.id === id);
      if (exists) return prev.map(d => d.id === id ? updatedDoc : d);
      return [updatedDoc, ...prev];
    });

    try {
      await api.saveDocument(updatedDoc);
      refreshStats();
    } catch (e) {
      console.error('Failed to save', e);
    }
  }, [refreshStats]);

  const incrementChecks = useCallback(async (humanScore?: number, aiScore?: number) => {
    try {
      const res = await api.updateStats({ checkIncrement: 1, humanScore, aiScore });
      if (res.stats) {
        setStats(prev => ({
          ...prev,
          checksDone: prev.checksDone + 1,
          humanContent: res.stats.humanContent || prev.humanContent,
          aiContent: res.stats.aiContent || prev.aiContent
        }));
      }
    } catch (e) {
      console.error('Failed to update checks', e);
    }
  }, []);

  const incrementRephrases = useCallback(async (words: number, humanScore?: number, aiScore?: number) => {
    try {
      const res = await api.updateStats({ rephraseIncrement: 1, wordIncrement: words, humanScore, aiScore });
      if (res.stats) {
        setStats(prev => ({
          ...prev,
          rephrasedCount: prev.rephrasedCount + 1,
          wordsRephrased: prev.wordsRephrased + words,
          humanContent: res.stats.humanContent || prev.humanContent,
          aiContent: res.stats.aiContent || prev.aiContent
        }));
      }
    } catch (e) {
      console.error('Failed to update rephrases', e);
    }
  }, []);

  return (
    <AppContext.Provider value={{
      documents,
      currentDocId,
      setCurrentDocId,
      loadingDocs,
      createNewDoc,
      deleteDoc,
      saveCurrentDoc,
      stats,
      loadingStats,
      refreshStats,
      incrementChecks,
      incrementRephrases
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
