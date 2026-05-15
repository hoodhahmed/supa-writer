import apiClient from '@/services/clients/apiClient';

export const documentsApi = {
  getDocuments: async () => {
    const res = await apiClient.get('/documents');
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
