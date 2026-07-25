import { z } from 'zod';

export const calculateInjuryRiskSchema = z.object({
  force: z.boolean().optional().default(false),
});

export type CalculateInjuryRiskInput = z.infer<typeof calculateInjuryRiskSchema>;
