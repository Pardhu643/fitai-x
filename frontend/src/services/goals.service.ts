import api from '../lib/api';

export const goalsService = {
  getGoals: async () => {
    const response = await api.get('/api/v1/goals');
    return response.data.data?.goals || [];
  },
  createGoal: async (data: any) => {
    const response = await api.post('/api/v1/goals', data);
    return response.data.data?.goal;
  },
  updateGoal: async (id: string, data: any) => {
    const response = await api.put(`/api/v1/goals/${id}`, data);
    return response.data.data?.goal;
  },
  deleteGoal: async (id: string) => {
    const response = await api.delete(`/api/v1/goals/${id}`);
    return response.data;
  }
};
