import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { X, Settings2 } from 'lucide-react';
import { nutritionService } from '../../services/nutrition.service';

interface NutritionPreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export function NutritionPreferencesModal({ isOpen, onClose, onSaved }: NutritionPreferencesModalProps) {
  const [dietaryPreference, setDietaryPreference] = useState('BALANCED');
  const [allergies, setAllergies] = useState('');
  const [dislikedFoods, setDislikedFoods] = useState('');
  const [preferredCuisines, setPreferredCuisines] = useState('');
  const [mealsPerDay, setMealsPerDay] = useState(3);
  const [cookingSkill, setCookingSkill] = useState('BEGINNER');
  const [cookingTime, setCookingTime] = useState(60);
  const [budget, setBudget] = useState('MEDIUM');

  // Overrides state
  const [calorieOverride, setCalorieOverride] = useState('');
  const [proteinOverride, setProteinOverride] = useState('');
  const [carbOverride, setCarbOverride] = useState('');
  const [fatOverride, setFatOverride] = useState('');

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      nutritionService.getProfile().then((data: any) => {
        if (data) {
          setDietaryPreference(data.dietaryPreference || 'BALANCED');
          setAllergies(data.allergies?.join(', ') || '');
          setDislikedFoods(data.dislikedFoods?.join(', ') || '');
          setPreferredCuisines(data.preferredCuisines?.join(', ') || '');
          setMealsPerDay(data.mealsPerDay || 3);
          setCookingSkill(data.cookingSkill || 'BEGINNER');
          setCookingTime(data.maximumCookingTime || 60);
          setBudget(data.budgetPreference || 'MEDIUM');

          setCalorieOverride(data.calorieTargetOverride ? String(data.calorieTargetOverride) : '');
          setProteinOverride(data.proteinTargetOverride ? String(data.proteinTargetOverride) : '');
          setCarbOverride(data.carbohydrateTargetOverride ? String(data.carbohydrateTargetOverride) : '');
          setFatOverride(data.fatTargetOverride ? String(data.fatTargetOverride) : '');
        }
      }).catch((err: any) => console.error(err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await nutritionService.updateProfile({
        dietaryPreference,
        allergies: allergies.split(',').map(s => s.trim()).filter(Boolean),
        dislikedFoods: dislikedFoods.split(',').map(s => s.trim()).filter(Boolean),
        preferredCuisines: preferredCuisines.split(',').map(s => s.trim()).filter(Boolean),
        mealsPerDay,
        cookingSkill,
        maximumCookingTime: cookingTime,
        budgetPreference: budget,
        calorieTargetOverride: calorieOverride ? Number(calorieOverride) : null,
        proteinTargetOverride: proteinOverride ? Number(proteinOverride) : null,
        carbohydrateTargetOverride: carbOverride ? Number(carbOverride) : null,
        fatTargetOverride: fatOverride ? Number(fatOverride) : null
      });
      onSaved();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <Card className="bg-[#10151D] border border-white/5 max-w-2xl w-full p-6 relative rounded-2xl shadow-2xl scrollbar-none my-8">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-[#A8B0BF] hover:text-white transition"
          aria-label="Close"
        >
          <X size={20} />
        </button>
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Settings2 className="text-[#FFC400]" size={22} />
          Nutrition Preferences & Overrides
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#A8B0BF] uppercase tracking-wide mb-1.5">Dietary Preference</label>
              <select 
                value={dietaryPreference}
                onChange={e => setDietaryPreference(e.target.value)}
                className="w-full bg-[#171D26] border border-white/5 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#FFC400]/50"
              >
                <option value="BALANCED">Balanced / Any</option>
                <option value="VEGAN">Vegan</option>
                <option value="VEGETARIAN">Vegetarian</option>
                <option value="KETO">Keto</option>
                <option value="PALEO">Paleo</option>
                <option value="PESCATARIAN">Pescatarian</option>
                <option value="ANY">Any</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#A8B0BF] uppercase tracking-wide mb-1.5">Cooking Skill Level</label>
              <select 
                value={cookingSkill}
                onChange={e => setCookingSkill(e.target.value)}
                className="w-full bg-[#171D26] border border-white/5 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#FFC400]/50"
              >
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#A8B0BF] uppercase tracking-wide mb-1.5">Allergies (comma separated)</label>
              <input 
                type="text"
                value={allergies}
                onChange={e => setAllergies(e.target.value)}
                placeholder="e.g. peanuts, dairy"
                className="w-full bg-[#171D26] border border-white/5 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#FFC400]/50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#A8B0BF] uppercase tracking-wide mb-1.5">Disliked Foods (comma separated)</label>
              <input 
                type="text"
                value={dislikedFoods}
                onChange={e => setDislikedFoods(e.target.value)}
                placeholder="e.g. mushrooms, olives"
                className="w-full bg-[#171D26] border border-white/5 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#FFC400]/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#A8B0BF] uppercase tracking-wide mb-1.5">Meals / Day</label>
              <input 
                type="number"
                min="1"
                max="6"
                value={mealsPerDay}
                onChange={e => setMealsPerDay(Number(e.target.value))}
                className="w-full bg-[#171D26] border border-white/5 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#FFC400]/50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#A8B0BF] uppercase tracking-wide mb-1.5">Max Cook Time (min)</label>
              <input 
                type="number"
                min="5"
                step="5"
                value={cookingTime}
                onChange={e => setCookingTime(Number(e.target.value))}
                className="w-full bg-[#171D26] border border-white/5 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#FFC400]/50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#A8B0BF] uppercase tracking-wide mb-1.5">Budget Preference</label>
              <select 
                value={budget}
                onChange={e => setBudget(e.target.value)}
                className="w-full bg-[#171D26] border border-white/5 rounded-xl px-4 py-2.5 text-white focus:outline-none"
              >
                <option value="LOW">Economy</option>
                <option value="MEDIUM">Standard</option>
                <option value="HIGH">Premium</option>
              </select>
            </div>
          </div>

          <div className="border-t border-white/5 pt-4 space-y-3">
            <h4 className="text-sm font-bold text-white">Manual Calorie & Macro Overrides (Optional)</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-[10px] text-gray-500 font-bold uppercase mb-1">Calories (kcal)</label>
                <input 
                  type="number"
                  placeholder="Auto"
                  value={calorieOverride}
                  onChange={e => setCalorieOverride(e.target.value)}
                  className="w-full bg-[#171D26] border border-white/5 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] text-gray-500 font-bold uppercase mb-1">Protein (g)</label>
                <input 
                  type="number"
                  placeholder="Auto"
                  value={proteinOverride}
                  onChange={e => setProteinOverride(e.target.value)}
                  className="w-full bg-[#171D26] border border-white/5 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] text-gray-500 font-bold uppercase mb-1">Carbs (g)</label>
                <input 
                  type="number"
                  placeholder="Auto"
                  value={carbOverride}
                  onChange={e => setCarbOverride(e.target.value)}
                  className="w-full bg-[#171D26] border border-white/5 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] text-gray-500 font-bold uppercase mb-1">Fat (g)</label>
                <input 
                  type="number"
                  placeholder="Auto"
                  value={fatOverride}
                  onChange={e => setFatOverride(e.target.value)}
                  className="w-full bg-[#171D26] border border-white/5 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
            <button 
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold border border-white/5 hover:bg-[#151B24] transition text-gray-300"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="bg-[#FFC400] text-black px-5 py-2 rounded-xl font-bold hover:bg-[#FFD43B] transition text-xs disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}
