import api from '../lib/api';

export interface MealIngredient {
  id: string;
  name: string;
  normalizedName: string;
  quantity: number;
  unit: string;
  category: string;
  optional: boolean;
}

export interface Meal {
  id: string;
  mealType: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';
  title: string;
  description: string | null;
  instructions: string[];
  preparationMinutes: number;
  cookingMinutes: number;
  servings: number;
  calories: number;
  proteinGrams: number;
  carbohydrateGrams: number;
  fatGrams: number;
  fibreGrams: number;
  ingredients: MealIngredient[];
}

export interface MealPlanDay {
  id: string;
  date: string;
  calorieTarget: number;
  totalCalories: number;
  totalProtein: number;
  totalCarbohydrates: number;
  totalFat: number;
  meals: Meal[];
}

export interface MealPlan {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  dailyCalories: number;
  status: 'ACTIVE' | 'ARCHIVED';
  days: MealPlanDay[];
}

export interface MealLog {
  id: string;
  userId: string;
  mealId: string;
  date: string;
  status: 'CONSUMED' | 'PARTIALLY_CONSUMED' | 'SKIPPED';
  consumedServings: number;
  actualCalories: number;
  createdAt: string;
  meal: Meal;
}

export const mealService = {
  getCurrentPlan: async (): Promise<MealPlan | null> => {
    const response = await api.get('/api/v1/meal-plans/current');
    return response.data.data;
  },
  generatePlan: async (daysCount: number = 7): Promise<MealPlan> => {
    const response = await api.post('/api/v1/meal-plans/generate', { daysCount });
    return response.data.data;
  },
  getPlanById: async (mealPlanId: string): Promise<MealPlan> => {
    const response = await api.get(`/api/v1/meal-plans/${mealPlanId}`);
    return response.data.data;
  },
  deletePlan: async (mealPlanId: string): Promise<void> => {
    await api.delete(`/api/v1/meal-plans/${mealPlanId}`);
  },
  regeneratePlan: async (mealPlanId: string): Promise<MealPlan> => {
    const response = await api.post(`/api/v1/meal-plans/${mealPlanId}/regenerate`);
    return response.data.data;
  },
  replaceMeal: async (mealId: string): Promise<Meal> => {
    const response = await api.post(`/api/v1/meals/${mealId}/replace`);
    return response.data.data;
  },
  logMeal: async (mealId: string, status: string, consumedServings: number = 1.0): Promise<MealLog> => {
    const response = await api.post(`/api/v1/meals/${mealId}/log`, { status, consumedServings });
    return response.data.data;
  },
  getLogs: async (): Promise<MealLog[]> => {
    const response = await api.get('/api/v1/meals/logs');
    return response.data.data;
  }
};
export default mealService;
