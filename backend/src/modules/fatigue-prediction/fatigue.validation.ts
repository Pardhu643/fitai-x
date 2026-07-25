import { z } from 'zod';

export const calculateFatigueSchema = z.object({
  force: z.boolean().optional().default(false),
});

export type CalculateFatigueInput = z.infer<typeof calculateFatigueSchema>;
