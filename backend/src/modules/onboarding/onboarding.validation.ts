import { z } from 'zod';

const personalDetailsSchema = z.object({
  age: z.number().min(13).max(120),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']),
  heightCm: z.number().min(100).max(250),
  weightKg: z.number().min(30).max(300),
});

const fitnessDetailsSchema = z.object({
  goal: z.enum(['FAT_LOSS', 'MUSCLE_GAIN', 'STRENGTH', 'ENDURANCE', 'ATHLETIC_PERFORMANCE', 'GENERAL_FITNESS']),
  fitnessLevel: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
});

const scheduleDetailsSchema = z.object({
  workoutDaysPerWeek: z.number().min(1).max(7),
  workoutDurationMinutes: z.number().min(15).max(180),
  preferredTime: z.enum(['MORNING', 'AFTERNOON', 'EVENING']),
});

const equipmentDetailsSchema = z.object({
  equipment: z.array(z.enum(['GYM', 'DUMBBELLS', 'RESISTANCE_BANDS', 'PULL_UP_BAR', 'BENCH', 'HOME_ONLY', 'NO_EQUIPMENT'])).min(1),
});

const injurySchema = z.object({
  type: z.enum(['BACK_PAIN', 'SHOULDER_PAIN', 'KNEE_PAIN', 'OTHER']),
  details: z.string().optional(),
});

const medicalDetailsSchema = z.object({
  injuries: z.array(injurySchema),
});

const dietDetailsSchema = z.object({
  dietType: z.enum(['VEGETARIAN', 'VEGAN', 'NON_VEGETARIAN', 'EGGETARIAN']),
  budget: z.string().optional(),
  cookingSkill: z.string().optional(),
});

export const onboardingSchema = z.object({
  personal: personalDetailsSchema,
  fitness: fitnessDetailsSchema,
  schedule: scheduleDetailsSchema,
  equipment: equipmentDetailsSchema,
  medical: medicalDetailsSchema,
  diet: dietDetailsSchema,
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;
