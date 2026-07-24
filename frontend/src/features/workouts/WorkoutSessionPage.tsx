import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { workoutPlanService } from '../../services/workout-plan.service';
import { useNotificationStore } from '../../store/notificationStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Loader } from '../../components/ui/Loader';
import { Check, Clock } from 'lucide-react';

export function WorkoutSessionPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const addNotification = useNotificationStore((state) => state.addNotification);
  
  const [loading, setLoading] = useState(true);
  const [day, setDay] = useState<any>(null);
  const [timer, setTimer] = useState(0);

  // Set completion mapping state
  const [completedSets, setCompletedSets] = useState<Record<string, boolean>>({});

  // Completion Form
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [difficulty, setDifficulty] = useState(5);
  const [notes, setNotes] = useState('');
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    loadSession();
    const interval = setInterval(() => {
      setTimer((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [sessionId]);

  const loadSession = async () => {
    try {
      const activePlan = await workoutPlanService.getCurrentPlan();
      // Load exercises from current active plan days (or fetch day directly)
      const currentDay = activePlan.data?.workoutDays?.[0];
      setDay(currentDay);
    } catch (err) {
      addNotification('error', 'Failed to load session details');
    } finally {
      setLoading(false);
    }
  };

  const toggleSet = (exerciseId: string, setIndex: number) => {
    const key = `${exerciseId}-${setIndex}`;
    setCompletedSets((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleCompleteWorkout = async () => {
    if (!sessionId) return;
    setCompleting(true);
    try {
      const durationMin = Math.round(timer / 60);
      await workoutPlanService.completeWorkoutSession(sessionId, {
        perceivedDifficulty: difficulty,
        notes,
        durationMinutes: durationMin > 0 ? durationMin : 1,
      });
      addNotification('success', 'Congratulations! Workout completed and logged!');
      navigate('/dashboard');
    } catch (err) {
      addNotification('error', 'Failed to save workout session');
    } finally {
      setCompleting(false);
      setShowCompletionModal(false);
    }
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090909] flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 max-w-xl mx-auto">
      {/* Header and Timer */}
      <div className="flex justify-between items-center bg-[#151515] p-5 rounded-2xl border border-[#1B1B1B] sticky top-0 z-10 shadow-lg">
        <div>
          <span className="text-[10px] font-bold text-[#FFC400] tracking-wider uppercase">Active Session</span>
          <h1 className="font-extrabold text-white text-lg mt-0.5">{day?.title || 'Workout'}</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-mono text-lg font-bold text-[#FFC400] flex items-center gap-1.5 bg-[#1B1B1B] px-3 py-1.5 rounded-xl border border-[#222]">
            <Clock size={16} />
            {formatTime(timer)}
          </span>
          <Button 
            onClick={() => setShowCompletionModal(true)}
            className="bg-[#FFC400] text-black hover:bg-[#e0ad00] font-bold rounded-xl px-4 py-2 text-xs"
          >
            Finish
          </Button>
        </div>
      </div>

      {/* Exercises list */}
      <div className="space-y-4">
        {day?.workoutExercises?.map((we: any, weIdx: number) => (
          <Card key={we.id} variant="bordered" className="bg-[#151515] border-[#1B1B1B] p-5 space-y-4 rounded-2xl">
            <div>
              <h3 className="font-bold text-white text-sm">{weIdx + 1}. {we.exercise.name}</h3>
              <p className="text-[11px] text-gray-500 mt-0.5">{we.restSeconds}s rest • Tempo: {we.tempo || '2-0-2-0'}</p>
            </div>

            <div className="space-y-2">
              <div className="grid grid-cols-4 text-[10px] font-bold text-gray-500 pb-1 border-b border-[#1B1B1B]">
                <span>SET</span>
                <span>KG</span>
                <span>REPS</span>
                <span className="text-right">DONE</span>
              </div>

              {Array.from({ length: we.setsCount }).map((_, sIdx) => {
                const isDone = !!completedSets[`${we.id}-${sIdx}`];
                return (
                  <div key={sIdx} className={`grid grid-cols-4 items-center py-1.5 text-xs rounded-lg transition-colors ${isDone ? 'bg-[#7CFF4D]/5' : ''}`}>
                    <span className="font-semibold text-gray-400">Set {sIdx + 1}</span>
                    <input 
                      type="number" 
                      defaultValue={we.targetWeight || 15} 
                      className="w-16 bg-[#1B1B1B] border border-[#222] rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-[#FFC400]" 
                    />
                    <input 
                      type="number" 
                      defaultValue={we.repsMax || 12} 
                      className="w-16 bg-[#1B1B1B] border border-[#222] rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-[#FFC400]" 
                    />
                    <div className="flex justify-end pr-1">
                      <button 
                        onClick={() => toggleSet(we.id, sIdx)}
                        className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all ${
                          isDone 
                            ? 'bg-[#7CFF4D] border-[#7CFF4D] text-black' 
                            : 'border-gray-700 text-transparent hover:border-gray-500'
                        }`}
                      >
                        <Check size={12} className="stroke-[3]" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        ))}
      </div>

      {/* Completion Modal */}
      {showCompletionModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <Card variant="elevated" className="bg-[#151515] border border-[#1B1B1B] max-w-md w-full p-6 space-y-6 rounded-2xl">
            <h2 className="text-xl font-bold text-white text-center">Complete Workout! 🎉</h2>
            <p className="text-xs text-gray-400 text-center leading-relaxed">
              Awesome work! Rate how difficult this workout session was for you:
            </p>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Perceived Difficulty (1-10)</label>
              <div className="flex items-center gap-3 bg-[#1B1B1B] border border-[#222] p-4 rounded-xl">
                <input 
                  type="range" 
                  min="1" 
                  max="10" 
                  value={difficulty} 
                  onChange={(e) => setDifficulty(parseInt(e.target.value))} 
                  className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#FFC400]"
                />
                <span className="font-extrabold text-lg text-[#FFC400] w-6 text-center">{difficulty}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Workout Notes</label>
              <textarea 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g., Felt strong on squats today."
                className="w-full bg-[#1B1B1B] border border-[#222] rounded-xl p-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#FFC400] h-24 resize-none"
              />
            </div>

            <div className="flex gap-4">
              <Button 
                variant="outline" 
                className="flex-1 border-[#1B1B1B] hover:bg-[#1B1B1B] text-gray-300 font-bold rounded-xl" 
                onClick={() => setShowCompletionModal(false)}
              >
                Go Back
              </Button>
              <Button 
                className="flex-1 bg-[#FFC400] text-black hover:bg-[#e0ad00] font-bold rounded-xl" 
                onClick={handleCompleteWorkout} 
                isLoading={completing}
              >
                Submit Logs
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
