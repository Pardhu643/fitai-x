import { CalorieCalculationResult } from './nutrition.types';

export class CalorieCalculatorService {
  calculateCalories(
    weightKg: number,
    heightCm: number,
    age: number,
    gender: 'MALE' | 'FEMALE' | string,
    activityLevel: string, // "SEDENTARY", "LIGHTLY_ACTIVE", "MODERATELY_ACTIVE", "VERY_ACTIVE"
    goal: string // "FAT_LOSS", "MAINTENANCE", "MUSCLE_GAIN", "ENDURANCE", "GENERAL_FITNESS"
  ): CalorieCalculationResult {
    // Mifflin-St Jeor BMR
    let bmr = 10 * weightKg + 6.25 * heightCm - 5 * age;
    if (gender === 'MALE') {
      bmr += 5;
    } else {
      bmr -= 161;
    }

    // Activity Multiplier
    let multiplier = 1.2;
    switch (activityLevel) {
      case 'LIGHTLY_ACTIVE':
        multiplier = 1.375;
        break;
      case 'MODERATELY_ACTIVE':
        multiplier = 1.55;
        break;
      case 'VERY_ACTIVE':
        multiplier = 1.725;
        break;
      case 'SEDENTARY':
      default:
        multiplier = 1.2;
    }

    const tdee = bmr * multiplier;

    // Adjust for Goal
    let calories = tdee;
    let explanation = `Your BMR is estimated at ${Math.round(bmr)} kcal/day. Based on your activity level, your TDEE is ${Math.round(tdee)} kcal/day. `;

    if (goal === 'FAT_LOSS') {
      calories = tdee - 500;
      // Floor at safe limits: 1200 kcal for female, 1500 kcal for male
      const floor = gender === 'MALE' ? 1500 : 1200;
      if (calories < floor) {
        calories = floor;
        explanation += `To support safe fat loss, we applied a deficit but kept calories at your gender's safe minimum floor of ${floor} kcal/day.`;
      } else {
        explanation += `We applied a safe deficit of 500 kcal for weight management, targeting ${Math.round(calories)} kcal/day.`;
      }
    } else if (goal === 'MUSCLE_GAIN') {
      calories = tdee + 300;
      explanation += `We added a surplus of 300 kcal to support muscle hypertrophy, targeting ${Math.round(calories)} kcal/day.`;
    } else if (goal === 'ENDURANCE') {
      calories = tdee + 200;
      explanation += `We adjusted your intake by +200 kcal to supply ample glycogen reserves for endurance, targeting ${Math.round(calories)} kcal/day.`;
    } else {
      explanation += `We targeted maintenance levels to match your daily expenditure of ${Math.round(calories)} kcal/day.`;
    }

    return {
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      calories: Math.round(calories),
      explanation
    };
  }
}

export const calorieCalculatorService = new CalorieCalculatorService();
