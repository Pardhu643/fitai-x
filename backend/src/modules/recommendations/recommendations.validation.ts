import { z } from 'zod';

export const generateProgressiveOverloadSchema = z.object({
  exerciseId: z.string(),
  currentSets: z.number().min(1).max(10),
  currentReps: z.number().min(1).max(30),
  currentWeight: z.number().nullable(),
});

export const applyRecommendationSchema = z.object({
  appliedAt: z.date().optional(),
});

export const dismissRecommendationSchema = z.object({
  dismissedAt: z.date().optional(),
});
