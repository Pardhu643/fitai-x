import { useState } from 'react';
import { Card } from '../ui/Card';
import { Target, TrendingUp, Calendar, ArrowRight, Check } from 'lucide-react';
import { goalsService } from '../../services/goals.service';

interface GoalCardProps {
  title: string;
  explanation: string;
  data?: {
    goal?: string;
    target?: string;
    deadline?: string;
    progress?: number;
    category?: string;
  };
  onAction?: () => void;
  actionLabel?: string;
}

export function GoalCard({ title, explanation, data, onAction }: GoalCardProps) {
  const [isAdded, setIsAdded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddGoal = async () => {
    if (isAdded || isLoading) return;
    setIsLoading(true);

    try {
      if (data?.target) {
        const targetValue = parseFloat(data.target.replace(/[^0-9.]/g, ''));
        await goalsService.createGoal({
          targetWeightKg: isNaN(targetValue) ? undefined : targetValue,
          targetDate: data.deadline
        });
        setIsAdded(true);
        if (onAction) onAction();
      }
    } catch (err) {
      console.error('Failed to add goal:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-[#151B24] border-white/5 p-5 rounded-xl">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-lg bg-[#EC4899]/10 flex items-center justify-center flex-shrink-0">
          <Target className="text-[#EC4899]" size={20} />
        </div>
        <div className="flex-1">
          <h4 className="text-base font-bold text-white mb-1">{title}</h4>
          <p className="text-sm text-[#A8B0BF] leading-relaxed">{explanation}</p>
        </div>
      </div>

      {data && (
        <div className="bg-[#10151D] rounded-lg p-4 mb-3 space-y-2">
          {data.goal && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#A8B0BF] w-20">Goal:</span>
              <span className="text-sm text-white font-medium">{data.goal}</span>
            </div>
          )}
          {data.target && (
            <div className="flex items-center gap-2">
              <TrendingUp className="text-[#4ADE80]" size={14} />
              <span className="text-xs text-[#A8B0BF]">Target:</span>
              <span className="text-sm text-white">{data.target}</span>
            </div>
          )}
          {data.deadline && (
            <div className="flex items-center gap-2">
              <Calendar className="text-[#FFC400]" size={14} />
              <span className="text-xs text-[#A8B0BF]">Deadline:</span>
              <span className="text-sm text-white">{data.deadline}</span>
            </div>
          )}
          {data.progress !== undefined && (
            <div className="mt-3 pt-3 border-t border-white/5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-[#A8B0BF]">Progress</span>
                <span className="text-xs text-white font-bold">{data.progress}%</span>
              </div>
              <div className="w-full bg-[#171D26] rounded-full h-2">
                <div 
                  className="bg-[#EC4899] h-2 rounded-full transition-all" 
                  style={{ width: `${data.progress}%` }}
                />
              </div>
            </div>
          )}
          {data.category && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#A8B0BF] w-20">Category:</span>
              <span className="text-xs bg-[#171D26] text-[#A8B0BF] px-2 py-0.5 rounded">{data.category}</span>
            </div>
          )}
        </div>
      )}

      <button
        onClick={handleAddGoal}
        disabled={isAdded || isLoading}
        className={`w-full px-4 py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-colors ${
          isAdded 
            ? 'bg-[#4ADE80] text-black cursor-default' 
            : 'bg-[#EC4899] text-white hover:bg-[#F65AA3] disabled:opacity-50'
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
            Add Goal
            <ArrowRight size={16} />
          </>
        )}
      </button>
    </Card>
  );
}
