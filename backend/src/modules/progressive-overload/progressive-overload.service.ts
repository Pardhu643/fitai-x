import { ProgressiveOverloadInput, ProgressiveOverloadResult, DeloadInput, DeloadResult } from './progressive-overload.types';

export class ProgressiveOverloadService {
  applyProgressionRules(
    exerciseName: string,
    currentSets: number,
    currentReps: number,
    currentWeight: number | null,
    fitnessLevel: string
  ): { sets: number; reps: number; weight: number | null; note: string } {
    let sets = currentSets;
    let reps = currentReps;
    let weight = currentWeight;
    let note = '';

    if (fitnessLevel === 'ADVANCED') {
      if (weight !== null) {
        const isLowerBody = ['squats', 'deadlift', 'lunge', 'leg press'].some(kw => exerciseName.toLowerCase().includes(kw));
        const increment = isLowerBody ? 5 : 2.5;
        weight += increment;
        note = `Progressive overload applied: increased weight by ${increment}kg for advanced progression.`;
      } else {
        reps = Math.min(reps + 2, 15);
        note = `Progressive overload applied: increased reps by 2 for volume progression.`;
      }
    } else if (fitnessLevel === 'INTERMEDIATE') {
      reps = Math.min(reps + 1, 12);
      note = `Progressive overload applied: increased target reps by 1.`;
    } else {
      note = 'No progressive overload adjustments applied for beginners.';
    }

    return { sets, reps, weight, note };
  }

  calculateEnhancedProgression(input: ProgressiveOverloadInput): ProgressiveOverloadResult {
    const {
      exerciseName,
      currentSets,
      currentReps,
      currentWeight,
      fitnessLevel,
      workoutHistory,
      recoveryScore,
      fatigueScore,
      injuryRiskScore,
      sorenessLevel
    } = input;

    // Safety checks - never increase load when risk is high
    if (injuryRiskScore >= 75 || fatigueScore >= 75) {
      return {
        sets: Math.max(1, currentSets - 1),
        reps: Math.max(1, currentReps - 1),
        weight: currentWeight,
        recommendation: 'REDUCE_INTENSITY',
        explanation: `Reduced intensity due to ${injuryRiskScore >= 75 ? 'high injury risk' : 'high fatigue'}. Safety first.`,
        confidence: 0.9
      };
    }

    // Check for poor recovery
    if (recoveryScore < 50 || sorenessLevel === 'HEAVY') {
      return {
        sets: currentSets,
        reps: currentReps,
        weight: currentWeight,
        recommendation: 'RECOVERY_DAY',
        explanation: `Recovery day recommended due to ${recoveryScore < 50 ? 'low recovery score' : 'heavy soreness'}.`,
        confidence: 0.85
      };
    }

    // Calculate consistency and performance trends
    const recentPerformance = workoutHistory.completedReps.slice(-3);
    const isImproving = recentPerformance.length >= 2 && recentPerformance[recentPerformance.length - 1] > recentPerformance[0];
    
    const failedSetRatio = workoutHistory.completedSets.length > 0
      ? workoutHistory.failedSets / workoutHistory.completedSets.length
      : 0;

    // Beginner: focus on form and consistency
    if (fitnessLevel === 'BEGINNER') {
      if (workoutHistory.consistency < 0.7) {
        return {
          sets: currentSets,
          reps: currentReps,
          weight: currentWeight,
          recommendation: 'MAINTAIN',
          explanation: 'Focus on consistency before increasing load. Build the habit first.',
          confidence: 0.8
        };
      }
      
      if (isImproving && workoutHistory.consistency >= 0.8) {
        return {
          sets: currentSets,
          reps: Math.min(currentReps + 1, 12),
          weight: currentWeight,
          recommendation: 'INCREASE_REPS',
          explanation: 'Good progress! Increase reps slightly to continue building strength.',
          confidence: 0.75
        };
      }
      
      return {
        sets: currentSets,
        reps: currentReps,
        weight: currentWeight,
        recommendation: 'MAINTAIN',
        explanation: 'Continue with current parameters to build consistency.',
        confidence: 0.7
      };
    }

    // Intermediate: gradual increases
    if (fitnessLevel === 'INTERMEDIATE') {
      if (failedSetRatio > 0.2) {
        return {
          sets: currentSets,
          reps: currentReps,
          weight: currentWeight,
          recommendation: 'MAINTAIN',
          explanation: 'Recent failed sets detected. Maintain current load until strength improves.',
          confidence: 0.85
        };
      }

      if (isImproving && recoveryScore >= 70 && workoutHistory.consistency >= 0.8) {
        if (currentWeight && currentReps >= 10) {
          const isLowerBody = ['squats', 'deadlift', 'lunge', 'leg press'].some(kw => exerciseName.toLowerCase().includes(kw));
          const increment = isLowerBody ? 2.5 : 1.25;
          return {
            sets: currentSets,
            reps: currentReps,
            weight: currentWeight + increment,
            recommendation: 'INCREASE_WEIGHT',
            explanation: `Strong progress! Increase weight by ${increment}kg for continued gains.`,
            confidence: 0.8
          };
        }
        
        return {
          sets: currentSets,
          reps: Math.min(currentReps + 1, 12),
          weight: currentWeight,
          recommendation: 'INCREASE_REPS',
          explanation: 'Increase reps to build toward weight progression.',
          confidence: 0.75
        };
      }

      return {
        sets: currentSets,
        reps: currentReps,
        weight: currentWeight,
        recommendation: 'MAINTAIN',
        explanation: 'Maintain current load. Focus on perfect form and consistency.',
        confidence: 0.7
      };
    }

    // Advanced: strategic increases with deload awareness
    if (fitnessLevel === 'ADVANCED') {
      if (failedSetRatio > 0.15) {
        return {
          sets: Math.max(2, currentSets - 1),
          reps: currentReps,
          weight: currentWeight,
          recommendation: 'REDUCE_VOLUME',
          explanation: 'Failed sets detected. Reduce volume to allow recovery.',
          confidence: 0.85
        };
      }

      if (isImproving && recoveryScore >= 75 && workoutHistory.consistency >= 0.9) {
        if (currentWeight) {
          const isLowerBody = ['squats', 'deadlift', 'lunge', 'leg press'].some(kw => exerciseName.toLowerCase().includes(kw));
          const increment = isLowerBody ? 5 : 2.5;
          return {
            sets: currentSets,
            reps: currentReps,
            weight: currentWeight + increment,
            recommendation: 'INCREASE_WEIGHT',
            explanation: `Excellent progress! Increase weight by ${increment}kg for advanced progression.`,
            confidence: 0.85
          };
        }
        
        if (currentReps < 15) {
          return {
            sets: currentSets,
            reps: currentReps + 2,
            weight: currentWeight,
            recommendation: 'INCREASE_REPS',
            explanation: 'Increase reps to build toward weight progression.',
            confidence: 0.8
          };
        }
        
        return {
          sets: currentSets + 1,
          reps: currentReps,
          weight: currentWeight,
          recommendation: 'INCREASE_SETS',
          explanation: 'Add a set to increase volume for hypertrophy.',
          confidence: 0.75
        };
      }

      return {
        sets: currentSets,
        reps: currentReps,
        weight: currentWeight,
        recommendation: 'MAINTAIN',
        explanation: 'Maintain current load. Focus on intensity and progressive overload.',
        confidence: 0.7
      };
    }

    return {
      sets: currentSets,
      reps: currentReps,
      weight: currentWeight,
      recommendation: 'MAINTAIN',
      explanation: 'No progression recommended at this time.',
      confidence: 0.5
    };
  }

  calculateDeload(input: DeloadInput): DeloadResult {
    const {
      workoutHistory,
      fatigueScore,
      injuryRiskScore,
      recoveryScore,
      sorenessLevel
    } = input;

    let shouldDeload = false;
    let type: 'VOLUME_REDUCTION' | 'INTENSITY_REDUCTION' | 'RECOVERY_WEEK' = 'VOLUME_REDUCTION';
    let explanation = '';
    let confidence = 0;
    let recommendedDuration = 3;

    const reasons: string[] = [];

    // Check fatigue
    if (fatigueScore >= 80) {
      shouldDeload = true;
      reasons.push(`Critical fatigue level (${fatigueScore}/100)`);
      confidence += 0.3;
    } else if (fatigueScore >= 65) {
      shouldDeload = true;
      reasons.push(`High fatigue level (${fatigueScore}/100)`);
      confidence += 0.2;
    }

    // Check injury risk
    if (injuryRiskScore >= 75) {
      shouldDeload = true;
      type = 'RECOVERY_WEEK';
      reasons.push(`High injury risk (${injuryRiskScore}/100)`);
      confidence += 0.35;
      recommendedDuration = 7;
    } else if (injuryRiskScore >= 60) {
      shouldDeload = true;
      reasons.push(`Moderate injury risk (${injuryRiskScore}/100)`);
      confidence += 0.2;
    }

    // Check recovery
    if (recoveryScore < 40) {
      shouldDeload = true;
      type = 'RECOVERY_WEEK';
      reasons.push(`Very low recovery score (${recoveryScore}/100)`);
      confidence += 0.3;
      recommendedDuration = 7;
    } else if (recoveryScore < 50) {
      shouldDeload = true;
      reasons.push(`Low recovery score (${recoveryScore}/100)`);
      confidence += 0.15;
    }

    // Check training patterns
    if (workoutHistory.consecutiveTrainingDays >= 6) {
      shouldDeload = true;
      type = 'RECOVERY_WEEK';
      reasons.push(`${workoutHistory.consecutiveTrainingDays} consecutive training days`);
      confidence += 0.25;
      recommendedDuration = 7;
    }

    if (workoutHistory.failedWorkouts >= 3) {
      shouldDeload = true;
      type = 'INTENSITY_REDUCTION';
      reasons.push(`${workoutHistory.failedWorkouts} failed workouts recently`);
      confidence += 0.2;
    }

    // Check for plateau
    if (workoutHistory.plateauDuration >= 4) {
      shouldDeload = true;
      type = 'VOLUME_REDUCTION';
      reasons.push(`${workoutHistory.plateauDuration} week plateau detected`);
      confidence += 0.15;
    }

    // Check excessive volume
    const avgWeeklyVolume = workoutHistory.weeklyVolume.length > 0
      ? workoutHistory.weeklyVolume.reduce((a, b) => a + b, 0) / workoutHistory.weeklyVolume.length
      : 0;
    
    if (avgWeeklyVolume > 10000) {
      shouldDeload = true;
      type = 'VOLUME_REDUCTION';
      reasons.push(`High weekly training volume (${Math.round(avgWeeklyVolume)} units)`);
      confidence += 0.15;
    }

    // Check soreness
    if (sorenessLevel === 'HEAVY') {
      shouldDeload = true;
      type = 'RECOVERY_WEEK';
      reasons.push('Heavy persistent soreness');
      confidence += 0.2;
      recommendedDuration = 5;
    }

    if (shouldDeload) {
      explanation = `Deload recommended: ${reasons.join('; ')}. ${type === 'RECOVERY_WEEK' ? 'Take a full recovery week.' : type === 'VOLUME_REDUCTION' ? 'Reduce training volume by 30-40%.' : 'Reduce training intensity by 20-30%.'}`;
      confidence = Math.min(0.95, confidence);
    } else {
      explanation = 'No deload needed at this time. Continue with normal training.';
      confidence = 0.8;
    }

    return {
      shouldDeload,
      type,
      explanation,
      confidence,
      recommendedDuration
    };
  }
}

export const progressiveOverloadService = new ProgressiveOverloadService();
