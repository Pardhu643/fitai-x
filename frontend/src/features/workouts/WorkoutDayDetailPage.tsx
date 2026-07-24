import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { workoutPlanService } from '../../services/workout-plan.service';
import { useNotificationStore } from '../../store/notificationStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Loader } from '../../components/ui/Loader';
import { ArrowLeft, Play, Info } from 'lucide-react';

export function WorkoutDayDetailPage() {
  const { dayId } = useParams();
  const navigate = useNavigate();
  const addNotification = useNotificationStore((state) => state.addNotification);
  const [loading, setLoading] = useState(true);
  const [day, setDay] = useState<any>(null);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    loadDay();
  }, [dayId]);

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
