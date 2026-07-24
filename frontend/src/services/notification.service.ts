import api from '../lib/api';

export const notificationService = {
  getNotifications: async () => {
    const response = await api.get('/api/v1/notifications');
    return response.data.data?.notifications || [];
  },
  markAsRead: async (id: string) => {
    const response = await api.patch(`/api/v1/notifications/${id}/read`);
    return response.data.data?.notification;
  },
  markAllAsRead: async () => {
    const response = await api.patch('/api/v1/notifications/read-all');
    return response.data;
  }
};
