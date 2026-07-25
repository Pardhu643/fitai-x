export interface ProgressiveOverloadInput {
  exerciseName: string;
  currentSets: number;
  currentReps: number;
  currentWeight: number | null;
  fitnessLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  workoutHistory: {
    completedReps: number[];
    completedSets: number[];
    weightsLifted: number[];
    failedSets: number;
    skippedWorkouts: number;
    consistency: number;
  };
  recoveryScore: number;
  fatigueScore: number;
  injuryRiskScore: number;
  sorenessLevel: string;
}

export interface ProgressiveOverloadResult {
  sets: number;
  reps: number;
  weight: number | null;
  recommendation: 'INCREASE_WEIGHT' | 'INCREASE_REPS' | 'INCREASE_SETS' | 'MAINTAIN' | 'REDUCE_INTENSITY' | 'REDUCE_VOLUME' | 'SUBSTITUTE_EXERCISE' | 'RECOVERY_DAY';
  explanation: string;
  confidence: number;
}

export interface DeloadInput {
  workoutHistory: {
    weeklyVolume: number[];
    failedWorkouts: number;
    consecutiveTrainingDays: number;
    plateauDuration: number;
  };
  fatigueScore: number;
  injuryRiskScore: number;
  recoveryScore: number;
  sorenessLevel: string;
}

export interface DeloadResult {
  shouldDeload: boolean;
  type: 'VOLUME_REDUCTION' | 'INTENSITY_REDUCTION' | 'RECOVERY_WEEK';
  explanation: string;
  confidence: number;
  recommendedDuration: number; // days
}
