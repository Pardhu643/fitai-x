import { prisma } from '../../core/database/prisma';
import { mealGeneratorService } from './meal-generator.service';

export class MealReplacementService {
  async replaceMeal(mealId: string, userId: string) {
    const meal = await prisma.meal.findUnique({
      where: { id: mealId },
      include: { mealPlanDay: { include: { mealPlan: true } } }
    });

    if (!meal || meal.mealPlanDay.mealPlan.userId !== userId) {
      throw new Error('Meal not found or unauthorized');
    }

    const profile = await prisma.nutritionProfile.findUnique({ where: { userId } });
    const diet = profile?.dietaryPreference || 'BALANCED';
    const allergies = profile?.allergies || [];

    const newMealData = await mealGeneratorService.generateMealReplacement(
      diet,
      allergies,
      meal.calories,
      meal.mealType
    );

    const result = await prisma.$transaction(async (tx) => {
      // Delete old ingredients
      await tx.mealIngredient.deleteMany({ where: { mealId } });

      // Update the meal record
      const updatedMeal = await tx.meal.update({
        where: { id: mealId },
        data: {
          title: newMealData.title,
          description: newMealData.description,
          instructions: newMealData.instructions,
          preparationMinutes: newMealData.preparationMinutes,
          cookingMinutes: newMealData.cookingMinutes,
          servings: newMealData.servings,
          calories: newMealData.calories,
          proteinGrams: newMealData.proteinGrams,
          carbohydrateGrams: newMealData.carbohydrateGrams,
          fatGrams: newMealData.fatGrams,
          fibreGrams: newMealData.fibreGrams || 0,
          ingredients: {
            create: newMealData.ingredients.map(ing => ({
              name: ing.name,
              normalizedName: ing.name.toLowerCase().trim(),
              quantity: ing.quantity,
              unit: ing.unit,
              category: ing.category,
              optional: ing.optional || false
            }))
          }
        },
        include: { ingredients: true }
      });

      // Recalculate day totals
      const dayMeals = await tx.meal.findMany({
        where: { mealPlanDayId: meal.mealPlanDayId }
      });

      let totalCal = 0, totalPro = 0, totalCarb = 0, totalFat = 0;
      dayMeals.forEach(m => {
        totalCal += m.calories;
        totalPro += m.proteinGrams;
        totalCarb += m.carbohydrateGrams;
        totalFat += m.fatGrams;
      });

      await tx.mealPlanDay.update({
        where: { id: meal.mealPlanDayId },
        data: {
          totalCalories: totalCal,
          totalProtein: totalPro,
          totalCarbohydrates: totalCarb,
          totalFat: totalFat
        }
      });

      return updatedMeal;
    });

    try {
      const { groceryListService } = require('./grocery-list.service');
      await groceryListService.updateAfterMealReplacement(userId, meal!.mealPlanDay.mealPlanId);
    } catch (err) {
      console.error('Failed to update grocery list after replacing meal:', err);
    }

    return result;
  }
}

export const mealReplacementService = new MealReplacementService();
