export interface InjuryRiskAssessment {
  id: string;
  userId: string;
  score: number;
  level: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  confidence: number;
  disclaimer: string;
  explanation: string;
  recommendedPrecautions: string[];
  exercisesToAvoid: string[];
  trainingModifications: string[];
  factors: InjuryRiskFactor[];
  bodyAreas: InjuryRiskBodyArea[];
  calculationVersion: string;
  calculatedAt: Date;
  forceRecalculate: boolean;
}

export interface InjuryRiskFactor {
  id: string;
  assessmentId: string;
  name: string;
  value: number;
  weight: number;
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
}

export interface InjuryRiskBodyArea {
  id: string;
  assessmentId: string;
  bodyArea: string;
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH';
  reason: string;
  recommendedAction: string;
}

export interface CalculateInjuryRiskInput {
  force?: boolean;
}

export interface InjuryRiskCalculationContext {
  userId: string;
  injuryHistory: {
    hasPreviousInjuries: boolean;
    injuryTypes: string[];
    injuryDetails: Array<{ type: string; details: string }>;
  };
  currentPain: {
    hasReportedPain: boolean;
    painAreas: string[];
    severity: number; // 0-1
  };
  recoveryData: {
    latestEntry: {
      sleepHours: number;
      sleepQuality: string;
      sorenessLevel: string;
      stressLevel: string;
      energyLevel: string;
      score: number;
    } | null;
    hasRecentData: boolean;
  };
  fatigueData: {
    latestAssessment: {
      score: number;
      level: string;
    } | null;
    hasRecentData: boolean;
  };
  workoutData: {
    recentWorkouts: {
      count: number;
      totalDuration: number;
      consecutiveDays: number;
      avgIntensity: number;
    };
    muscleGroupFrequency: Record<string, number>;
    workloadIncrease: number; // 0-1, rate of increase
    trainingFrequency: number; // workouts per week
  };
  exerciseData: {
    contraindications: Array<{ exercise: string; conditions: string[] }>;
    highRiskExercises: string[];
  };
}

export interface InjuryRiskScoreResult {
  score: number;
  level: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  confidence: number;
  factors: Array<{
    name: string;
    value: number;
    weight: number;
    impact: 'HIGH' | 'MEDIUM' | 'LOW';
    description: string;
  }>;
  bodyAreas: Array<{
    bodyArea: string;
    riskLevel: 'LOW' | 'MODERATE' | 'HIGH';
    reason: string;
    recommendedAction: string;
  }>;
  explanation: string;
  recommendedPrecautions: string[];
  exercisesToAvoid: string[];
  trainingModifications: string[];
}
