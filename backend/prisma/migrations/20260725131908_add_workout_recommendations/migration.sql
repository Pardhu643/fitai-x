-- CreateEnum
CREATE TYPE "InjuryRiskLevel" AS ENUM ('LOW', 'MODERATE', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "RecommendationType" AS ENUM ('PROGRESSIVE_OVERLOAD', 'DELOAD', 'RECOVERY_DAY', 'EXERCISE_SUBSTITUTION', 'INTENSITY_REDUCTION', 'VOLUME_REDUCTION');

-- CreateEnum
CREATE TYPE "RecommendationStatus" AS ENUM ('PENDING', 'APPLIED', 'DISMISSED', 'EXPIRED');

-- CreateTable
CREATE TABLE "injury_risk_assessments" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "level" "InjuryRiskLevel" NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "disclaimer" TEXT NOT NULL DEFAULT 'This assessment is a fitness risk indicator and is not a medical diagnosis.',
    "explanation" TEXT NOT NULL,
    "recommendedPrecautions" TEXT[],
    "exercisesToAvoid" TEXT[],
    "trainingModifications" TEXT[],
    "calculationVersion" TEXT NOT NULL DEFAULT '1.0',
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "forceRecalculate" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "injury_risk_assessments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "injury_risk_factors" (
    "id" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "impact" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "injury_risk_factors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "injury_risk_body_areas" (
    "id" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "bodyArea" TEXT NOT NULL,
    "riskLevel" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "recommendedAction" TEXT NOT NULL,

    CONSTRAINT "injury_risk_body_areas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workout_recommendations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "RecommendationType" NOT NULL,
    "status" "RecommendationStatus" NOT NULL DEFAULT 'PENDING',
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "explanation" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "exerciseId" TEXT,
    "workoutPlanId" TEXT,
    "currentValues" JSONB,
    "recommendedValues" JSONB,
    "appliedAt" TIMESTAMP(3),
    "dismissedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workout_recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "injury_risk_assessments_userId_calculatedAt_idx" ON "injury_risk_assessments"("userId", "calculatedAt");

-- CreateIndex
CREATE INDEX "workout_recommendations_userId_status_idx" ON "workout_recommendations"("userId", "status");

-- CreateIndex
CREATE INDEX "workout_recommendations_userId_type_idx" ON "workout_recommendations"("userId", "type");

-- CreateIndex
CREATE INDEX "workout_recommendations_userId_createdAt_idx" ON "workout_recommendations"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "injury_risk_assessments" ADD CONSTRAINT "injury_risk_assessments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "injury_risk_factors" ADD CONSTRAINT "injury_risk_factors_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "injury_risk_assessments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "injury_risk_body_areas" ADD CONSTRAINT "injury_risk_body_areas_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "injury_risk_assessments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_recommendations" ADD CONSTRAINT "workout_recommendations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_recommendations" ADD CONSTRAINT "workout_recommendations_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "exercise_library"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_recommendations" ADD CONSTRAINT "workout_recommendations_workoutPlanId_fkey" FOREIGN KEY ("workoutPlanId") REFERENCES "workout_plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;
