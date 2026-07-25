-- CreateEnum
CREATE TYPE "FatigueLevel" AS ENUM ('LOW', 'MODERATE', 'HIGH', 'CRITICAL');

-- CreateTable
CREATE TABLE "fatigue_assessments" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "level" "FatigueLevel" NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "explanation" TEXT NOT NULL,
    "recommendedAction" TEXT NOT NULL,
    "calculationVersion" TEXT NOT NULL DEFAULT '1.0',
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "forceRecalculate" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "fatigue_assessments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fatigue_factors" (
    "id" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "impact" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "fatigue_factors_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "fatigue_assessments_userId_calculatedAt_idx" ON "fatigue_assessments"("userId", "calculatedAt");

-- AddForeignKey
ALTER TABLE "fatigue_assessments" ADD CONSTRAINT "fatigue_assessments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fatigue_factors" ADD CONSTRAINT "fatigue_factors_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "fatigue_assessments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
