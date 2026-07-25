export interface CalorieCalculationResult {
  bmr: number;
  tdee: number;
  calories: number;
  explanation: string;
}

export interface MacroCalculationResult {
  proteinGrams: number;
  carbohydrateGrams: number;
  fatGrams: number;
  fibreGrams: number;
  waterMl: number;
}

export interface NutritionTargetsResult {
  calories: number;
  proteinGrams: number;
  carbohydrateGrams: number;
  fatGrams: number;
  fibreGrams: number;
  waterMl: number;
  goal: string;
  explanation: string;
}
