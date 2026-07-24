import api from '../lib/api';

export const habitService = {
  getHabits: async () => {
    const response = await api.get('/api/v1/smart-habits');
    return response.data.data?.habits || [];
  },
  createHabit: async (data: { 
    name: string; 
    description?: string; 
    category?: string; 
    targetValue?: number; 
    unit?: string; 
    frequency?: string;
  }) => {
    const response = await api.post('/api/v1/smart-habits', data);
    return response.data.data?.habit;
  },
  updateHabit: async (id: string, data: any) => {
    const response = await api.patch(`/api/v1/smart-habits/${id}`, data);
    return response.data.data?.habit;
  },
  completeHabit: async (id: string) => {
    const response = await api.post(`/api/v1/smart-habits/${id}/complete`);
    return response.data.data?.habit;
  },
  deleteHabit: async (id: string) => {
    const response = await api.delete(`/api/v1/smart-habits/${id}`);
    return response.data;
  }
};
