import { geminiService } from '../ai/gemini.service';
import { mealPlanSchema, mealSchema, MealPlanType, MealType } from './meal.types';

export class MealGeneratorService {
  private getFallbackMeal(
    mealType: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK',
    calories: number,
    protein: number,
    carbs: number,
    fat: number,
    diet: string,
    allergies: string[]
  ): MealType {
    // Generate scaled deterministic meals
    const matchesAllergy = (name: string) => {
      const lowerName = name.toLowerCase();
      return allergies.some(a => lowerName.includes(a.toLowerCase()));
    };

    let title = 'Nutrient Dense Plate';
    let ingredients = [{ name: 'Mixed Whole Foods', quantity: 200, unit: 'g', category: 'Produce', optional: false }];
    let instructions = ['Assemble all fresh ingredients in a bowl.', 'Season to taste and serve.'];

    if (mealType === 'BREAKFAST') {
      if (diet === 'KETO') {
        title = 'Scrambled Eggs with Avocado';
        ingredients = [
          { name: 'Eggs', quantity: 3, unit: 'pcs', category: 'Dairy', optional: false },
          { name: 'Avocado', quantity: 1, unit: 'pc', category: 'Produce', optional: false }
        ];
        instructions = ['Whisk eggs and scramble in a pan.', 'Slice avocado and serve alongside.'];
      } else if (diet === 'VEGAN') {
        title = 'Oatmeal with Almond Milk and Berries';
        ingredients = [
          { name: 'Oats', quantity: 80, unit: 'g', category: 'Pantry', optional: false },
          { name: 'Almond Milk', quantity: 250, unit: 'ml', category: 'Dairy Alternatives', optional: false },
          { name: 'Mixed Berries', quantity: 50, unit: 'g', category: 'Produce', optional: false }
        ];
        instructions = ['Cook oats in almond milk.', 'Top with fresh berries.'];
      } else {
        title = 'Protein Berry Oatmeal';
        ingredients = [
          { name: 'Oats', quantity: 80, unit: 'g', category: 'Pantry', optional: false },
          { name: 'Whey Protein', quantity: 30, unit: 'g', category: 'Pantry', optional: false },
          { name: 'Mixed Berries', quantity: 50, unit: 'g', category: 'Produce', optional: false }
        ];
        instructions = ['Cook oats in water.', 'Stir in protein powder and top with berries.'];
      }
    } else if (mealType === 'LUNCH' || mealType === 'DINNER') {
      if (diet === 'KETO') {
        title = 'Grilled Salmon with Asparagus';
        ingredients = [
          { name: 'Salmon Fillet', quantity: 180, unit: 'g', category: 'Seafood', optional: false },
          { name: 'Asparagus', quantity: 150, unit: 'g', category: 'Produce', optional: false },
          { name: 'Olive Oil', quantity: 15, unit: 'ml', category: 'Pantry', optional: false }
        ];
        instructions = ['Pan-sear salmon in olive oil.', 'Steam asparagus and serve.'];
      } else if (diet === 'VEGAN' || diet === 'VEGETARIAN') {
        title = 'Tofu Quinoa Nourish Bowl';
        ingredients = [
          { name: 'Firm Tofu', quantity: 150, unit: 'g', category: 'Produce', optional: false },
          { name: 'Quinoa', quantity: 100, unit: 'g', category: 'Pantry', optional: false },
          { name: 'Mixed Greens', quantity: 80, unit: 'g', category: 'Produce', optional: false }
        ];
        instructions = ['Cook quinoa in boiling water.', 'Pan-fry tofu and serve over greens.'];
      } else {
        title = 'Grilled Chicken and Quinoa';
        ingredients = [
          { name: 'Chicken Breast', quantity: 150, unit: 'g', category: 'Meat', optional: false },
          { name: 'Quinoa', quantity: 100, unit: 'g', category: 'Pantry', optional: false },
          { name: 'Broccoli', quantity: 100, unit: 'g', category: 'Produce', optional: false }
        ];
        instructions = ['Grill chicken and steam broccoli.', 'Serve alongside cooked quinoa.'];
      }
    } else {
      // Snack
      title = 'Mixed Nuts and Fruit';
      ingredients = [
        { name: 'Almonds', quantity: 30, unit: 'g', category: 'Pantry', optional: false },
        { name: 'Apple', quantity: 1, unit: 'pc', category: 'Produce', optional: false }
      ];
      instructions = ['Serve fresh apple slices with raw almonds.'];
    }

    // Clean allergy conflict
    ingredients = ingredients.filter(i => !matchesAllergy(i.name));
    if (ingredients.length === 0) {
      ingredients = [{ name: 'Rice and Olive Oil', quantity: 100, unit: 'g', category: 'Pantry', optional: false }];
    }

    return {
      mealType,
      title,
      description: `Balanced meal formulated for ${diet} targets.`,
      instructions,
      preparationMinutes: 10,
      cookingMinutes: 15,
      servings: 1,
      calories: Math.round(calories),
      proteinGrams: Math.round(protein),
      carbohydrateGrams: Math.round(carbs),
      fatGrams: Math.round(fat),
      fibreGrams: Math.round(calories * 0.014),
      ingredients
    };
  }

  async generateMealPlan(params: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    dietaryPreference: string;
    allergies: string[];
    dislikedFoods: string[];
    preferredCuisines: string[];
    mealsPerDay: number;
    maxCookingTime: number;
    daysCount: number;
  }): Promise<MealPlanType> {
    const prompt = `You are Rachel, an expert nutritionist. Generate a personalized ${params.daysCount}-day meal plan.
Daily Targets:
- Calories: ${params.calories} kcal
- Protein: ${params.protein}g
- Carbs: ${params.carbs}g
- Fat: ${params.fat}g

Preferences:
- Diet: ${params.dietaryPreference}
- Allergies (STRICT EXCLUSION): ${params.allergies.join(', ') || 'None'}
- Disliked Foods (STRICT EXCLUSION): ${params.dislikedFoods.join(', ') || 'None'}
- Cuisines: ${params.preferredCuisines.join(', ') || 'Balanced'}
- Meals / Day: ${params.mealsPerDay}
- Max Cooking Time: ${params.maxCookingTime} minutes

You MUST output valid JSON ONLY, matching this schema:
{
  "title": "7-Day Meal Plan",
  "dailyCalories": 2000,
  "days": [
    {
      "date": "Day 1",
      "calorieTarget": 2000,
      "meals": [
        {
          "mealType": "BREAKFAST",
          "title": "Protein Oatmeal",
          "description": "Hearty oatmeal",
          "instructions": ["Boil oats", "Stir protein"],
          "preparationMinutes": 5,
          "cookingMinutes": 10,
          "servings": 1,
          "calories": 500,
          "proteinGrams": 40,
          "carbohydrateGrams": 60,
          "fatGrams": 10,
          "fibreGrams": 5,
          "ingredients": [
            { "name": "Rolled Oats", "quantity": 80, "unit": "g", "category": "Pantry" }
          ]
        }
      ]
    }
  ]
}`;

    try {
      const responseText = await geminiService.generateResponse(prompt);
      let cleaned = responseText.trim();
      if (cleaned.startsWith('```json')) {
        cleaned = cleaned.substring(7, cleaned.length - 3).trim();
      } else if (cleaned.startsWith('```')) {
        cleaned = cleaned.substring(3, cleaned.length - 3).trim();
      }

      const parsed = JSON.parse(cleaned);
      const validated = mealPlanSchema.parse(parsed);

      // Verify allergies exclusion
      for (const d of validated.days) {
        for (const m of d.meals) {
          for (const ing of m.ingredients) {
            const nameLower = ing.name.toLowerCase();
            const allergyConflict = params.allergies.some(a => nameLower.includes(a.toLowerCase()));
            if (allergyConflict) {
              throw new Error(`Generated plan contains allergen: ${ing.name}`);
            }
          }
        }
      }

      return validated;
    } catch (err) {
      console.warn('Gemini meal generation failed or returned unsafe JSON. Activating deterministic fallback planner...', err);
      
      // Construct fallback 
      const days = [];
      const mealTypes: ('BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK')[] = [];
      if (params.mealsPerDay === 1) mealTypes.push('LUNCH');
      else if (params.mealsPerDay === 2) mealTypes.push('BREAKFAST', 'DINNER');
      else if (params.mealsPerDay === 3) mealTypes.push('BREAKFAST', 'LUNCH', 'DINNER');
      else mealTypes.push('BREAKFAST', 'LUNCH', 'DINNER', 'SNACK');

      const calShare = params.calories / mealTypes.length;
      const proShare = params.protein / mealTypes.length;
      const carbShare = params.carbs / mealTypes.length;
      const fatShare = params.fat / mealTypes.length;

      for (let d = 1; d <= params.daysCount; d++) {
        const meals = mealTypes.map(type => 
          this.getFallbackMeal(type, calShare, proShare, carbShare, fatShare, params.dietaryPreference, params.allergies)
        );

        days.push({
          date: `Day ${d}`,
          calorieTarget: params.calories,
          meals
        });
      }

      return {
        title: `${params.daysCount}-Day ${params.dietaryPreference} Meal Plan`,
        dailyCalories: params.calories,
        days
      };
    }
  }

  async generateMealReplacement(
    dietaryPreference: string,
    allergies: string[],
    calories: number,
    mealType: string
  ): Promise<MealType> {
    const prompt = `Generate a single meal option of type "${mealType}" matching:
- Calories: ${calories} kcal
- Diet: ${dietaryPreference}
- Allergies: ${allergies.join(', ') || 'None'}

You MUST output JSON ONLY matching this schema:
{
  "mealType": "${mealType}",
  "title": "Protein bowl",
  "description": "Healthy choice",
  "instructions": ["Step 1"],
  "preparationMinutes": 5,
  "cookingMinutes": 10,
  "servings": 1,
  "calories": ${calories},
  "proteinGrams": 30,
  "carbohydrateGrams": 40,
  "fatGrams": 15,
  "fibreGrams": 5,
  "ingredients": [
    { "name": "Ingredient", "quantity": 100, "unit": "g", "category": "Pantry" }
  ]
}`;

    try {
      const responseText = await geminiService.generateResponse(prompt);
      let cleaned = responseText.trim();
      if (cleaned.startsWith('```json')) {
        cleaned = cleaned.substring(7, cleaned.length - 3).trim();
      } else if (cleaned.startsWith('```')) {
        cleaned = cleaned.substring(3, cleaned.length - 3).trim();
      }

      const parsed = JSON.parse(cleaned);
      const validated = mealSchema.parse(parsed);
      return validated;
    } catch (err) {
      console.warn('Gemini single meal replacement failed. Falling back to programmatic meal...', err);
      const mType = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'].includes(mealType) ? mealType as any : 'LUNCH';
      return this.getFallbackMeal(mType, calories, calories * 0.07, calories * 0.1, calories * 0.03, dietaryPreference, allergies);
    }
  }
}

export const mealGeneratorService = new MealGeneratorService();
