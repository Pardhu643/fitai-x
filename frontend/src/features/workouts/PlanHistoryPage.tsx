import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { workoutPlanService } from '../../services/workout-plan.service';
import { useNotificationStore } from '../../store/notificationStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Loader } from '../../components/ui/Loader';
import { ArrowLeft, Clock, GitCommit } from 'lucide-react';

export function PlanHistoryPage() {
  const navigate = useNavigate();
  const addNotification = useNotificationStore((state) => state.addNotification);
  const [loading, setLoading] = useState(true);
  const [versions, setVersions] = useState<any[]>([]);
  const [planId, setPlanId] = useState<string>('');

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const activePlan = await workoutPlanService.getCurrentPlan();
      if (!activePlan.data) {
        setLoading(false);
        return;
      }
      setPlanId(activePlan.data.id);
      const data = await workoutPlanService.getVersions(activePlan.data.id);
      setVersions(data.data);
    } catch (err) {
      addNotification('error', 'Failed to load plan history');
    } finally {
      setLoading(false);
    }
  };

  const handleRollback = async (version: number) => {
    if (!window.confirm(`Are you sure you want to rollback to Version v${version}? This will create a new plan version.`)) return;
    setLoading(true);
    try {
      await workoutPlanService.rollback(planId, version);
      addNotification('success', `Successfully rolled back to version ${version}`);
      navigate('/workouts/current');
    } catch (err) {
      addNotification('error', 'Rollback failed');
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

  return (
    <div className="space-y-8 pb-12 max-w-xl mx-auto">
      <button 
        onClick={() => navigate('/workouts/current')} 
        className="flex items-center text-[#FFC400] hover:text-[#e0ad00] font-bold text-sm"
      >
        <ArrowLeft size={16} className="mr-1.5" />
        Back to Plan
      </button>

      <h1 className="text-3xl font-extrabold text-white">Plan Version History</h1>
      
      {versions.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No plan versions logged yet.</p>
      ) : (
        <div className="relative border-l border-[#1B1B1B] ml-4 space-y-6">
          {versions.map((ver) => (
            <div key={ver.id} className="mb-8 ml-6 relative">
              <span className="absolute -left-9 top-1.5 flex items-center justify-center w-6 h-6 bg-[#FFC400] rounded-full text-black">
                <GitCommit size={14} className="stroke-[3]" />
              </span>
              
              <Card variant="bordered" className="bg-[#151515] border-[#1B1B1B] p-5 shadow-sm space-y-4 rounded-2xl">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                  <div>
                    <h3 className="font-bold text-white text-base">Version v{ver.version}</h3>
                    <p className="text-[10px] text-gray-500 mt-1 flex items-center gap-1.5">
                      <Clock size={12} />
                      {new Date(ver.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => navigate(`/workouts/compare?v1=${ver.version}`)}
                      className="border-[#1B1B1B] hover:bg-[#1B1B1B] text-gray-300 font-bold rounded-xl text-xs"
                    >
                      Compare
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={() => handleRollback(ver.version)}
                      className="bg-[#FFC400] text-black hover:bg-[#e0ad00] font-bold rounded-xl text-xs"
                    >
                      Rollback
                    </Button>
                  </div>
                </div>

                {ver.changeReason && (
                  <div className="text-xs text-gray-400 bg-[#1B1B1B] border border-[#222] p-3 rounded-xl leading-relaxed">
                    <strong className="text-white">Reason: </strong>{ver.changeReason}
                  </div>
                )}
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
