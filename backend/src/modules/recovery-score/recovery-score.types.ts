export type SleepQuality = 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
export type HydrationLevel = 'HIGH' | 'MEDIUM' | 'LOW';
export type SorenessLevel = 'NONE' | 'LIGHT' | 'HEAVY';
export type StressLevel = 'LOW' | 'MEDIUM' | 'HIGH';
export type EnergyLevel = 'HIGH' | 'MEDIUM' | 'LOW';
export type WorkoutLoad = 'LIGHT' | 'MODERATE' | 'INTENSE';

export interface CreateRecoveryInput {
  sleepHours: number;
  sleepQuality: SleepQuality;
  hydrationLevel: HydrationLevel;
  sorenessLevel: SorenessLevel;
  stressLevel: StressLevel;
  energyLevel: EnergyLevel;
  previousWorkoutLoad: WorkoutLoad;
}

export interface RecoveryScoreResponse {
  id: string;
  userId: string;
  date: Date;
  sleepHours: number;
  sleepQuality: SleepQuality;
  hydrationLevel: HydrationLevel;
  sorenessLevel: SorenessLevel;
  stressLevel: StressLevel;
  energyLevel: EnergyLevel;
  previousWorkoutLoad: WorkoutLoad;
  score: number;
  recommendation: string;
}
