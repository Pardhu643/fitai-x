import api from '../lib/api';

export const recommendationsService = {
  async getPendingRecommendations() {
    const response = await api.get('/api/v1/recommendations/pending');
    return response.data;
  },

  async getAllRecommendations(limit?: number) {
    const response = await api.get('/api/v1/recommendations/history', {
      params: limit ? { limit } : undefined,
    });
    return response.data;
  },

  async getRecommendationById(id: string) {
    const response = await api.get(`/api/v1/recommendations/${id}`);
    return response.data;
  },

  async applyRecommendation(id: string) {
    const response = await api.post(`/api/v1/recommendations/${id}/apply`);
    return response.data;
  },

  async dismissRecommendation(id: string) {
    const response = await api.post(`/api/v1/recommendations/${id}/dismiss`);
    return response.data;
  },

  async generateProgressiveOverload(data: {
    exerciseId: string;
    currentSets: number;
    currentReps: number;
    currentWeight: number | null;
  }) {
    const response = await api.post('/api/v1/recommendations/progressive-overload', data);
    return response.data;
  },

  async generateDeload() {
    const response = await api.post('/api/v1/recommendations/deload');
    return response.data;
  },
};
