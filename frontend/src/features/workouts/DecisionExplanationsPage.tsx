import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { workoutPlanService } from '../../services/workout-plan.service';
import { useNotificationStore } from '../../store/notificationStore';
import { Card } from '../../components/ui/Card';
import { Loader } from '../../components/ui/Loader';
import { ArrowLeft, Sparkles, AlertCircle } from 'lucide-react';

export function DecisionExplanationsPage() {
  const navigate = useNavigate();
  const addNotification = useNotificationStore((state) => state.addNotification);
  const [loading, setLoading] = useState(true);
  const [explanations, setExplanations] = useState<any[]>([]);

  useEffect(() => {
    loadExplanations();
  }, []);

  const loadExplanations = async () => {
    try {
      const activePlan = await workoutPlanService.getCurrentPlan();
      if (!activePlan.data) {
        setLoading(false);
        return;
      }
      const data = await workoutPlanService.getExplanations(activePlan.data.id);
      setExplanations(data.data);
    } catch (err) {
      addNotification('error', 'Failed to load explanations');
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
      <div className="max-w-2xl mx-auto">
        <button onClick={() => navigate('/workouts/current')} className="flex items-center text-primary-600 hover:text-primary-700 font-medium mb-6">
          <ArrowLeft size={16} className="mr-1" />
          Back to Current Plan
        </button>

        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <Sparkles className="text-yellow-500" />
          Plan Adaptations
        </h1>
        <p className="text-gray-600 mb-8">AI-driven & rule-based adjustments logged for your active plan.</p>

        {explanations.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border p-6">
            <AlertCircle className="mx-auto text-gray-400 mb-3" size={36} />
            <p className="text-gray-500">No adaptations logged for this plan yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {explanations.map((exp) => (
              <Card key={exp.id} variant="bordered" className="p-4 flex gap-4 items-start hover:border-yellow-300 transition-colors bg-yellow-50/20">
                <div className="bg-yellow-100 text-yellow-800 p-2 rounded-lg shrink-0">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">{exp.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{exp.explanation}</p>
                  <p className="text-xs text-gray-400 mt-2">Logged on {new Date(exp.createdAt).toLocaleString()}</p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
