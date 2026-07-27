import { useState } from 'react';
import { Card } from '../ui/Card';
import { Heart, Activity, Clock, ArrowRight, Check } from 'lucide-react';
import { workoutPlanService } from '../../services/workout-plan.service';

interface RecoveryCardProps {
  title: string;
  explanation: string;
  data?: {
    activity?: string;
    duration?: string;
    intensity?: string;
    benefit?: string;
  };
  onAction?: () => void;
  actionLabel?: string;
}

export function RecoveryCard({ title, explanation, data, onAction }: RecoveryCardProps) {
  const [isAdded, setIsAdded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveRecommendation = async () => {
    if (isAdded || isLoading) return;
    setIsLoading(true);

    try {
      // Save as a recovery entry
      await workoutPlanService.createRecoveryEntry({
        sleepHours: 8,
        sleepQuality: 'Good',
        hydrationLevel: 'Well Hydrated',
        sorenessLevel: 'Low',
        stressLevel: 'Low',
        energyLevel: 'High',
        previousWorkoutLoad: 'Moderate'
      });
      setIsAdded(true);
      if (onAction) onAction();
    } catch (err) {
      console.error('Failed to save recovery recommendation:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-[#151B24] border-white/5 p-5 rounded-xl">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-lg bg-[#EF4444]/10 flex items-center justify-center flex-shrink-0">
          <Heart className="text-[#EF4444]" size={20} />
        </div>
        <div className="flex-1">
          <h4 className="text-base font-bold text-white mb-1">{title}</h4>
          <p className="text-sm text-[#A8B0BF] leading-relaxed">{explanation}</p>
        </div>
      </div>

      {data && (
        <div className="bg-[#10151D] rounded-lg p-4 mb-3 space-y-2">
          {data.activity && (
            <div className="flex items-center gap-2">
              <Activity className="text-[#32D5F4]" size={14} />
              <span className="text-xs text-[#A8B0BF]">Activity:</span>
              <span className="text-sm text-white font-medium">{data.activity}</span>
            </div>
          )}
          {data.duration && (
            <div className="flex items-center gap-2">
              <Clock className="text-[#FFC400]" size={14} />
              <span className="text-xs text-[#A8B0BF]">Duration:</span>
              <span className="text-sm text-white">{data.duration}</span>
            </div>
          )}
          {data.intensity && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#A8B0BF] w-20">Intensity:</span>
              <span className="text-sm text-white">{data.intensity}</span>
            </div>
          )}
          {data.benefit && (
            <div className="mt-3 pt-3 border-t border-white/5">
              <span className="text-xs text-[#A8B0BF] block mb-1">Benefit:</span>
              <span className="text-sm text-white">{data.benefit}</span>
            </div>
          )}
        </div>
      )}

      <button
        onClick={handleSaveRecommendation}
        disabled={isAdded || isLoading}
        className={`w-full px-4 py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-colors ${
          isAdded 
            ? 'bg-[#4ADE80] text-black cursor-default' 
            : 'bg-[#EF4444] text-white hover:bg-[#FF5454] disabled:opacity-50'
        }`}
      >
        {isAdded ? (
          <>
            <Check size={16} />
            Saved ✓
          </>
        ) : isLoading ? (
          'Saving...'
        ) : (
          <>
            Save Recommendation
            <ArrowRight size={16} />
          </>
        )}
      </button>
    </Card>
  );
}
