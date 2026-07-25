import { prisma } from '../../core/database/prisma';
import { calorieCalculatorService } from './calorie-calculator.service';
import { macroCalculatorService } from './macro-calculator.service';
import { NutritionTargetsResult } from './nutrition.types';
import { NutritionGoal } from '@prisma/client';

export class NutritionTargetService {
  async calculateAndSaveTargets(userId: string): Promise<NutritionTargetsResult> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { 
        nutritionProfile: true,
        userPreferences: true
      }
    });

    if (!user) {
      throw new Error('User not found');
    }

    const weight = user.weightKg || 70;
    const height = user.heightCm || 170;
    const age = user.age || 28;
    const gender = user.gender === 'FEMALE' ? 'FEMALE' : 'MALE';
    
    // Map PrimaryGoal to NutritionGoal and calculation goal key
    const primaryGoal = user.primaryGoal || 'GENERAL_FITNESS';
    let calcGoal = 'GENERAL_FITNESS';
    let targetGoal: NutritionGoal = NutritionGoal.GENERAL_FITNESS;

    if (primaryGoal === 'WEIGHT_LOSS') {
      calcGoal = 'FAT_LOSS';
      targetGoal = NutritionGoal.FAT_LOSS;
    } else if (primaryGoal === 'MUSCLE_GAIN' || primaryGoal === 'STRENGTH') {
      calcGoal = 'MUSCLE_GAIN';
      targetGoal = NutritionGoal.MUSCLE_GAIN;
    } else if (primaryGoal === 'ENDURANCE') {
      calcGoal = 'ENDURANCE';
      targetGoal = NutritionGoal.ENDURANCE;
    } else {
      calcGoal = 'GENERAL_FITNESS';
      targetGoal = NutritionGoal.GENERAL_FITNESS;
    }

    // Map workout days per week to activity level
    const daysPerWeek = user.userPreferences?.workoutDaysPerWeek || 3;
    let activityLevel = 'MODERATELY_ACTIVE';
    if (daysPerWeek <= 1) {
      activityLevel = 'SEDENTARY';
    } else if (daysPerWeek <= 3) {
      activityLevel = 'LIGHTLY_ACTIVE';
    } else if (daysPerWeek <= 5) {
      activityLevel = 'MODERATELY_ACTIVE';
    } else {
      activityLevel = 'VERY_ACTIVE';
    }

    const profile = user.nutritionProfile;

    // Check if targets are completely overridden
    if (
      profile &&
      profile.calorieTargetOverride &&
      profile.proteinTargetOverride &&
      profile.carbohydrateTargetOverride &&
      profile.fatTargetOverride
    ) {
      const overrideTarget = {
        calories: profile.calorieTargetOverride,
        proteinGrams: profile.proteinTargetOverride,
        carbohydrateGrams: profile.carbohydrateTargetOverride,
        fatGrams: profile.fatTargetOverride,
        fibreGrams: Math.max(20, Math.min(50, Math.round((profile.calorieTargetOverride / 1000) * 14))),
        waterMl: Math.max(2000, Math.min(5000, Math.round(weight * 35))),
        goal: calcGoal,
        explanation: 'Nutrition targets are manually overridden as specified in your profile.'
      };

      await prisma.nutritionTarget.create({
        data: {
          userId,
          calories: overrideTarget.calories,
          proteinGrams: overrideTarget.proteinGrams,
          carbohydrateGrams: overrideTarget.carbohydrateGrams,
          fatGrams: overrideTarget.fatGrams,
          fibreGrams: overrideTarget.fibreGrams,
          waterMl: overrideTarget.waterMl,
          goal: targetGoal,
          source: 'OVERRIDE'
        }
      });

      return overrideTarget;
    }

    const calResult = calorieCalculatorService.calculateCalories(
      weight,
      height,
      age,
      gender,
      activityLevel,
      calcGoal
    );

    const macroResult = macroCalculatorService.calculateMacros(
      weight,
      calResult.calories,
      calcGoal
    );

    // Save to DB
    await prisma.nutritionTarget.create({
      data: {
        userId,
        calories: calResult.calories,
        proteinGrams: macroResult.proteinGrams,
        carbohydrateGrams: macroResult.carbohydrateGrams,
        fatGrams: macroResult.fatGrams,
        fibreGrams: macroResult.fibreGrams,
        waterMl: macroResult.waterMl,
        goal: targetGoal,
        source: 'CALCULATOR'
      }
    });

    return {
      calories: calResult.calories,
      proteinGrams: macroResult.proteinGrams,
      carbohydrateGrams: macroResult.carbohydrateGrams,
      fatGrams: macroResult.fatGrams,
      fibreGrams: macroResult.fibreGrams,
      waterMl: macroResult.waterMl,
      goal: calcGoal,
      explanation: calResult.explanation
    };
  }

  async getLatestTargets(userId: string): Promise<any> {
    const target = await prisma.nutritionTarget.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    if (!target) {
      return this.calculateAndSaveTargets(userId);
    }

    return target;
  }
}

export const nutritionTargetService = new NutritionTargetService();
