import { useState } from 'react';
import { Card } from '../ui/Card';
import { Utensils, Flame, Wheat, ArrowRight, Check } from 'lucide-react';
import { mealService } from '../../services/meal.service';

interface MealCardProps {
  title: string;
  explanation: string;
  data?: {
    name?: string;
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    ingredients?: string[];
    mealType?: string;
  };
  onAction?: () => void;
  actionLabel?: string;
}

export function MealCard({ title, explanation, data, onAction }: MealCardProps) {
  const [isAdded, setIsAdded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddToMealPlanner = async () => {
    if (isAdded || isLoading) return;
    setIsLoading(true);

    try {
      await mealService.generatePlan(7);
      setIsAdded(true);
      if (onAction) onAction();
    } catch (err) {
      console.error('Failed to add meal:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-[#151B24] border-white/5 p-5 rounded-xl">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-lg bg-[#4ADE80]/10 flex items-center justify-center flex-shrink-0">
          <Utensils className="text-[#4ADE80]" size={20} />
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
              <span className="text-xs text-[#A8B0BF] w-20">Meal:</span>
              <span className="text-sm text-white font-medium">{data.name}</span>
            </div>
          )}
          {data.mealType && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#A8B0BF] w-20">Type:</span>
              <span className="text-sm text-white">{data.mealType}</span>
            </div>
          )}
          <div className="grid grid-cols-3 gap-2 mt-2">
            {data.calories && (
              <div className="text-center bg-[#171D26] rounded p-2">
                <Flame className="text-[#FF5E5E] mx-auto mb-1" size={14} />
                <span className="text-xs text-white font-bold">{data.calories}</span>
                <span className="text-xs text-[#A8B0BF] block">kcal</span>
              </div>
            )}
            {data.protein && (
              <div className="text-center bg-[#171D26] rounded p-2">
                <span className="text-xs text-white font-bold">{data.protein}g</span>
                <span className="text-xs text-[#A8B0BF] block">protein</span>
              </div>
            )}
            {data.carbs && (
              <div className="text-center bg-[#171D26] rounded p-2">
                <Wheat className="text-[#FFC400] mx-auto mb-1" size={14} />
                <span className="text-xs text-white font-bold">{data.carbs}g</span>
                <span className="text-xs text-[#A8B0BF] block">carbs</span>
              </div>
            )}
          </div>
          {data.ingredients && data.ingredients.length > 0 && (
            <div className="mt-3 pt-3 border-t border-white/5">
              <span className="text-xs text-[#A8B0BF] block mb-2">Ingredients:</span>
              <div className="flex flex-wrap gap-1">
                {data.ingredients.map((ingredient, idx) => (
                  <span key={idx} className="text-xs bg-[#171D26] text-white px-2 py-1 rounded">
                    {ingredient}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <button
        onClick={handleAddToMealPlanner}
        disabled={isAdded || isLoading}
        className={`w-full px-4 py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-colors ${
          isAdded 
            ? 'bg-[#4ADE80] text-black cursor-default' 
            : 'bg-[#4ADE80] text-black hover:bg-[#6FE894] disabled:opacity-50'
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
            Add to Meal Planner
            <ArrowRight size={16} />
          </>
        )}
      </button>
    </Card>
  );
}
