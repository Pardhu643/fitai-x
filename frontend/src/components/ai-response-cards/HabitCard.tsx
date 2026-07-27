import { useState } from 'react';
import { Card } from '../ui/Card';
import { CheckCircle, Calendar, ArrowRight, Check } from 'lucide-react';
import { habitService } from '../../services/habit.service';

interface HabitCardProps {
  title: string;
  explanation: string;
  data?: {
    habit?: string;
    frequency?: string;
    duration?: string;
    bestTime?: string;
  };
  onAction?: () => void;
  actionLabel?: string;
}

export function HabitCard({ title, explanation, data, onAction }: HabitCardProps) {
  const [isAdded, setIsAdded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddHabit = async () => {
    if (isAdded || isLoading) return;
    setIsLoading(true);

    try {
      if (data?.habit) {
        await habitService.createHabit({
          name: data.habit,
          description: explanation,
          frequency: data.frequency || 'Daily',
          targetValue: data.duration ? parseInt(data.duration) : undefined,
          unit: data.duration ? 'minutes' : undefined
        });
        setIsAdded(true);
        if (onAction) onAction();
      }
    } catch (err) {
      console.error('Failed to add habit:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-[#151B24] border-white/5 p-5 rounded-xl">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-lg bg-[#F97316]/10 flex items-center justify-center flex-shrink-0">
          <CheckCircle className="text-[#F97316]" size={20} />
        </div>
        <div className="flex-1">
          <h4 className="text-base font-bold text-white mb-1">{title}</h4>
          <p className="text-sm text-[#A8B0BF] leading-relaxed">{explanation}</p>
        </div>
      </div>

      {data && (
        <div className="bg-[#10151D] rounded-lg p-4 mb-3 space-y-2">
          {data.habit && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#A8B0BF] w-20">Habit:</span>
              <span className="text-sm text-white font-medium">{data.habit}</span>
            </div>
          )}
          {data.frequency && (
            <div className="flex items-center gap-2">
              <Calendar className="text-[#32D5F4]" size={14} />
              <span className="text-xs text-[#A8B0BF]">Frequency:</span>
              <span className="text-sm text-white">{data.frequency}</span>
            </div>
          )}
          {data.duration && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#A8B0BF] w-20">Duration:</span>
              <span className="text-sm text-white">{data.duration}</span>
            </div>
          )}
          {data.bestTime && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#A8B0BF] w-20">Best Time:</span>
              <span className="text-sm text-white">{data.bestTime}</span>
            </div>
          )}
        </div>
      )}

      <button
        onClick={handleAddHabit}
        disabled={isAdded || isLoading}
        className={`w-full px-4 py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-colors ${
          isAdded 
            ? 'bg-[#4ADE80] text-black cursor-default' 
            : 'bg-[#F97316] text-white hover:bg-[#FF8432] disabled:opacity-50'
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
            Add Habit
            <ArrowRight size={16} />
          </>
        )}
      </button>
    </Card>
  );
}
