import { prisma } from '../../core/database/prisma';
import { NotFoundError } from '../../core/errors/AppError';
import { InjuryRiskAssessment } from './injury-risk.types';

export class InjuryRiskRepository {
  async createAssessment(
    userId: string,
    data: {
      score: number;
      level: string;
      confidence: number;
      explanation: string;
      recommendedPrecautions: string[];
      exercisesToAvoid: string[];
      trainingModifications: string[];
      factors: Array<{
        name: string;
        value: number;
        weight: number;
        impact: string;
        description: string;
      }>;
      bodyAreas: Array<{
        bodyArea: string;
        riskLevel: string;
        reason: string;
        recommendedAction: string;
      }>;
      forceRecalculate: boolean;
    }
  ): Promise<InjuryRiskAssessment> {
    return prisma.injuryRiskAssessment.create({
      data: {
        userId,
        score: data.score,
        level: data.level as any,
        confidence: data.confidence,
        disclaimer: 'This assessment is a fitness risk indicator and is not a medical diagnosis.',
        explanation: data.explanation,
        recommendedPrecautions: data.recommendedPrecautions,
        exercisesToAvoid: data.exercisesToAvoid,
        trainingModifications: data.trainingModifications,
        calculationVersion: '1.0',
        forceRecalculate: data.forceRecalculate,
        factors: {
          create: data.factors,
        },
        bodyAreas: {
          create: data.bodyAreas,
        },
      },
      include: {
        factors: true,
        bodyAreas: true,
      },
    }) as Promise<InjuryRiskAssessment>;
  }

  async getLatestAssessment(userId: string): Promise<InjuryRiskAssessment | null> {
    return prisma.injuryRiskAssessment.findFirst({
      where: { userId },
      orderBy: { calculatedAt: 'desc' },
      include: {
        factors: true,
        bodyAreas: true,
      },
    }) as Promise<InjuryRiskAssessment | null>;
  }

  async getAssessmentById(id: string, userId: string): Promise<InjuryRiskAssessment> {
    const assessment = await prisma.injuryRiskAssessment.findFirst({
      where: { id, userId },
      include: {
        factors: true,
        bodyAreas: true,
      },
    });

    if (!assessment) {
      throw new NotFoundError('Injury risk assessment not found');
    }

    return assessment as InjuryRiskAssessment;
  }

  async getAssessmentHistory(
    userId: string,
    limit: number = 30
  ): Promise<InjuryRiskAssessment[]> {
    return prisma.injuryRiskAssessment.findMany({
      where: { userId },
      orderBy: { calculatedAt: 'desc' },
      take: limit,
      include: {
        factors: true,
        bodyAreas: true,
      },
    }) as Promise<InjuryRiskAssessment[]>;
  }

  async getUserInjuries(userId: string) {
    return prisma.injury.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getRecentWorkouts(userId: string, days: number = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const workouts = await prisma.workoutHistory.findMany({
      where: {
        userId,
        completedAt: { gte: cutoffDate },
      },
      orderBy: { completedAt: 'desc' },
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

  async getLatestFatigueAssessment(userId: string) {
    return prisma.fatigueAssessment.findFirst({
      where: { userId },
      orderBy: { calculatedAt: 'desc' },
    });
  }

  async getExerciseLibrary() {
    return prisma.exerciseLibrary.findMany({
      select: {
        name: true,
        primaryMuscle: true,
        secondaryMuscles: true,
        contraindications: true,
        difficulty: true,
      },
    });
  }

  async getActiveWorkoutPlan(userId: string) {
    return prisma.workoutPlan.findFirst({
      where: {
        userId,
        isActive: true,
      },
      include: {
        workoutDays: {
          include: {
            workoutExercises: {
              include: {
                exercise: true,
              },
            },
          },
        },
      },
    });
  }
}

export const injuryRiskRepository = new InjuryRiskRepository();
