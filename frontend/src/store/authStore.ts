import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '../services/auth.service';
import type { User } from '../types/auth';

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  updateOnboardingStatus: (status: boolean) => void;
  isHydrating: boolean;
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      accessToken: null,
      isLoading: false,
      error: null,
      isHydrating: true,

      hydrate: async () => {
        const token = localStorage.getItem('token');
        if (!token) {
          set({ isAuthenticated: false, user: null, accessToken: null, isHydrating: false });
          return;
        }
        try {
          set({ accessToken: token });
          const user = await authService.getCurrentUser();
          set({ isAuthenticated: true, user, isHydrating: false });
        } catch (error) {
          console.error('Hydration failed:', error);
          localStorage.removeItem('token');
          set({ isAuthenticated: false, user: null, accessToken: null, isHydrating: false });
        }
      },

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.login({ email, password });
          localStorage.setItem('token', response.data.accessToken);
          set({
            isAuthenticated: true,
            user: response.data.user as User,
            accessToken: response.data.accessToken,
            isLoading: false,
          });
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Login failed',
            isLoading: false,
          });
          throw error;
        }
      },

      register: async (name: string, email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.register({ name, email, password });
          localStorage.setItem('token', response.data.accessToken);
          set({
            isAuthenticated: true,
            user: response.data.user as User,
            accessToken: response.data.accessToken,
            isLoading: false,
          });
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Registration failed',
            isLoading: false,
          });
          throw error;
        }
      },

      logout: async () => {
        try {
          await authService.logout();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          localStorage.removeItem('token');
          set({
            isAuthenticated: false,
            user: null,
            accessToken: null,
          });
        }
      },

      clearError: () => set({ error: null }),
      updateOnboardingStatus: (status: boolean) => {
        const user = get().user;
        if (user) {
          set({ user: { ...user, hasCompletedOnboarding: status } });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        accessToken: state.accessToken,
      }),
    }
  )
);
