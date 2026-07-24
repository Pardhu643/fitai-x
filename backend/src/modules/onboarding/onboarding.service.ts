import { onboardingRepository } from './onboarding.repository';
import { OnboardingData } from './onboarding.types';

export class OnboardingService {
  async completeOnboarding(userId: string, data: OnboardingData) {
    return onboardingRepository.completeOnboarding(userId, data);
  }

  async getOnboardingStatus(userId: string) {
    return onboardingRepository.getOnboardingStatus(userId);
  }
}

export const onboardingService = new OnboardingService();
