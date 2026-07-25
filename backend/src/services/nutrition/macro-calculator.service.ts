import { MacroCalculationResult } from './nutrition.types';

export class MacroCalculatorService {
  calculateMacros(
    weightKg: number,
    calories: number,
    goal: string
  ): MacroCalculationResult {
    // 1. Protein Target
    let proteinPerKg = 1.6;
    if (goal === 'MUSCLE_GAIN' || goal === 'FAT_LOSS' || goal === 'ENDURANCE') {
      proteinPerKg = 2.0;
    }
    
    // Bounds check
    proteinPerKg = Math.max(1.2, Math.min(2.5, proteinPerKg));
    let proteinGrams = Math.round(weightKg * proteinPerKg);
    let proteinCalories = proteinGrams * 4;

    // Guard: Ensure protein does not exceed 40% of total calories
    if (proteinCalories > calories * 0.40) {
      proteinGrams = Math.round((calories * 0.35) / 4);
      proteinCalories = proteinGrams * 4;
    }

    // 2. Fat Target (25% of total calories)
    const fatCalories = calories * 0.25;
    const fatGrams = Math.round(fatCalories / 9);

    // 3. Carbohydrates (Remaining calories)
    const remainingCalories = calories - (proteinCalories + fatCalories);
    const carbohydrateGrams = Math.round(Math.max(remainingCalories, 0) / 4);

    // 4. Fibre: 14g per 1000 kcal (safe default: min 20g, max 50g)
    let fibreGrams = Math.round((calories / 1000) * 14);
    fibreGrams = Math.max(20, Math.min(50, fibreGrams));

    // 5. Water: 35ml per kg of body weight (safe floor: 2000ml, ceiling: 5000ml)
    let waterMl = Math.round(weightKg * 35);
    waterMl = Math.max(2000, Math.min(5000, waterMl));

    return {
      proteinGrams,
      carbohydrateGrams,
      fatGrams,
      fibreGrams,
      waterMl
    };
  }
}

export const macroCalculatorService = new MacroCalculatorService();
