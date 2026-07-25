import { z } from 'zod';

export const mealIngredientSchema = z.object({
  name: z.string(),
  quantity: z.number(),
  unit: z.string(),
  category: z.string(),
  optional: z.boolean().optional().default(false)
});

export const mealSchema = z.object({
  mealType: z.enum(['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK']),
  title: z.string(),
  description: z.string().optional(),
  instructions: z.array(z.string()),
  preparationMinutes: z.number(),
  cookingMinutes: z.number(),
  servings: z.number().default(1),
  calories: z.number(),
  proteinGrams: z.number(),
  carbohydrateGrams: z.number(),
  fatGrams: z.number(),
  fibreGrams: z.number().optional().default(0),
  ingredients: z.array(mealIngredientSchema)
});

export const mealPlanDaySchema = z.object({
  date: z.string(),
  calorieTarget: z.number(),
  meals: z.array(mealSchema)
});

export const mealPlanSchema = z.object({
  title: z.string(),
  dailyCalories: z.number(),
  days: z.array(mealPlanDaySchema)
});

export type MealPlanType = z.infer<typeof mealPlanSchema>;
export type MealType = z.infer<typeof mealSchema>;
