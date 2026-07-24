import api from '../lib/api';

export const calendarService = {
  getEvents: async (startDate: string, endDate: string) => {
    const response = await api.get(`/api/v1/smart-calendar?startDate=${startDate}&endDate=${endDate}`);
    return response.data.data?.events || [];
  },
  createEvent: async (data: any) => {
    const response = await api.post('/api/v1/smart-calendar', data);
    return response.data.data?.event;
  },
  updateEvent: async (id: string, data: any) => {
    const response = await api.patch(`/api/v1/smart-calendar/${id}`, data);
    return response.data.data?.event;
  },
  deleteEvent: async (id: string) => {
    const response = await api.delete(`/api/v1/smart-calendar/${id}`);
    return response.data;
  }
};
