import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { workoutPlanService } from '../../services/workout-plan.service';
import { recommendationsService } from '../../services/recommendations.service';
import { useNotificationStore } from '../../store/notificationStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Loader } from '../../components/ui/Loader';
import { ArrowLeft, Play, Info, Activity, Check, X } from 'lucide-react';

export function WorkoutDayDetailPage() {
  const { dayId } = useParams();
  const navigate = useNavigate();
  const addNotification = useNotificationStore((state) => state.addNotification);
  const [loading, setLoading] = useState(true);
  const [day, setDay] = useState<any>(null);
  const [starting, setStarting] = useState(false);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [applyingRec, setApplyingRec] = useState<string | null>(null);
  const [dismissingRec, setDismissingRec] = useState<string | null>(null);

  useEffect(() => {
    loadDay();
    loadRecommendations();
  }, [dayId]);

  const loadRecommendations = async () => {
    try {
      const data = await recommendationsService.getPendingRecommendations();
      setRecommendations(data.data || []);
    } catch (err) {
      // Silently fail - recommendations are optional
    }
  };

  const loadDay = async () => {
    try {
      const activePlan = await workoutPlanService.getCurrentPlan();
      const currentDay = activePlan.data?.workoutDays?.find((d: any) => d.id === dayId);
      if (!currentDay) {
        throw new Error('Day not found');
      }
      setDay(currentDay);
    } catch (err) {
      addNotification('error', 'Failed to load day details');
    } finally {
      setLoading(false);
    }
  };

  const handleStartWorkout = async () => {
    if (!dayId) return;
    setStarting(true);
    try {
      const data = await workoutPlanService.startWorkoutSession(dayId);
      addNotification('success', 'Workout session started! Let\'s go!');
      navigate(`/workouts/session/${data.data.id}`);
    } catch (err) {
      addNotification('error', 'Failed to start workout session');
    } finally {
      setStarting(false);
    }
  };

  const handleApplyRecommendation = async (recId: string) => {
    setApplyingRec(recId);
    try {
      await recommendationsService.applyRecommendation(recId);
      addNotification('success', 'Recommendation applied successfully');
      loadRecommendations();
    } catch (err) {
      addNotification('error', 'Failed to apply recommendation');
    } finally {
      setApplyingRec(null);
    }
  };

  const handleDismissRecommendation = async (recId: string) => {
    setDismissingRec(recId);
    try {
      await recommendationsService.dismissRecommendation(recId);
      addNotification('success', 'Recommendation dismissed');
      loadRecommendations();
    } catch (err) {
      addNotification('error', 'Failed to dismiss recommendation');
    } finally {
      setDismissingRec(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090909] flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <button 
        onClick={() => navigate('/workouts/current')} 
        className="flex items-center text-[#FFC400] hover:text-[#e0ad00] font-bold text-sm"
      >
        <ArrowLeft size={16} className="mr-1.5" />
        Back to Current Plan
      </button>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs font-bold text-[#FFC400] tracking-widest uppercase">Workout Routine</span>
          <h1 className="text-3xl font-extrabold text-white mt-1">{day.title || day.name}</h1>
          <p className="text-gray-400 text-sm mt-1">Focus: {day.focus || 'Full Body'} • {day.estimatedDuration || day.durationMinutes} minutes</p>
        </div>
        <Button 
          onClick={handleStartWorkout} 
          isLoading={starting}
          className="bg-[#FFC400] text-black hover:bg-[#e0ad00] font-bold rounded-xl px-6 py-3.5 flex items-center gap-2 text-sm shadow-lg shadow-[#FFC400]/10"
        >
          <Play size={18} fill="black" />
          Start Workout
        </Button>
      </div>

      <div className="space-y-6">
        {/* Recommendations Section */}
        {recommendations.length > 0 && (
          <Card variant="bordered" className="bg-[#151515] border-[#1B1B1B] p-6 rounded-2xl">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="text-[#FFC400]" size={20} />
              <h3 className="text-lg font-bold text-white">Recommendations</h3>
            </div>
            <div className="space-y-3">
              {recommendations.map((rec) => (
                <div key={rec.id} className="bg-[#10151D] border border-white/5 p-4 rounded-xl">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-bold text-white">{rec.title}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          rec.type === 'DELOAD' ? 'bg-[#FF5E5E]/20 text-[#FF5E5E]' :
                          rec.type === 'PROGRESSIVE_OVERLOAD' ? 'bg-[#7CFF4D]/20 text-[#7CFF4D]' :
                          'bg-[#FFC400]/20 text-[#FFC400]'
                        }`}>
                          {rec.type.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-[#A8B0BF] mb-2">{rec.description}</p>
                      {rec.explanation && (
                        <p className="text-xs text-gray-400 italic">{rec.explanation}</p>
                      )}
                      {rec.currentValues && rec.recommendedValues && (
                        <div className="mt-2 flex gap-4 text-xs">
                          <span className="text-gray-400">Current: <span className="text-white">{JSON.stringify(rec.currentValues)}</span></span>
                          <span className="text-gray-400">Recommended: <span className="text-[#7CFF4D]">{JSON.stringify(rec.recommendedValues)}</span></span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleApplyRecommendation(rec.id)}
                        disabled={applyingRec === rec.id || dismissingRec === rec.id}
                        isLoading={applyingRec === rec.id}
                        className="bg-[#7CFF4D] text-black hover:bg-[#6BE640] font-bold rounded-xl px-3 py-1.5 text-xs flex items-center gap-1"
                      >
                        <Check size={14} />
                        Apply
                      </Button>
                      <Button
                        onClick={() => handleDismissRecommendation(rec.id)}
                        disabled={applyingRec === rec.id || dismissingRec === rec.id}
                        isLoading={dismissingRec === rec.id}
                        variant="outline"
                        className="border-white/10 hover:bg-white/5 text-gray-300 font-bold rounded-xl px-3 py-1.5 text-xs flex items-center gap-1"
                      >
                        <X size={14} />
                        Dismiss
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {day.workoutExercises?.map((we: any, idx: number) => (
          <Card key={we.id} variant="bordered" className="bg-[#151515] border-[#1B1B1B] p-6 rounded-2xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-[#1B1B1B] pb-4 mb-4 gap-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-3">
                  <span className="bg-[#FFC400] text-black w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold">
                    {idx + 1}
                  </span>
                  {we.exercise.name}
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Primary: <span className="text-white font-medium">{we.exercise.primaryMuscle}</span> • Secondary: <span className="text-white font-medium">{we.exercise.secondaryMuscles?.join(', ') || 'None'}</span>
                </p>
              </div>
              <div className="text-left sm:text-right">
                <span className="bg-[#1B1B1B] border border-[#222] text-[#FFC400] text-xs px-3 py-1.5 rounded-xl font-bold">
                  {we.setsCount} Sets x {we.repsMax} Reps
                </span>
                <p className="text-[11px] text-gray-400 mt-2">{we.restSeconds}s rest • Tempo: {we.tempo || '2-0-2-0'}</p>
              </div>
            </div>

            {we.notes && (
              <div className="mb-4 bg-[#FFC400]/5 border border-[#FFC400]/10 text-gray-300 text-xs p-3.5 rounded-xl flex items-center gap-2">
                <Info size={16} className="text-[#FFC400]" />
                <span>{we.notes}</span>
              </div>
            )}

            <div className="space-y-2">
              <h4 className="font-bold text-white text-xs tracking-wide uppercase">Instructions:</h4>
              <ol className="list-decimal list-inside text-xs text-gray-400 space-y-1.5 leading-relaxed">
                {we.exercise.instructions?.map((inst: string, i: number) => (
                  <li key={i}>{inst}</li>
                ))}
              </ol>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
