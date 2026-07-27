import { useEffect, useState } from 'react';
import { progressService } from '../../services/progress.service';
import { coachService } from '../../services/coach.service';
import { Card } from '../../components/ui/Card';
import { TrendingUp, Activity, Target, Calendar, Loader2, Bot, Send, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { LineChart as RechartsLineChart, BarChart as RechartsBarChart, XAxis as RechartsXAxis, YAxis as RechartsYAxis, CartesianGrid as RechartsCartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer as RechartsResponsiveContainer, Line as RechartsLine, Bar as RechartsBar } from 'recharts';

export function ProgressPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [aiMessage, setAiMessage] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const fetchProgress = async () => {
    try {
      const progressData = await progressService.getProgress();
      setData(progressData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAiQuestion = async () => {
    if (!aiMessage.trim() || aiLoading) return;
    setAiLoading(true);
    setAiResponse('');

    try {
      const res = await coachService.chat(aiMessage, []);
      if (res.data?.reply) {
        setAiResponse(res.data.reply);
      }
    } catch (err) {
      console.error('AI question failed:', err);
      setAiResponse('Sorry, I couldn\'t process your question right now.');
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="animate-spin text-[#FFC400]" size={36} />
        <p className="text-gray-400 text-sm">Loading your progress data...</p>
      </div>
    );
  }

  const { summary, workoutHistory, goals, bodyMeasurements } = data || {};

  // Prepare chart data
  const weightData = bodyMeasurements?.map((m: any) => ({
    date: format(new Date(m.measuredAt), 'MMM d'),
    weight: m.weightKg
  })) || [];

  const workoutData = workoutHistory?.slice(-7).map((w: any) => ({
    date: format(new Date(w.completedAt), 'EEE'),
    duration: w.durationMinutes,
    calories: w.caloriesBurned || 0
  })) || [];

  const hasEnoughData = weightData.length >= 2 || workoutData.length >= 2;

  return (
    <div className="container-custom py-8 max-w-6xl">
      <div className="mb-8 flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-[#151B24] border border-white/5 flex items-center justify-center text-[#32D5F4]">
          <TrendingUp size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Progress Analytics</h1>
          <p className="text-sm text-[#A8B0BF]">Your fitness journey at a glance.</p>
        </div>
      </div>

      {!hasEnoughData && (
        <Card className="bg-[#10151D] border-white/5 p-8 mb-8 text-center">
          <Activity className="text-[#FFC400] mx-auto mb-4" size={48} />
          <h3 className="text-lg font-bold text-white mb-2">Complete more workouts to unlock your progress insights</h3>
          <p className="text-[#A8B0BF] text-sm">Log at least 2 workouts or measurements to see your analytics.</p>
        </Card>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-[#10151D] border-white/5 p-6">
          <div className="flex items-center gap-3 mb-2">
            <Activity className="text-[#FFC400]" size={20} />
            <span className="text-sm text-[#A8B0BF]">Total Workouts</span>
          </div>
          <p className="text-3xl font-bold text-white">{summary?.totalWorkouts || 0}</p>
        </Card>
        <Card className="bg-[#10151D] border-white/5 p-6">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="text-[#32D5F4]" size={20} />
            <span className="text-sm text-[#A8B0BF]">Total Minutes</span>
          </div>
          <p className="text-3xl font-bold text-white">{summary?.totalMinutes || 0}</p>
        </Card>
        <Card className="bg-[#10151D] border-white/5 p-6">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="text-[#FF5E5E]" size={20} />
            <span className="text-sm text-[#A8B0BF]">Calories Burned</span>
          </div>
          <p className="text-3xl font-bold text-white">{summary?.totalCalories || 0}</p>
        </Card>
        <Card className="bg-[#10151D] border-white/5 p-6">
          <div className="flex items-center gap-3 mb-2">
            <Target className="text-[#4ADE80]" size={20} />
            <span className="text-sm text-[#A8B0BF]">Avg Rating</span>
          </div>
          <p className="text-3xl font-bold text-white">{summary?.avgRating ? summary.avgRating.toFixed(1) : 'N/A'}</p>
        </Card>
      </div>

      {/* Charts Section */}
      {hasEnoughData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Weight Trend Chart */}
          {weightData.length >= 2 && (
            <Card className="bg-[#10151D] border-white/5 p-6">
              <h3 className="text-lg font-bold text-white mb-4">Weight Trend</h3>
              <RechartsResponsiveContainer width="100%" height={200}>
                <RechartsLineChart data={weightData}>
                  <RechartsCartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                  <RechartsXAxis dataKey="date" stroke="#A8B0BF" fontSize={12} />
                  <RechartsYAxis stroke="#A8B0BF" fontSize={12} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#151B24', border: '1px solid #ffffff10', borderRadius: '8px' }}
                    itemStyle={{ color: '#ffffff' }}
                  />
                  <RechartsLine type="monotone" dataKey="weight" stroke="#FFC400" strokeWidth={2} dot={{ fill: '#FFC400' }} />
                </RechartsLineChart>
              </RechartsResponsiveContainer>
            </Card>
          )}

          {/* Workout Consistency Chart */}
          {workoutData.length >= 2 && (
            <Card className="bg-[#10151D] border-white/5 p-6">
              <h3 className="text-lg font-bold text-white mb-4">Weekly Workout Activity</h3>
              <RechartsResponsiveContainer width="100%" height={200}>
                <RechartsBarChart data={workoutData}>
                  <RechartsCartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                  <RechartsXAxis dataKey="date" stroke="#A8B0BF" fontSize={12} />
                  <RechartsYAxis stroke="#A8B0BF" fontSize={12} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#151B24', border: '1px solid #ffffff10', borderRadius: '8px' }}
                    itemStyle={{ color: '#ffffff' }}
                  />
                  <RechartsBar dataKey="duration" fill="#32D5F4" radius={[4, 4, 0, 0]} />
                </RechartsBarChart>
              </RechartsResponsiveContainer>
            </Card>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Latest Body Measurement */}
        <Card className="bg-[#10151D] border-white/5 p-6">
          <h3 className="text-lg font-bold text-white mb-4">Latest Measurements</h3>
          {summary?.latestMeasurement ? (
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-[#A8B0BF]">Weight</span>
                <span className="text-white font-bold">{summary.latestMeasurement.weightKg} kg</span>
              </div>
              {summary.latestMeasurement.bodyFatPercent && (
                <div className="flex justify-between">
                  <span className="text-[#A8B0BF]">Body Fat</span>
                  <span className="text-white font-bold">{summary.latestMeasurement.bodyFatPercent}%</span>
                </div>
              )}
              {summary.latestMeasurement.waistCm && (
                <div className="flex justify-between">
                  <span className="text-[#A8B0BF]">Waist</span>
                  <span className="text-white font-bold">{summary.latestMeasurement.waistCm} cm</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-[#A8B0BF]">Measured</span>
                <span className="text-white font-bold">
                  {format(new Date(summary.latestMeasurement.measuredAt), 'MMM d, yyyy')}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-[#A8B0BF] text-sm">No measurements recorded yet.</p>
          )}
        </Card>

        {/* Goals Progress */}
        <Card className="bg-[#10151D] border-white/5 p-6">
          <h3 className="text-lg font-bold text-white mb-4">Active Goals</h3>
          {goals && goals.length > 0 ? (
            <div className="space-y-3">
              {goals.map((goal: any) => (
                <div key={goal.id} className={`p-3 rounded-lg ${goal.isAchieved ? 'bg-green-500/10' : 'bg-[#151B24]'}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      {goal.targetWeightKg && (
                        <p className="text-white text-sm">Target: {goal.targetWeightKg} kg</p>
                      )}
                      {goal.targetBodyFat && (
                        <p className="text-white text-sm">Body Fat: {goal.targetBodyFat}%</p>
                      )}
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${goal.isAchieved ? 'bg-green-500 text-white' : 'bg-[#FFC400]/20 text-[#FFC400]'}`}>
                      {goal.isAchieved ? 'Achieved' : 'In Progress'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[#A8B0BF] text-sm">No goals set yet.</p>
          )}
        </Card>
      </div>

      {/* AI Progress Assistant */}
      <Card className="bg-[#10151D] border-white/5 p-6 mt-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-[#FFC400]/10 flex items-center justify-center">
            <Bot className="text-[#FFC400]" size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">AI Progress Assistant</h3>
            <p className="text-xs text-[#A8B0BF]">Ask about your progress and get personalized insights</p>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2 mb-3">
            <button 
              onClick={() => { setAiMessage('Why has my progress slowed down?'); handleAiQuestion(); }}
              disabled={aiLoading}
              className="bg-[#171D26] hover:bg-white/5 border border-white/5 px-3 py-1.5 rounded-full text-xs text-white transition disabled:opacity-50"
            >
              Why has my progress slowed down?
            </button>
            <button 
              onClick={() => { setAiMessage('How can I improve my workout consistency?'); handleAiQuestion(); }}
              disabled={aiLoading}
              className="bg-[#171D26] hover:bg-white/5 border border-white/5 px-3 py-1.5 rounded-full text-xs text-white transition disabled:opacity-50"
            >
              Improve workout consistency?
            </button>
            <button 
              onClick={() => { setAiMessage('What should I focus on this week?'); handleAiQuestion(); }}
              disabled={aiLoading}
              className="bg-[#171D26] hover:bg-white/5 border border-white/5 px-3 py-1.5 rounded-full text-xs text-white transition disabled:opacity-50"
            >
              Focus on this week?
            </button>
          </div>
          
          <div className="flex gap-2 items-center bg-[#151B24] rounded-lg p-2 border border-white/5">
            <input 
              type="text" 
              value={aiMessage}
              onChange={e => setAiMessage(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAiQuestion()}
              placeholder="Ask about your progress..."
              className="flex-1 bg-transparent border-none focus:outline-none text-white px-2 placeholder-[#A8B0BF] text-sm disabled:opacity-50"
              disabled={aiLoading}
            />
            <button 
              onClick={handleAiQuestion}
              disabled={!aiMessage.trim() || aiLoading}
              className="bg-[#FFC400] text-black p-2 rounded-lg disabled:opacity-50 hover:bg-[#FFD43B] transition-colors"
            >
              <Send size={16} />
            </button>
          </div>
          
          {aiResponse && (
            <div className="bg-[#151B24] p-4 rounded-lg border border-white/5">
              <div className="flex items-start gap-2">
                <Sparkles className="text-[#FFC400] mt-0.5" size={16} />
                <p className="text-sm text-white whitespace-pre-wrap">{aiResponse}</p>
              </div>
            </div>
          )}
          
          {aiLoading && (
            <div className="flex items-center gap-2 text-[#A8B0BF] text-sm">
              <Loader2 className="animate-spin" size={16} />
              Analyzing your progress...
            </div>
          )}
        </div>
      </Card>

      {/* Recent Workout History */}
      <Card className="bg-[#10151D] border-white/5 p-6 mt-6">
        <h3 className="text-lg font-bold text-white mb-4">Recent Workouts</h3>
        {workoutHistory && workoutHistory.length > 0 ? (
          <div className="space-y-3">
            {workoutHistory.map((workout: any) => (
              <div key={workout.id} className="flex items-center justify-between p-3 bg-[#151B24] rounded-lg">
                <div>
                  <p className="text-white text-sm font-bold">
                    {format(new Date(workout.completedAt), 'MMM d, yyyy')}
                  </p>
                  <p className="text-[#A8B0BF] text-xs">{workout.durationMinutes} minutes</p>
                </div>
                <div className="text-right">
                  {workout.caloriesBurned && (
                    <p className="text-[#FFC400] text-sm font-bold">{workout.caloriesBurned} cal</p>
                  )}
                  {workout.rating && (
                    <p className="text-white text-xs">Rating: {workout.rating}/5</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[#A8B0BF] text-sm">No workout history yet.</p>
        )}
      </Card>
    </div>
  );
}
