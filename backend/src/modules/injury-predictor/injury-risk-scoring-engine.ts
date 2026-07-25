import { InjuryRiskCalculationContext, InjuryRiskScoreResult } from './injury-risk.types';
import {
  INJURY_RISK_WEIGHTS,
  INJURY_RISK_THRESHOLDS,
  DEFAULT_PRECAUTIONS,
  BODY_AREA_MAPPING,
  EXERCISE_CONTRAINDICATIONS,
  TRAINING_MODIFICATIONS,
  getImpactLevel,
  getBodyAreaRiskLevel,
} from './injury-risk.constants';

export class InjuryRiskScoringEngine {
  calculateInjuryRisk(context: InjuryRiskCalculationContext): InjuryRiskScoreResult {
    const factors: InjuryRiskScoreResult['factors'] = [];
    const bodyAreas: InjuryRiskScoreResult['bodyAreas'] = [];
    let totalScore = 0;
    let totalWeight = 0;

    // Historical factors
    const previousInjuryFactor = this.calculatePreviousInjuryFactor(context);
    factors.push(previousInjuryFactor);
    totalScore += previousInjuryFactor.value * previousInjuryFactor.weight;
    totalWeight += previousInjuryFactor.weight;

    const recurringPatternFactor = this.calculateRecurringPatternFactor(context);
    factors.push(recurringPatternFactor);
    totalScore += recurringPatternFactor.value * recurringPatternFactor.weight;
    totalWeight += recurringPatternFactor.weight;

    // Current condition factors
    const currentPainFactor = this.calculateCurrentPainFactor(context);
    factors.push(currentPainFactor);
    totalScore += currentPainFactor.value * currentPainFactor.weight;
    totalWeight += currentPainFactor.weight;

    const sorenessFactor = this.calculateSorenessFactor(context);
    factors.push(sorenessFactor);
    totalScore += sorenessFactor.value * sorenessFactor.weight;
    totalWeight += sorenessFactor.weight;

    const fatigueFactor = this.calculateFatigueFactor(context);
    factors.push(fatigueFactor);
    totalScore += fatigueFactor.value * fatigueFactor.weight;
    totalWeight += fatigueFactor.weight;

    // Training pattern factors
    const repeatedMuscleFactor = this.calculateRepeatedMuscleFactor(context);
    factors.push(repeatedMuscleFactor);
    totalScore += repeatedMuscleFactor.value * repeatedMuscleFactor.weight;
    totalWeight += repeatedMuscleFactor.weight;

    const workloadIncreaseFactor = this.calculateWorkloadIncreaseFactor(context);
    factors.push(workloadIncreaseFactor);
    totalScore += workloadIncreaseFactor.value * workloadIncreaseFactor.weight;
    totalWeight += workloadIncreaseFactor.weight;

    const trainingFrequencyFactor = this.calculateTrainingFrequencyFactor(context);
    factors.push(trainingFrequencyFactor);
    totalScore += trainingFrequencyFactor.value * trainingFrequencyFactor.weight;
    totalWeight += trainingFrequencyFactor.weight;

    // Recovery factors
    const sleepFactor = this.calculateSleepFactor(context);
    factors.push(sleepFactor);
    totalScore += sleepFactor.value * sleepFactor.weight;
    totalWeight += sleepFactor.weight;

    const recoveryFactor = this.calculateRecoveryFactor(context);
    factors.push(recoveryFactor);
    totalScore += recoveryFactor.value * recoveryFactor.weight;
    totalWeight += recoveryFactor.weight;

    // Calculate body area risks
    this.calculateBodyAreaRisks(context, factors, bodyAreas);

    // Normalize total score to 0-100
    const normalizedScore = totalWeight > 0 ? (totalScore / totalWeight) * 100 : 0;
    const finalScore = Math.min(100, Math.max(0, Math.round(normalizedScore)));

    // Determine risk level
    const level = this.determineRiskLevel(finalScore);

    // Calculate confidence
    const confidence = this.calculateConfidence(context);

    // Generate explanation
    const explanation = this.generateExplanation(factors, bodyAreas, finalScore, confidence);

    // Determine precautions and modifications
    const recommendedPrecautions = DEFAULT_PRECAUTIONS[level];
    const exercisesToAvoid = this.determineExercisesToAvoid(bodyAreas as InjuryRiskScoreResult['bodyAreas'], context);
    const trainingModifications = this.determineTrainingModifications(level, factors);

    return {
      score: finalScore,
      level,
      confidence,
      factors,
      bodyAreas,
      explanation,
      recommendedPrecautions,
      exercisesToAvoid,
      trainingModifications,
    };
  }

  private calculatePreviousInjuryFactor(context: InjuryRiskCalculationContext): InjuryRiskScoreResult['factors'][0] {
    const { injuryHistory } = context;
    const value = injuryHistory.hasPreviousInjuries ? 0.7 : 0.1;
    
    const weight = INJURY_RISK_WEIGHTS.previousInjuryHistory;
    const impact = getImpactLevel(value * weight);
    
    return {
      name: 'previous_injury_history',
      value,
      weight,
      impact,
      description: injuryHistory.hasPreviousInjuries
        ? `Previous injuries: ${injuryHistory.injuryTypes.join(', ')}`
        : 'No previous injury history',
    };
  }

  private calculateRecurringPatternFactor(context: InjuryRiskCalculationContext): InjuryRiskScoreResult['factors'][0] {
    const { injuryHistory } = context;
    // Check if same injury type appears multiple times
    const injuryCounts = injuryHistory.injuryTypes.reduce((acc, type) => {
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const hasRecurring = Object.values(injuryCounts).some(count => count > 1);
    const value = hasRecurring ? 0.9 : 0.2;
    
    const weight = INJURY_RISK_WEIGHTS.recurringInjuryPattern;
    const impact = getImpactLevel(value * weight);
    
    return {
      name: 'recurring_injury_pattern',
      value,
      weight,
      impact,
      description: hasRecurring ? 'Recurring injury pattern detected' : 'No recurring injury pattern',
    };
  }

  private calculateCurrentPainFactor(context: InjuryRiskCalculationContext): InjuryRiskScoreResult['factors'][0] {
    const { currentPain } = context;
    
    if (!currentPain.hasReportedPain) {
      return {
        name: 'current_pain',
        value: 0.1,
        weight: INJURY_RISK_WEIGHTS.currentPain,
        impact: 'LOW',
        description: 'No current pain reported',
      };
    }

    const value = currentPain.severity;
    const weight = INJURY_RISK_WEIGHTS.currentPain;
    const impact = getImpactLevel(value * weight);
    
    return {
      name: 'current_pain',
      value,
      weight,
      impact,
      description: `Current pain in: ${currentPain.painAreas.join(', ')}`,
    };
  }

  private calculateSorenessFactor(context: InjuryRiskCalculationContext): InjuryRiskScoreResult['factors'][0] {
    const { recoveryData } = context;
    
    if (!recoveryData.hasRecentData || !recoveryData.latestEntry) {
      return {
        name: 'high_soreness',
        value: 0.5,
        weight: INJURY_RISK_WEIGHTS.highSoreness,
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
    const weight = INJURY_RISK_WEIGHTS.highSoreness;
    const impact = getImpactLevel(value * weight);
    
    return {
      name: 'high_soreness',
      value,
      weight,
      impact,
      description: `Soreness level: ${soreness}`,
    };
  }

  private calculateFatigueFactor(context: InjuryRiskCalculationContext): InjuryRiskScoreResult['factors'][0] {
    const { fatigueData } = context;
    
    if (!fatigueData.hasRecentData || !fatigueData.latestAssessment) {
      return {
        name: 'critical_fatigue',
        value: 0.3,
        weight: INJURY_RISK_WEIGHTS.criticalFatigue,
        impact: 'LOW',
        description: 'No recent fatigue data available',
      };
    }

    const fatigueLevel = fatigueData.latestAssessment.level;
    const fatigueScore = fatigueData.latestAssessment.score;
    
    // Higher fatigue = higher injury risk
    let value: number;
    if (fatigueLevel === 'CRITICAL') value = 0.9;
    else if (fatigueLevel === 'HIGH') value = 0.7;
    else if (fatigueLevel === 'MODERATE') value = 0.4;
    else value = 0.2;
    
    const weight = INJURY_RISK_WEIGHTS.criticalFatigue;
    const impact = getImpactLevel(value * weight);
    
    return {
      name: 'critical_fatigue',
      value,
      weight,
      impact,
      description: `Fatigue level: ${fatigueLevel} (${fatigueScore}/100)`,
    };
  }

  private calculateRepeatedMuscleFactor(context: InjuryRiskCalculationContext): InjuryRiskScoreResult['factors'][0] {
    const { workoutData } = context;
    const muscleGroupFrequency = workoutData.muscleGroupFrequency;
    
    // Find most trained muscle group
    const maxFrequency = Math.max(...Object.values(muscleGroupFrequency), 0);
    const totalWorkouts = workoutData.recentWorkouts.count || 1;
    
    // If same muscle group trained > 60% of the time, high risk
    const value = totalWorkouts > 0 ? (maxFrequency / totalWorkouts) * 1.5 : 0;
    const normalizedValue = Math.min(1, value);
    
    const weight = INJURY_RISK_WEIGHTS.repeatedMuscleGroupTraining;
    const impact = getImpactLevel(normalizedValue * weight);
    
    const mostTrained = Object.entries(muscleGroupFrequency).sort((a, b) => b[1] - a[1])[0];
    
    return {
      name: 'repeated_muscle_group_training',
      value: normalizedValue,
      weight,
      impact,
      description: mostTrained
        ? `Most trained area: ${mostTrained[0]} (${Math.round((maxFrequency / totalWorkouts) * 100)}% of workouts)`
        : 'No muscle group frequency data',
    };
  }

  private calculateWorkloadIncreaseFactor(context: InjuryRiskCalculationContext): InjuryRiskScoreResult['factors'][0] {
    const { workoutData } = context;
    const workloadIncrease = workoutData.workloadIncrease;
    
    // Rapid increase (>50% in short period) is high risk
    const value = Math.min(1, workloadIncrease * 1.5);
    
    const weight = INJURY_RISK_WEIGHTS.rapidWorkloadIncrease;
    const impact = getImpactLevel(value * weight);
    
    return {
      name: 'rapid_workload_increase',
      value,
      weight,
      impact,
      description: `Workload increase: ${Math.round(workloadIncrease * 100)}%`,
    };
  }

  private calculateTrainingFrequencyFactor(context: InjuryRiskCalculationContext): InjuryRiskScoreResult['factors'][0] {
    const { workoutData } = context;
    const frequency = workoutData.trainingFrequency;
    
    // >5 days/week without proper recovery is high risk
    const value = Math.min(1, frequency / 7);
    
    const weight = INJURY_RISK_WEIGHTS.highTrainingFrequency;
    const impact = getImpactLevel(value * weight);
    
    return {
      name: 'high_training_frequency',
      value,
      weight,
      impact,
      description: `Training frequency: ${frequency} days/week`,
    };
  }

  private calculateSleepFactor(context: InjuryRiskCalculationContext): InjuryRiskScoreResult['factors'][0] {
    const { recoveryData } = context;
    
    if (!recoveryData.hasRecentData || !recoveryData.latestEntry) {
      return {
        name: 'poor_sleep',
        value: 0.5,
        weight: INJURY_RISK_WEIGHTS.poorSleep,
        impact: 'LOW',
        description: 'No recent sleep data available',
      };
    }

    const sleepHours = recoveryData.latestEntry.sleepHours;
    // <6 hours is high risk
    let value: number;
    if (sleepHours < 5) value = 0.9;
    else if (sleepHours < 6) value = 0.7;
    else if (sleepHours < 7) value = 0.4;
    else value = 0.2;
    
    const weight = INJURY_RISK_WEIGHTS.poorSleep;
    const impact = getImpactLevel(value * weight);
    
    return {
      name: 'poor_sleep',
      value,
      weight,
      impact,
      description: `Sleep duration: ${sleepHours} hours`,
    };
  }

  private calculateRecoveryFactor(context: InjuryRiskCalculationContext): InjuryRiskScoreResult['factors'][0] {
    const { recoveryData } = context;
    
    if (!recoveryData.hasRecentData || !recoveryData.latestEntry) {
      return {
        name: 'insufficient_recovery',
        value: 0.5,
        weight: INJURY_RISK_WEIGHTS.insufficientRecovery,
        impact: 'LOW',
        description: 'No recent recovery data available',
      };
    }

    const recoveryScore = recoveryData.latestEntry.score;
    // Low recovery score = high risk
    const value = 1 - (recoveryScore / 100);
    
    const weight = INJURY_RISK_WEIGHTS.insufficientRecovery;
    const impact = getImpactLevel(value * weight);
    
    return {
      name: 'insufficient_recovery',
      value,
      weight,
      impact,
      description: `Recovery score: ${recoveryScore}/100`,
    };
  }

  private calculateBodyAreaRisks(
    context: InjuryRiskCalculationContext,
    _factors: InjuryRiskScoreResult['factors'],
    bodyAreas: InjuryRiskScoreResult['bodyAreas']
  ): void {
    const { injuryHistory, currentPain } = context;
    
    // Map injuries to body areas
    const areaScores: Record<string, number> = {};
    
    injuryHistory.injuryDetails.forEach(injury => {
      const areas = BODY_AREA_MAPPING[injury.type] || ['General'];
      areas.forEach(area => {
        areaScores[area] = (areaScores[area] || 0) + 0.5;
      });
    });
    
    // Add current pain areas
    currentPain.painAreas.forEach(area => {
      areaScores[area] = (areaScores[area] || 0) + currentPain.severity;
    });
    
    // Create body area entries
    Object.entries(areaScores).forEach(([area, score]) => {
      const riskLevel = getBodyAreaRiskLevel(score);
      let reason = '';
      let recommendedAction = '';
      
      if (injuryHistory.injuryTypes.some(type => BODY_AREA_MAPPING[type]?.includes(area))) {
        reason = `Previous injury in this area`;
        recommendedAction = 'Avoid exercises that stress this area';
      }
      
      if (currentPain.painAreas.includes(area)) {
        reason += reason ? '. Current pain reported' : 'Current pain reported';
        recommendedAction = 'Rest and avoid aggravating activities';
      }
      
      if (!reason) reason = 'Elevated risk based on training patterns';
      if (!recommendedAction) recommendedAction = 'Monitor closely and reduce intensity';
      
      bodyAreas.push({
        bodyArea: area,
        riskLevel,
        reason,
        recommendedAction,
      });
    });
    
    // If no specific areas, add general
    if (bodyAreas.length === 0) {
      bodyAreas.push({
        bodyArea: 'General',
        riskLevel: 'LOW',
        reason: 'No specific areas of concern',
        recommendedAction: 'Continue with normal training precautions',
      });
    }
  }

  private determineRiskLevel(score: number): 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' {
    if (score >= INJURY_RISK_THRESHOLDS.CRITICAL) return 'CRITICAL';
    if (score >= INJURY_RISK_THRESHOLDS.HIGH) return 'HIGH';
    if (score >= INJURY_RISK_THRESHOLDS.MODERATE) return 'MODERATE';
    return 'LOW';
  }

  private calculateConfidence(context: InjuryRiskCalculationContext): number {
    let availableSignals = 0;
    let totalSignals = 10;

    if (context.injuryHistory.hasPreviousInjuries) availableSignals += 2;
    if (context.currentPain.hasReportedPain) availableSignals += 2;
    if (context.recoveryData.hasRecentData) availableSignals += 2;
    if (context.fatigueData.hasRecentData) availableSignals += 2;
    if (context.workoutData.recentWorkouts.count > 0) availableSignals += 2;

    return Math.min(1, availableSignals / totalSignals);
  }

  private generateExplanation(
    factors: InjuryRiskScoreResult['factors'],
    bodyAreas: InjuryRiskScoreResult['bodyAreas'],
    score: number,
    confidence: number
  ): string {
    const highImpactFactors = factors.filter(f => f.impact === 'HIGH');
    const topFactors = highImpactFactors.slice(0, 3);

    let explanation = `Injury risk score: ${score}/100 (${this.determineRiskLevel(score)}). `;
    
    if (topFactors.length > 0) {
      explanation += 'Primary risk factors: ';
      explanation += topFactors.map(f => f.description).join('; ');
      explanation += '. ';
    }

    const highRiskAreas = bodyAreas.filter(ba => ba.riskLevel === 'HIGH');
    if (highRiskAreas.length > 0) {
      explanation += 'High-risk areas: ';
      explanation += highRiskAreas.map(ba => ba.bodyArea).join(', ');
      explanation += '. ';
    }

    if (confidence < 0.5) {
      explanation += `Confidence: ${Math.round(confidence * 100)}%. More data needed for accurate assessment. `;
    }

    return explanation;
  }

  private determineExercisesToAvoid(
    bodyAreas: InjuryRiskScoreResult['bodyAreas'],
    context: InjuryRiskCalculationContext
  ): string[] {
    const exercisesToAvoid: string[] = [];

    bodyAreas.forEach(area => {
      if (area.riskLevel === 'HIGH') {
        const contraindications = EXERCISE_CONTRAINDICATIONS[area.bodyArea.toUpperCase()] || [];
        exercisesToAvoid.push(...contraindications);
      }
    });

    // Add exercises with contraindications from library
    context.exerciseData.contraindications.forEach(({ exercise, conditions }) => {
      if (conditions.some(condition =>
        bodyAreas.some(ba =>
          ba.bodyArea.toLowerCase().includes(condition.toLowerCase()) ||
          condition.toLowerCase().includes(ba.bodyArea.toLowerCase())
        )
      )) {
        exercisesToAvoid.push(exercise);
      }
    });

    return [...new Set(exercisesToAvoid)]; // Remove duplicates
  }

  private determineTrainingModifications(
    level: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL',
    factors: InjuryRiskScoreResult['factors']
  ): string[] {
    const modifications: string[] = [];

    if (level === 'HIGH' || level === 'CRITICAL') {
      modifications.push(TRAINING_MODIFICATIONS.REDUCE_INTENSITY);
      modifications.push(TRAINING_MODIFICATIONS.REDUCE_VOLUME);
      modifications.push(TRAINING_MODIFICATIONS.ADD_REST_DAYS);
    }

    if (level === 'CRITICAL') {
      modifications.push(TRAINING_MODIFICATIONS.PROFESSIONAL_CONSULTATION);
    }

    const highFatigue = factors.find(f => f.name === 'critical_fatigue' && f.value > 0.7);
    if (highFatigue) {
      modifications.push(TRAINING_MODIFICATIONS.AVOID_IMPACT);
    }

    const repeatedMuscle = factors.find(f => f.name === 'repeated_muscle_group_training' && f.value > 0.6);
    if (repeatedMuscle) {
      modifications.push(TRAINING_MODIFICATIONS.USE_ALTERNATIVES);
      modifications.push(TRAINING_MODIFICATIONS.REDUCE_FREQUENCY);
    }

    return modifications;
  }
}

export const injuryRiskScoringEngine = new InjuryRiskScoringEngine();
