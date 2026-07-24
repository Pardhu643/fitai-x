import { prisma } from '../../core/database/prisma';
import { NotFoundError } from '../../core/errors/AppError';

export class WorkoutSessionService {
  async startSession(userId: string, workoutDayId: string) {
    const day = await prisma.workoutDay.findUnique({
      where: { id: workoutDayId },
    });
    if (!day) throw new NotFoundError('Workout day not found');

    return prisma.workoutSession.create({
      data: {
        userId,
        workoutDayId,
        status: 'ACTIVE',
        startedAt: new Date(),
      },
      include: {
        workoutDay: true,
      },
    });
  }

  async completeSession(
    sessionId: string,
    userId: string,
    data: { perceivedDifficulty: number; notes?: string; durationMinutes?: number }
  ) {
    const session = await prisma.workoutSession.findFirst({
      where: { id: sessionId, userId },
      include: {
        workoutDay: true,
      },
    });

    if (!session) throw new NotFoundError('Workout session not found');

    const completedAt = new Date();
    const duration = data.durationMinutes || Math.round((completedAt.getTime() - session.startedAt.getTime()) / (1000 * 60));

    const updatedSession = await prisma.workoutSession.update({
      where: { id: sessionId },
      data: {
        status: 'COMPLETED',
        completedAt,
        durationMinutes: duration,
        perceivedDifficulty: data.perceivedDifficulty,
        notes: data.notes || null,
      },
    });

    // Seed/log to WorkoutHistory for backward compatibility
    await prisma.workoutHistory.create({
      data: {
        userId,
        workoutDayId: session.workoutDayId,
        durationMinutes: duration,
        caloriesBurned: duration * 8, // estimate
        notes: data.notes || `Completed ${session.workoutDay.name}`,
        rating: data.perceivedDifficulty,
      },
    });

    return updatedSession;
  }
}

export const workoutSessionService = new WorkoutSessionService();
