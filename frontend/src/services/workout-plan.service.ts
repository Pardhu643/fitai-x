import api from '../lib/api';

export interface RecoveryInput {
  sleepHours: number;
  sleepQuality: string;
  hydrationLevel: string;
  sorenessLevel: string;
  stressLevel: string;
  energyLevel: string;
  previousWorkoutLoad: string;
}

export const workoutPlanService = {
  async generatePlan(): Promise<any> {
    const response = await api.post('/api/v1/workout-plans/generate');
    return response.data;
  },

  async getPlans(): Promise<any> {
    const response = await api.get('/api/v1/workout-plans');
    return response.data;
  },

  async getCurrentPlan(): Promise<any> {
    const response = await api.get('/api/v1/workout-plans/current');
    return response.data;
  },

  async getPlanById(id: string): Promise<any> {
    const response = await api.get(`/api/v1/workout-plans/${id}`);
    return response.data;
  },

  async createRecoveryEntry(data: RecoveryInput): Promise<any> {
    const response = await api.post('/api/v1/recovery', data);
    return response.data;
  },

  async getLatestRecoveryEntry(): Promise<any> {
    const response = await api.get('/api/v1/recovery/latest');
    return response.data;
  },

  async getExplanations(planId: string): Promise<any> {
    const response = await api.get(`/api/v1/workout-plans/${planId}/explanations`);
    return response.data;
  },

  async getVersions(planId: string): Promise<any> {
    const response = await api.get(`/api/v1/workout-plans/${planId}/versions`);
    return response.data;
  },

  async getVersionSnapshot(planId: string, version: number): Promise<any> {
    const response = await api.get(`/api/v1/workout-plans/${planId}/versions/${version}`);
    return response.data;
  },

  async rollback(planId: string, version: number): Promise<any> {
    const response = await api.post(`/api/v1/workout-plans/${planId}/rollback`, { version });
    return response.data;
  },

  async startWorkoutSession(workoutDayId: string): Promise<any> {
    const response = await api.post('/api/v1/workout-sessions', { workoutDayId });
    return response.data;
  },

  async completeWorkoutSession(sessionId: string, data: { perceivedDifficulty: number; notes: string; durationMinutes?: number }): Promise<any> {
    const response = await api.patch(`/api/v1/workout-sessions/${sessionId}/complete`, data);
    return response.data;
  },
};
