import { prisma } from '../../core/database/prisma';
import { CreateRecoveryInput, RecoveryScoreResponse } from './recovery-score.types';

export class RecoveryScoreRepository {
  async saveRecoveryEntry(userId: string, data: CreateRecoveryInput, score: number, recommendation: string): Promise<RecoveryScoreResponse> {
    return prisma.recoveryEntry.create({
      data: {
        userId,
        sleepHours: data.sleepHours,
        sleepQuality: data.sleepQuality,
        hydrationLevel: data.hydrationLevel,
        sorenessLevel: data.sorenessLevel,
        stressLevel: data.stressLevel,
        energyLevel: data.energyLevel,
        previousWorkoutLoad: data.previousWorkoutLoad,
        score,
        recommendation,
      },
    }) as Promise<RecoveryScoreResponse>;
  }

  async getLatestRecoveryEntry(userId: string): Promise<RecoveryScoreResponse | null> {
    return prisma.recoveryEntry.findFirst({
      where: { userId },
      orderBy: { date: 'desc' },
    }) as Promise<RecoveryScoreResponse | null>;
  }
}

export const recoveryScoreRepository = new RecoveryScoreRepository();
