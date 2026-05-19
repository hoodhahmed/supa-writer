import apiClient from '@/services/clients/apiClient';

export const aiApi = {
  getAIScore: async (documentText: string) => {
    const res = await apiClient.post('/ai/score', { documentText });
    return res.data;
  },

  humanizeText: async (text: string, tone: string = 'Standard') => {
    const res = await apiClient.post('/ai/humanize', { text, tone });
    return res.data;
  },

  getGrammarlyScore: async (documentText: string) => {
    const res = await apiClient.post('/ai/grammarly-score', { documentText });
    return res.data;
  }
};
