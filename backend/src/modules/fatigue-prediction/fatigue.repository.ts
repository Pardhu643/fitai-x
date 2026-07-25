import { prisma } from '../../core/database/prisma';
import { NotFoundError } from '../../core/errors/AppError';
import { FatigueAssessment } from './fatigue.types';

export class FatigueRepository {
  async createAssessment(
    userId: string,
    data: {
      score: number;
      level: string;
      confidence: number;
      explanation: string;
      recommendedAction: string;
      factors: Array<{
        name: string;
        value: number;
        weight: number;
        impact: string;
        description: string;
      }>;
      forceRecalculate: boolean;
    }
  ): Promise<FatigueAssessment> {
    return prisma.fatigueAssessment.create({
      data: {
        userId,
        score: data.score,
        level: data.level as any,
        confidence: data.confidence,
        explanation: data.explanation,
        recommendedAction: data.recommendedAction,
        calculationVersion: '1.0',
        forceRecalculate: data.forceRecalculate,
        factors: {
          create: data.factors,
        },
      },
      include: {
        factors: true,
      },
    }) as Promise<FatigueAssessment>;
  }

  async getLatestAssessment(userId: string): Promise<FatigueAssessment | null> {
    return prisma.fatigueAssessment.findFirst({
      where: { userId },
      orderBy: { calculatedAt: 'desc' },
      include: {
        factors: true,
      },
    }) as Promise<FatigueAssessment | null>;
  }

  async getAssessmentById(id: string, userId: string): Promise<FatigueAssessment> {
    const assessment = await prisma.fatigueAssessment.findFirst({
      where: { id, userId },
      include: {
        factors: true,
      },
    });

    if (!assessment) {
      throw new NotFoundError('Fatigue assessment not found');
    }

    return assessment as FatigueAssessment;
  }

  async getAssessmentHistory(
    userId: string,
    limit: number = 30
  ): Promise<FatigueAssessment[]> {
    return prisma.fatigueAssessment.findMany({
      where: { userId },
      orderBy: { calculatedAt: 'desc' },
      take: limit,
      include: {
        factors: true,
      },
    }) as Promise<FatigueAssessment[]>;
  }

  async getRecentWorkouts(userId: string, days: number = 7) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const workouts = await prisma.workoutHistory.findMany({
      where: {
        userId,
        completedAt: { gte: cutoffDate },
      },
      orderBy: { completedAt: 'desc' },
      select: {
        completedAt: true,
        durationMinutes: true,
        caloriesBurned: true,
        rating: true,
      },
    });

    return workouts;
  }

  async getConsecutiveTrainingDays(userId: string): Promise<number> {
    const workouts = await prisma.workoutHistory.findMany({
      where: { userId },
      orderBy: { completedAt: 'desc' },
      select: {
        completedAt: true,
      },
      take: 30,
    });

    if (workouts.length === 0) return 0;

    let consecutiveDays = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (const workout of workouts) {
      const workoutDate = new Date(workout.completedAt);
      workoutDate.setHours(0, 0, 0, 0);

      const diffDays = Math.floor(
        (currentDate.getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diffDays === consecutiveDays) {
        consecutiveDays++;
        currentDate = workoutDate;
      } else if (diffDays === consecutiveDays + 1) {
        consecutiveDays++;
        currentDate = workoutDate;
      } else {
        break;
      }
    }

    return consecutiveDays;
  }

  async getLatestRecoveryEntry(userId: string) {
    return prisma.recoveryEntry.findFirst({
      where: { userId },
      orderBy: { date: 'desc' },
    });
  }

  async getRecentHabitLogs(userId: string, days: number = 7) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return prisma.habitLog.findMany({
      where: {
        userId,
        logDate: { gte: cutoffDate },
      },
      include: {
        habit: true,
      },
    });
  }

  async getRecentMealLogs(userId: string, days: number = 7) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return prisma.mealLog.findMany({
      where: {
        userId,
        date: { gte: cutoffDate },
      },
      include: {
        meal: {
          include: {
            mealPlanDay: {
              include: {
                mealPlan: true,
              },
            },
          },
        },
      },
    });
  }

  async getRecentPlanChanges(userId: string, days: number = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const planVersions = await prisma.workoutPlanVersion.findMany({
      where: {
        workoutPlan: {
          userId,
        },
        createdAt: { gte: cutoffDate },
      },
      orderBy: { createdAt: 'desc' },
    });

    const planChanges = await prisma.planChangeExplanation.findMany({
      where: {
        userId,
        createdAt: { gte: cutoffDate },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      planVersions,
      planChanges,
    };
  }

  async getActiveWorkoutPlan(userId: string) {
    return prisma.workoutPlan.findFirst({
      where: {
        userId,
        isActive: true,
      },
      include: {
        workoutDays: true,
      },
    });
  }
}

export const fatigueRepository = new FatigueRepository();
