import apiClient from '@/services/clients/apiClient';

export const documentsApi = {
  getDocuments: async (limit: number = 20) => {
    const res = await apiClient.get('/documents', { params: { limit } });
    return res.data;
  },

  saveDocument: async (doc: any) => {
    const res = await apiClient.post('/documents', doc);
    return res.data;
  },

  deleteDocument: async (id: string) => {
    const res = await apiClient.delete(`/documents/${id}`);
    return res.data;
  }
};
