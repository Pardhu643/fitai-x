import { fatigueScoringEngine } from './fatigue-scoring-engine';
import { FatigueCalculationContext } from './fatigue.types';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`[PASS] ${message}`);
}

function testWellRestedUser() {
  console.log('\nRunning: Well-Rested User Test...');
  
  const context: FatigueCalculationContext = {
    userId: 'test-user-1',
    recentWorkouts: {
      count: 2,
      totalDuration: 90,
      totalVolume: 400,
      consecutiveDays: 1,
      avgIntensity: 0.4,
      missedWorkouts: 0,
    },
    recoveryData: {
      latestEntry: {
        sleepHours: 8,
        sleepQuality: 'EXCELLENT',
        hydrationLevel: 'HIGH',
        sorenessLevel: 'NONE',
        stressLevel: 'LOW',
        energyLevel: 'HIGH',
        previousWorkoutLoad: 'LIGHT',
        score: 90,
      },
      hasRecentData: true,
    },
    habitData: {
      sleepConsistency: 0.9,
      hydrationConsistency: 0.9,
    },
    nutritionData: {
      calorieAdherence: 0.9,
      proteinAdherence: 0.9,
      hasRecentData: true,
    },
    planChangeData: {
      recentChanges: 0,
      daysSinceLastChange: 30,
    },
  };

  const result = fatigueScoringEngine.calculateFatigueScore(context);
  assert(result.level === 'LOW', `Well-rested user should have LOW fatigue, got ${result.level}`);
  assert(result.score < 30, `Well-rested user should have score < 30, got ${result.score}`);
  assert(result.confidence > 0.7, `Well-rested user should have high confidence, got ${result.confidence}`);
}

function testModerateFatigue() {
  console.log('\nRunning: Moderate Fatigue Test...');
  
  const context: FatigueCalculationContext = {
    userId: 'test-user-2',
    recentWorkouts: {
      count: 5,
      totalDuration: 225,
      totalVolume: 1000,
      consecutiveDays: 4,
      avgIntensity: 0.7,
      missedWorkouts: 0,
    },
    recoveryData: {
      latestEntry: {
        sleepHours: 6,
        sleepQuality: 'FAIR',
        hydrationLevel: 'MEDIUM',
        sorenessLevel: 'LIGHT',
        stressLevel: 'MEDIUM',
        energyLevel: 'MEDIUM',
        previousWorkoutLoad: 'MODERATE',
        score: 55,
      },
      hasRecentData: true,
    },
    habitData: {
      sleepConsistency: 0.6,
      hydrationConsistency: 0.6,
    },
    nutritionData: {
      calorieAdherence: 0.6,
      proteinAdherence: 0.6,
      hasRecentData: true,
    },
    planChangeData: {
      recentChanges: 1,
      daysSinceLastChange: 14,
    },
  };

  const result = fatigueScoringEngine.calculateFatigueScore(context);
  console.log(`  Actual score: ${result.score}, level: ${result.level}`);
  assert(result.level === 'MODERATE', `Moderate fatigue should be MODERATE, got ${result.level}`);
  assert(result.score >= 50 && result.score < 75, `Moderate fatigue score should be 50-74, got ${result.score}`);
}

function testConsecutiveHeavyTrainingDays() {
  console.log('\nRunning: Consecutive Heavy Training Days Test...');
  
  const context: FatigueCalculationContext = {
    userId: 'test-user-3',
    recentWorkouts: {
      count: 6,
      totalDuration: 360,
      totalVolume: 1500,
      consecutiveDays: 6,
      avgIntensity: 0.8,
      missedWorkouts: 0,
    },
    recoveryData: {
      latestEntry: {
        sleepHours: 6,
        sleepQuality: 'FAIR',
        hydrationLevel: 'MEDIUM',
        sorenessLevel: 'LIGHT',
        stressLevel: 'MEDIUM',
        energyLevel: 'MEDIUM',
        previousWorkoutLoad: 'INTENSE',
        score: 55,
      },
      hasRecentData: true,
    },
    habitData: {
      sleepConsistency: 0.6,
      hydrationConsistency: 0.6,
    },
    nutritionData: {
      calorieAdherence: 0.6,
      proteinAdherence: 0.6,
      hasRecentData: true,
    },
    planChangeData: {
      recentChanges: 0,
      daysSinceLastChange: 30,
    },
  };

  const result = fatigueScoringEngine.calculateFatigueScore(context);
  assert(result.level === 'HIGH' || result.level === 'MODERATE', `Heavy training should result in HIGH or MODERATE fatigue, got ${result.level}`);
  assert(result.score >= 50, `Heavy training should have score >= 50, got ${result.score}`);
}

function testPoorSleepAndHighSoreness() {
  console.log('\nRunning: Poor Sleep and High Soreness Test...');
  
  const context: FatigueCalculationContext = {
    userId: 'test-user-4',
    recentWorkouts: {
      count: 4,
      totalDuration: 180,
      totalVolume: 800,
      consecutiveDays: 3,
      avgIntensity: 0.6,
      missedWorkouts: 0,
    },
    recoveryData: {
      latestEntry: {
        sleepHours: 3,
        sleepQuality: 'POOR',
        hydrationLevel: 'LOW',
        sorenessLevel: 'HEAVY',
        stressLevel: 'HIGH',
        energyLevel: 'LOW',
        previousWorkoutLoad: 'MODERATE',
        score: 25,
      },
      hasRecentData: true,
    },
    habitData: {
      sleepConsistency: 0.3,
      hydrationConsistency: 0.3,
    },
    nutritionData: {
      calorieAdherence: 0.4,
      proteinAdherence: 0.4,
      hasRecentData: true,
    },
    planChangeData: {
      recentChanges: 0,
      daysSinceLastChange: 30,
    },
  };

  const result = fatigueScoringEngine.calculateFatigueScore(context);
  console.log(`  Actual score: ${result.score}, level: ${result.level}`);
  assert(result.level === 'HIGH' || result.level === 'MODERATE', `Poor sleep and high soreness should result in HIGH or MODERATE fatigue, got ${result.level}`);
  assert(result.score >= 60, `Poor sleep and high soreness should have score >= 60, got ${result.score}`);
  assert(result.recommendedAction.toLowerCase().includes('sleep') || result.recommendedAction.toLowerCase().includes('soreness'), 
    `Recommendation should address sleep or soreness`);
}

function testCriticalFatigue() {
  console.log('\nRunning: Critical Fatigue Test...');
  
  const context: FatigueCalculationContext = {
    userId: 'test-user-5',
    recentWorkouts: {
      count: 7,
      totalDuration: 420,
      totalVolume: 2000,
      consecutiveDays: 7,
      avgIntensity: 0.9,
      missedWorkouts: 0,
    },
    recoveryData: {
      latestEntry: {
        sleepHours: 3,
        sleepQuality: 'POOR',
        hydrationLevel: 'LOW',
        sorenessLevel: 'HEAVY',
        stressLevel: 'HIGH',
        energyLevel: 'LOW',
        previousWorkoutLoad: 'INTENSE',
        score: 20,
      },
      hasRecentData: true,
    },
    habitData: {
      sleepConsistency: 0.3,
      hydrationConsistency: 0.3,
    },
    nutritionData: {
      calorieAdherence: 0.4,
      proteinAdherence: 0.4,
      hasRecentData: true,
    },
    planChangeData: {
      recentChanges: 2,
      daysSinceLastChange: 3,
    },
  };

  const result = fatigueScoringEngine.calculateFatigueScore(context);
  console.log(`  Actual score: ${result.score}, level: ${result.level}`);
  assert(result.level === 'CRITICAL' || result.level === 'HIGH', `Critical conditions should result in CRITICAL or HIGH fatigue, got ${result.level}`);
  assert(result.score >= 75, `Critical fatigue should have score >= 75, got ${result.score}`);
  assert(result.recommendedAction.toLowerCase().includes('rest') || result.recommendedAction.toLowerCase().includes('recovery'), 
    `Critical fatigue recommendation should include rest`);
}

function testMissingRecoveryData() {
  console.log('\nRunning: Missing Recovery Data Test...');
  
  const context: FatigueCalculationContext = {
    userId: 'test-user-6',
    recentWorkouts: {
      count: 3,
      totalDuration: 135,
      totalVolume: 600,
      consecutiveDays: 2,
      avgIntensity: 0.5,
      missedWorkouts: 0,
    },
    recoveryData: {
      latestEntry: null,
      hasRecentData: false,
    },
    habitData: {
      sleepConsistency: 0.5,
      hydrationConsistency: 0.5,
    },
    nutritionData: {
      calorieAdherence: 0.5,
      proteinAdherence: 0.5,
      hasRecentData: false,
    },
    planChangeData: {
      recentChanges: 0,
      daysSinceLastChange: 30,
    },
  };

  const result = fatigueScoringEngine.calculateFatigueScore(context);
  assert(result.confidence < 0.6, `Missing data should result in lower confidence, got ${result.confidence}`);
  assert(result.explanation.includes('More data needed'), `Explanation should mention need for more data`);
}

function testFactorContributions() {
  console.log('\nRunning: Factor Contributions Test...');
  
  const context: FatigueCalculationContext = {
    userId: 'test-user-7',
    recentWorkouts: {
      count: 5,
      totalDuration: 225,
      totalVolume: 1000,
      consecutiveDays: 4,
      avgIntensity: 0.7,
      missedWorkouts: 0,
    },
    recoveryData: {
      latestEntry: {
        sleepHours: 5,
        sleepQuality: 'FAIR',
        hydrationLevel: 'MEDIUM',
        sorenessLevel: 'LIGHT',
        stressLevel: 'MEDIUM',
        energyLevel: 'MEDIUM',
        previousWorkoutLoad: 'MODERATE',
        score: 50,
      },
      hasRecentData: true,
    },
    habitData: {
      sleepConsistency: 0.6,
      hydrationConsistency: 0.6,
    },
    nutritionData: {
      calorieAdherence: 0.6,
      proteinAdherence: 0.6,
      hasRecentData: true,
    },
    planChangeData: {
      recentChanges: 0,
      daysSinceLastChange: 30,
    },
  };

  const result = fatigueScoringEngine.calculateFatigueScore(context);
  assert(result.factors.length > 0, `Should have contributing factors`);
  assert(result.factors.every(f => f.weight > 0), `All factors should have positive weight`);
  assert(result.factors.every(f => f.value >= 0 && f.value <= 1), `All factor values should be normalized 0-1`);
}

function runAllTests() {
  try {
    testWellRestedUser();
    testModerateFatigue();
    testConsecutiveHeavyTrainingDays();
    testPoorSleepAndHighSoreness();
    testCriticalFatigue();
    testMissingRecoveryData();
    testFactorContributions();
    console.log('\n✅ All fatigue scoring engine tests passed successfully!');
  } catch (error: any) {
    console.error('\n❌ Test runner failed!');
    console.error(error.message);
    process.exit(1);
  }
}

runAllTests();
