// Fatigue scoring weights and thresholds
export const FATIGUE_WEIGHTS = {
  // Workout-related factors (total: 0.45)
  recentWorkoutLoad: 0.15,
  consecutiveTrainingDays: 0.15,
  workoutIntensity: 0.10,
  missedWorkouts: 0.05,

  // Recovery-related factors (total: 0.35)
  sleepDuration: 0.10,
  sleepQuality: 0.08,
  recoveryScore: 0.10,
  sorenessLevel: 0.07,

  // Lifestyle factors (total: 0.15)
  stressLevel: 0.08,
  energyLevel: 0.07,

  // Other factors (total: 0.05)
  planChanges: 0.03,
  nutritionAdherence: 0.02,
};

export const FATIGUE_THRESHOLDS = {
  LOW: 25,
  MODERATE: 50,
  HIGH: 75,
  CRITICAL: 90,
};

export const RECOMMENDED_ACTIONS = {
  LOW: 'Continue planned workout',
  MODERATE: 'Reduce workout intensity or consider active recovery',
  HIGH: 'Active recovery or light workout recommended',
  CRITICAL: 'Rest day recommended. Reassess after recovery entry',
};

export const RECOVERY_BASED_ACTIONS = {
  POOR_SLEEP: 'Improve sleep quality and duration',
  HIGH_SORENESS: 'Focus on mobility and light stretching',
  HIGH_STRESS: 'Consider stress reduction techniques',
  POOR_NUTRITION: 'Ensure proper nutrition and hydration',
};

export const DUPLICATE_CALCULATION_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes

export const CALCULATION_VERSION = '1.0';

// Normalization ranges
export const NORMALIZATION_RANGES = {
  workoutDuration: { min: 0, max: 180 }, // minutes
  consecutiveDays: { min: 0, max: 7 },
  sleepHours: { min: 0, max: 12 },
  recoveryScore: { min: 0, max: 100 },
};

// Impact levels based on factor contribution
export const getImpactLevel = (weightedScore: number): 'HIGH' | 'MEDIUM' | 'LOW' => {
  if (weightedScore >= 0.15) return 'HIGH';
  if (weightedScore >= 0.08) return 'MEDIUM';
  return 'LOW';
};
