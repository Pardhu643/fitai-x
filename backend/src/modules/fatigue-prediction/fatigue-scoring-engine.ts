import { FatigueCalculationContext, FatigueScoreResult } from './fatigue.types';
import {
  FATIGUE_WEIGHTS,
  FATIGUE_THRESHOLDS,
  RECOMMENDED_ACTIONS,
  RECOVERY_BASED_ACTIONS,
  NORMALIZATION_RANGES,
  getImpactLevel,
} from './fatigue.constants';

export class FatigueScoringEngine {
  calculateFatigueScore(context: FatigueCalculationContext): FatigueScoreResult {
    const factors: FatigueScoreResult['factors'] = [];
    let totalScore = 0;
    let totalWeight = 0;

    // Workout-related factors
    const workoutLoadFactor = this.calculateWorkoutLoadFactor(context);
    factors.push(workoutLoadFactor);
    totalScore += workoutLoadFactor.value * workoutLoadFactor.weight;
    totalWeight += workoutLoadFactor.weight;

    const consecutiveDaysFactor = this.calculateConsecutiveDaysFactor(context);
    factors.push(consecutiveDaysFactor);
    totalScore += consecutiveDaysFactor.value * consecutiveDaysFactor.weight;
    totalWeight += consecutiveDaysFactor.weight;

    const intensityFactor = this.calculateIntensityFactor(context);
    factors.push(intensityFactor);
    totalScore += intensityFactor.value * intensityFactor.weight;
    totalWeight += intensityFactor.weight;

    const missedWorkoutsFactor = this.calculateMissedWorkoutsFactor(context);
    factors.push(missedWorkoutsFactor);
    totalScore += missedWorkoutsFactor.value * missedWorkoutsFactor.weight;
    totalWeight += missedWorkoutsFactor.weight;

    // Recovery-related factors
    const sleepDurationFactor = this.calculateSleepDurationFactor(context);
    factors.push(sleepDurationFactor);
    totalScore += sleepDurationFactor.value * sleepDurationFactor.weight;
    totalWeight += sleepDurationFactor.weight;

    const sleepQualityFactor = this.calculateSleepQualityFactor(context);
    factors.push(sleepQualityFactor);
    totalScore += sleepQualityFactor.value * sleepQualityFactor.weight;
    totalWeight += sleepQualityFactor.weight;

    const recoveryScoreFactor = this.calculateRecoveryScoreFactor(context);
    factors.push(recoveryScoreFactor);
    totalScore += recoveryScoreFactor.value * recoveryScoreFactor.weight;
    totalWeight += recoveryScoreFactor.weight;

    const sorenessFactor = this.calculateSorenessFactor(context);
    factors.push(sorenessFactor);
    totalScore += sorenessFactor.value * sorenessFactor.weight;
    totalWeight += sorenessFactor.weight;

    // Lifestyle factors
    const stressFactor = this.calculateStressFactor(context);
    factors.push(stressFactor);
    totalScore += stressFactor.value * stressFactor.weight;
    totalWeight += stressFactor.weight;

    const energyFactor = this.calculateEnergyFactor(context);
    factors.push(energyFactor);
    totalScore += energyFactor.value * energyFactor.weight;
    totalWeight += energyFactor.weight;

    // Other factors
    const planChangeFactor = this.calculatePlanChangeFactor(context);
    factors.push(planChangeFactor);
    totalScore += planChangeFactor.value * planChangeFactor.weight;
    totalWeight += planChangeFactor.weight;

    const nutritionFactor = this.calculateNutritionFactor(context);
    factors.push(nutritionFactor);
    totalScore += nutritionFactor.value * nutritionFactor.weight;
    totalWeight += nutritionFactor.weight;

    // Normalize total score to 0-100
    const normalizedScore = totalWeight > 0 ? (totalScore / totalWeight) * 100 : 0;
    const finalScore = Math.min(100, Math.max(0, Math.round(normalizedScore)));

    // Determine fatigue level
    const level = this.determineFatigueLevel(finalScore);

    // Calculate confidence based on available data
    const confidence = this.calculateConfidence(context);

    // Generate explanation
    const explanation = this.generateExplanation(factors, finalScore, confidence);

    // Determine recommended action
    const recommendedAction = this.determineRecommendedAction(
      level,
      context,
      factors
    );

    return {
      score: finalScore,
      level,
      confidence,
      factors,
      explanation,
      recommendedAction,
    };
  }

  private calculateWorkoutLoadFactor(context: FatigueCalculationContext): FatigueScoreResult['factors'][0] {
    const { recentWorkouts } = context;
    const avgDuration = recentWorkouts.count > 0 ? recentWorkouts.totalDuration / recentWorkouts.count : 0;
    
    // Normalize duration (0-180 minutes)
    const normalizedDuration = Math.min(1, avgDuration / NORMALIZATION_RANGES.workoutDuration.max);
    
    // Consider workout count (more workouts = higher fatigue)
    const workoutCountScore = Math.min(1, recentWorkouts.count / 7);
    
    // Combine duration and count
    const value = (normalizedDuration * 0.6 + workoutCountScore * 0.4);
    
    const weight = FATIGUE_WEIGHTS.recentWorkoutLoad;
    const impact = getImpactLevel(value * weight);
    
    return {
      name: 'recent_workout_load',
      value,
      weight,
      impact,
      description: `Recent workout load based on ${recentWorkouts.count} workouts with average duration of ${Math.round(avgDuration)} minutes`,
    };
  }

  private calculateConsecutiveDaysFactor(context: FatigueCalculationContext): FatigueScoreResult['factors'][0] {
    const { recentWorkouts } = context;
    const normalizedDays = Math.min(1, recentWorkouts.consecutiveDays / NORMALIZATION_RANGES.consecutiveDays.max);
    
    const weight = FATIGUE_WEIGHTS.consecutiveTrainingDays;
    const impact = getImpactLevel(normalizedDays * weight);
    
    return {
      name: 'consecutive_training_days',
      value: normalizedDays,
      weight,
      impact,
      description: `${recentWorkouts.consecutiveDays} consecutive training days`,
    };
  }

  private calculateIntensityFactor(context: FatigueCalculationContext): FatigueScoreResult['factors'][0] {
    const { recentWorkouts } = context;
    // Use avgIntensity if available, otherwise estimate from duration and calories
    const intensity = recentWorkouts.avgIntensity || 0.5;
    
    const weight = FATIGUE_WEIGHTS.workoutIntensity;
    const impact = getImpactLevel(intensity * weight);
    
    return {
      name: 'workout_intensity',
      value: intensity,
      weight,
      impact,
      description: `Average workout intensity: ${Math.round(intensity * 100)}%`,
    };
  }

  private calculateMissedWorkoutsFactor(context: FatigueCalculationContext): FatigueScoreResult['factors'][0] {
    const { recentWorkouts } = context;
    // More missed workouts = lower fatigue (recovery time)
    const normalizedMissed = Math.min(1, recentWorkouts.missedWorkouts / 5);
    const value = 1 - normalizedMissed; // Invert: fewer missed = higher fatigue
    
    const weight = FATIGUE_WEIGHTS.missedWorkouts;
    const impact = getImpactLevel(value * weight);
    
    return {
      name: 'missed_workouts',
      value,
      weight,
      impact,
      description: `${recentWorkouts.missedWorkouts} missed workouts in recent period`,
    };
  }

  private calculateSleepDurationFactor(context: FatigueCalculationContext): FatigueScoreResult['factors'][0] {
    const { recoveryData } = context;
    
    if (!recoveryData.hasRecentData || !recoveryData.latestEntry) {
      return {
        name: 'sleep_duration',
        value: 0.5,
        weight: FATIGUE_WEIGHTS.sleepDuration,
        impact: 'LOW',
        description: 'No recent sleep data available',
      };
    }

    const sleepHours = recoveryData.latestEntry.sleepHours;
    // Optimal sleep is 7-9 hours. Less or more increases fatigue
    let normalizedSleep: number;
    if (sleepHours >= 7 && sleepHours <= 9) {
      normalizedSleep = 0.2; // Low fatigue
    } else if (sleepHours < 5) {
      normalizedSleep = 1.0; // High fatigue
    } else if (sleepHours < 7) {
      normalizedSleep = 0.6; // Moderate fatigue
    } else {
      normalizedSleep = 0.4; // Slightly elevated fatigue
    }
    
    const weight = FATIGUE_WEIGHTS.sleepDuration;
    const impact = getImpactLevel(normalizedSleep * weight);
    
    return {
      name: 'sleep_duration',
      value: normalizedSleep,
      weight,
      impact,
      description: `${sleepHours} hours of sleep (optimal: 7-9 hours)`,
    };
  }

  private calculateSleepQualityFactor(context: FatigueCalculationContext): FatigueScoreResult['factors'][0] {
    const { recoveryData } = context;
    
    if (!recoveryData.hasRecentData || !recoveryData.latestEntry) {
      return {
        name: 'sleep_quality',
        value: 0.5,
        weight: FATIGUE_WEIGHTS.sleepQuality,
        impact: 'LOW',
        description: 'No recent sleep quality data available',
      };
    }

    const quality = recoveryData.latestEntry.sleepQuality;
    const qualityMap: Record<string, number> = {
      EXCELLENT: 0.1,
      GOOD: 0.3,
      FAIR: 0.6,
      POOR: 0.9,
    };
    
    const value = qualityMap[quality] || 0.5;
    const weight = FATIGUE_WEIGHTS.sleepQuality;
    const impact = getImpactLevel(value * weight);
    
    return {
      name: 'sleep_quality',
      value,
      weight,
      impact,
      description: `Sleep quality: ${quality}`,
    };
  }

  private calculateRecoveryScoreFactor(context: FatigueCalculationContext): FatigueScoreResult['factors'][0] {
    const { recoveryData } = context;
    
    if (!recoveryData.hasRecentData || !recoveryData.latestEntry) {
      return {
        name: 'recovery_score',
        value: 0.5,
        weight: FATIGUE_WEIGHTS.recoveryScore,
        impact: 'LOW',
        description: 'No recent recovery score available',
      };
    }

    const recoveryScore = recoveryData.latestEntry.score;
    // Invert recovery score: higher recovery = lower fatigue
    const normalizedRecovery = 1 - (recoveryScore / 100);
    
    const weight = FATIGUE_WEIGHTS.recoveryScore;
    const impact = getImpactLevel(normalizedRecovery * weight);
    
    return {
      name: 'recovery_score',
      value: normalizedRecovery,
      weight,
      impact,
      description: `Recovery score: ${recoveryScore}/100`,
    };
  }

  private calculateSorenessFactor(context: FatigueCalculationContext): FatigueScoreResult['factors'][0] {
    const { recoveryData } = context;
    
    if (!recoveryData.hasRecentData || !recoveryData.latestEntry) {
      return {
        name: 'soreness_level',
        value: 0.5,
        weight: FATIGUE_WEIGHTS.sorenessLevel,
        impact: 'LOW',
        description: 'No recent soreness data available',
      };
    }

    const soreness = recoveryData.latestEntry.sorenessLevel;
    const sorenessMap: Record<string, number> = {
      NONE: 0.1,
      LIGHT: 0.4,
      HEAVY: 0.9,
    };
    
    const value = sorenessMap[soreness] || 0.5;
    const weight = FATIGUE_WEIGHTS.sorenessLevel;
    const impact = getImpactLevel(value * weight);
    
    return {
      name: 'soreness_level',
      value,
      weight,
      impact,
      description: `Soreness level: ${soreness}`,
    };
  }

  private calculateStressFactor(context: FatigueCalculationContext): FatigueScoreResult['factors'][0] {
    const { recoveryData } = context;
    
    if (!recoveryData.hasRecentData || !recoveryData.latestEntry) {
      return {
        name: 'stress_level',
        value: 0.5,
        weight: FATIGUE_WEIGHTS.stressLevel,
        impact: 'LOW',
        description: 'No recent stress data available',
      };
    }

    const stress = recoveryData.latestEntry.stressLevel;
    const stressMap: Record<string, number> = {
      LOW: 0.2,
      MEDIUM: 0.5,
      HIGH: 0.9,
    };
    
    const value = stressMap[stress] || 0.5;
    const weight = FATIGUE_WEIGHTS.stressLevel;
    const impact = getImpactLevel(value * weight);
    
    return {
      name: 'stress_level',
      value,
      weight,
      impact,
      description: `Stress level: ${stress}`,
    };
  }

  private calculateEnergyFactor(context: FatigueCalculationContext): FatigueScoreResult['factors'][0] {
    const { recoveryData } = context;
    
    if (!recoveryData.hasRecentData || !recoveryData.latestEntry) {
      return {
        name: 'energy_level',
        value: 0.5,
        weight: FATIGUE_WEIGHTS.energyLevel,
        impact: 'LOW',
        description: 'No recent energy data available',
      };
    }

    const energy = recoveryData.latestEntry.energyLevel;
    const energyMap: Record<string, number> = {
      HIGH: 0.2,
      MEDIUM: 0.5,
      LOW: 0.9,
    };
    
    const value = energyMap[energy] || 0.5;
    const weight = FATIGUE_WEIGHTS.energyLevel;
    const impact = getImpactLevel(value * weight);
    
    return {
      name: 'energy_level',
      value,
      weight,
      impact,
      description: `Energy level: ${energy}`,
    };
  }

  private calculatePlanChangeFactor(context: FatigueCalculationContext): FatigueScoreResult['factors'][0] {
    const { planChangeData } = context;
    
    // Recent plan changes can increase fatigue due to adaptation
    const normalizedChanges = Math.min(1, planChangeData.recentChanges / 3);
    const daysSinceChange = planChangeData.daysSinceLastChange;
    
    // Decay the impact over time
    const timeDecay = Math.max(0.2, 1 - (daysSinceChange / 14));
    const value = normalizedChanges * timeDecay;
    
    const weight = FATIGUE_WEIGHTS.planChanges;
    const impact = getImpactLevel(value * weight);
    
    return {
      name: 'plan_changes',
      value,
      weight,
      impact,
      description: `${planChangeData.recentChanges} recent plan changes, ${daysSinceChange} days since last change`,
    };
  }

  private calculateNutritionFactor(context: FatigueCalculationContext): FatigueScoreResult['factors'][0] {
    const { nutritionData } = context;
    
    if (!nutritionData.hasRecentData) {
      return {
        name: 'nutrition_adherence',
        value: 0.5,
        weight: FATIGUE_WEIGHTS.nutritionAdherence,
        impact: 'LOW',
        description: 'No recent nutrition data available',
      };
    }

    // Poor nutrition adherence = higher fatigue
    const avgAdherence = (nutritionData.calorieAdherence + nutritionData.proteinAdherence) / 2;
    const value = 1 - avgAdherence;
    
    const weight = FATIGUE_WEIGHTS.nutritionAdherence;
    const impact = getImpactLevel(value * weight);
    
    return {
      name: 'nutrition_adherence',
      value,
      weight,
      impact,
      description: `Nutrition adherence: ${Math.round(avgAdherence * 100)}%`,
    };
  }

  private determineFatigueLevel(score: number): 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' {
    if (score >= FATIGUE_THRESHOLDS.CRITICAL) return 'CRITICAL';
    if (score >= FATIGUE_THRESHOLDS.HIGH) return 'HIGH';
    if (score >= FATIGUE_THRESHOLDS.MODERATE) return 'MODERATE';
    return 'LOW';
  }

  private calculateConfidence(context: FatigueCalculationContext): number {
    let availableSignals = 0;
    let totalSignals = 11;

    if (context.recentWorkouts.count > 0) availableSignals += 4;
    if (context.recoveryData.hasRecentData) availableSignals += 6;
    if (context.nutritionData.hasRecentData) availableSignals += 1;

    return Math.min(1, availableSignals / totalSignals);
  }

  private generateExplanation(
    factors: FatigueScoreResult['factors'],
    score: number,
    confidence: number
  ): string {
    const highImpactFactors = factors.filter(f => f.impact === 'HIGH');
    const topFactors = highImpactFactors.slice(0, 3);

    let explanation = `Fatigue score: ${score}/100 (${this.determineFatigueLevel(score)}). `;
    
    if (topFactors.length > 0) {
      explanation += 'Primary contributors: ';
      explanation += topFactors.map(f => f.description).join('; ');
      explanation += '. ';
    }

    if (confidence < 0.5) {
      explanation += `Confidence: ${Math.round(confidence * 100)}%. More data needed for accurate assessment. `;
    }

    return explanation;
  }

  private determineRecommendedAction(
    level: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL',
    _context: FatigueCalculationContext,
    factors: FatigueScoreResult['factors']
  ): string {
    let action = RECOMMENDED_ACTIONS[level];

    // Add specific recommendations based on key factors
    const poorSleep = factors.find(f => f.name === 'sleep_duration' && f.value > 0.6);
    const highSoreness = factors.find(f => f.name === 'soreness_level' && f.value > 0.7);
    const highStress = factors.find(f => f.name === 'stress_level' && f.value > 0.7);
    const poorNutrition = factors.find(f => f.name === 'nutrition_adherence' && f.value > 0.6);

    if (poorSleep) {
      action += '. ' + RECOVERY_BASED_ACTIONS.POOR_SLEEP;
    }
    if (highSoreness) {
      action += '. ' + RECOVERY_BASED_ACTIONS.HIGH_SORENESS;
    }
    if (highStress) {
      action += '. ' + RECOVERY_BASED_ACTIONS.HIGH_STRESS;
    }
    if (poorNutrition) {
      action += '. ' + RECOVERY_BASED_ACTIONS.POOR_NUTRITION;
    }

    return action;
  }
}

export const fatigueScoringEngine = new FatigueScoringEngine();
