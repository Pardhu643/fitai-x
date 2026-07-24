import { prisma } from '../../core/database/prisma';
import { NotFoundError } from '../../core/errors/AppError';

export class AdaptivePlanningRepository {
  async createPlan(userId: string, planData: any) {
    return prisma.$transaction(async (tx) => {
      // 1. Deactivate current active plans
      await tx.workoutPlan.updateMany({
        where: { userId, isActive: true },
        data: { isActive: false },
      });

      // 2. Create the plan
      const plan = await tx.workoutPlan.create({
        data: {
          userId,
          name: planData.name,
          goal: planData.goal,
          fitnessLevel: planData.fitnessLevel,
          daysPerWeek: planData.daysPerWeek,
          durationMinutes: planData.durationMinutes,
          status: 'ACTIVE',
          isActive: true,
          version: 1,
        },
      });

      // 3. Create days, exercises, and sets
      for (const day of planData.workoutDays) {
        const createdDay = await tx.workoutDay.create({
          data: {
            workoutPlanId: plan.id,
            dayOfWeek: day.dayOfWeek,
            dayNumber: day.dayNumber,
            name: day.name,
            title: day.title,
            durationMinutes: day.durationMinutes,
            estimatedDuration: day.estimatedDuration,
            focus: day.focus,
            notes: day.notes,
          },
        });

        for (const we of day.workoutExercises) {
          const createdWE = await tx.workoutExercise.create({
            data: {
              workoutDayId: createdDay.id,
              exerciseId: we.exerciseId,
              order: we.order,
              setsCount: we.setsCount,
              repsMin: we.repsMin,
              repsMax: we.repsMax,
              targetWeight: we.targetWeight,
              restSeconds: we.restSeconds,
              tempo: we.tempo,
              notes: we.notes,
            },
          });

          for (const s of we.sets) {
            await tx.workoutSet.create({
              data: {
                workoutExerciseId: createdWE.id,
                weightKg: s.weightKg,
                reps: s.reps,
                order: s.order,
                isCompleted: s.isCompleted || false,
              },
            });
          }
        }
      }

      return tx.workoutPlan.findUnique({
        where: { id: plan.id },
        include: {
          workoutDays: {
            include: {
              workoutExercises: {
                include: {
                  exercise: true,
                  sets: true,
                },
                orderBy: { order: 'asc' },
              },
            },
            orderBy: { dayOfWeek: 'asc' },
          },
        },
      });
    }, { timeout: 35000, maxWait: 35000 });
  }

  async getPlans(userId: string) {
    return prisma.workoutPlan.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        workoutDays: {
          include: {
            workoutExercises: {
              include: {
                exercise: true,
                sets: true,
              },
              orderBy: { order: 'asc' },
            },
          },
          orderBy: { dayOfWeek: 'asc' },
        },
      },
    });
  }

  async getCurrentPlan(userId: string) {
    return prisma.workoutPlan.findFirst({
      where: { userId, isActive: true },
      include: {
        workoutDays: {
          include: {
            workoutExercises: {
              include: {
                exercise: true,
                sets: true,
              },
              orderBy: { order: 'asc' },
            },
          },
          orderBy: { dayOfWeek: 'asc' },
        },
      },
    });
  }

  async getPlanById(id: string, userId: string) {
    const plan = await prisma.workoutPlan.findFirst({
      where: { id, userId },
      include: {
        workoutDays: {
          include: {
            workoutExercises: {
              include: {
                exercise: true,
                sets: true,
              },
              orderBy: { order: 'asc' },
            },
          },
          orderBy: { dayOfWeek: 'asc' },
        },
      },
    });

    if (!plan) throw new NotFoundError('Workout plan not found');
    return plan;
  }
}

export const adaptivePlanningRepository = new AdaptivePlanningRepository();
