import { injuryRiskRepository } from './injury-risk.repository';
import { injuryRiskScoringEngine } from './injury-risk-scoring-engine';
import { CalculateInjuryRiskInput, InjuryRiskAssessment, InjuryRiskCalculationContext } from './injury-risk.types';
import { DUPLICATE_CALCULATION_THRESHOLD_MS } from './injury-risk.constants';

export class InjuryRiskService {
  async calculateInjuryRisk(userId: string, input: CalculateInjuryRiskInput): Promise<InjuryRiskAssessment> {
    const { force = false } = input;

    // Check for recent duplicate calculation
    if (!force) {
      const latestAssessment = await injuryRiskRepository.getLatestAssessment(userId);
      if (latestAssessment) {
        const timeSinceLastCalculation = Date.now() - latestAssessment.calculatedAt.getTime();
        if (timeSinceLastCalculation < DUPLICATE_CALCULATION_THRESHOLD_MS) {
          return latestAssessment;
        }
      }
    }

    // Gather context data
    const context = await this.buildCalculationContext(userId);

    // Calculate injury risk score
    const result = injuryRiskScoringEngine.calculateInjuryRisk(context);

    // Store assessment
    const assessment = await injuryRiskRepository.createAssessment(userId, {
      score: result.score,
      level: result.level,
      confidence: result.confidence,
      explanation: result.explanation,
      recommendedPrecautions: result.recommendedPrecautions,
      exercisesToAvoid: result.exercisesToAvoid,
      trainingModifications: result.trainingModifications,
      factors: result.factors,
      bodyAreas: result.bodyAreas,
      forceRecalculate: force,
    });

    return assessment;
  }

  async getCurrentInjuryRisk(userId: string): Promise<InjuryRiskAssessment | null> {
    return injuryRiskRepository.getLatestAssessment(userId);
  }

  async getInjuryRiskHistory(userId: string, limit?: number): Promise<InjuryRiskAssessment[]> {
    return injuryRiskRepository.getAssessmentHistory(userId, limit);
  }

  async getInjuryRiskById(assessmentId: string, userId: string): Promise<InjuryRiskAssessment> {
    return injuryRiskRepository.getAssessmentById(assessmentId, userId);
  }

  private async buildCalculationContext(userId: string): Promise<InjuryRiskCalculationContext> {
    // Gather injury history
    const userInjuries = await injuryRiskRepository.getUserInjuries(userId);
    const injuryTypes = userInjuries.map(i => i.type);
    const injuryDetails = userInjuries.map(i => ({ type: i.type, details: i.details || '' }));

    // Current pain (simulated - in real app, this would come from user input)
    const currentPain = {
      hasReportedPain: false,
      painAreas: [] as string[],
      severity: 0,
    };

    // Gather recovery data
    const latestRecovery = await injuryRiskRepository.getLatestRecoveryEntry(userId);
    const hasRecentRecovery = latestRecovery !== null;
    const recoveryAge = hasRecentRecovery
      ? Date.now() - latestRecovery!.date.getTime()
      : Infinity;
    const isRecentRecovery = recoveryAge < 48 * 60 * 60 * 1000; // 48 hours

    // Gather fatigue data
    const latestFatigue = await injuryRiskRepository.getLatestFatigueAssessment(userId);
    const hasRecentFatigue = latestFatigue !== null;
    const fatigueAge = hasRecentFatigue
      ? Date.now() - latestFatigue!.calculatedAt.getTime()
      : Infinity;
    const isRecentFatigue = fatigueAge < 24 * 60 * 60 * 1000; // 24 hours

    // Gather workout data
    const recentWorkouts = await injuryRiskRepository.getRecentWorkouts(userId, 30);
    const consecutiveDays = await injuryRiskRepository.getConsecutiveTrainingDays(userId);
    const activePlan = await injuryRiskRepository.getActiveWorkoutPlan(userId);

    // Calculate workout metrics
    const workoutCount = recentWorkouts.length;
    const totalDuration = recentWorkouts.reduce((sum, w) => sum + w.durationMinutes, 0);
    const totalCalories = recentWorkouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0);

    // Estimate intensity based on duration and calories
    const avgIntensity = totalDuration > 0 ? Math.min(1, (totalCalories / totalDuration) / 10) : 0.5;

    // Calculate muscle group frequency from exercise library
    const exerciseLibrary = await injuryRiskRepository.getExerciseLibrary();
    const muscleGroupFrequency: Record<string, number> = {};
    
    // Simple estimation based on workout count and plan
    if (activePlan && activePlan.workoutDays) {
      activePlan.workoutDays.forEach(day => {
        day.workoutExercises.forEach(we => {
          const muscle = we.exercise?.primaryMuscle || 'General';
          muscleGroupFrequency[muscle] = (muscleGroupFrequency[muscle] || 0) + 1;
        });
      });
    }

    // Calculate workload increase (simplified - compare recent vs older workouts)
    const recentWorkoutCount = recentWorkouts.slice(0, 7).length;
    const olderWorkoutCount = recentWorkouts.slice(7, 14).length;
    const workloadIncrease = olderWorkoutCount > 0 
      ? Math.min(1, (recentWorkoutCount - olderWorkoutCount) / olderWorkoutCount)
      : 0;

    // Training frequency (workouts per week)
    const trainingFrequency = workoutCount > 0 ? Math.min(7, Math.round(workoutCount / 4 * 7)) : 0;

    // Gather exercise contraindications from library
    const exerciseContraindications = exerciseLibrary.map(ex => ({
      exercise: ex.name,
      conditions: ex.contraindications || [],
    }));

    const highRiskExercises = exerciseLibrary
      .filter(ex => ex.difficulty === 'ADVANCED')
      .map(ex => ex.name);

    return {
      userId,
      injuryHistory: {
        hasPreviousInjuries: userInjuries.length > 0,
        injuryTypes,
        injuryDetails,
      },
      currentPain,
      recoveryData: {
        latestEntry: latestRecovery
          ? {
              sleepHours: latestRecovery.sleepHours,
              sleepQuality: latestRecovery.sleepQuality,
              sorenessLevel: latestRecovery.sorenessLevel,
              stressLevel: latestRecovery.stressLevel,
              energyLevel: latestRecovery.energyLevel,
              score: latestRecovery.score,
            }
          : null,
        hasRecentData: isRecentRecovery,
      },
      fatigueData: {
        latestAssessment: latestFatigue
          ? {
              score: latestFatigue.score,
              level: latestFatigue.level,
            }
          : null,
        hasRecentData: isRecentFatigue,
      },
      workoutData: {
        recentWorkouts: {
          count: workoutCount,
          totalDuration,
          consecutiveDays,
          avgIntensity,
        },
        muscleGroupFrequency,
        workloadIncrease,
        trainingFrequency,
      },
      exerciseData: {
        contraindications: exerciseContraindications,
        highRiskExercises,
      },
    };
  }
}

export const injuryRiskService = new InjuryRiskService();
