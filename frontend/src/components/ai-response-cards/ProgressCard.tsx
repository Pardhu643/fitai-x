import { useState } from 'react';
import { Card } from '../ui/Card';
import { TrendingUp, BarChart3, Award, ArrowRight, Check } from 'lucide-react';
import { progressService } from '../../services/progress.service';

interface ProgressCardProps {
  title: string;
  explanation: string;
  data?: {
    metric?: string;
    value?: string;
    change?: string;
    trend?: string;
    timeframe?: string;
  };
  onAction?: () => void;
  actionLabel?: string;
}

export function ProgressCard({ title, explanation, data, onAction }: ProgressCardProps) {
  const [isAdded, setIsAdded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleApplyRecommendation = async () => {
    if (isAdded || isLoading) return;
    setIsLoading(true);

    try {
      // Save as a body measurement or workout history entry
      if (data?.metric?.toLowerCase().includes('weight')) {
        const weightValue = parseFloat(data.value?.replace(/[^0-9.]/g, '') || '0');
        await progressService.addBodyMeasurement({
          weightKg: weightValue
        });
      } else {
        await progressService.addWorkoutHistory({
          durationMinutes: 30,
          caloriesBurned: 200,
          rating: 5
        });
      }
      setIsAdded(true);
      if (onAction) onAction();
    } catch (err) {
      console.error('Failed to apply recommendation:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-[#151B24] border-white/5 p-5 rounded-xl">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-lg bg-[#3B82F6]/10 flex items-center justify-center flex-shrink-0">
          <BarChart3 className="text-[#3B82F6]" size={20} />
        </div>
        <div className="flex-1">
          <h4 className="text-base font-bold text-white mb-1">{title}</h4>
          <p className="text-sm text-[#A8B0BF] leading-relaxed">{explanation}</p>
        </div>
      </div>

      {data && (
        <div className="bg-[#10151D] rounded-lg p-4 mb-3 space-y-2">
          {data.metric && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#A8B0BF] w-20">Metric:</span>
              <span className="text-sm text-white font-medium">{data.metric}</span>
            </div>
          )}
          {data.value && (
            <div className="flex items-center gap-2">
              <Award className="text-[#FFC400]" size={14} />
              <span className="text-xs text-[#A8B0BF]">Value:</span>
              <span className="text-sm text-white font-bold">{data.value}</span>
            </div>
          )}
          {data.change && (
            <div className="flex items-center gap-2">
              <TrendingUp className={data.change.startsWith('+') ? 'text-[#4ADE80]' : 'text-[#FF5E5E]'} size={14} />
              <span className="text-xs text-[#A8B0BF]">Change:</span>
              <span className={`text-sm font-bold ${data.change.startsWith('+') ? 'text-[#4ADE80]' : 'text-[#FF5E5E]'}`}>{data.change}</span>
            </div>
          )}
          {data.trend && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#A8B0BF] w-20">Trend:</span>
              <span className="text-sm text-white">{data.trend}</span>
            </div>
          )}
          {data.timeframe && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#A8B0BF] w-20">Timeframe:</span>
              <span className="text-sm text-white">{data.timeframe}</span>
            </div>
          )}
        </div>
      )}

      <button
        onClick={handleApplyRecommendation}
        disabled={isAdded || isLoading}
        className={`w-full px-4 py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-colors ${
          isAdded 
            ? 'bg-[#4ADE80] text-black cursor-default' 
            : 'bg-[#3B82F6] text-white hover:bg-[#4B92FF] disabled:opacity-50'
        }`}
      >
        {isAdded ? (
          <>
            <Check size={16} />
            Applied ✓
          </>
        ) : isLoading ? (
          'Applying...'
        ) : (
          <>
            Apply Recommendation
            <ArrowRight size={16} />
          </>
        )}
      </button>
    </Card>
  );
}
