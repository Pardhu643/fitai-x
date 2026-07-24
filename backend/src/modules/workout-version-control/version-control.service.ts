import { prisma } from '../../core/database/prisma';
import { versionControlRepository } from './version-control.repository';
import { NotFoundError } from '../../core/errors/AppError';

export class VersionControlService {
  async saveSnapshot(planId: string, changeReason?: string) {
    const plan = await prisma.workoutPlan.findUnique({
      where: { id: planId },
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

    const versionNum = plan.version;

    // Create JSON snapshot
    const snapshot = {
      name: plan.name,
      goal: plan.goal,
      fitnessLevel: plan.fitnessLevel,
      daysPerWeek: plan.daysPerWeek,
      durationMinutes: plan.durationMinutes,
      workoutDays: plan.workoutDays.map(d => ({
        dayOfWeek: d.dayOfWeek,
        dayNumber: d.dayNumber,
        name: d.name,
        title: d.title,
        durationMinutes: d.durationMinutes,
        estimatedDuration: d.estimatedDuration,
        focus: d.focus,
        notes: d.notes,
        workoutExercises: d.workoutExercises.map(we => ({
          exerciseName: we.exercise.name,
          category: we.exercise.category,
          primaryMuscle: we.exercise.primaryMuscle,
          secondaryMuscles: we.exercise.secondaryMuscles,
          equipment: we.exercise.equipment,
          difficulty: we.exercise.difficulty,
          instructions: we.exercise.instructions,
          contraindications: we.exercise.contraindications,
          order: we.order,
          setsCount: we.setsCount,
          repsMin: we.repsMin,
          repsMax: we.repsMax,
          targetWeight: we.targetWeight,
          restSeconds: we.restSeconds,
          tempo: we.tempo,
          notes: we.notes,
          sets: we.sets.map(s => ({
            weightKg: s.weightKg,
            reps: s.reps,
            order: s.order,
            isCompleted: s.isCompleted,
          })),
        })),
      })),
    };

    await versionControlRepository.createSnapshot(planId, versionNum, snapshot, changeReason);
  }

  async getVersions(planId: string, userId: string) {
    // Verify ownership
    const plan = await prisma.workoutPlan.findFirst({ where: { id: planId, userId } });
    if (!plan) throw new NotFoundError('Workout plan not found');

    return versionControlRepository.getVersions(planId);
  }

  async getVersionSnapshot(planId: string, version: number, userId: string) {
    const plan = await prisma.workoutPlan.findFirst({ where: { id: planId, userId } });
    if (!plan) throw new NotFoundError('Workout plan not found');

    const versionSnapshot = await versionControlRepository.getVersionSnapshot(planId, version);
    if (!versionSnapshot) throw new NotFoundError('Version snapshot not found');

    return versionSnapshot;
  }

  async rollback(planId: string, version: number, userId: string) {
    const plan = await prisma.workoutPlan.findFirst({ where: { id: planId, userId } });
    if (!plan) throw new NotFoundError('Workout plan not found');

    const versionSnapshot = await versionControlRepository.getVersionSnapshot(planId, version);
    if (!versionSnapshot) throw new NotFoundError('Version snapshot not found');

    const snapshot = versionSnapshot.snapshot as any;
    const nextVersion = plan.version + 1;

    // Apply snapshot to database in a transaction
    await prisma.$transaction(async (tx) => {
      // 1. Delete all current workout days for this plan
      await tx.workoutDay.deleteMany({
        where: { workoutPlanId: planId },
      });

      // 2. Update plan info
      await tx.workoutPlan.update({
        where: { id: planId },
        data: {
          name: snapshot.name,
          goal: snapshot.goal,
          fitnessLevel: snapshot.fitnessLevel,
          daysPerWeek: snapshot.daysPerWeek,
          durationMinutes: snapshot.durationMinutes,
          version: nextVersion,
        },
      });

      // 3. Rebuild days, exercises, sets
      for (const day of snapshot.workoutDays) {
        const createdDay = await tx.workoutDay.create({
          data: {
            workoutPlanId: planId,
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
          // Find or create the exercise library entry
          let exerciseLib = await tx.exerciseLibrary.findUnique({
            where: { name: we.exerciseName },
          });

          if (!exerciseLib) {
            exerciseLib = await tx.exerciseLibrary.create({
              data: {
                name: we.exerciseName,
                category: we.category || 'General',
                primaryMuscle: we.primaryMuscle || 'Full Body',
                secondaryMuscles: we.secondaryMuscles || [],
                equipment: we.equipment || [],
                difficulty: we.difficulty || 'BEGINNER',
                instructions: we.instructions || [],
                contraindications: we.contraindications || [],
              },
            });
          }

          const createdWE = await tx.workoutExercise.create({
            data: {
              workoutDayId: createdDay.id,
              exerciseId: exerciseLib.id,
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
    });

    // Save the new version snapshot
    await this.saveSnapshot(planId, `Rollback to version ${version}`);

    return prisma.workoutPlan.findUnique({
      where: { id: planId },
      include: {
        workoutDays: {
          include: {
            workoutExercises: {
              include: {
                exercise: true,
                sets: true,
              },
            },
          },
        },
      },
    });
  }
}

export const versionControlService = new VersionControlService();
