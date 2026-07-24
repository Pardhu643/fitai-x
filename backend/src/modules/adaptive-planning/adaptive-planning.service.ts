import { prisma } from '../../core/database/prisma';
import { adaptivePlanningRepository } from './adaptive-planning.repository';
import { versionControlService } from '../workout-version-control/version-control.service';
import { decisionExplanationService } from '../ai-decision-explanation/decision-explanation.service';
import { progressiveOverloadService } from '../progressive-overload/progressive-overload.service';
import { conflictDetectionService } from '../conflict-detection/conflict-detection.service';
import { recoveryScoreService } from '../recovery-score/recovery-score.service';
import { NotFoundError } from '../../core/errors/AppError';
import { WorkoutGoal } from '@prisma/client';

function mapGoal(userGoal: string): WorkoutGoal {
  if (userGoal === 'WEIGHT_LOSS') return 'FAT_LOSS';
  if (userGoal === 'FLEXIBILITY') return 'GENERAL_FITNESS';
  return userGoal as WorkoutGoal;
}

export class AdaptivePlanningService {
  async getPlans(userId: string) {
    return adaptivePlanningRepository.getPlans(userId);
  }

  async getCurrentPlan(userId: string) {
    return adaptivePlanningRepository.getCurrentPlan(userId);
  }

  async getPlanById(id: string, userId: string) {
    return adaptivePlanningRepository.getPlanById(id, userId);
  }

  async generatePlan(userId: string) {
    // 1. Fetch user onboarding data & preferences
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        userPreferences: true,
        userEquipments: { include: { equipment: true } },
        injuries: true,
      },
    });

    if (!user) throw new NotFoundError('User not found');
    if (!user.hasCompletedOnboarding || !user.userPreferences) {
      throw new Error('User onboarding is incomplete. Please complete onboarding first.');
    }

    const { userPreferences, injuries } = user;
    const goal = mapGoal(user.primaryGoal || 'GENERAL_FITNESS');
    const fitnessLevel = user.fitnessLevel || 'BEGINNER';
    const daysPerWeek = userPreferences.workoutDaysPerWeek || 3;
    const duration = userPreferences.workoutDurationMinutes || 45;
    const userEquipment = user.userEquipments.map(ue => ue.equipment.type);

    // 2. Fetch master exercise library
    const exerciseLibrary = await prisma.exerciseLibrary.findMany();
    if (exerciseLibrary.length === 0) {
      throw new Error('Exercise library is empty. Please run migrations and seed database.');
    }

    // 3. Query latest recovery score for today's check-in
    const latestRecovery = await recoveryScoreService.getLatestEntry(userId);
    const recoveryScore = latestRecovery ? latestRecovery.score : 100;

    const explanations: { title: string; text: string }[] = [];

    // Log base rules
    explanations.push({
      title: 'Fitness Level Rule',
      text: `Workout days structured as a ${
        fitnessLevel === 'BEGINNER' ? 'Full Body' : fitnessLevel === 'INTERMEDIATE' ? 'Upper/Lower' : 'Push/Pull/Legs'
      } plan due to ${fitnessLevel} experience level.`
    });

    if (goal === 'FAT_LOSS') {
      explanations.push({
        title: 'Goal Adaptation',
        text: 'Additional conditioning focus added because the primary goal is fat loss.'
      });
    } else if (goal === 'STRENGTH') {
      explanations.push({
        title: 'Goal Adaptation',
        text: 'Extended rest periods and compound exercise priority applied to support strength development.'
      });
    }

    // 4. Generate workout days
    const workoutDays: any[] = [];
    const splits = this.getSplitFocus(fitnessLevel, daysPerWeek);

    for (let dayIdx = 0; dayIdx < daysPerWeek; dayIdx++) {
      const dayFocus = splits[dayIdx] || 'Full Body';
      
      // Select exercises matching focus, equipment, and injury limitations
      let availableExercises = exerciseLibrary.filter(ex => {
        // Filter by category/focus
        if (dayFocus === 'Push' && ex.category !== 'Push') return false;
        if (dayFocus === 'Pull' && ex.category !== 'Pull') return false;
        if (dayFocus === 'Legs' && ex.category !== 'Legs' && ex.category !== 'Lower Body') return false;
        if (dayFocus === 'Upper' && ex.category !== 'Push' && ex.category !== 'Pull') return false;
        if (dayFocus === 'Lower' && ex.category !== 'Legs' && ex.category !== 'Lower Body') return false;

        // Filter by equipment
        const matchesEquipment = ex.equipment.some(eq => userEquipment.includes(eq as any) || eq === 'NO_EQUIPMENT');
        if (!matchesEquipment) return false;

        return true;
      });

      if (availableExercises.length === 0) {
        // Fallback to any equipment-matched exercises if split categories yield nothing
        availableExercises = exerciseLibrary.filter(ex => 
          ex.equipment.some(eq => userEquipment.includes(eq as any) || eq === 'NO_EQUIPMENT')
        );
      }

      // Check injury exclusions
      const activeInjuries = injuries.map(inj => inj.type);
      const exercisesForDay: any[] = [];

      // Select up to 4-6 exercises depending on duration
      const targetExerciseCount = Math.min(Math.max(Math.floor(duration / 10), 3), 6);
      
      for (const ex of availableExercises) {
        if (exercisesForDay.length >= targetExerciseCount) break;

        const isContraindicated = ex.contraindications.some(contra => activeInjuries.includes(contra as any));
        if (isContraindicated) {
          // Substitutions
          const alternative = exerciseLibrary.find(alt => 
            alt.category === ex.category && 
            !alt.contraindications.some(contra => activeInjuries.includes(contra as any)) &&
            alt.equipment.some(eq => userEquipment.includes(eq as any) || eq === 'NO_EQUIPMENT')
          );

          if (alternative) {
            exercisesForDay.push(alternative);
            explanations.push({
              title: 'Injury Substitution',
              text: `${ex.name} was replaced with ${alternative.name} because ${activeInjuries.join(', ')} was reported.`
            });
          }
        } else {
          exercisesForDay.push(ex);
        }
      }

      // 5. Volume and recovery adaptations
      let setsCount = fitnessLevel === 'BEGINNER' ? 2 : fitnessLevel === 'INTERMEDIATE' ? 3 : 4;
      let restSeconds = goal === 'STRENGTH' ? 120 : 90;
      let weightModifier = 1.0;

      if (recoveryScore < 40) {
        setsCount = Math.max(1, setsCount - 2);
        weightModifier = 0.8;
        explanations.push({
          title: 'Recovery Score Adaptation',
          text: `Workout volume was reduced by 50% and intensity reduced because today's recovery score is ${recoveryScore}.`
        });
      } else if (recoveryScore < 60) {
        setsCount = Math.max(1, setsCount - 2);
        weightModifier = 0.9;
        explanations.push({
          title: 'Recovery Score Adaptation',
          text: `Workout volume was reduced by 40% because today's recovery score is ${recoveryScore}.`
        });
      } else if (recoveryScore < 80) {
        setsCount = Math.max(1, setsCount - 1);
        explanations.push({
          title: 'Recovery Score Adaptation',
          text: `Workout volume was reduced by 25% because today's recovery score is ${recoveryScore}.`
        });
      }

      const workoutExercises = exercisesForDay.map((ex, exIdx) => {
        let repsMin = 8;
        let repsMax = 12;

        if (goal === 'STRENGTH') {
          repsMin = 4;
          repsMax = 6;
        } else if (goal === 'FAT_LOSS' || goal === 'ENDURANCE') {
          repsMin = 12;
          repsMax = 15;
        }

        // Apply Progressive Overload for Intermediate/Advanced
        let overloadText = '';
        if (fitnessLevel !== 'BEGINNER') {
          const overloaded = progressiveOverloadService.applyProgressionRules(
            ex.name,
            setsCount,
            repsMax,
            null,
            fitnessLevel
          );
          repsMax = overloaded.reps;
          overloadText = overloaded.note;
        }

        // Generate sets
        const sets: any[] = [];
        for (let sIdx = 0; sIdx < setsCount; sIdx++) {
          const weightKg = ex.category === 'Lower Body' || ex.category === 'Legs' ? 40 : 15;
          sets.push({
            order: sIdx,
            reps: repsMax,
            weightKg: Math.round(weightKg * weightModifier),
          });
        }

        return {
          exerciseId: ex.id,
          order: exIdx,
          setsCount,
          repsMin,
          repsMax,
          restSeconds,
          tempo: '2-0-2-0',
          notes: overloadText || null,
          sets,
        };
      });

      workoutDays.push({
        dayOfWeek: dayIdx + 1, // Sunday=0, Monday=1, etc.
        dayNumber: dayIdx + 1,
        name: `Day ${dayIdx + 1}`,
        title: `${dayFocus} Day`,
        durationMinutes: duration,
        estimatedDuration: duration,
        focus: dayFocus,
        notes: `Focus on progressive overloading and hydration.`,
        workoutExercises,
      });
    }

    // 6. Conflict Detection Space-out
    const conflictResult = conflictDetectionService.detectAndResolveConflicts(
      workoutDays.map(wd => ({
        dayNumber: wd.dayNumber,
        title: wd.title,
        focus: wd.focus,
        exercises: wd.workoutExercises.map((we: any) => we.exerciseId),
      }))
    );

    conflictResult.notes.forEach(note => {
      explanations.push({
        title: 'Scheduling Conflict',
        text: note,
      });
    });

    // 7. Save generated plan
    const plan = await adaptivePlanningRepository.createPlan(userId, {
      name: `${goal.replace('_', ' ')} Plan - ${fitnessLevel}`,
      goal,
      fitnessLevel,
      daysPerWeek,
      durationMinutes: duration,
      workoutDays,
    });

    if (!plan) throw new Error('Failed to save workout plan');

    // 8. Log Explanations to database
    for (const exp of explanations) {
      await decisionExplanationService.logExplanation(userId, plan.id, exp.title, exp.text);
    }

    // 9. Save Version snapshot
    await versionControlService.saveSnapshot(plan.id, 'Initial generation');

    return plan;
  }

  private getSplitFocus(fitnessLevel: string, daysPerWeek: number): string[] {
    if (fitnessLevel === 'BEGINNER') {
      return Array(daysPerWeek).fill('Full Body');
    }
    
    if (fitnessLevel === 'INTERMEDIATE') {
      if (daysPerWeek === 2) return ['Upper', 'Lower'];
      if (daysPerWeek === 3) return ['Upper', 'Lower', 'Full Body'];
      if (daysPerWeek === 4) return ['Upper', 'Lower', 'Upper', 'Lower'];
      return ['Upper', 'Lower', 'Upper', 'Lower', 'Full Body'];
    }

    // ADVANCED split
    if (daysPerWeek === 3) return ['Push', 'Pull', 'Legs'];
    if (daysPerWeek === 4) return ['Push', 'Pull', 'Legs', 'Full Body'];
    if (daysPerWeek === 5) return ['Push', 'Pull', 'Legs', 'Upper', 'Lower'];
    return ['Push', 'Pull', 'Legs', 'Push', 'Pull', 'Legs'];
  }
}

export const adaptivePlanningService = new AdaptivePlanningService();
