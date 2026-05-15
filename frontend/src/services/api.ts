import axios from 'axios';

// During development, Vite proxies '/api' to 'http://backend:8000'
const apiClient = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = {
  // --- AI Tools ---
  getAIScore: async (documentText: string) => {
    const response = await apiClient.post('/ai/score', { documentText });
    return response.data;
  },
  
  humanizeText: async (text: string, tone: string = "Standard") => {
    const response = await apiClient.post('/ai/humanize', { text, tone });
    return response.data;
  },

  // --- Document Storage ---
  getDocuments: async () => {
    const response = await apiClient.get('/documents');
    return response.data;
  },
  
  saveDocument: async (doc: any) => {
    const response = await apiClient.post('/documents', doc);
    return response.data;
  },
  
  deleteDocument: async (id: string) => {
    const response = await apiClient.delete(`/documents/${id}`);
    return response.data;
  }
};