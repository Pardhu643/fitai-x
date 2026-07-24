import api from '../lib/api';

export const dashboardService = {
  async getDashboard() {
    const response = await api.get('/api/v1/dashboard');
    return response.data;
  },
};
