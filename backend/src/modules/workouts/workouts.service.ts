import { workoutRepository } from './workouts.repository';
import { CompleteWorkoutInput, GenerateWorkoutInput, WorkoutPlan, WorkoutHistory } from './workouts.types';

export class WorkoutService {
  async getWorkoutPlans(userId: string): Promise<WorkoutPlan[]> {
    return workoutRepository.getWorkoutPlans(userId);
  }

  async getWorkoutPlanById(id: string, userId: string): Promise<WorkoutPlan> {
    return workoutRepository.getWorkoutPlanById(id, userId);
  }

  async getWorkoutHistory(userId: string): Promise<WorkoutHistory[]> {
    return workoutRepository.getWorkoutHistory(userId);
  }

  async getWorkoutHistoryById(id: string, userId: string): Promise<WorkoutHistory> {
    return workoutRepository.getWorkoutHistoryById(id, userId);
  }

  async completeWorkout(userId: string, data: CompleteWorkoutInput): Promise<WorkoutHistory> {
    return workoutRepository.completeWorkout(userId, data);
  }

  async generateWorkout(userId: string, data: GenerateWorkoutInput): Promise<WorkoutPlan> {
    const plan = await this.generateWorkoutPlanWithRules(data);
    return workoutRepository.createWorkoutPlan(userId, plan);
  }

  async setActivePlan(userId: string, planId: string): Promise<void> {
    await workoutRepository.setActivePlan(userId, planId);
  }

  async createWorkoutPlanFromAi(userId: string, aiData: any): Promise<WorkoutPlan> {
    const plan = {
      name: aiData.name || 'AI Generated Workout Plan',
      goal: 'GENERAL_FITNESS',
      fitnessLevel: 'INTERMEDIATE',
      daysPerWeek: aiData.daysPerWeek || 3,
      durationMinutes: 45,
      startDate: new Date(),
      workoutDays: aiData.workoutDays?.map((day: any) => ({
        dayOfWeek: day.dayOfWeek,
        dayNumber: day.dayOfWeek,
        name: day.name,
        title: day.focus,
        durationMinutes: day.durationMinutes,
        estimatedDuration: day.durationMinutes,
        focus: day.focus,
        exercises: day.exercises?.map((ex: any, idx: number) => ({
          name: ex.name,
          muscleGroup: ex.muscleGroup,
          equipmentNeeded: 'None',
          instructions: `${ex.sets} sets of ${ex.reps} reps with ${ex.restSeconds}s rest`,
          order: idx,
          exerciseSets: Array.from({ length: ex.sets }, (_, i) => ({
            reps: ex.reps,
            weightKg: null,
            restTimeSeconds: ex.restSeconds,
            order: i,
            isCompleted: false,
          })),
        })),
      })) || [],
    };

    return workoutRepository.createWorkoutPlan(userId, plan);
  }

  private async generateWorkoutPlanWithRules(data: GenerateWorkoutInput): Promise<any> {
    const { goal, fitnessLevel, workoutDaysPerWeek, workoutDurationMinutes, equipment } = data;

    const workoutDays = this.createWorkoutDays(fitnessLevel, workoutDaysPerWeek, workoutDurationMinutes, goal, equipment);

    return {
      name: `${goal} Plan - ${fitnessLevel}`,
      goal,
      fitnessLevel,
      startDate: new Date(),
      workoutDays,
    };
  }

  private createWorkoutDays(fitnessLevel: string, daysPerWeek: number, duration: number, goal: string, equipment: string[]): any[] {
    const days: any[] = [];

    for (let i = 0; i < daysPerWeek; i++) {
      const dayOfWeek = i;
      const exercises = this.generateExercises(fitnessLevel, goal, equipment, duration);

      days.push({
        dayOfWeek,
        name: this.getDayName(dayOfWeek),
        durationMinutes: duration,
        exercises,
      });
    }

    return days;
  }

  private getDayName(dayIndex: number): string {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayIndex];
  }

  private generateExercises(fitnessLevel: string, goal: string, equipment: string[], duration: number): any[] {
    const exercises: any[] = [];
    const exerciseCount = Math.floor(duration / 10);

    for (let i = 0; i < exerciseCount; i++) {
      const exercise = this.getExerciseForGoal(goal, equipment, i);
      exercises.push({
        name: exercise.name,
        muscleGroup: exercise.muscleGroup,
        equipmentNeeded: exercise.equipment,
        instructions: exercise.instructions,
        order: i,
        exerciseSets: this.generateSets(fitnessLevel, goal),
      });
    }

    return exercises;
  }

  private getExerciseForGoal(goal: string, _equipment: string[], index: number): any {
    const exercises: any = {
      'FAT_LOSS': [
        { name: 'Burpees', muscleGroup: 'Full Body', equipment: 'None', instructions: 'Perform burpees with proper form' },
        { name: 'Jump Squats', muscleGroup: 'Legs', equipment: 'None', instructions: 'Jump explosively from squat position' },
        { name: 'Mountain Climbers', muscleGroup: 'Core', equipment: 'None', instructions: 'Alternate knees to chest rapidly' },
        { name: 'High Knees', muscleGroup: 'Cardio', equipment: 'None', instructions: 'Run in place bringing knees high' },
        { name: 'Jumping Jacks', muscleGroup: 'Full Body', equipment: 'None', instructions: 'Jump while spreading arms and legs' },
      ],
      'MUSCLE_GAIN': [
        { name: 'Push-ups', muscleGroup: 'Chest', equipment: 'None', instructions: 'Keep core tight, lower chest to ground' },
        { name: 'Squats', muscleGroup: 'Legs', equipment: 'None', instructions: 'Lower until thighs parallel to ground' },
        { name: 'Lunges', muscleGroup: 'Legs', equipment: 'None', instructions: 'Step forward and lower hips' },
        { name: 'Plank', muscleGroup: 'Core', equipment: 'None', instructions: 'Hold straight body position' },
        { name: 'Dips', muscleGroup: 'Triceps', equipment: 'Chair/Bench', instructions: 'Lower body by bending arms' },
      ],
      'STRENGTH': [
        { name: 'Push-ups', muscleGroup: 'Chest', equipment: 'None', instructions: 'Slow controlled movement' },
        { name: 'Squats', muscleGroup: 'Legs', equipment: 'None', instructions: 'Focus on depth and control' },
        { name: 'Pull-ups', muscleGroup: 'Back', equipment: 'Pull-up Bar', instructions: 'Pull chin above bar' },
        { name: 'Plank', muscleGroup: 'Core', equipment: 'None', instructions: 'Hold for maximum time' },
        { name: 'Glute Bridges', muscleGroup: 'Glutes', equipment: 'None', instructions: 'Squeeze glutes at top' },
      ],
      'ENDURANCE': [
        { name: 'Running in Place', muscleGroup: 'Cardio', equipment: 'None', instructions: 'Maintain steady pace' },
        { name: 'Jump Rope', muscleGroup: 'Cardio', equipment: 'Jump Rope', instructions: 'Jump with rhythm' },
        { name: 'Burpees', muscleGroup: 'Full Body', equipment: 'None', instructions: 'Maintain consistent pace' },
        { name: 'Mountain Climbers', muscleGroup: 'Core', equipment: 'None', instructions: 'Quick alternating movement' },
        { name: 'High Knees', muscleGroup: 'Cardio', equipment: 'None', instructions: 'Keep knees high' },
      ],
      'GENERAL_FITNESS': [
        { name: 'Push-ups', muscleGroup: 'Chest', equipment: 'None', instructions: 'Standard push-up form' },
        { name: 'Squats', muscleGroup: 'Legs', equipment: 'None', instructions: 'Standard squat form' },
        { name: 'Lunges', muscleGroup: 'Legs', equipment: 'None', instructions: 'Alternate legs' },
        { name: 'Plank', muscleGroup: 'Core', equipment: 'None', instructions: 'Hold straight line' },
        { name: 'Jumping Jacks', muscleGroup: 'Cardio', equipment: 'None', instructions: 'Full range of motion' },
      ],
      'ATHLETIC_PERFORMANCE': [
        { name: 'Plyometric Push-ups', muscleGroup: 'Chest', equipment: 'None', instructions: 'Explosive push movement' },
        { name: 'Jump Squats', muscleGroup: 'Legs', equipment: 'None', instructions: 'Explosive upward movement' },
        { name: 'Box Jumps', muscleGroup: 'Legs', equipment: 'Box/Platform', instructions: 'Jump onto box softly' },
        { name: 'Sprints', muscleGroup: 'Cardio', equipment: 'None', instructions: 'Maximum effort sprints' },
        { name: 'Burpees', muscleGroup: 'Full Body', equipment: 'None', instructions: 'Explosive full body movement' },
      ],
    };

    const goalExercises = exercises[goal] || exercises['GENERAL_FITNESS'];
    return goalExercises[index % goalExercises.length];
  }

  private generateSets(fitnessLevel: string, goal: string): any[] {
    const sets: any[] = [];
    let reps: number;
    let setsCount: number;
    let restTime: number;

    if (fitnessLevel === 'BEGINNER') {
      reps = 8;
      setsCount = 2;
      restTime = 60;
    } else if (fitnessLevel === 'INTERMEDIATE') {
      reps = 12;
      setsCount = 3;
      restTime = 90;
    } else {
      reps = 15;
      setsCount = 4;
      restTime = 60;
    }

    if (goal === 'STRENGTH') {
      reps = Math.max(5, reps - 5);
      restTime = 120;
    } else if (goal === 'FAT_LOSS' || goal === 'ENDURANCE') {
      reps = reps + 5;
      restTime = 45;
    }

    for (let i = 0; i < setsCount; i++) {
      sets.push({
        reps,
        weightKg: null,
        restTimeSeconds: restTime,
        order: i,
        isCompleted: false,
      });
    }

    return sets;
  }
}

export const workoutService = new WorkoutService();
