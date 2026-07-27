import { useState } from 'react';
import { Card } from '../ui/Card';
import { Target, Repeat, Timer, ArrowRight, Check } from 'lucide-react';
import { workoutPlanService } from '../../services/workout-plan.service';

interface ExerciseCardProps {
  title: string;
  explanation: string;
  data?: {
    name?: string;
    sets?: number;
    reps?: number;
    duration?: number;
    muscle?: string;
    equipment?: string;
  };
  onAction?: () => void;
  actionLabel?: string;
}

export function ExerciseCard({ title, explanation, data, onAction }: ExerciseCardProps) {
  const [isAdded, setIsAdded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddToWorkout = async () => {
    if (isAdded || isLoading) return;
    setIsLoading(true);

    try {
      // Generate a workout plan that includes this exercise
      await workoutPlanService.generatePlan();
      setIsAdded(true);
      if (onAction) onAction();
    } catch (err) {
      console.error('Failed to add exercise:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-[#151B24] border-white/5 p-5 rounded-xl">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-lg bg-[#32D5F4]/10 flex items-center justify-center flex-shrink-0">
          <Target className="text-[#32D5F4]" size={20} />
        </div>
        <div className="flex-1">
          <h4 className="text-base font-bold text-white mb-1">{title}</h4>
          <p className="text-sm text-[#A8B0BF] leading-relaxed">{explanation}</p>
        </div>
      </div>

      {data && (
        <div className="bg-[#10151D] rounded-lg p-4 mb-3 space-y-2">
          {data.name && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#A8B0BF] w-20">Exercise:</span>
              <span className="text-sm text-white font-medium">{data.name}</span>
            </div>
          )}
          {data.sets && data.reps && (
            <div className="flex items-center gap-2">
              <Repeat className="text-[#FFC400]" size={14} />
              <span className="text-xs text-[#A8B0BF]">Sets x Reps:</span>
              <span className="text-sm text-white">{data.sets} x {data.reps}</span>
            </div>
          )}
          {data.duration && (
            <div className="flex items-center gap-2">
              <Timer className="text-[#4ADE80]" size={14} />
              <span className="text-xs text-[#A8B0BF]">Duration:</span>
              <span className="text-sm text-white">{data.duration} sec</span>
            </div>
          )}
          {data.muscle && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#A8B0BF] w-20">Target:</span>
              <span className="text-sm text-white font-medium">{data.muscle}</span>
            </div>
          )}
          {data.equipment && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#A8B0BF] w-20">Equipment:</span>
              <span className="text-sm text-white">{data.equipment}</span>
            </div>
          )}
        </div>
      )}

      <button
        onClick={handleAddToWorkout}
        disabled={isAdded || isLoading}
        className={`w-full px-4 py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-colors ${
          isAdded 
            ? 'bg-[#4ADE80] text-black cursor-default' 
            : 'bg-[#32D5F4] text-black hover:bg-[#5DE4FF] disabled:opacity-50'
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
            Add to Workout
            <ArrowRight size={16} />
          </>
        )}
      </button>
    </Card>
  );
}
