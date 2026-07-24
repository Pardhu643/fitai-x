export type Role = 'USER' | 'ADMIN';
export type Gender = 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';
export type FitnessLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
export type PrimaryGoal = 'WEIGHT_LOSS' | 'MUSCLE_GAIN' | 'ENDURANCE' | 'STRENGTH' | 'FLEXIBILITY' | 'GENERAL_FITNESS';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  age: number | null;
  gender: Gender | null;
  heightCm: number | null;
  weightKg: number | null;
  fitnessLevel: FitnessLevel | null;
  primaryGoal: PrimaryGoal | null;
  profileImageUrl: string | null;
  hasCompletedOnboarding: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      name: string;
      email: string;
      role: Role;
      hasCompletedOnboarding: boolean;
    };
    accessToken: string;
  };
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface UpdateProfileInput {
  name?: string;
  age?: number;
  gender?: Gender;
  heightCm?: number;
  weightKg?: number;
  fitnessLevel?: FitnessLevel;
  primaryGoal?: PrimaryGoal;
}
