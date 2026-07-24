import { decisionExplanationRepository } from './decision-explanation.repository';

export class DecisionExplanationService {
  async logExplanation(userId: string, planId: string, title: string, explanation: string, previousValue?: string, newValue?: string) {
    return decisionExplanationRepository.logExplanation(userId, planId, title, explanation, previousValue, newValue);
  }

  async getExplanations(planId: string, userId: string) {
    return decisionExplanationRepository.getExplanations(planId, userId);
  }
}

export const decisionExplanationService = new DecisionExplanationService();
