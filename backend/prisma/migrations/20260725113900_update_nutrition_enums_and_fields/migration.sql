/*
  Warnings:

  - The `dietaryPreference` column on the `nutrition_profiles` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `cookingSkill` column on the `nutrition_profiles` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `budgetPreference` column on the `nutrition_profiles` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `goal` column on the `nutrition_targets` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "DietaryPreference" AS ENUM ('BALANCED', 'VEGETARIAN', 'VEGAN', 'KETO', 'PALEO', 'PESCATARIAN', 'ANY');

-- CreateEnum
CREATE TYPE "NutritionGoal" AS ENUM ('FAT_LOSS', 'MAINTENANCE', 'MUSCLE_GAIN', 'ENDURANCE', 'GENERAL_FITNESS');

-- CreateEnum
CREATE TYPE "CookingSkill" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');

-- CreateEnum
CREATE TYPE "BudgetPreference" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- AlterTable
ALTER TABLE "nutrition_profiles" ADD COLUMN     "calorieTargetOverride" INTEGER,
ADD COLUMN     "carbohydrateTargetOverride" INTEGER,
ADD COLUMN     "fatTargetOverride" INTEGER,
ADD COLUMN     "preferredMealTimes" TEXT[],
ADD COLUMN     "proteinTargetOverride" INTEGER,
DROP COLUMN "dietaryPreference",
ADD COLUMN     "dietaryPreference" "DietaryPreference" DEFAULT 'BALANCED',
DROP COLUMN "cookingSkill",
ADD COLUMN     "cookingSkill" "CookingSkill" DEFAULT 'BEGINNER',
DROP COLUMN "budgetPreference",
ADD COLUMN     "budgetPreference" "BudgetPreference" DEFAULT 'MEDIUM';

-- AlterTable
ALTER TABLE "nutrition_targets" DROP COLUMN "goal",
ADD COLUMN     "goal" "NutritionGoal" NOT NULL DEFAULT 'GENERAL_FITNESS',
ALTER COLUMN "source" SET DEFAULT 'CALCULATOR';

-- CreateIndex
CREATE INDEX "nutrition_targets_userId_idx" ON "nutrition_targets"("userId");
