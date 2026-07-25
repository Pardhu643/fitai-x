import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { recommendationsService } from '../../services/recommendations.service';
import { useNotificationStore } from '../../store/notificationStore';
import { Card } from '../../components/ui/Card';
import { Loader } from '../../components/ui/Loader';
import { ArrowLeft, Activity, Check, X, Calendar } from 'lucide-react';

export function RecommendationsPage() {
  const navigate = useNavigate();
  const addNotification = useNotificationStore((state) => state.addNotification);
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<any[]>([]);

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    try {
      const data = await recommendationsService.getAllRecommendations(50);
      setRecommendations(data.data || []);
    } catch (err) {
      addNotification('error', 'Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-[#FFC400]/20 text-[#FFC400]';
      case 'APPLIED': return 'bg-[#7CFF4D]/20 text-[#7CFF4D]';
      case 'DISMISSED': return 'bg-gray-500/20 text-gray-400';
      case 'EXPIRED': return 'bg-[#FF5E5E]/20 text-[#FF5E5E]';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'DELOAD': return 'bg-[#FF5E5E]/20 text-[#FF5E5E]';
      case 'PROGRESSIVE_OVERLOAD': return 'bg-[#7CFF4D]/20 text-[#7CFF4D]';
      case 'RECOVERY_DAY': return 'bg-[#32D5F4]/20 text-[#32D5F4]';
      default: return 'bg-[#FFC400]/20 text-[#FFC400]';
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
        onClick={() => navigate('/dashboard')} 
        className="flex items-center text-[#FFC400] hover:text-[#e0ad00] font-bold text-sm"
      >
        <ArrowLeft size={16} className="mr-1.5" />
        Back to Dashboard
      </button>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs font-bold text-[#FFC400] tracking-widest uppercase">Recommendations</span>
          <h1 className="text-3xl font-extrabold text-white mt-1">Your Training Recommendations</h1>
          <p className="text-gray-400 text-sm mt-1">History of progressive overload and deload suggestions</p>
        </div>
      </div>

      {recommendations.length === 0 ? (
        <Card variant="bordered" className="bg-[#151515] border-[#1B1B1B] p-12 rounded-2xl text-center">
          <Activity size={48} className="mx-auto mb-4 text-[#6F7887]" />
          <h3 className="text-lg font-bold text-white mb-2">No recommendations yet</h3>
          <p className="text-sm text-[#A8B0BF]">Recommendations will appear here as you train.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {recommendations.map((rec) => (
            <Card key={rec.id} variant="bordered" className="bg-[#151515] border-[#1B1B1B] p-6 rounded-2xl">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="text-sm font-bold text-white">{rec.title}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getTypeColor(rec.type)}`}>
                      {rec.type.replace('_', ' ')}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(rec.status)}`}>
                      {rec.status}
                    </span>
                  </div>
                  <p className="text-xs text-[#A8B0BF] mb-2">{rec.description}</p>
                  {rec.explanation && (
                    <p className="text-xs text-gray-400 italic mb-2">{rec.explanation}</p>
                  )}
                  {rec.currentValues && rec.recommendedValues && (
                    <div className="mb-2 flex flex-wrap gap-4 text-xs">
                      <span className="text-gray-400">Current: <span className="text-white">{JSON.stringify(rec.currentValues)}</span></span>
                      <span className="text-gray-400">Recommended: <span className="text-[#7CFF4D]">{JSON.stringify(rec.recommendedValues)}</span></span>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-4 text-xs text-gray-400 mt-2">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      Created: {new Date(rec.createdAt).toLocaleDateString()}
                    </span>
                    {rec.appliedAt && (
                      <span className="flex items-center gap-1">
                        <Check size={12} />
                        Applied: {new Date(rec.appliedAt).toLocaleDateString()}
                      </span>
                    )}
                    {rec.dismissedAt && (
                      <span className="flex items-center gap-1">
                        <X size={12} />
                        Dismissed: {new Date(rec.dismissedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <span className="text-xs text-gray-400 block">Confidence</span>
                    <span className="text-sm font-bold text-white">{Math.round(rec.confidence * 100)}%</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
