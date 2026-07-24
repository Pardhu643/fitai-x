import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { workoutPlanService } from '../../services/workout-plan.service';
import { useNotificationStore } from '../../store/notificationStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ProgressRing } from '../../components/ui/ProgressRing';
import { ArrowLeft, Activity, Info } from 'lucide-react';

export function RecoveryCheckInPage() {
  const navigate = useNavigate();
  const addNotification = useNotificationStore((state) => state.addNotification);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  // Form State
  const [sleepHours, setSleepHours] = useState(8);
  const [sleepQuality, setSleepQuality] = useState('GOOD');
  const [hydrationLevel, setHydrationLevel] = useState('MEDIUM');
  const [sorenessLevel, setSorenessLevel] = useState('NONE');
  const [stressLevel, setStressLevel] = useState('MEDIUM');
  const [energyLevel, setEnergyLevel] = useState('MEDIUM');
  const [previousWorkoutLoad, setPreviousWorkoutLoad] = useState('MODERATE');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await workoutPlanService.createRecoveryEntry({
        sleepHours,
        sleepQuality,
        hydrationLevel,
        sorenessLevel,
        stressLevel,
        energyLevel,
        previousWorkoutLoad,
      });
      setResult(data.data);
      addNotification('success', `Recovery Score: ${data.data.score}! Plan updated.`);
    } catch (err) {
      addNotification('error', 'Failed to log recovery check-in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-12 max-w-xl mx-auto">
      <button 
        onClick={() => navigate('/workouts/current')} 
        className="flex items-center text-[#FFC400] hover:text-[#e0ad00] font-bold text-sm"
      >
        <ArrowLeft size={16} className="mr-1.5" />
        Back to Current Plan
      </button>

      <div className="text-center">
        <Activity className="text-[#FFC400] mx-auto mb-3" size={44} />
        <h1 className="text-3xl font-extrabold text-white">Daily Recovery Check-In</h1>
        <p className="text-gray-400 text-xs mt-1.5">Analyze your body conditions to adapt today's workout plan</p>
      </div>

      {result ? (
        <Card variant="elevated" className="bg-[#151515] border border-[#1B1B1B] text-center p-6 rounded-2xl space-y-6">
          <h2 className="text-xl font-bold text-white">Your Recovery Report</h2>
          <div className="flex justify-center py-4">
            <ProgressRing 
              progress={result.score} 
              size={150} 
              strokeWidth={10} 
              color={result.score >= 80 ? '#7CFF4D' : result.score >= 60 ? '#FFC400' : '#FF5E5E'} 
            />
          </div>
          
          <div className="bg-[#1B1B1B] border border-[#222] p-4 rounded-xl text-left">
            <h3 className="font-bold text-white mb-1.5 text-sm flex items-center gap-1.5">
              <Info size={16} className="text-[#FFC400]" />
              Recommendation
            </h3>
            <p className="text-gray-400 text-xs leading-relaxed">{result.recommendation}</p>
          </div>

          <div className="flex gap-4">
            <Button 
              onClick={() => setResult(null)} 
              variant="outline" 
              className="flex-1 border-[#1B1B1B] hover:bg-[#1B1B1B] text-gray-300 font-bold rounded-xl"
            >
              Check In Again
            </Button>
            <Button 
              onClick={() => navigate('/workouts/current')} 
              className="flex-1 bg-[#FFC400] text-black hover:bg-[#e0ad00] font-bold rounded-xl"
            >
              Go to Workout
            </Button>
          </div>
        </Card>
      ) : (
        <Card variant="elevated" className="bg-[#151515] border border-[#1B1B1B] p-6 rounded-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Sleep Duration (Hours)</label>
              <input 
                type="number" 
                step="0.5"
                value={sleepHours}
                onChange={(e) => setSleepHours(parseFloat(e.target.value))}
                className="w-full bg-[#1B1B1B] border border-[#222] rounded-xl px-4 py-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#FFC400]"
                min="0"
                max="24"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Sleep Quality</label>
              <select 
                value={sleepQuality}
                onChange={(e) => setSleepQuality(e.target.value)}
                className="w-full bg-[#1B1B1B] border border-[#222] rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#FFC400]"
              >
                <option value="EXCELLENT">Excellent (Restful & Uninterrupted)</option>
                <option value="GOOD">Good (Typical & Mostly Restful)</option>
                <option value="FAIR">Fair (Slightly Disrupted)</option>
                <option value="POOR">Poor (Tossing & Turning)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Hydration Level</label>
              <select 
                value={hydrationLevel}
                onChange={(e) => setHydrationLevel(e.target.value)}
                className="w-full bg-[#1B1B1B] border border-[#222] rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#FFC400]"
              >
                <option value="HIGH">High (Sufficient water throughout day)</option>
                <option value="MEDIUM">Medium (Moderate water intake)</option>
                <option value="LOW">Low (Feeling dry / dehydrated)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Muscle Soreness</label>
              <select 
                value={sorenessLevel}
                onChange={(e) => setSorenessLevel(e.target.value)}
                className="w-full bg-[#1B1B1B] border border-[#222] rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#FFC400]"
              >
                <option value="NONE">None (Fully fresh muscles)</option>
                <option value="LIGHT">Light (Slight stiffness / mild soreness)</option>
                <option value="HEAVY">Heavy (Intense DOMS / fatigued)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Stress Level</label>
              <select 
                value={stressLevel}
                onChange={(e) => setStressLevel(e.target.value)}
                className="w-full bg-[#1B1B1B] border border-[#222] rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#FFC400]"
              >
                <option value="LOW">Low (Relaxed & focused)</option>
                <option value="MEDIUM">Medium (Normal daily pressure)</option>
                <option value="HIGH">High (Anxious / overwhelmed)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Energy level</label>
              <select 
                value={energyLevel}
                onChange={(e) => setEnergyLevel(e.target.value)}
                className="w-full bg-[#1B1B1B] border border-[#222] rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#FFC400]"
              >
                <option value="HIGH">High (Full of power / ready to lift)</option>
                <option value="MEDIUM">Medium (Normal / steady)</option>
                <option value="LOW">Low (Sluggish / tired)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Previous Workout Load</label>
              <select 
                value={previousWorkoutLoad}
                onChange={(e) => setPreviousWorkoutLoad(e.target.value)}
                className="w-full bg-[#1B1B1B] border border-[#222] rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#FFC400]"
              >
                <option value="LIGHT">Light (Easy recovery session)</option>
                <option value="MODERATE">Moderate (Standard hypertrophy / strength)</option>
                <option value="INTENSE">Intense (Heavy lifting / high volume)</option>
              </select>
            </div>

            <Button 
              type="submit" 
              isLoading={loading} 
              className="w-full bg-[#FFC400] text-black hover:bg-[#e0ad00] font-bold rounded-xl py-3 mt-4 text-xs shadow-lg shadow-[#FFC400]/10"
            >
              Analyze Recovery
            </Button>
          </form>
        </Card>
      )}
    </div>
  );
}
