import { useState } from 'react';
import { Card } from '../ui/Card';
import { Dumbbell, Clock, Flame, ArrowRight, Check, Calendar } from 'lucide-react';
import { workoutPlanService } from '../../services/workout-plan.service';

interface WorkoutCardProps {
  title: string;
  explanation: string;
  data?: {
    name?: string;
    duration?: number;
    calories?: number;
    exercises?: string[];
    intensity?: string;
    daysPerWeek?: number;
    workoutDays?: Array<{
      dayOfWeek: number;
      name: string;
      focus: string;
      durationMinutes: number;
      exercises: Array<{
        name: string;
        sets: number;
        reps: number;
        restSeconds: number;
        muscleGroup: string;
      }>;
    }>;
  };
  onAction?: () => void;
  actionLabel?: string;
}

export function WorkoutCard({ title, explanation, data, onAction }: WorkoutCardProps) {
  const [isAdded, setIsAdded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddToWorkouts = async () => {
    if (isAdded || isLoading) return;
    setIsLoading(true);

    try {
      // Save the complete multi-day workout plan from AI data
      if (data?.workoutDays && data.workoutDays.length > 0) {
        await workoutPlanService.createFromAi(data);
      } else {
        // Fallback to generate plan if no multi-day data
        await workoutPlanService.generatePlan();
      }
      setIsAdded(true);
      if (onAction) onAction();
    } catch (err) {
      console.error('Failed to add workout:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const isMultiDay = data?.workoutDays && data.workoutDays.length > 0;

  return (
    <Card className="bg-[#151B24] border-white/5 p-5 rounded-xl">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-lg bg-[#FFC400]/10 flex items-center justify-center flex-shrink-0">
          <Dumbbell className="text-[#FFC400]" size={20} />
        </div>
        <div className="flex-1">
          <h4 className="text-base font-bold text-white mb-1">{title}</h4>
          <p className="text-sm text-[#A8B0BF] leading-relaxed">{explanation}</p>
        </div>
      </div>

      {data && (
        <div className="bg-[#10151D] rounded-lg p-4 mb-3">
          {data.name && (
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs text-[#A8B0BF]">Plan:</span>
              <span className="text-sm text-white font-medium">{data.name}</span>
            </div>
          )}
          
          {isMultiDay && data.workoutDays ? (
            <div className="space-y-4">
              {data.workoutDays.map((day, dayIdx) => (
                <div key={dayIdx} className="border-l-2 border-[#FFC400] pl-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="text-[#FFC400]" size={14} />
                    <span className="text-sm font-bold text-white">{day.name}</span>
                    <span className="text-xs text-[#A8B0BF]">• {day.focus}</span>
                    <span className="text-xs text-[#A8B0BF]">• {day.durationMinutes} min</span>
                  </div>
                  <div className="space-y-2 ml-2">
                    {day.exercises.map((exercise, exIdx) => (
                      <div key={exIdx} className="bg-[#171D26] p-2 rounded">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-white font-medium">{exercise.name}</span>
                          <span className="text-xs text-[#A8B0BF]">{exercise.muscleGroup}</span>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-[#A8B0BF]">
                          <span>{exercise.sets} sets x {exercise.reps} reps</span>
                          <span>• {exercise.restSeconds}s rest</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {data.duration && (
                <div className="flex items-center gap-2">
                  <Clock className="text-[#32D5F4]" size={14} />
                  <span className="text-xs text-[#A8B0BF]">Duration:</span>
                  <span className="text-sm text-white">{data.duration} min</span>
                </div>
              )}
              {data.calories && (
                <div className="flex items-center gap-2">
                  <Flame className="text-[#FF5E5E]" size={14} />
                  <span className="text-xs text-[#A8B0BF]">Calories:</span>
                  <span className="text-sm text-white">{data.calories} kcal</span>
                </div>
              )}
              {data.intensity && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#A8B0BF] w-20">Intensity:</span>
                  <span className="text-sm text-white font-medium">{data.intensity}</span>
                </div>
              )}
              {data.exercises && data.exercises.length > 0 && (
                <div className="mt-3 pt-3 border-t border-white/5">
                  <span className="text-xs text-[#A8B0BF] block mb-2">Exercises:</span>
                  <div className="flex flex-wrap gap-1">
                    {data.exercises.map((exercise, idx) => (
                      <span key={idx} className="text-xs bg-[#171D26] text-white px-2 py-1 rounded">
                        {exercise}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <button
        onClick={handleAddToWorkouts}
        disabled={isAdded || isLoading}
        className={`w-full px-4 py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-colors ${
          isAdded 
            ? 'bg-[#4ADE80] text-black cursor-default' 
            : 'bg-[#FFC400] text-black hover:bg-[#FFD43B] disabled:opacity-50'
        }`}
      >
        {isAdded ? (
          <>
            <Check size={16} />
            Added ✓
          </>
        ) : isLoading ? (
          'Adding...'
        ) : (
          <>
            Add to Workouts
            <ArrowRight size={16} />
          </>
        )}
      </button>
    </Card>
  );
}
