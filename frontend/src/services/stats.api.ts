import apiClient from '@/services/clients/apiClient';

export interface UserStats {
  checksDone: number;
  rephrasedCount: number;
  wordsRephrased: number;
  humanContent: string;
  aiContent: string;
}

export const statsApi = {
  getStats: async () => {
    const res = await apiClient.get('/stats');
    return res.data;
  },

  getGlobalStats: async () => {
    const res = await apiClient.get('/stats/global');
    return res.data;
  },

  updateStats: async (update: { checkIncrement?: number, rephraseIncrement?: number, wordIncrement?: number, humanScore?: number, aiScore?: number }) => {
    const res = await apiClient.post('/stats/update', update);
    return res.data;
  }
};
