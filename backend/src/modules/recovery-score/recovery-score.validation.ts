import { z } from 'zod';

export const createRecoverySchema = z.object({
  sleepHours: z.number().min(0).max(24),
  sleepQuality: z.enum(['EXCELLENT', 'GOOD', 'FAIR', 'POOR']),
  hydrationLevel: z.enum(['HIGH', 'MEDIUM', 'LOW']),
  sorenessLevel: z.enum(['NONE', 'LIGHT', 'HEAVY']),
  stressLevel: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  energyLevel: z.enum(['HIGH', 'MEDIUM', 'LOW']),
  previousWorkoutLoad: z.enum(['LIGHT', 'MODERATE', 'INTENSE']),
});
