import api from '../lib/api';

export const progressService = {
  getProgress: async () => {
    const response = await api.get('/api/v1/progress');
    return response.data.data;
  },
  addBodyMeasurement: async (data: any) => {
    const response = await api.post('/api/v1/progress/measurements', data);
    return response.data.data?.measurement;
  },
  addWorkoutHistory: async (data: any) => {
    const response = await api.post('/api/v1/progress/workouts', data);
    return response.data.data?.history;
  }
};
