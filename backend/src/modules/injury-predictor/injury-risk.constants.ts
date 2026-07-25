// Injury risk scoring weights and thresholds
export const INJURY_RISK_WEIGHTS = {
  // Historical factors (total: 0.30)
  previousInjuryHistory: 0.20,
  recurringInjuryPattern: 0.10,

  // Current condition factors (total: 0.35)
  currentPain: 0.15,
  highSoreness: 0.10,
  criticalFatigue: 0.10,

  // Training pattern factors (total: 0.25)
  repeatedMuscleGroupTraining: 0.10,
  rapidWorkloadIncrease: 0.08,
  highTrainingFrequency: 0.07,

  // Recovery factors (total: 0.10)
  poorSleep: 0.05,
  insufficientRecovery: 0.05,
};

export const INJURY_RISK_THRESHOLDS = {
  LOW: 25,
  MODERATE: 50,
  HIGH: 75,
  CRITICAL: 90,
};

export const DISCLAIMER_TEXT = 'This assessment is a fitness risk indicator and is not a medical diagnosis.';

export const DEFAULT_PRECAUTIONS = {
  LOW: ['Continue normal training with proper form', 'Monitor for any pain or discomfort'],
  MODERATE: ['Consider reducing intensity by 10-20%', 'Focus on proper warm-up and cool-down', 'Monitor affected areas closely'],
  HIGH: ['Reduce training intensity by 30-50%', 'Avoid exercises that stress affected areas', 'Consider additional rest days', 'Consult a healthcare professional if pain persists'],
  CRITICAL: ['Stop training and rest completely', 'Seek medical evaluation before returning to training', 'Do not ignore pain signals', 'Follow healthcare provider recommendations'],
};

export const BODY_AREA_MAPPING: Record<string, string[]> = {
  KNEE_PAIN: ['Knee', 'Lower body', 'Legs'],
  SHOULDER_PAIN: ['Shoulder', 'Upper body', 'Arms'],
  BACK_PAIN: ['Back', 'Spine', 'Core'],
  OTHER: ['General'],
};

export const EXERCISE_CONTRAINDICATIONS: Record<string, string[]> = {
  KNEE: ['Deep squats', 'Jump squats', 'Lunges', 'Leg extensions', 'High-impact plyometrics'],
  SHOULDER: ['Overhead press', 'Bench press', 'Pull-ups', 'Dips', 'Lateral raises'],
  BACK: ['Deadlifts', 'Rows', 'Back extensions', 'Heavy compound movements'],
};

export const TRAINING_MODIFICATIONS = {
  REDUCE_INTENSITY: 'Reduce training intensity by 20-30%',
  REDUCE_VOLUME: 'Reduce training volume by 20-30%',
  FOCUS_ON_FORM: 'Focus on proper form and technique',
  ADD_REST_DAYS: 'Add additional rest days between sessions',
  AVOID_IMPACT: 'Avoid high-impact exercises',
  USE_ALTERNATIVES: 'Use lower-impact alternatives',
  REDUCE_FREQUENCY: 'Reduce training frequency',
  PROFESSIONAL_CONSULTATION: 'Consult with a healthcare professional',
};

export const DUPLICATE_CALCULATION_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes

export const CALCULATION_VERSION = '1.0';

// Normalization ranges
export const NORMALIZATION_RANGES = {
  workloadIncrease: { min: 0, max: 1 }, // 0-100% increase
  trainingFrequency: { min: 0, max: 7 }, // workouts per week
  consecutiveDays: { min: 0, max: 7 },
  painSeverity: { min: 0, max: 10 },
};

// Impact levels based on factor contribution
export const getImpactLevel = (weightedScore: number): 'HIGH' | 'MEDIUM' | 'LOW' => {
  if (weightedScore >= 0.15) return 'HIGH';
  if (weightedScore >= 0.08) return 'MEDIUM';
  return 'LOW';
};

// Body area risk level based on score contribution
export const getBodyAreaRiskLevel = (areaScore: number): 'LOW' | 'MODERATE' | 'HIGH' => {
  if (areaScore >= 0.6) return 'HIGH';
  if (areaScore >= 0.3) return 'MODERATE';
  return 'LOW';
};
