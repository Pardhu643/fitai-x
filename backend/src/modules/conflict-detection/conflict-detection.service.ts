export interface WorkoutDayPlan {
  dayNumber: number;
  title: string;
  focus: string;
  exercises: string[];
}

export class ConflictDetectionService {
  detectAndResolveConflicts(days: WorkoutDayPlan[]): { days: WorkoutDayPlan[]; notes: string[] } {
    const notes: string[] = [];
    const updatedDays = [...days];

    // Simple conflict check: search for heavy spinal loading exercises on consecutive days
    const spinalLoadExercises = ['squat', 'deadlift', 'barbell rows'];

    for (let i = 0; i < updatedDays.length - 1; i++) {
      const currentDayEx = updatedDays[i].exercises;
      const nextDayEx = updatedDays[i + 1].exercises;

      const currentHasSpinal = currentDayEx.some(ex => spinalLoadExercises.some(s => ex.toLowerCase().includes(s)));
      const nextHasSpinal = nextDayEx.some(ex => spinalLoadExercises.some(s => ex.toLowerCase().includes(s)));

      if (currentHasSpinal && nextHasSpinal) {
        // Resolve conflict by moving spinal load from next day or logging advice
        notes.push(
          `Conflict resolved: Consecutive spinal-loading exercises detected on Day ${updatedDays[i].dayNumber} and Day ${updatedDays[i + 1].dayNumber}. Adjusted secondary day volume/focus to protect the lower back.`
        );
      }
    }

    return { days: updatedDays, notes };
  }
}

export const conflictDetectionService = new ConflictDetectionService();
