import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { workoutPlanService } from '../../services/workout-plan.service';
import { useNotificationStore } from '../../store/notificationStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Loader } from '../../components/ui/Loader';
import { EmptyState } from '../../components/ui/EmptyState';
import { Calendar, RefreshCw, History, Info, Sparkles, ChevronRight } from 'lucide-react';

export function CurrentPlanPage() {
  const navigate = useNavigate();
  const addNotification = useNotificationStore((state) => state.addNotification);
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<any>(null);

  useEffect(() => {
    loadPlan();
  }, []);

  const loadPlan = async () => {
    try {
      const data = await workoutPlanService.getCurrentPlan();
      setPlan(data.data);
    } catch (err) {
      addNotification('error', 'Failed to load current workout plan');
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async () => {
    setLoading(true);
    try {
      const data = await workoutPlanService.generatePlan();
      setPlan(data.data);
      addNotification('success', 'Plan regenerated & adapted to latest conditions!');
    } catch (err: any) {
      addNotification('error', err.response?.data?.message || 'Failed to regenerate plan');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090909] flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-[#090909] py-12 px-4 flex items-center justify-center">
        <div className="max-w-md w-full">
          <EmptyState
            title="No Active Workout Plan"
            description="You don't have an active workout plan. Let's generate a personalized workout plan adapted to your fitness level, goals, and metrics."
            action={{
              label: 'Generate Plan Now',
              onClick: () => navigate('/workouts/generate')
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#FFC400] tracking-widest uppercase">Active Workout Plan</span>
          <h1 className="text-3xl font-extrabold text-white mt-1">{plan.name}</h1>
          <p className="text-gray-400 text-sm mt-1">
            Goal: <span className="font-semibold text-white">{plan.goal.replace('_', ' ')}</span> • Version: <span className="font-semibold text-white">v{plan.version}</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate(`/workouts/explanations`)}
            className="border-[#1B1B1B] hover:bg-[#1B1B1B] text-gray-300 font-bold rounded-xl text-xs"
          >
            <Info size={14} className="mr-1.5" />
            Adaptations
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate(`/workouts/history`)}
            className="border-[#1B1B1B] hover:bg-[#1B1B1B] text-gray-300 font-bold rounded-xl text-xs"
          >
            <History size={14} className="mr-1.5" />
            History
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRegenerate}
            className="border-[#1B1B1B] hover:bg-[#1B1B1B] text-gray-300 font-bold rounded-xl text-xs"
          >
            <RefreshCw size={14} className="mr-1.5" />
            Regenerate
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Calendar className="text-[#FFC400]" size={22} />
            Weekly Schedule
          </h2>
          
          {plan.workoutDays.map((day: any) => (
            <Card key={day.id} variant="bordered" className="bg-[#151515] border-[#1B1B1B] hover:border-gray-700 transition-colors p-6 rounded-2xl">
              <div className="flex items-center justify-between border-b border-[#1B1B1B] pb-4 mb-4">
                <div>
                  <h3 className="font-bold text-lg text-white">{day.title || day.name}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Focus: {day.focus || 'Full Body'} • {day.estimatedDuration || day.durationMinutes} min</p>
                </div>
                <Button 
                  size="sm" 
                  onClick={() => navigate(`/workouts/day/${day.id}`)}
                  className="bg-[#FFC400] text-black hover:bg-[#e0ad00] font-bold rounded-xl px-4 py-2 flex items-center gap-1.5 text-xs"
                >
                  Exercises
                  <ChevronRight size={14} />
                </Button>
              </div>
              
              <div className="space-y-2">
                {day.workoutExercises && day.workoutExercises.length > 0 ? (
                  day.workoutExercises.map((we: any) => (
                    <div key={we.id} className="flex justify-between items-center text-xs p-3 bg-[#1B1B1B] border border-[#222] rounded-xl">
                      <div>
                        <span className="font-bold text-white">{we.exercise.name}</span>
                        <span className="text-[10px] text-gray-500 ml-2">({we.exercise.primaryMuscle})</span>
                      </div>
                      <div className="text-gray-400 font-semibold">
                        {we.setsCount} sets x {we.repsMax} reps @ {we.restSeconds}s
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-400 text-center py-2">No exercises assigned to this day.</p>
                )}
              </div>
            </Card>
          ))}
        </div>

        <div className="space-y-6">
          <Card variant="elevated" className="bg-[#1B1B1B] border border-[#2c2c2c] text-white p-6 rounded-2xl relative overflow-hidden group">
            <div className="absolute -top-12 -right-12 w-24 h-24 bg-[#7CFF4D]/5 rounded-full blur-xl group-hover:bg-[#7CFF4D]/10 transition-all duration-300"></div>
            <Sparkles className="mb-3 text-[#7CFF4D] animate-pulse" size={28} />
            <h3 className="font-bold text-lg mb-1.5">Feeling Recovered?</h3>
            <p className="text-xs text-gray-400 mb-4 leading-relaxed">
              Submit a daily recovery check-in to dynamically adjust sets, volume, and intensities for today's workout.
            </p>
            <Button 
              className="w-full bg-[#7CFF4D] text-black hover:bg-[#6be03e] font-bold rounded-xl py-2.5 text-xs" 
              onClick={() => navigate('/recovery')}
            >
              Recovery Check-In
            </Button>
          </Card>

          <Card variant="bordered" className="bg-[#151515] border-[#1B1B1B] p-6 rounded-2xl">
            <h3 className="font-bold text-white mb-4">Quick Overview</h3>
            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between border-b border-[#1B1B1B] pb-2.5">
                <span className="text-gray-400">Total days/week</span>
                <span className="text-white font-bold">{plan.daysPerWeek} days</span>
              </div>
              <div className="flex justify-between border-b border-[#1B1B1B] pb-2.5">
                <span className="text-gray-400">Workout Duration</span>
                <span className="text-white font-bold">{plan.durationMinutes} min</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Target Goal</span>
                <span className="text-[#FFC400] font-bold">{plan.goal.replace('_', ' ')}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
