import { recommendationsRepository } from './recommendations.repository';
import { progressiveOverloadService } from '../progressive-overload/progressive-overload.service';
import { injuryRiskService } from '../injury-predictor/injury-risk.service';
import { fatigueService } from '../fatigue-prediction/fatigue.service';
import { recoveryScoreService } from '../recovery-score/recovery-score.service';
import { WorkoutRecommendation } from './recommendations.types';
import { ProgressiveOverloadInput, DeloadInput } from '../progressive-overload/progressive-overload.types';
import { prisma } from '../../core/database/prisma';

export class RecommendationsService {
  async generateProgressiveOverloadRecommendation(
    userId: string,
    exerciseId: string,
    currentSets: number,
    currentReps: number,
    currentWeight: number | null
  ): Promise<WorkoutRecommendation> {
    // Get user data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { userPreferences: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Get latest assessments
    const [fatigueAssessment, injuryRiskAssessment, recoveryEntry] = await Promise.all([
      fatigueService.getCurrentFatigue(userId),
      injuryRiskService.getCurrentInjuryRisk(userId),
      recoveryScoreService.getLatestEntry(userId),
    ]);

    // Get workout history
    const recentWorkouts = await prisma.workoutHistory.findMany({
      where: { userId },
      orderBy: { completedAt: 'desc' },
      take: 10,
    });

    // Simplified workout history data since WorkoutHistory doesn't store detailed sets
    const completedReps = recentWorkouts.map(() => currentReps); // Use current as baseline
    const completedSets = recentWorkouts.map(() => currentSets);
    const weightsLifted = recentWorkouts.map(() => currentWeight || 0);

    const exercise = await prisma.exerciseLibrary.findUnique({
      where: { id: exerciseId },
    });

    const input: ProgressiveOverloadInput = {
      exerciseName: exercise?.name || 'Unknown',
      currentSets,
      currentReps,
      currentWeight,
      fitnessLevel: user.fitnessLevel || 'BEGINNER',
      workoutHistory: {
        completedReps,
        completedSets,
        weightsLifted,
        failedSets: recentWorkouts.filter(w => !w.completedAt).length,
        skippedWorkouts: 0,
        consistency: recentWorkouts.length > 0 ? 0.8 : 0.5,
      },
      recoveryScore: recoveryEntry?.score || 80,
      fatigueScore: fatigueAssessment?.score || 30,
      injuryRiskScore: injuryRiskAssessment?.score || 20,
      sorenessLevel: recoveryEntry?.sorenessLevel || 'LIGHT',
    };

    const result = progressiveOverloadService.calculateEnhancedProgression(input);

    // Check if similar recommendation already exists
    const existing = await recommendationsRepository.getPendingRecommendations(userId);
    const similarExists = existing.some(
      r => r.type === 'PROGRESSIVE_OVERLOAD' && r.exerciseId === exerciseId
    );

    if (similarExists) {
      throw new Error('Similar recommendation already pending');
    }

    return recommendationsRepository.createRecommendation(userId, {
      type: 'PROGRESSIVE_OVERLOAD',
      title: this.getRecommendationTitle(result.recommendation),
      description: result.explanation,
      explanation: result.explanation,
      confidence: result.confidence,
      exerciseId,
      currentValues: { sets: currentSets, reps: currentReps, weight: currentWeight },
      recommendedValues: { sets: result.sets, reps: result.reps, weight: result.weight },
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });
  }

  async generateDeloadRecommendation(userId: string): Promise<WorkoutRecommendation | null> {
    // Get latest assessments
    const [fatigueAssessment, injuryRiskAssessment, recoveryEntry] = await Promise.all([
      fatigueService.getCurrentFatigue(userId),
      injuryRiskService.getCurrentInjuryRisk(userId),
      recoveryScoreService.getLatestEntry(userId),
    ]);

    // Get workout history
    const recentWorkouts = await prisma.workoutHistory.findMany({
      where: { userId },
      orderBy: { completedAt: 'desc' },
      take: 30,
    });

    const weeklyVolume = this.calculateWeeklyVolume(recentWorkouts);
    const consecutiveDays = await this.calculateConsecutiveTrainingDays(userId);

    const input: DeloadInput = {
      workoutHistory: {
        weeklyVolume,
        failedWorkouts: recentWorkouts.filter(w => !w.completedAt).length,
        consecutiveTrainingDays: consecutiveDays,
        plateauDuration: 0, // Would need more complex logic
      },
      fatigueScore: fatigueAssessment?.score || 30,
      injuryRiskScore: injuryRiskAssessment?.score || 20,
      recoveryScore: recoveryEntry?.score || 80,
      sorenessLevel: recoveryEntry?.sorenessLevel || 'LIGHT',
    };

    const result = progressiveOverloadService.calculateDeload(input);

    if (!result.shouldDeload) {
      return null;
    }

    // Check if deload recommendation already exists
    const existing = await recommendationsRepository.getRecommendationsByType(userId, 'DELOAD');
    const recentDeload = existing.find(r => r.status === 'PENDING' || r.status === 'APPLIED');

    if (recentDeload) {
      return null;
    }

    return recommendationsRepository.createRecommendation(userId, {
      type: 'DELOAD',
      title: `${result.type.replace('_', ' ')} Recommended`,
      description: result.explanation,
      explanation: result.explanation,
      confidence: result.confidence,
      recommendedValues: { type: result.type, duration: result.recommendedDuration },
      expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
    });
  }

  async applyRecommendation(userId: string, recommendationId: string): Promise<WorkoutRecommendation> {
    return recommendationsRepository.applyRecommendation(recommendationId, userId);
  }

  async dismissRecommendation(userId: string, recommendationId: string): Promise<WorkoutRecommendation> {
    return recommendationsRepository.dismissRecommendation(recommendationId, userId);
  }

  async getPendingRecommendations(userId: string): Promise<WorkoutRecommendation[]> {
    return recommendationsRepository.getPendingRecommendations(userId);
  }

  async getAllRecommendations(userId: string, limit?: number): Promise<WorkoutRecommendation[]> {
    return recommendationsRepository.getAllRecommendations(userId, limit);
  }

  async getRecommendationById(userId: string, recommendationId: string): Promise<WorkoutRecommendation> {
    return recommendationsRepository.getRecommendationById(recommendationId, userId);
  }

  private getRecommendationTitle(recommendation: string): string {
    const titles: Record<string, string> = {
      INCREASE_WEIGHT: 'Increase Weight',
      INCREASE_REPS: 'Increase Reps',
      INCREASE_SETS: 'Increase Sets',
      MAINTAIN: 'Maintain Current Load',
      REDUCE_INTENSITY: 'Reduce Intensity',
      REDUCE_VOLUME: 'Reduce Volume',
      SUBSTITUTE_EXERCISE: 'Substitute Exercise',
      RECOVERY_DAY: 'Take Recovery Day',
    };
    return titles[recommendation] || 'Recommendation';
  }

  private calculateWeeklyVolume(workouts: any[]): number[] {
    // Simplified weekly volume calculation based on duration and calories
    const weeklyVolumes: number[] = [];
    for (let i = 0; i < 4; i++) {
      const weekWorkouts = workouts.slice(i * 7, (i + 1) * 7);
      const volume = weekWorkouts.reduce((sum, w) => 
        sum + (w.durationMinutes || 0) * 10 + (w.caloriesBurned || 0), 0);
      weeklyVolumes.push(volume);
    }
    return weeklyVolumes;
  }

  private async calculateConsecutiveTrainingDays(userId: string): Promise<number> {
    const workouts = await prisma.workoutHistory.findMany({
      where: { userId },
      orderBy: { completedAt: 'desc' },
      select: { completedAt: true },
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
}

export const recommendationsService = new RecommendationsService();
