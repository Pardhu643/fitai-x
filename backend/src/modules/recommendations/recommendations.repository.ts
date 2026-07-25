import { prisma } from '../../core/database/prisma';
import { NotFoundError } from '../../core/errors/AppError';
import { WorkoutRecommendation, CreateRecommendationInput } from './recommendations.types';

export class RecommendationsRepository {
  async createRecommendation(
    userId: string,
    data: CreateRecommendationInput
  ): Promise<WorkoutRecommendation> {
    return prisma.workoutRecommendation.create({
      data: {
        userId,
        type: data.type,
        title: data.title,
        description: data.description,
        explanation: data.explanation,
        confidence: data.confidence,
        exerciseId: data.exerciseId,
        workoutPlanId: data.workoutPlanId,
        currentValues: data.currentValues,
        recommendedValues: data.recommendedValues,
        expiresAt: data.expiresAt,
      },
      include: {
        exercise: true,
        workoutPlan: true,
      },
    }) as Promise<WorkoutRecommendation>;
  }

  async getRecommendationById(id: string, userId: string): Promise<WorkoutRecommendation> {
    const recommendation = await prisma.workoutRecommendation.findFirst({
      where: { id, userId },
      include: {
        exercise: true,
        workoutPlan: true,
      },
    });

    if (!recommendation) {
      throw new NotFoundError('Recommendation not found');
    }

    return recommendation as WorkoutRecommendation;
  }

  async getPendingRecommendations(userId: string): Promise<WorkoutRecommendation[]> {
    return prisma.workoutRecommendation.findMany({
      where: {
        userId,
        status: 'PENDING',
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
      orderBy: { createdAt: 'desc' },
      include: {
        exercise: true,
        workoutPlan: true,
      },
    }) as Promise<WorkoutRecommendation[]>;
  }

  async getAllRecommendations(userId: string, limit?: number): Promise<WorkoutRecommendation[]> {
    return prisma.workoutRecommendation.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        exercise: true,
        workoutPlan: true,
      },
    }) as Promise<WorkoutRecommendation[]>;
  }

  async applyRecommendation(id: string, userId: string): Promise<WorkoutRecommendation> {
    const recommendation = await prisma.workoutRecommendation.update({
      where: { id, userId },
      data: {
        status: 'APPLIED',
        appliedAt: new Date(),
      },
      include: {
        exercise: true,
        workoutPlan: true,
      },
    });

    return recommendation as WorkoutRecommendation;
  }

  async dismissRecommendation(id: string, userId: string): Promise<WorkoutRecommendation> {
    const recommendation = await prisma.workoutRecommendation.update({
      where: { id, userId },
      data: {
        status: 'DISMISSED',
        dismissedAt: new Date(),
      },
      include: {
        exercise: true,
        workoutPlan: true,
      },
    });

    return recommendation as WorkoutRecommendation;
  }

  async expireRecommendations(): Promise<void> {
    await prisma.workoutRecommendation.updateMany({
      where: {
        status: 'PENDING',
        expiresAt: { lt: new Date() },
      },
      data: {
        status: 'EXPIRED',
      },
    });
  }

  async getRecommendationsByType(
    userId: string,
    type: 'PROGRESSIVE_OVERLOAD' | 'DELOAD' | 'RECOVERY_DAY' | 'EXERCISE_SUBSTITUTION' | 'INTENSITY_REDUCTION' | 'VOLUME_REDUCTION'
  ): Promise<WorkoutRecommendation[]> {
    return prisma.workoutRecommendation.findMany({
      where: {
        userId,
        type,
      },
      orderBy: { createdAt: 'desc' },
      include: {
        exercise: true,
        workoutPlan: true,
      },
    }) as Promise<WorkoutRecommendation[]>;
  }
}

export const recommendationsRepository = new RecommendationsRepository();
