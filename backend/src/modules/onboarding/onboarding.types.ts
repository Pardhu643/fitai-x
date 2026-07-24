export type WorkoutGoal = 'FAT_LOSS' | 'MUSCLE_GAIN' | 'STRENGTH' | 'ENDURANCE' | 'ATHLETIC_PERFORMANCE' | 'GENERAL_FITNESS';
export type DietType = 'VEGETARIAN' | 'VEGAN' | 'NON_VEGETARIAN' | 'EGGETARIAN';
export type TimeOfDay = 'MORNING' | 'AFTERNOON' | 'EVENING';
export type EquipmentType = 'GYM' | 'DUMBBELLS' | 'RESISTANCE_BANDS' | 'PULL_UP_BAR' | 'BENCH' | 'HOME_ONLY' | 'NO_EQUIPMENT';
export type InjuryType = 'BACK_PAIN' | 'SHOULDER_PAIN' | 'KNEE_PAIN' | 'OTHER';

export interface PersonalDetails {
  age: number;
  gender: 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';
  heightCm: number;
  weightKg: number;
}

export interface FitnessDetails {
  goal: WorkoutGoal;
  fitnessLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
}

export interface ScheduleDetails {
  workoutDaysPerWeek: number;
  workoutDurationMinutes: number;
  preferredTime: TimeOfDay;
}

export interface EquipmentDetails {
  equipment: EquipmentType[];
}

export interface MedicalDetails {
  injuries: {
    type: InjuryType;
    details?: string;
  }[];
}

export interface DietDetails {
  dietType: DietType;
  budget?: string;
  cookingSkill?: string;
}

export interface OnboardingData {
  personal: PersonalDetails;
  fitness: FitnessDetails;
  schedule: ScheduleDetails;
  equipment: EquipmentDetails;
  medical: MedicalDetails;
  diet: DietDetails;
}

export interface OnboardingResponse {
  success: boolean;
  message: string;
  data: {
    userId: string;
    hasCompletedOnboarding: boolean;
  };
}
