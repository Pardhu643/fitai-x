import api from '../lib/api';
import type { OnboardingData, OnboardingResponse } from '../types/onboarding';

export const onboardingService = {
  async completeOnboarding(data: OnboardingData): Promise<OnboardingResponse> {
    const response = await api.post('/api/v1/onboarding', data);
    return response.data;
  },

  async getOnboardingStatus(): Promise<any> {
    const response = await api.get('/api/v1/onboarding/status');
    return response.data;
  },
};
