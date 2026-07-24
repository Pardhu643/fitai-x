import { prisma } from '../../core/database/prisma';

export class DecisionExplanationRepository {
  async logExplanation(userId: string, planId: string, title: string, explanation: string, previousValue?: string, newValue?: string) {
    return prisma.planChangeExplanation.create({
      data: {
        userId,
        workoutPlanId: planId,
        title,
        explanation,
        previousValue: previousValue || null,
        newValue: newValue || null,
      },
    });
  }

  async getExplanations(planId: string, userId: string) {
    return prisma.planChangeExplanation.findMany({
      where: {
        workoutPlanId: planId,
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}

export const decisionExplanationRepository = new DecisionExplanationRepository();
