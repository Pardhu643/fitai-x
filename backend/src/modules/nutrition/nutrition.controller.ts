import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../core/database/prisma';
import { nutritionTargetService } from '../../services/nutrition/nutrition-target.service';
import { z } from 'zod';

const asyncHandler = (fn: any) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

const profileUpdateSchema = z.object({
  dietaryPreference: z.enum(['BALANCED', 'VEGETARIAN', 'VEGAN', 'KETO', 'PALEO', 'PESCATARIAN', 'ANY']).optional(),
  allergies: z.array(z.string()).optional(),
  dislikedFoods: z.array(z.string()).optional(),
  preferredCuisines: z.array(z.string()).optional(),
  mealsPerDay: z.number().min(1).max(6).optional(),
  cookingSkill: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).optional(),
  maximumCookingTime: z.number().min(5).max(360).optional(),
  budgetPreference: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  preferredMealTimes: z.array(z.string()).optional(),
  calorieTargetOverride: z.number().min(500).max(10000).nullable().optional(),
  proteinTargetOverride: z.number().min(10).max(500).nullable().optional(),
  carbohydrateTargetOverride: z.number().min(10).max(1500).nullable().optional(),
  fatTargetOverride: z.number().min(5).max(300).nullable().optional()
});

export const nutritionController = {
  getProfile: asyncHandler(async (req: Request, res: Response): Promise<any> => {
    const userId = (req as any).user.userId;
    let profile = await prisma.nutritionProfile.findUnique({
      where: { userId }
    });

    if (!profile) {
      profile = await prisma.nutritionProfile.create({
        data: { userId }
      });
    }

    return res.json({ success: true, data: profile });
  }),

  updateProfile: asyncHandler(async (req: Request, res: Response): Promise<any> => {
    const userId = (req as any).user.userId;
    
    // Validate request body
    const validated = profileUpdateSchema.parse(req.body);

    const profile = await prisma.nutritionProfile.upsert({
      where: { userId },
      update: validated,
      create: {
        userId,
        ...validated
      }
    });

    // Auto-recalculate target metrics
    const targets = await nutritionTargetService.calculateAndSaveTargets(userId);

    return res.json({ success: true, data: { profile, targets } });
  }),

  getTargets: asyncHandler(async (req: Request, res: Response): Promise<any> => {
    const userId = (req as any).user.userId;
    const targets = await nutritionTargetService.getLatestTargets(userId);
    return res.json({ success: true, data: targets });
  }),

  calculateTargets: asyncHandler(async (req: Request, res: Response): Promise<any> => {
    const userId = (req as any).user.userId;
    const targets = await nutritionTargetService.calculateAndSaveTargets(userId);
    return res.json({ success: true, data: targets });
  })
};
