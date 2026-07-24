import api from '../lib/api';
import { RegisterInput, LoginInput, AuthResponse, User, UpdateProfileInput } from '../types/auth';

export const authService = {
  register: async (data: RegisterInput): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/api/v1/auth/register', data);
    return response.data;
  },

  login: async (data: LoginInput): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/api/v1/auth/login', data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/api/v1/auth/logout');
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<{ success: boolean; data: { user: User } }>('/api/v1/auth/me');
    return response.data.data.user;
  },

  getProfile: async (): Promise<User> => {
    const response = await api.get<{ success: boolean; data: { profile: User } }>('/api/v1/users/profile');
    return response.data.data.profile;
  },

  updateProfile: async (data: UpdateProfileInput): Promise<User> => {
    const response = await api.patch<{ success: boolean; data: { profile: User } }>('/api/v1/users/profile', data);
    return response.data.data.profile;
  },
};
