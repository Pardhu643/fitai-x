import { fatigueRepository } from './fatigue.repository';
import { fatigueScoringEngine } from './fatigue-scoring-engine';
import { CalculateFatigueInput, FatigueAssessment, FatigueCalculationContext } from './fatigue.types';
import { DUPLICATE_CALCULATION_THRESHOLD_MS } from './fatigue.constants';

export class FatigueService {
  async calculateFatigue(userId: string, input: CalculateFatigueInput): Promise<FatigueAssessment> {
    const { force = false } = input;

    // Check for recent duplicate calculation
    if (!force) {
      const latestAssessment = await fatigueRepository.getLatestAssessment(userId);
      if (latestAssessment) {
        const timeSinceLastCalculation = Date.now() - latestAssessment.calculatedAt.getTime();
        if (timeSinceLastCalculation < DUPLICATE_CALCULATION_THRESHOLD_MS) {
          return latestAssessment;
        }
      }
    }

    // Gather context data
    const context = await this.buildCalculationContext(userId);

    // Calculate fatigue score
    const result = fatigueScoringEngine.calculateFatigueScore(context);

    // Store assessment
    const assessment = await fatigueRepository.createAssessment(userId, {
      score: result.score,
      level: result.level,
      confidence: result.confidence,
      explanation: result.explanation,
      recommendedAction: result.recommendedAction,
      factors: result.factors,
      forceRecalculate: force,
    });

    return assessment;
  }

  async getCurrentFatigue(userId: string): Promise<FatigueAssessment | null> {
    return fatigueRepository.getLatestAssessment(userId);
  }

  async getFatigueHistory(userId: string, limit?: number): Promise<FatigueAssessment[]> {
    return fatigueRepository.getAssessmentHistory(userId, limit);
  }

  async getFatigueById(assessmentId: string, userId: string): Promise<FatigueAssessment> {
    return fatigueRepository.getAssessmentById(assessmentId, userId);
  }

  private async buildCalculationContext(userId: string): Promise<FatigueCalculationContext> {
    // Gather workout data
    const recentWorkouts = await fatigueRepository.getRecentWorkouts(userId, 7);
    const consecutiveDays = await fatigueRepository.getConsecutiveTrainingDays(userId);
    const activePlan = await fatigueRepository.getActiveWorkoutPlan(userId);

    // Calculate workout metrics
    const workoutCount = recentWorkouts.length;
    const totalDuration = recentWorkouts.reduce((sum, w) => sum + w.durationMinutes, 0);
    const totalCalories = recentWorkouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0);
    
    // Estimate intensity based on duration and calories
    const avgIntensity = totalDuration > 0 ? Math.min(1, (totalCalories / totalDuration) / 10) : 0.5;

    // Estimate missed workouts (based on active plan)
    let missedWorkouts = 0;
    if (activePlan && activePlan.workoutDays.length > 0) {
      const expectedWorkouts = activePlan.workoutDays.length;
      missedWorkouts = Math.max(0, expectedWorkouts - workoutCount);
    }

    // Gather recovery data
    const latestRecovery = await fatigueRepository.getLatestRecoveryEntry(userId);
    const hasRecentRecovery = latestRecovery !== null;
    const recoveryAge = hasRecentRecovery
      ? Date.now() - latestRecovery!.date.getTime()
      : Infinity;
    const isRecentRecovery = recoveryAge < 48 * 60 * 60 * 1000; // 48 hours

    // Gather habit data
    const recentHabitLogs = await fatigueRepository.getRecentHabitLogs(userId, 7);
    const sleepLogs = recentHabitLogs.filter(
      log => log.habit.category === 'SLEEP' || log.habit.name.toLowerCase().includes('sleep')
    );
    const hydrationLogs = recentHabitLogs.filter(
      log => log.habit.category === 'WATER' || log.habit.name.toLowerCase().includes('water')
    );

    const sleepConsistency = sleepLogs.length > 0
      ? sleepLogs.filter(log => log.completed).length / sleepLogs.length
      : 0.5;
    const hydrationConsistency = hydrationLogs.length > 0
      ? hydrationLogs.filter(log => log.completed).length / hydrationLogs.length
      : 0.5;

    // Gather nutrition data
    const recentMealLogs = await fatigueRepository.getRecentMealLogs(userId, 7);
    const hasNutritionData = recentMealLogs.length > 0;
    
    let calorieAdherence = 0.5;
    let proteinAdherence = 0.5;
    
    if (hasNutritionData) {
      // Simple adherence calculation based on completion status
      const completedMeals = recentMealLogs.filter(log => log.status === 'CONSUMED').length;
      calorieAdherence = completedMeals / recentMealLogs.length;
      proteinAdherence = calorieAdherence; // Simplified
    }

    // Gather plan change data
    const planChanges = await fatigueRepository.getRecentPlanChanges(userId, 30);
    const recentChanges = planChanges.planVersions.length + planChanges.planChanges.length;
    
    let daysSinceLastChange = 999;
    if (planChanges.planVersions.length > 0) {
      daysSinceLastChange = Math.min(
        daysSinceLastChange,
        Math.floor((Date.now() - planChanges.planVersions[0].createdAt.getTime()) / (1000 * 60 * 60 * 24))
      );
    }
    if (planChanges.planChanges.length > 0) {
      daysSinceLastChange = Math.min(
        daysSinceLastChange,
        Math.floor((Date.now() - planChanges.planChanges[0].createdAt.getTime()) / (1000 * 60 * 60 * 24))
      );
    }

    return {
      userId,
      recentWorkouts: {
        count: workoutCount,
        totalDuration,
        totalVolume: totalCalories, // Using calories as volume proxy
        consecutiveDays,
        avgIntensity,
        missedWorkouts,
      },
      recoveryData: {
        latestEntry: latestRecovery
          ? {
              sleepHours: latestRecovery.sleepHours,
              sleepQuality: latestRecovery.sleepQuality,
              hydrationLevel: latestRecovery.hydrationLevel,
              sorenessLevel: latestRecovery.sorenessLevel,
              stressLevel: latestRecovery.stressLevel,
              energyLevel: latestRecovery.energyLevel,
              previousWorkoutLoad: latestRecovery.previousWorkoutLoad,
              score: latestRecovery.score,
            }
          : null,
        hasRecentData: isRecentRecovery,
      },
      habitData: {
        sleepConsistency,
        hydrationConsistency,
      },
      nutritionData: {
        calorieAdherence,
        proteinAdherence,
        hasRecentData: hasNutritionData,
      },
      planChangeData: {
        recentChanges,
        daysSinceLastChange,
      },
    };
  }
}

export const fatigueService = new FatigueService();
