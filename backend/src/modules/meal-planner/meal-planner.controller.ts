import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../core/database/prisma';
import { nutritionTargetService } from '../../services/nutrition/nutrition-target.service';
import { mealGeneratorService } from '../../services/nutrition/meal-generator.service';
import { mealReplacementService } from '../../services/nutrition/meal-replacement.service';

const asyncHandler = (fn: any) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export const mealPlannerController = {
  generatePlan: asyncHandler(async (req: Request, res: Response): Promise<any> => {
    const userId = (req as any).user.userId;
    const { daysCount } = req.body;
    const days = daysCount ? parseInt(daysCount) : 7;

    const profile = await prisma.nutritionProfile.findUnique({ where: { userId } }) || {
      dietaryPreference: 'BALANCED',
      allergies: [],
      dislikedFoods: [],
      preferredCuisines: [],
      mealsPerDay: 3,
      maximumCookingTime: 60,
      budgetPreference: 'MEDIUM'
    };

    let target;
    try {
      target = await nutritionTargetService.getLatestTargets(userId);
    } catch (err) {
      console.warn('Failed to get nutrition targets, using defaults:', err);
      target = {
        calories: 2000,
        proteinGrams: 150,
        carbohydrateGrams: 200,
        fatGrams: 65
      };
    }

    const generated = await mealGeneratorService.generateMealPlan({
      calories: target.calories,
      protein: target.proteinGrams,
      carbs: target.carbohydrateGrams,
      fat: target.fatGrams,
      dietaryPreference: profile.dietaryPreference || 'BALANCED',
      allergies: profile.allergies || [],
      dislikedFoods: profile.dislikedFoods || [],
      preferredCuisines: profile.preferredCuisines || [],
      mealsPerDay: profile.mealsPerDay || 3,
      maxCookingTime: profile.maximumCookingTime || 60,
      daysCount: days
    });

    const plan = await prisma.$transaction(async (tx) => {
      // Archive old plan
      await tx.mealPlan.updateMany({
        where: { userId, status: 'ACTIVE' },
        data: { status: 'ARCHIVED' }
      });

      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(startDate.getDate() + days - 1);

      const dbPlan = await tx.mealPlan.create({
        data: {
          userId,
          title: generated.title || `${days}-Day Meal Plan`,
          startDate,
          endDate,
          dailyCalories: target.calories,
          status: 'ACTIVE'
        }
      });

      for (let i = 0; i < generated.days.length; i++) {
        const day = generated.days[i];
        const dateOffset = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
        
        const planDay = await tx.mealPlanDay.create({
          data: {
            mealPlanId: dbPlan.id,
            date: dateOffset,
            calorieTarget: target.calories
          }
        });

        let totalCal = 0, totalPro = 0, totalCarb = 0, totalFat = 0;

        for (const meal of day.meals) {
          totalCal += meal.calories;
          totalPro += meal.proteinGrams;
          totalCarb += meal.carbohydrateGrams;
          totalFat += meal.fatGrams;

          const dbMeal = await tx.meal.create({
            data: {
              mealPlanDayId: planDay.id,
              mealType: meal.mealType,
              title: meal.title,
              description: meal.description,
              instructions: meal.instructions,
              preparationMinutes: meal.preparationMinutes,
              cookingMinutes: meal.cookingMinutes,
              servings: meal.servings,
              calories: meal.calories,
              proteinGrams: meal.proteinGrams,
              carbohydrateGrams: meal.carbohydrateGrams,
              fatGrams: meal.fatGrams,
              fibreGrams: meal.fibreGrams || 0
            }
          });

          const ingredientsData = meal.ingredients.map(ing => ({
            mealId: dbMeal.id,
            name: ing.name,
            normalizedName: ing.name.toLowerCase().trim(),
            quantity: ing.quantity,
            unit: ing.unit,
            category: ing.category
          }));

          await tx.mealIngredient.createMany({
            data: ingredientsData
          });
        }

        // Update day totals
        await tx.mealPlanDay.update({
          where: { id: planDay.id },
          data: {
            totalCalories: totalCal,
            totalProtein: totalPro,
            totalCarbohydrates: totalCarb,
            totalFat: totalFat
          }
        });
      }

      return dbPlan;
    });

    // Auto-generate grocery list
    try {
      const { groceryListService } = require('../../services/nutrition/grocery-list.service');
      await groceryListService.generateGroceryList(userId, plan.id, false);
    } catch (err) {
      console.error('Failed to auto-generate grocery list after plan generation:', err);
    }

    // Sync calendar events
    try {
      const { calendarIntegrationService } = require('../../services/nutrition/calendar-integration.service');
      await calendarIntegrationService.syncMealPlanEvents(userId, plan.id);
    } catch (err) {
      console.error('Failed to sync calendar events after plan generation:', err);
    }

    // Trigger grocery checklist notification alert
    try {
      const { notificationIntegrationService } = require('../../services/nutrition/notification-integration.service');
      await notificationIntegrationService.triggerGroceryReminder(userId);
    } catch (err) {
      console.error('Failed to trigger notification alert after plan generation:', err);
    }

    return res.json({ success: true, data: plan });
  }),

  getPlansList: asyncHandler(async (req: Request, res: Response): Promise<any> => {
    const userId = (req as any).user.userId;
    const plans = await prisma.mealPlan.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
    return res.json({ success: true, data: plans });
  }),

  getCurrentPlan: asyncHandler(async (req: Request, res: Response): Promise<any> => {
    const userId = (req as any).user.userId;
    const plan = await prisma.mealPlan.findFirst({
      where: { userId, status: 'ACTIVE' },
      include: {
        days: {
          include: {
            meals: {
              include: {
                ingredients: true
              }
            }
          },
          orderBy: { date: 'asc' }
        }
      }
    });

    return res.json({ success: true, data: plan });
  }),

  getPlanById: asyncHandler(async (req: Request, res: Response): Promise<any> => {
    const userId = (req as any).user.userId;
    const { mealPlanId } = req.params;

    const plan = await prisma.mealPlan.findUnique({
      where: { id: mealPlanId },
      include: {
        days: {
          include: {
            meals: {
              include: {
                ingredients: true
              }
            }
          },
          orderBy: { date: 'asc' }
        }
      }
    });

    if (!plan || plan.userId !== userId) {
      return res.status(404).json({ success: false, error: 'Meal plan not found' });
    }

    return res.json({ success: true, data: plan });
  }),

  deletePlan: asyncHandler(async (req: Request, res: Response): Promise<any> => {
    const userId = (req as any).user.userId;
    const { mealPlanId } = req.params;

    const plan = await prisma.mealPlan.findUnique({
      where: { id: mealPlanId }
    });

    if (!plan || plan.userId !== userId) {
      return res.status(404).json({ success: false, error: 'Meal plan not found or unauthorized' });
    }

    // Remove related calendar events
    try {
      const { calendarIntegrationService } = require('../../services/nutrition/calendar-integration.service');
      await calendarIntegrationService.removeMealPlanEvents(userId, plan.startDate, plan.endDate);
    } catch (err) {
      console.error('Failed to remove calendar events after deleting plan:', err);
    }

    await prisma.mealPlan.delete({
      where: { id: mealPlanId }
    });

    return res.json({ success: true, message: 'Meal plan deleted successfully' });
  }),

  regeneratePlan: asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { mealPlanId } = req.params;
    const userId = (req as any).user.userId;

    const plan = await prisma.mealPlan.findUnique({
      where: { id: mealPlanId }
    });

    if (!plan || plan.userId !== userId) {
      return res.status(404).json({ success: false, error: 'Meal plan not found or unauthorized' });
    }

    // Determine the days count
    const diffTime = Math.abs(plan.endDate.getTime() - plan.startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

    // Trigger generate
    req.body.daysCount = diffDays;
    return mealPlannerController.generatePlan(req, res, next);
  }),

  replaceMealOption: asyncHandler(async (req: Request, res: Response): Promise<any> => {
    const userId = (req as any).user.userId;
    const { mealId } = req.params;

    const updated = await mealReplacementService.replaceMeal(mealId, userId);
    return res.json({ success: true, data: updated });
  }),

  logMealConsumption: asyncHandler(async (req: Request, res: Response): Promise<any> => {
    const userId = (req as any).user.userId;
    const { mealId } = req.params;
    const { status, consumedServings } = req.body;

    const meal = await prisma.meal.findUnique({
      where: { id: mealId },
      include: { mealPlanDay: { include: { mealPlan: true } } }
    });

    if (!meal || meal.mealPlanDay.mealPlan.userId !== userId) {
      return res.status(404).json({ success: false, error: 'Meal not found' });
    }

    const actualCalories = Math.round(meal.calories * (consumedServings || 1.0));

    // Upsert or prevent duplicated consumption logs for the same meal
    const existingLog = await prisma.mealLog.findFirst({
      where: { userId, mealId }
    });

    let log;
    if (existingLog) {
      log = await prisma.mealLog.update({
        where: { id: existingLog.id },
        data: {
          status: status || 'CONSUMED',
          consumedServings: consumedServings || 1.0,
          actualCalories
        }
      });
    } else {
      log = await prisma.mealLog.create({
        data: {
          userId,
          mealId,
          status: status || 'CONSUMED',
          consumedServings: consumedServings || 1.0,
          actualCalories
        }
      });
    }

    return res.json({ success: true, data: log });
  }),

  getMealLogsList: asyncHandler(async (req: Request, res: Response): Promise<any> => {
    const userId = (req as any).user.userId;
    const logs = await prisma.mealLog.findMany({
      where: { userId },
      include: { meal: true },
      orderBy: { createdAt: 'desc' }
    });

    return res.json({ success: true, data: logs });
  })
};
