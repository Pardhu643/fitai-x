import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { mealService, MealPlan, Meal } from '../../services/meal.service';
import { Calendar, RefreshCw, CheckCircle, Eye, Loader, Trash2 } from 'lucide-react';

export function MealPlannerPage() {
  const [plan, setPlan] = useState<MealPlan | null>(null);
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);
  const [activeMealDetails, setActiveMealDetails] = useState<Meal | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionPending, setActionPending] = useState(false);
  const [daysCount, setDaysCount] = useState(7);

  const loadPlan = async () => {
    try {
      setLoading(true);
      const active = await mealService.getCurrentPlan();
      setPlan(active);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlan();
  }, []);

  const handleGenerate = async () => {
    setActionPending(true);
    try {
      const newPlan = await mealService.generatePlan(daysCount);
      setPlan(newPlan);
      setSelectedDayIdx(0);
    } catch (err) {
      console.error(err);
    } finally {
      setActionPending(false);
    }
  };

  const handleRegenerate = async () => {
    if (!plan) return;
    if (!window.confirm('Are you sure you want to regenerate this complete meal plan? This will replace your current schedule.')) return;
    setActionPending(true);
    try {
      const regenerated = await mealService.regeneratePlan(plan.id);
      setPlan(regenerated);
      setSelectedDayIdx(0);
    } catch (err) {
      console.error(err);
    } finally {
      setActionPending(false);
    }
  };

  const handleDeletePlan = async () => {
    if (!plan) return;
    if (!window.confirm('Are you sure you want to delete your active meal plan?')) return;
    setActionPending(true);
    try {
      await mealService.deletePlan(plan.id);
      setPlan(null);
    } catch (err) {
      console.error(err);
    } finally {
      setActionPending(false);
    }
  };

  const handleReplaceMeal = async (mealId: string) => {
    setActionPending(true);
    try {
      const updatedMeal = await mealService.replaceMeal(mealId);
      if (plan) {
        const updatedDays = plan.days.map(day => {
          return {
            ...day,
            meals: day.meals.map(m => m.id === mealId ? { ...m, ...updatedMeal } : m)
          };
        });
        setPlan({ ...plan, days: updatedDays });
      }
      if (activeMealDetails && activeMealDetails.id === mealId) {
        setActiveMealDetails({ ...activeMealDetails, ...updatedMeal });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionPending(false);
    }
  };

  const handleLogMeal = async (mealId: string, status: string) => {
    setActionPending(true);
    try {
      await mealService.logMeal(mealId, status);
      alert(`Logged meal status as ${status.replace('_', ' ')}`);
    } catch (err) {
      console.error(err);
    } finally {
      setActionPending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader className="animate-spin text-[#FFC400]" size={36} />
        <p className="text-gray-400 text-sm">Assembling your weekly food board...</p>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="bg-[#10151D] border border-white/5 p-8 rounded-3xl space-y-6 shadow-xl">
          <Calendar size={48} className="text-[#FFC400] mx-auto" />
          <h2 className="text-2xl font-black text-white uppercase tracking-tight">No Active Meal Plan</h2>
          <p className="text-[#A8B0BF] text-xs">
            Generate a personalized meal plan aligned with your daily targets, dietary restrictions, and cooking preferences.
          </p>

          <div className="flex justify-center gap-4">
            <select 
              value={daysCount}
              onChange={e => setDaysCount(Number(e.target.value))}
              className="bg-[#171D26] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
            >
              <option value={1}>1-Day Plan</option>
              <option value={3}>3-Day Plan</option>
              <option value={7}>7-Day Plan</option>
            </select>

            <button 
              onClick={handleGenerate}
              disabled={actionPending}
              className="bg-[#FFC400] hover:bg-[#FFD43B] text-black px-6 py-2.5 rounded-xl font-bold text-xs transition disabled:opacity-50 flex items-center gap-2"
            >
              {actionPending ? 'Generating...' : 'Generate Plan'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const selectedDay = plan.days[selectedDayIdx];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 pb-20">
      
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">MEAL PLANNER</h1>
          <p className="text-[#A8B0BF] text-sm mt-1">{plan.title}</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleRegenerate}
            disabled={actionPending}
            className="flex items-center gap-2 border border-white/5 bg-[#10151D] hover:bg-[#151B24] transition px-4 py-2.5 rounded-xl text-xs font-bold text-gray-300 disabled:opacity-50"
          >
            <RefreshCw size={16} className={actionPending ? "animate-spin text-white" : "text-[#FFC400]"} />
            Regenerate Plan
          </button>
          <button 
            onClick={handleDeletePlan}
            disabled={actionPending}
            className="flex items-center gap-2 border border-red-500/10 bg-red-500/5 hover:bg-red-500/10 transition px-4 py-2.5 rounded-xl text-xs font-bold text-red-400 disabled:opacity-50"
          >
            <Trash2 size={16} />
            Delete Plan
          </button>
        </div>
      </div>

      {/* Days Tabs Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {plan.days.map((day, idx) => (
          <button
            key={day.id}
            onClick={() => setSelectedDayIdx(idx)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition shrink-0 ${
              selectedDayIdx === idx 
                ? 'bg-[#FFC400] text-black' 
                : 'bg-[#10151D] border border-white/5 text-[#A8B0BF] hover:text-white'
            }`}
          >
            Day {idx + 1}
          </button>
        ))}
      </div>

      {/* Grid: Meals List + Details panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Meals Cards list */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">Daily Meals</h3>

          {selectedDay?.meals?.map(meal => (
            <Card key={meal.id} className="bg-[#10151D] border border-white/5 p-4 flex flex-col md:flex-row justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="bg-[#FFC400]/10 text-[#FFC400] text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                    {meal.mealType}
                  </span>
                  <span className="text-gray-500 text-xs">{meal.preparationMinutes + meal.cookingMinutes} min cook time</span>
                </div>
                <h4 className="text-base font-bold text-white">{meal.title}</h4>
                <p className="text-xs text-[#A8B0BF] line-clamp-2">{meal.description || 'Nutrient-rich options selection.'}</p>
                
                <div className="flex gap-3 text-[10px] font-bold text-gray-400 pt-1">
                  <span>{meal.calories} kcal</span>
                  <span>P: {meal.proteinGrams}g</span>
                  <span>C: {meal.carbohydrateGrams}g</span>
                  <span>F: {meal.fatGrams}g</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex md:flex-col justify-end gap-2 shrink-0 pt-2 md:pt-0">
                <button
                  onClick={() => setActiveMealDetails(meal)}
                  className="bg-[#171D26] hover:bg-[#202835] text-xs font-bold text-gray-300 px-3 py-2 rounded-xl transition flex items-center justify-center gap-1.5"
                >
                  <Eye size={14} /> View
                </button>
                <button
                  onClick={() => handleReplaceMeal(meal.id)}
                  disabled={actionPending}
                  className="bg-[#171D26] hover:bg-[#202835] text-xs font-bold text-gray-300 px-3 py-2 rounded-xl transition disabled:opacity-50"
                >
                  Swap Option
                </button>
                <div className="relative group">
                  <button className="w-full bg-[#FFC400] text-black text-xs font-bold px-3 py-2 rounded-xl hover:bg-[#FFD43B] transition flex items-center justify-center gap-1">
                    <CheckCircle size={14} /> Log Meal
                  </button>
                  {/* Hover/click dropdown */}
                  <div className="absolute right-0 bottom-full md:bottom-auto md:top-full mt-1 hidden group-hover:block bg-[#171D26] border border-white/5 rounded-xl py-1 shadow-2xl z-20 min-w-[150px]">
                    <button onClick={() => handleLogMeal(meal.id, 'CONSUMED')} className="w-full text-left px-4 py-2 text-xs text-white hover:bg-white/5">Consumed</button>
                    <button onClick={() => handleLogMeal(meal.id, 'PARTIALLY_CONSUMED')} className="w-full text-left px-4 py-2 text-xs text-white hover:bg-white/5">Partial Consumed</button>
                    <button onClick={() => handleLogMeal(meal.id, 'SKIPPED')} className="w-full text-left px-4 py-2 text-xs text-white hover:bg-white/5">Skipped</button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Selected Meal detail panel */}
        <div className="lg:col-span-1">
          {activeMealDetails ? (
            <Card className="bg-[#10151D] border border-white/5 p-6 space-y-6 sticky top-24">
              <div className="flex justify-between items-start">
                <div>
                  <span className="bg-[#FFC400]/10 text-[#FFC400] text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                    {activeMealDetails.mealType}
                  </span>
                  <h4 className="text-lg font-bold text-white mt-1.5">{activeMealDetails.title}</h4>
                </div>
                <button 
                  onClick={() => setActiveMealDetails(null)}
                  className="text-gray-500 hover:text-white text-xs font-bold"
                >
                  Close
                </button>
              </div>

              {/* Ingredients */}
              <div className="space-y-2">
                <h5 className="text-xs font-bold uppercase tracking-wider text-[#A8B0BF]">Ingredients</h5>
                <ul className="text-xs text-gray-300 space-y-1.5 list-disc pl-4">
                  {activeMealDetails.ingredients?.map((ing, i) => (
                    <li key={i}>
                      {ing.name} - {ing.quantity} {ing.unit}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Instructions */}
              <div className="space-y-2">
                <h5 className="text-xs font-bold uppercase tracking-wider text-[#A8B0BF]">Instructions</h5>
                <ol className="text-xs text-gray-300 space-y-2 list-decimal pl-4">
                  {activeMealDetails.instructions?.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
              </div>
            </Card>
          ) : (
            <div className="bg-[#10151D]/50 border border-dashed border-white/5 rounded-2xl p-8 text-center text-gray-500 text-xs">
              Select a meal's "View" button to show ingredients and cooking instructions.
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
export default MealPlannerPage;
