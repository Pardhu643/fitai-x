import { recoveryScoreService } from '../recovery-score/recovery-score.service';
import { progressiveOverloadService } from '../progressive-overload/progressive-overload.service';
import { conflictDetectionService } from '../conflict-detection/conflict-detection.service';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`[PASS] ${message}`);
}

function testRecoveryScoreCalculation() {
  console.log('\nRunning: Recovery Score Calculation Tests...');
  
  const highRecovery = recoveryScoreService.calculateScore({
    sleepHours: 8,
    sleepQuality: 'EXCELLENT',
    hydrationLevel: 'HIGH',
    sorenessLevel: 'NONE',
    stressLevel: 'LOW',
    energyLevel: 'HIGH',
    previousWorkoutLoad: 'LIGHT',
  });
  assert(highRecovery.score >= 80, `High recovery score should be >= 80, got ${highRecovery.score}`);

  const lowRecovery = recoveryScoreService.calculateScore({
    sleepHours: 4,
    sleepQuality: 'POOR',
    hydrationLevel: 'LOW',
    sorenessLevel: 'HEAVY',
    stressLevel: 'HIGH',
    energyLevel: 'LOW',
    previousWorkoutLoad: 'INTENSE',
  });
  assert(lowRecovery.score < 40, `Poor recovery score should be < 40, got ${lowRecovery.score}`);
}

function testProgressiveOverloadRules() {
  console.log('\nRunning: Progressive Overload Rules Tests...');

  // Beginner gets no progressive overload adjustments
  const beginner = progressiveOverloadService.applyProgressionRules('Squats', 3, 10, 40, 'BEGINNER');
  assert(beginner.reps === 10 && beginner.weight === 40, 'Beginner should not get progressive overload changes');

  // Intermediate gets target rep increases
  const intermediate = progressiveOverloadService.applyProgressionRules('Squats', 3, 10, 40, 'INTERMEDIATE');
  assert(intermediate.reps === 11, 'Intermediate should get target rep increased by 1');

  // Advanced gets weight increases
  const advanced = progressiveOverloadService.applyProgressionRules('Squats', 3, 10, 40, 'ADVANCED');
  assert(advanced.weight === 45, 'Advanced lower-body Squats should increase weight by 5kg');
}

function testConflictDetection() {
  console.log('\nRunning: Conflict Detection & Resolution Tests...');

  const conflict = conflictDetectionService.detectAndResolveConflicts([
    { dayNumber: 1, title: 'Day 1', focus: 'Legs', exercises: ['Squats', 'Leg Extension'] },
    { dayNumber: 2, title: 'Day 2', focus: 'Lower', exercises: ['Deadlifts', 'Glute Bridge'] },
  ]);
  assert(conflict.notes.length > 0, 'Consecutive spinal loading should trigger scheduling conflict warning');
}

function runAllTests() {
  try {
    testRecoveryScoreCalculation();
    testProgressiveOverloadRules();
    testConflictDetection();
    console.log('\nAll assertions passed successfully!');
  } catch (error: any) {
    console.error('\nTest runner failed!');
    console.error(error.message);
    process.exit(1);
  }
}

runAllTests();
