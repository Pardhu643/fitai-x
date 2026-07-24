import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { workoutPlanService } from '../../services/workout-plan.service';
import { useNotificationStore } from '../../store/notificationStore';
import { Card } from '../../components/ui/Card';
import { Loader } from '../../components/ui/Loader';
import { ArrowLeft, Diff } from 'lucide-react';

export function VersionComparisonPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const addNotification = useNotificationStore((state) => state.addNotification);
  const [loading, setLoading] = useState(true);

  const [currentPlan, setCurrentPlan] = useState<any>(null);
  const [comparedSnapshot, setComparedSnapshot] = useState<any>(null);
  
  const v1 = parseInt(searchParams.get('v1') || '1', 10);

  useEffect(() => {
    loadComparison();
  }, [v1]);

  const loadComparison = async () => {
    try {
      const activePlan = await workoutPlanService.getCurrentPlan();
      setCurrentPlan(activePlan.data);

      const data = await workoutPlanService.getVersionSnapshot(activePlan.data.id, v1);
      setComparedSnapshot(data.data.snapshot);
    } catch (err) {
      addNotification('error', 'Failed to load version snapshots');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <button onClick={() => navigate('/workouts/history')} className="flex items-center text-primary-600 hover:text-primary-700 font-medium mb-6">
          <ArrowLeft size={16} className="mr-1" />
          Back to History
        </button>

        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <Diff size={28} />
          Version Comparison
        </h1>
        <p className="text-gray-600 mb-8">Comparing Version v{v1} snapshot with Current Version v{currentPlan.version}</p>

        <div className="grid md:grid-cols-2 gap-8">
          
          {/* Version Snapshot Column */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-800 bg-gray-200 px-3 py-1.5 rounded-lg text-center">Version v{v1}</h2>
            {comparedSnapshot?.workoutDays?.map((day: any) => (
              <Card key={day.dayNumber} variant="bordered" className="opacity-90">
                <h3 className="font-bold text-gray-900 text-lg border-b pb-2 mb-3">{day.title || day.name} ({day.estimatedDuration}m)</h3>
                <div className="space-y-2">
                  {day.workoutExercises?.map((we: any, idx: number) => (
                    <div key={idx} className="text-sm border-b pb-1.5 last:border-0">
                      <div className="font-semibold text-gray-800">{we.exerciseName}</div>
                      <div className="text-xs text-gray-500">{we.setsCount} sets x {we.repsMax} reps ({we.restSeconds}s rest)</div>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>

          {/* Current Version Column */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white bg-primary-600 px-3 py-1.5 rounded-lg text-center">Current Version (v{currentPlan.version})</h2>
            {currentPlan?.workoutDays?.map((day: any) => (
              <Card key={day.id} variant="bordered" className="border-primary-100 shadow-sm">
                <h3 className="font-bold text-primary-700 text-lg border-b pb-2 mb-3">{day.title || day.name} ({day.estimatedDuration || day.durationMinutes}m)</h3>
                <div className="space-y-2">
                  {day.workoutExercises?.map((we: any, idx: number) => (
                    <div key={idx} className="text-sm border-b pb-1.5 last:border-0">
                      <div className="font-semibold text-gray-800">{we.exercise.name}</div>
                      <div className="text-xs text-gray-500">{we.setsCount} sets x {we.repsMax} reps ({we.restSeconds}s rest)</div>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
