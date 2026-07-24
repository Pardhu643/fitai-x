export interface WorkoutPlan {
  id: string;
  userId: string;
  name: string;
  goal: string;
  fitnessLevel: string;
  isActive: boolean;
  startDate: Date;
  endDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkoutDay {
  id: string;
  workoutPlanId: string;
  dayOfWeek: number;
  name: string;
  durationMinutes: number;
}

export interface Exercise {
  id: string;
  workoutDayId: string;
  name: string;
  muscleGroup: string;
  equipmentNeeded: string | null;
  instructions: string | null;
  order: number;
  exerciseSets: ExerciseSet[];
}

export interface ExerciseSet {
  id: string;
  exerciseId: string;
  reps: number;
  weightKg: number | null;
  restTimeSeconds: number;
  order: number;
  isCompleted: boolean;
}

export interface WorkoutHistory {
  id: string;
  userId: string;
  workoutPlanId: string | null;
  workoutDayId: string | null;
  completedAt: Date;
  durationMinutes: number;
  caloriesBurned: number | null;
  notes: string | null;
  rating: number | null;
}

export interface CompleteWorkoutInput {
  workoutDayId: string;
  durationMinutes: number;
  caloriesBurned: number;
  notes?: string;
  rating?: number;
}

export interface GenerateWorkoutInput {
  goal: string;
  fitnessLevel: string;
  workoutDaysPerWeek: number;
  workoutDurationMinutes: number;
  equipment: string[];
}
