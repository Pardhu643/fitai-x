import { prisma } from '../../core/database/prisma';
import { NotFoundError } from '../../core/errors/AppError';
import { WorkoutPlan, WorkoutHistory } from './workouts.types';

export class WorkoutRepository {
  async getWorkoutPlans(userId: string): Promise<WorkoutPlan[]> {
    return prisma.workoutPlan.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        workoutDays: {
          include: {
            exercises: {
              include: {
                exerciseSets: true,
              },
              orderBy: { order: 'asc' },
            },
          },
          orderBy: { dayOfWeek: 'asc' },
        },
      },
    });
  }

  async getWorkoutPlanById(id: string, userId: string): Promise<WorkoutPlan> {
    const plan = await prisma.workoutPlan.findFirst({
      where: { id, userId },
      include: {
        workoutDays: {
          include: {
            exercises: {
              include: {
                exerciseSets: true,
              },
              orderBy: { order: 'asc' },
            },
          },
          orderBy: { dayOfWeek: 'asc' },
        },
      },
    });

    if (!plan) {
      throw new NotFoundError('Workout plan not found');
    }

    return plan as WorkoutPlan;
  }

  async getWorkoutHistory(userId: string): Promise<WorkoutHistory[]> {
    return prisma.workoutHistory.findMany({
      where: { userId },
      orderBy: { completedAt: 'desc' },
      take: 50,
    }) as Promise<WorkoutHistory[]>;
  }

  async getWorkoutHistoryById(id: string, userId: string): Promise<WorkoutHistory> {
    const history = await prisma.workoutHistory.findFirst({
      where: { id, userId },
    });

    if (!history) {
      throw new NotFoundError('Workout history not found');
    }

    return history as WorkoutHistory;
  }

  async completeWorkout(userId: string, data: any): Promise<WorkoutHistory> {
    return prisma.workoutHistory.create({
      data: {
        userId,
        workoutDayId: data.workoutDayId,
        durationMinutes: data.durationMinutes,
        caloriesBurned: data.caloriesBurned,
        notes: data.notes,
        rating: data.rating,
      },
    }) as Promise<WorkoutHistory>;
  }

  async createWorkoutPlan(userId: string, planData: any): Promise<WorkoutPlan> {
    return prisma.workoutPlan.create({
      data: {
        userId,
        name: planData.name,
        goal: planData.goal,
        fitnessLevel: planData.fitnessLevel,
        daysPerWeek: planData.daysPerWeek || 3,
        durationMinutes: planData.durationMinutes || 45,
        startDate: planData.startDate,
        workoutDays: {
          create: planData.workoutDays,
        },
      },
      include: {
        workoutDays: {
          include: {
            exercises: {
              include: {
                exerciseSets: true,
              },
            },
          },
        },
      },
    }) as Promise<WorkoutPlan>;
  }

  async setActivePlan(userId: string, planId: string): Promise<void> {
    await prisma.$transaction([
      prisma.workoutPlan.updateMany({
        where: { userId },
        data: { isActive: false },
      }),
      prisma.workoutPlan.update({
        where: { id: planId, userId },
        data: { isActive: true },
      }),
    ]);
  }
}

export const workoutRepository = new WorkoutRepository();
