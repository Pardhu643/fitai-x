import api from '../lib/api';

export const memoryService = {
  getMemories: async () => {
    const response = await api.get('/api/v1/memories');
    return response.data.data?.memories || [];
  },
  createMemory: async (content: string) => {
    const response = await api.post('/api/v1/memories', { content });
    return response.data.data?.memory;
  },
  deleteMemory: async (id: string) => {
    const response = await api.delete(`/api/v1/memories/${id}`);
    return response.data;
  }
};
