export interface FatigueAssessment {
  id: string;
  userId: string;
  score: number;
  level: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  confidence: number;
  explanation: string;
  recommendedAction: string;
  factors: FatigueFactor[];
  calculationVersion: string;
  calculatedAt: Date;
  forceRecalculate: boolean;
}

export interface FatigueFactor {
  id: string;
  assessmentId: string;
  name: string;
  value: number;
  weight: number;
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
}

export interface CalculateFatigueInput {
  force?: boolean;
}

export interface FatigueCalculationContext {
  userId: string;
  recentWorkouts: {
    count: number;
    totalDuration: number;
    totalVolume: number;
    consecutiveDays: number;
    avgIntensity: number;
    missedWorkouts: number;
  };
  recoveryData: {
    latestEntry: {
      sleepHours: number;
      sleepQuality: string;
      hydrationLevel: string;
      sorenessLevel: string;
      stressLevel: string;
      energyLevel: string;
      previousWorkoutLoad: string;
      score: number;
    } | null;
    hasRecentData: boolean;
  };
  habitData: {
    sleepConsistency: number;
    hydrationConsistency: number;
  };
  nutritionData: {
    calorieAdherence: number;
    proteinAdherence: number;
    hasRecentData: boolean;
  };
  planChangeData: {
    recentChanges: number;
    daysSinceLastChange: number;
  };
}

export interface FatigueScoreResult {
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
  explanation: string;
  recommendedAction: string;
}
