import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Utensils, Calendar, ShoppingCart, Settings2, RefreshCw, Plus, Droplet } from 'lucide-react';
import { nutritionService, NutritionTarget, NutritionProfile } from '../../services/nutrition.service';
import { mealService } from '../../services/meal.service';
import { useNavigate } from 'react-router-dom';
import { NutritionPreferencesModal } from './NutritionPreferencesModal';

export function NutritionPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<NutritionProfile | null>(null);
  const [targets, setTargets] = useState<NutritionTarget | null>(null);
  const [consumedToday, setConsumedToday] = useState(0);
  const [waterLogged, setWaterLogged] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const p = await nutritionService.getProfile();
      setProfile(p);
      const t = await nutritionService.getTargets();
      setTargets(t);

      // Sum active consumed meals for today
      const logs = await mealService.getLogs();
      const todayStr = new Date().toDateString();
      const todayCal = logs
        .filter(log => new Date(log.createdAt).toDateString() === todayStr)
        .reduce((sum, log) => sum + log.actualCalories, 0);
      setConsumedToday(todayCal);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRecalculate = async () => {
    setRecalculating(true);
    try {
      const updatedTargets = await nutritionService.calculateTargets();
      setTargets(updatedTargets);
    } catch (err) {
      console.error(err);
    } finally {
      setRecalculating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <RefreshCw className="animate-spin text-[#FFC400]" size={36} />
        <p className="text-gray-400 text-sm">Assembling your nutrition dashboard...</p>
      </div>
    );
  }

  const calPercentage = targets ? Math.min(Math.round((consumedToday / targets.calories) * 100), 100) : 0;
  const waterPercentage = targets ? Math.min(Math.round((waterLogged / targets.waterMl) * 100), 100) : 0;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 pb-20">
      
      {/* Title block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">NUTRITION</h1>
          <p className="text-[#A8B0BF] text-sm mt-1">Track metrics, manage dietary preferences, and generate meal plans</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 border border-white/5 bg-[#10151D] hover:bg-[#151B24] transition px-4 py-2.5 rounded-xl text-xs font-bold text-gray-300"
          >
            <Settings2 size={16} className="text-[#FFC400]" />
            Preferences Profile
          </button>
          <button 
            onClick={handleRecalculate}
            disabled={recalculating}
            className="flex items-center gap-2 border border-white/5 bg-[#10151D] hover:bg-[#151B24] transition px-4 py-2.5 rounded-xl text-xs font-bold text-gray-300 disabled:opacity-50"
          >
            <RefreshCw size={16} className={recalculating ? "animate-spin text-white" : "text-[#FFC400]"} />
            Recalculate Targets
          </button>
        </div>
      </div>

      {/* Main Grid: Targets + Water Tracker */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Calorie Ring Metric */}
        <Card className="bg-[#10151D] border border-white/5 p-6 flex flex-col items-center justify-between text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-10">
            <Utensils size={64} className="text-white" />
          </div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-[#A8B0BF] mb-4">Calories Target</h3>
          
          <div className="relative flex items-center justify-center w-36 h-36">
            {/* SVG circle meter */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.03)" strokeWidth="6" fill="transparent" />
              <circle cx="50" cy="50" r="40" stroke="#FFC400" strokeWidth="6" fill="transparent"
                strokeDasharray={`${calPercentage * 2.51} 251`}
                strokeLinecap="round" />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-white">{consumedToday}</span>
              <span className="text-[10px] text-[#A8B0BF] uppercase font-bold">/ {targets?.calories || 2000} kcal</span>
            </div>
          </div>

          <div className="mt-4">
            <span className="bg-[#FFC400]/10 text-[#FFC400] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              {calPercentage}% Consumed
            </span>
          </div>
        </Card>

        {/* Macros Breakdown */}
        <Card className="bg-[#10151D] border border-white/5 p-6 flex flex-col justify-between">
          <h3 className="text-xs font-bold uppercase tracking-widest text-[#A8B0BF] mb-4">Target Macronutrients</h3>
          <div className="space-y-4">
            {/* Protein */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-[#FF4081]">Protein</span>
                <span className="text-white">{targets?.proteinGrams || 150}g</span>
              </div>
              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-[#FF4081]" style={{ width: '40%' }}></div>
              </div>
            </div>

            {/* Carbs */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-[#00E5FF]">Carbohydrates</span>
                <span className="text-white">{targets?.carbohydrateGrams || 200}g</span>
              </div>
              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-[#00E5FF]" style={{ width: '45%' }}></div>
              </div>
            </div>

            {/* Fat */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-[#FFEA00]">Fat</span>
                <span className="text-white">{targets?.fatGrams || 65}g</span>
              </div>
              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-[#FFEA00]" style={{ width: '30%' }}></div>
              </div>
            </div>

            {/* Fibre */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-[#00E676]">Fibre</span>
                <span className="text-white">{targets?.fibreGrams || 28}g</span>
              </div>
              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-[#00E676]" style={{ width: '25%' }}></div>
              </div>
            </div>
          </div>
        </Card>

        {/* Water / Hydration Tracker */}
        <Card className="bg-[#10151D] border border-white/5 p-6 flex flex-col items-center justify-between text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-10">
            <Droplet size={64} className="text-[#00E5FF]" />
          </div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-[#A8B0BF] mb-4">Daily Hydration</h3>
          
          <div className="relative flex items-center justify-center w-36 h-36">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.03)" strokeWidth="6" fill="transparent" />
              <circle cx="50" cy="50" r="40" stroke="#00E5FF" strokeWidth="6" fill="transparent"
                strokeDasharray={`${waterPercentage * 2.51} 251`}
                strokeLinecap="round" />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-white">{waterLogged}</span>
              <span className="text-[10px] text-[#A8B0BF] uppercase font-bold">/ {targets?.waterMl || 2500} ml</span>
            </div>
          </div>

          <div className="flex gap-2 w-full mt-4">
            <button 
              onClick={() => setWaterLogged(prev => prev + 250)}
              className="flex-1 bg-[#171D26] hover:bg-[#202835] text-xs font-bold text-[#00E5FF] py-2 rounded-xl transition flex items-center justify-center gap-1"
            >
              <Plus size={14} /> 250 ml
            </button>
            <button 
              onClick={() => setWaterLogged(prev => prev + 500)}
              className="flex-1 bg-[#171D26] hover:bg-[#202835] text-xs font-bold text-[#00E5FF] py-2 rounded-xl transition flex items-center justify-center gap-1"
            >
              <Plus size={14} /> 500 ml
            </button>
          </div>
        </Card>

      </div>

      {/* Navigation Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Meal Plan card */}
        <Card 
          onClick={() => navigate('/meal-planner')}
          className="bg-[#10151D] border border-white/5 p-6 flex items-center gap-4 hover:border-[#FFC400]/40 transition cursor-pointer group"
        >
          <div className="bg-[#FFC400]/10 text-[#FFC400] p-4 rounded-2xl group-hover:scale-105 transition duration-300">
            <Calendar size={32} />
          </div>
          <div>
            <h3 className="text-lg font-black text-white uppercase group-hover:text-[#FFC400] transition">Meal Planner</h3>
            <p className="text-xs text-[#A8B0BF] mt-1">Configure daily macro target spreads, swap selections, and log meals.</p>
          </div>
        </Card>

        {/* Grocery Checklist card */}
        <Card 
          onClick={() => navigate('/grocery-list')}
          className="bg-[#10151D] border border-white/5 p-6 flex items-center gap-4 hover:border-[#FFC400]/40 transition cursor-pointer group"
        >
          <div className="bg-[#FFC400]/10 text-[#FFC400] p-4 rounded-2xl group-hover:scale-105 transition duration-300">
            <ShoppingCart size={32} />
          </div>
          <div>
            <h3 className="text-lg font-black text-white uppercase group-hover:text-[#FFC400] transition">Grocery Checklist</h3>
            <p className="text-xs text-[#A8B0BF] mt-1">Aggregate ingredients lists dynamically, add custom items, and check off purchased stock.</p>
          </div>
        </Card>

      </div>

      {/* Preferences display cards */}
      <Card className="bg-[#10151D] border border-white/5 p-6 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-[#A8B0BF]">Active Preferences Settings</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-[#6C7A8F] block mb-0.5">Dietary Target</span>
            <span className="text-white font-bold">{profile?.dietaryPreference || 'BALANCED'}</span>
          </div>
          <div>
            <span className="text-[#6C7A8F] block mb-0.5">Meals per Day</span>
            <span className="text-white font-bold">{profile?.mealsPerDay || 3}</span>
          </div>
          <div>
            <span className="text-[#6C7A8F] block mb-0.5">Allergies</span>
            <span className="text-white font-bold">{profile?.allergies?.join(', ') || 'None'}</span>
          </div>
          <div>
            <span className="text-[#6C7A8F] block mb-0.5">Disliked Foods</span>
            <span className="text-white font-bold">{profile?.dislikedFoods?.join(', ') || 'None'}</span>
          </div>
        </div>
      </Card>

      {/* Preferences modal mount */}
      <NutritionPreferencesModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={loadData}
      />

    </div>
  );
}
export default NutritionPage;
