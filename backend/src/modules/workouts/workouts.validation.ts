import { z } from 'zod';

export const completeWorkoutSchema = z.object({
  workoutDayId: z.string(),
  durationMinutes: z.number().min(1).max(300),
  caloriesBurned: z.number().min(0).max(5000),
  notes: z.string().optional(),
  rating: z.number().min(1).max(5).optional(),
});

export const generateWorkoutSchema = z.object({
  goal: z.enum(['FAT_LOSS', 'MUSCLE_GAIN', 'STRENGTH', 'ENDURANCE', 'ATHLETIC_PERFORMANCE', 'GENERAL_FITNESS']),
  fitnessLevel: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
  workoutDaysPerWeek: z.number().min(1).max(7),
  workoutDurationMinutes: z.number().min(15).max(180),
  equipment: z.array(z.enum(['GYM', 'DUMBBELLS', 'RESISTANCE_BANDS', 'PULL_UP_BAR', 'BENCH', 'HOME_ONLY', 'NO_EQUIPMENT'])),
});

export type CompleteWorkoutInput = z.infer<typeof completeWorkoutSchema>;
export type GenerateWorkoutInput = z.infer<typeof generateWorkoutSchema>;
