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
  },

  getQuillBotScore: async (documentText: string) => {
    const res = await apiClient.post('/ai/quillbot-score', { documentText });
    return res.data;
  },

  getToneAnalysis: async (documentText: string) => {
    const res = await apiClient.post('/ai/tone', { documentText });
    return res.data;
  },

  getQualityScore: async (sentences: { text: string; pre?: string; post?: string }[]) => {
    const res = await apiClient.post('/ai/quality-score', { sentences });
    return res.data;
  }
};
