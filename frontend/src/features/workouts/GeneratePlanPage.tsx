import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { workoutPlanService } from '../../services/workout-plan.service';
import { useNotificationStore } from '../../store/notificationStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Loader } from '../../components/ui/Loader';
import { Dumbbell, Info } from 'lucide-react';

export function GeneratePlanPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const addNotification = useNotificationStore((state) => state.addNotification);
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await workoutPlanService.generatePlan();
      addNotification('success', 'Workout plan generated successfully!');
      navigate('/workouts/current');
    } catch (err: any) {
      addNotification('error', err.response?.data?.message || 'Failed to generate plan. Ensure onboarding is completed.');
    } finally {
      setGenerating(false);
    }
  };

  if (generating) {
    return (
      <div className="min-h-screen bg-[#090909] flex flex-col items-center justify-center p-4">
        <Loader size="lg" />
        <h2 className="text-xl font-bold text-white mt-6">Generating Your Custom Plan...</h2>
        <p className="text-gray-400 mt-2 text-center max-w-sm text-xs leading-relaxed">
          FitAI X is building your split, filtering exercises for equipment constraints, and adjusting for your injury history and recovery score.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 max-w-xl mx-auto">
      <div className="text-center">
        <Dumbbell className="text-[#FFC400] mx-auto mb-3" size={44} />
        <h1 className="text-3xl font-extrabold text-white">Generate Your Workout Plan</h1>
        <p className="text-gray-400 text-xs mt-1.5">Get a personalized plan based on your onboarding profile</p>
      </div>

      <Card variant="elevated" className="bg-[#151515] border border-[#1B1B1B] p-6 rounded-2xl space-y-6">
        <h2 className="text-lg font-bold text-white border-b border-[#1B1B1B] pb-3">Review Your Metrics</h2>
        
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="bg-[#1B1B1B] border border-[#222] p-4 rounded-xl">
            <span className="text-gray-500 block font-semibold mb-0.5">Goal</span>
            <span className="font-bold text-white text-sm">{user?.primaryGoal?.replace('_', ' ') || 'Not Set'}</span>
          </div>
          <div className="bg-[#1B1B1B] border border-[#222] p-4 rounded-xl">
            <span className="text-gray-500 block font-semibold mb-0.5">Fitness Level</span>
            <span className="font-bold text-white text-sm">{user?.fitnessLevel || 'Not Set'}</span>
          </div>
          <div className="bg-[#1B1B1B] border border-[#222] p-4 rounded-xl">
            <span className="text-gray-500 block font-semibold mb-0.5">Height</span>
            <span className="font-bold text-white text-sm">{user?.heightCm ? `${user.heightCm} cm` : 'Not Set'}</span>
          </div>
          <div className="bg-[#1B1B1B] border border-[#222] p-4 rounded-xl">
            <span className="text-gray-500 block font-semibold mb-0.5">Weight</span>
            <span className="font-bold text-white text-sm">{user?.weightKg ? `${user.weightKg} kg` : 'Not Set'}</span>
          </div>
        </div>

        <div className="bg-[#FFC400]/5 border border-[#FFC400]/10 p-4 rounded-xl flex gap-3 text-xs text-gray-300">
          <Info size={20} className="text-[#FFC400] shrink-0" />
          <div>
            <p className="font-bold text-white">Need to update your stats?</p>
            <p className="mt-0.5 text-gray-400">You can adjust these settings anytime in your Profile/Settings page before generating.</p>
          </div>
        </div>

        <Button 
          onClick={handleGenerate} 
          className="w-full bg-[#FFC400] text-black hover:bg-[#e0ad00] font-bold rounded-xl py-3 text-xs shadow-lg shadow-[#FFC400]/10"
        >
          Build My Workout Plan
        </Button>
      </Card>
    </div>
  );
}
