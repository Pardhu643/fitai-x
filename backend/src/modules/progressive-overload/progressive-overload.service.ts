export class ProgressiveOverloadService {
  applyProgressionRules(
    exerciseName: string,
    currentSets: number,
    currentReps: number,
    currentWeight: number | null,
    fitnessLevel: string
  ): { sets: number; reps: number; weight: number | null; note: string } {
    let sets = currentSets;
    let reps = currentReps;
    let weight = currentWeight;
    let note = '';

    if (fitnessLevel === 'ADVANCED') {
      // Advanced users get weight increases or higher volume
      if (weight !== null) {
        const isLowerBody = ['squats', 'deadlift', 'lunge', 'leg press'].some(kw => exerciseName.toLowerCase().includes(kw));
        const increment = isLowerBody ? 5 : 2.5;
        weight += increment;
        note = `Progressive overload applied: increased weight by ${increment}kg for advanced progression.`;
      } else {
        reps = Math.min(reps + 2, 15);
        note = `Progressive overload applied: increased reps by 2 for volume progression.`;
      }
    } else if (fitnessLevel === 'INTERMEDIATE') {
      // Intermediate users get rep target increases
      reps = Math.min(reps + 1, 12);
      note = `Progressive overload applied: increased target reps by 1.`;
    } else {
      note = 'No progressive overload adjustments applied for beginners.';
    }

    return { sets, reps, weight, note };
  }
}

export const progressiveOverloadService = new ProgressiveOverloadService();
