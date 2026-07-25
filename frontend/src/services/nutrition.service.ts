import api from '../lib/api';

export interface NutritionProfile {
  id: string;
  userId: string;
  dietaryPreference: string | null;
  allergies: string[];
  dislikedFoods: string[];
  preferredCuisines: string[];
  mealsPerDay: number;
  cookingSkill: string | null;
  maximumCookingTime: number;
  budgetPreference: string | null;
  preferredMealTimes: string[];
  calorieTargetOverride: number | null;
  proteinTargetOverride: number | null;
  carbohydrateTargetOverride: number | null;
  fatTargetOverride: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface NutritionTarget {
  id: string;
  userId: string;
  calories: number;
  proteinGrams: number;
  carbohydrateGrams: number;
  fatGrams: number;
  fibreGrams: number;
  waterMl: number;
  goal: string;
  source: string;
  effectiveFrom: string;
  createdAt: string;
  updatedAt: string;
}

export const nutritionService = {
  getProfile: async (): Promise<NutritionProfile> => {
    const response = await api.get('/api/v1/nutrition/profile');
    return response.data.data;
  },
  updateProfile: async (data: Partial<NutritionProfile>): Promise<{ profile: NutritionProfile; targets: NutritionTarget }> => {
    const response = await api.put('/api/v1/nutrition/profile', data);
    return response.data.data;
  },
  getTargets: async (): Promise<NutritionTarget> => {
    const response = await api.get('/api/v1/nutrition/targets');
    return response.data.data;
  },
  calculateTargets: async (): Promise<NutritionTarget> => {
    const response = await api.post('/api/v1/nutrition/targets/calculate');
    return response.data.data;
  }
};
export default nutritionService;
