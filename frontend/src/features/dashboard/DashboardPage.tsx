import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dumbbell, Calendar, TrendingUp, Flame, Target, Play, Plus, Clock, Heart, Utensils, ShoppingCart, AlertTriangle, Zap, Shield, Activity } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatisticsCard } from '../../components/ui/StatisticsCard';
import { ProgressRing } from '../../components/ui/ProgressRing';
import { WeightChart } from '../../components/ui/WeightChart';
import { dashboardService } from '../../services/dashboard.service';
import { useAuthStore } from '../../store/authStore';
import { useNotificationStore } from '../../store/notificationStore';

export function DashboardPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const addNotification = useNotificationStore((state) => state.addNotification);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const data = await dashboardService.getDashboard();
      setDashboardData(data.data);
    } catch (error: any) {
      addNotification('error', 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080B10] flex items-center justify-center">
        <div className="text-[#A8B0BF] font-bold text-xs uppercase tracking-wider">Loading dashboard...</div>
      </div>
    );
  }

  const stats = dashboardData?.stats || {
    totalWorkouts: 0,
    currentStreak: 0,
    totalCaloriesBurned: 0,
    totalMinutes: 0,
    thisWeekWorkouts: 0,
    thisWeekCalories: 0,
    thisWeekMinutes: 0,
  };

  const todayWorkout = dashboardData?.todayWorkout;
  const recentActivity = dashboardData?.recentActivity || [];
  const upcomingWorkouts = dashboardData?.upcomingWorkouts || [];
  const weightProgress = dashboardData?.weightProgress || [];
  const currentGoal = dashboardData?.currentGoal;
  const fatigueSummary = dashboardData?.fatigueSummary;
  const injuryRiskSummary = dashboardData?.injuryRiskSummary;
  const recommendationSummary = dashboardData?.recommendationSummary;

  return (
    <div className="space-y-8 pb-12 bg-[#080B10]">
      {/* Header greetings */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-xs font-bold text-[#FFC400] tracking-widest uppercase">Overview</span>
          <h1 className="text-3xl font-extrabold text-white mt-1">
            Welcome back, {user?.name?.split(' ')[0] || 'User'}! 👋
          </h1>
          <p className="text-[#A8B0BF] text-sm mt-1">Here's your fitness overview for today.</p>
        </div>
      </div>

      {/* Grid statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatisticsCard
          icon={Dumbbell}
          label="Total Workouts"
          value={stats.totalWorkouts}
          change={`+${stats.thisWeekWorkouts} this week`}
          iconColor="text-black"
          bgColor="bg-[#FFC400]"
        />
        <StatisticsCard
          icon={Flame}
          label="Calories Burned"
          value={stats.totalCaloriesBurned}
          change={`+${stats.thisWeekCalories} this week`}
          iconColor="text-[#FF5E5E]"
          bgColor="bg-[#FF5E5E]/15"
        />
        <StatisticsCard
          icon={TrendingUp}
          label="Current Streak"
          value={`${stats.currentStreak} days`}
          iconColor="text-[#7CFF4D]"
          bgColor="bg-[#7CFF4D]/15"
        />
        <StatisticsCard
          icon={Calendar}
          label="Total Minutes"
          value={stats.totalMinutes}
          change={`+${stats.thisWeekMinutes} this week`}
          iconColor="text-[#32D5F4]"
          bgColor="bg-[#32D5F4]/15"
        />
      </div>

      {/* Nutrition summary widgets */}
      {dashboardData?.nutritionSummary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatisticsCard
            icon={Utensils}
            label="Calories Consumed"
            value={`${dashboardData.nutritionSummary.caloriesConsumed} / ${dashboardData.nutritionSummary.calorieTarget} kcal`}
            change={`${Math.round((dashboardData.nutritionSummary.caloriesConsumed / dashboardData.nutritionSummary.calorieTarget) * 100)}% of target`}
            iconColor="text-[#FFC400]"
            bgColor="bg-[#FFC400]/15"
          />
          <StatisticsCard
            icon={Flame}
            label="Protein Intake"
            value={`${dashboardData.nutritionSummary.proteinGramsConsumed} / ${dashboardData.nutritionSummary.proteinGramsTarget}g`}
            change="Target Muscle Protein"
            iconColor="text-[#FF4081]"
            bgColor="bg-[#FF4081]/15"
          />
          <StatisticsCard
            icon={Calendar}
            label="Next Scheduled Meal"
            value={dashboardData.nutritionSummary.nextMealTitle || 'No Meals Remaining'}
            change={dashboardData.nutritionSummary.nextMealTime || 'Done for today'}
            iconColor="text-[#00E5FF]"
            bgColor="bg-[#00E5FF]/15"
          />
          <StatisticsCard
            icon={ShoppingCart}
            label="Groceries Remaining"
            value={`${dashboardData.nutritionSummary.groceryItemsRemaining} items`}
            change="Active Shopping Checklist"
            iconColor="text-[#00E676]"
            bgColor="bg-[#00E676]/15"
          />
        </div>
      )}

      {/* Today's Workout & Recovery Score */}
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card variant="bordered" className="bg-[#10151D] border-white/5 h-full flex flex-col justify-between p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Dumbbell className="text-[#FFC400]" size={22} />
                Today's Workout
              </h2>
              {todayWorkout ? (
                <Button 
                  onClick={() => navigate(`/workouts/day/${todayWorkout.id}`)}
                  className="bg-[#FFC400] text-black hover:bg-[#FFD43B] font-bold rounded-xl px-4 py-2 flex items-center gap-2 text-xs"
                >
                  <Play size={14} fill="black" />
                  Start Workout
                </Button>
              ) : (
                <Button 
                  onClick={() => navigate('/workouts/generate')}
                  className="bg-[#FFC400] text-black hover:bg-[#FFD43B] font-bold rounded-xl px-4 py-2 flex items-center gap-2 text-xs animate-pulse"
                >
                  <Plus size={14} />
                  Generate Plan
                </Button>
              )}
            </div>
            {todayWorkout ? (
              <div className="bg-[#151B24] border border-white/5 rounded-2xl p-6 relative overflow-hidden group">
                <div className="absolute -right-16 -bottom-16 w-48 h-48 bg-[#FFC400]/5 rounded-full blur-2xl group-hover:bg-[#FFC400]/10 transition-all duration-300"></div>
                <h3 className="text-xl font-bold text-white mb-2">{todayWorkout.name}</h3>
                <div className="flex items-center gap-4 text-sm text-[#A8B0BF]">
                  <span className="flex items-center gap-1.5 bg-[#10151D] px-3 py-1.5 rounded-xl border border-white/5">
                    <Clock size={15} className="text-[#FFC400]" />
                    {todayWorkout.durationMinutes || 45} min
                  </span>
                  <span className="flex items-center gap-1.5 bg-[#10151D] px-3 py-1.5 rounded-xl border border-white/5">
                    <Dumbbell size={15} className="text-[#FFC400]" />
                    {todayWorkout.workoutExercises?.length || 6} exercises
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 bg-[#151B24] border border-white/5 rounded-2xl">
                <Dumbbell size={40} className="mx-auto mb-3 text-[#6F7887]" />
                <h4 className="text-sm font-bold text-white">No active plan scheduled</h4>
                <p className="text-xs text-[#A8B0BF] mt-1">Generate a dynamic plan customized for you.</p>
              </div>
            )}
          </Card>
        </div>

        <Card variant="bordered" className="bg-[#10151D] border-white/5 p-6 rounded-2xl flex flex-col justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Heart className="text-[#7CFF4D]" size={22} />
            Recovery Status
          </h2>
          <div className="flex flex-col items-center justify-center py-6">
            <ProgressRing progress={85} size={130} color="#7CFF4D" />
            <div className="text-center mt-4">
              <span className="text-lg font-bold text-white block">Ready to Train</span>
              <p className="text-xs text-[#A8B0BF] mt-0.5">Based on sleep, stress & activity</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Phase 7 Cards: Fatigue, Injury Risk, Recommendations */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Fatigue Card */}
        {fatigueSummary && (
          <Card variant="bordered" className="bg-[#10151D] border-white/5 p-6 rounded-2xl">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="text-[#FF5E5E]" size={20} />
              <h3 className="text-lg font-bold text-white">Fatigue Level</h3>
            </div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-3xl font-bold text-white">{fatigueSummary.score}</span>
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                fatigueSummary.level === 'LOW' ? 'bg-[#7CFF4D]/20 text-[#7CFF4D]' :
                fatigueSummary.level === 'MODERATE' ? 'bg-[#FFC400]/20 text-[#FFC400]' :
                fatigueSummary.level === 'HIGH' ? 'bg-[#FF5E5E]/20 text-[#FF5E5E]' :
                'bg-[#FF0000]/20 text-[#FF0000]'
              }`}>
                {fatigueSummary.level}
              </span>
            </div>
            <p className="text-xs text-[#A8B0BF] mt-2">{fatigueSummary.explanation}</p>
          </Card>
        )}

        {/* Injury Risk Card */}
        {injuryRiskSummary && (
          <Card variant="bordered" className="bg-[#10151D] border-white/5 p-6 rounded-2xl">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="text-[#FF5E5E]" size={20} />
              <h3 className="text-lg font-bold text-white">Injury Risk</h3>
            </div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-3xl font-bold text-white">{injuryRiskSummary.score}</span>
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                injuryRiskSummary.level === 'LOW' ? 'bg-[#7CFF4D]/20 text-[#7CFF4D]' :
                injuryRiskSummary.level === 'MODERATE' ? 'bg-[#FFC400]/20 text-[#FFC400]' :
                injuryRiskSummary.level === 'HIGH' ? 'bg-[#FF5E5E]/20 text-[#FF5E5E]' :
                'bg-[#FF0000]/20 text-[#FF0000]'
              }`}>
                {injuryRiskSummary.level}
              </span>
            </div>
            <p className="text-[10px] text-[#A8B0BF] mt-2 italic">{injuryRiskSummary.disclaimer}</p>
          </Card>
        )}

        {/* Recommendation Card */}
        {recommendationSummary && (
          <Card variant="bordered" className={`bg-[#10151D] p-6 rounded-2xl ${
            recommendationSummary.type === 'DELOAD' ? 'border-[#FF5E5E]/50' : 'border-white/5'
          }`}>
            <div className="flex items-center gap-2 mb-4">
              <Activity className={recommendationSummary.type === 'DELOAD' ? 'text-[#FF5E5E]' : 'text-[#FFC400]'} size={20} />
              <h3 className="text-lg font-bold text-white">Recommendation</h3>
            </div>
            <div className="mb-3">
              <span className="text-sm font-bold text-white block">{recommendationSummary.title}</span>
              <span className="text-xs text-[#A8B0BF] block mt-1">{recommendationSummary.description}</span>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <div className="flex-1 bg-[#151B24] rounded-full h-1.5">
                <div 
                  className="bg-[#FFC400] h-1.5 rounded-full" 
                  style={{ width: `${recommendationSummary.confidence * 100}%` }}
                ></div>
              </div>
              <span className="text-xs text-[#A8B0BF]">{Math.round(recommendationSummary.confidence * 100)}%</span>
            </div>
          </Card>
        )}

        {/* Deload Warning */}
        {recommendationSummary?.type === 'DELOAD' && (
          <Card variant="bordered" className="bg-[#FF5E5E]/10 border-[#FF5E5E]/30 p-6 rounded-2xl col-span-full sm:col-span-2 lg:col-span-3">
            <div className="flex items-center gap-3">
              <AlertTriangle className="text-[#FF5E5E]" size={24} />
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white">Deload Recommended</h3>
                <p className="text-sm text-[#A8B0BF] mt-1">{recommendationSummary.description}</p>
              </div>
              <Button 
                onClick={() => navigate('/recommendations')}
                variant="outline"
                className="border-[#FF5E5E]/50 text-[#FF5E5E] hover:bg-[#FF5E5E]/20 rounded-xl text-xs"
              >
                View Details
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* Weight Progress & Goals */}
      <div className="grid lg:grid-cols-2 gap-8">
        <Card variant="bordered" className="bg-[#10151D] border-white/5 p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Weight Progress</h2>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/settings')}
              className="border-white/5 hover:bg-[#151B24] text-gray-300 font-bold rounded-xl text-xs"
            >
              <Plus size={14} className="mr-1.5" />
              Update Profile
            </Button>
          </div>
          <div className="bg-[#151B24] border border-white/5 p-4 rounded-xl">
            {weightProgress?.length > 0 ? (
              <WeightChart data={weightProgress.map((wp: any) => ({
                date: new Date(wp.date).toLocaleDateString(),
                weight: wp.weightKg,
              }))} />
            ) : (
              <div className="text-center py-10 text-[#A8B0BF] text-xs font-bold uppercase">
                No logged weights found. Profile weight is currently set.
              </div>
            )}
          </div>
        </Card>

        <Card variant="bordered" className="bg-[#10151D] border-white/5 p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Target className="text-[#FFC400]" size={22} />
              Current Goal
            </h2>
            {currentGoal ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4 bg-[#151B24] border border-white/5 p-4 rounded-xl">
                  <div className="bg-[#FFC400]/10 p-2.5 rounded-xl border border-[#FFC400]/20">
                    <Target className="text-[#FFC400]" size={22} />
                  </div>
                  <div>
                    <span className="text-xs text-[#A8B0BF] block font-semibold">Target Weight</span>
                    <span className="text-lg font-bold text-white">{currentGoal.targetWeightKg} kg</span>
                  </div>
                </div>
                {currentGoal.targetDate && (
                  <div className="flex items-center gap-4 bg-[#151B24] border border-white/5 p-4 rounded-xl">
                    <div className="bg-[#32D5F4]/10 p-2.5 rounded-xl border border-[#32D5F4]/20">
                      <Calendar className="text-[#32D5F4]" size={22} />
                    </div>
                    <div>
                      <span className="text-xs text-[#A8B0BF] block font-semibold">Target Date</span>
                      <span className="text-lg font-bold text-white">
                        {new Date(currentGoal.targetDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-10 bg-[#151B24] border border-white/5 rounded-2xl">
                <Target size={40} className="mx-auto mb-3 text-[#6F7887]" />
                <h4 className="text-sm font-bold text-white">No active goal set</h4>
                <Button 
                  variant="outline" 
                  className="mt-3 border-white/5 hover:bg-[#151B24] text-gray-300 font-bold rounded-xl text-xs" 
                  onClick={() => navigate('/goals')}
                >
                  Set a Goal
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Activity Logs */}
      <div className="grid lg:grid-cols-2 gap-8">
        <Card variant="bordered" className="bg-[#10151D] border-white/5 p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Recent Activity</h2>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/workouts/history')}
              className="border-white/5 hover:bg-[#151B24] text-gray-300 font-bold rounded-xl text-xs"
            >
              View All
            </Button>
          </div>
          <div className="space-y-3">
            {recentActivity.length > 0 ? (
              recentActivity.slice(0, 4).map((activity: any) => (
                <div key={activity.id} className="flex items-center justify-between p-4 bg-[#151B24] border border-white/5 rounded-xl hover:border-white/10 transition-colors">
                  <div>
                    <p className="font-bold text-white text-sm">{activity.workoutName || 'Push Workout'}</p>
                    <p className="text-xs text-[#A8B0BF] mt-0.5">
                      {new Date(activity.completedAt).toLocaleDateString()} • {activity.durationMinutes} min
                    </p>
                  </div>
                  {activity.rating && (
                    <div className="flex text-[#FFC400] text-xs">
                      {'★'.repeat(activity.rating)}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-10 bg-[#151B24] border border-white/5 rounded-xl text-[#A8B0BF] text-xs font-bold uppercase">
                No recent activity. Keep pushing!
              </div>
            )}
          </div>
        </Card>

        <Card variant="bordered" className="bg-[#10151D] border-white/5 p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Upcoming Workouts</h2>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/calendar')}
              className="border-white/5 hover:bg-[#151B24] text-gray-300 font-bold rounded-xl text-xs"
            >
              View Calendar
            </Button>
          </div>
          <div className="space-y-3">
            {upcomingWorkouts.length > 0 ? (
              upcomingWorkouts.map((workout: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-[#151B24] border border-white/5 rounded-xl">
                  <div>
                    <p className="font-bold text-white text-sm">{workout.name}</p>
                    <p className="text-xs text-[#A8B0BF] mt-0.5">
                      Day {workout.dayNumber} • {workout.focus}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-[#FFC400] uppercase bg-[#FFC400]/10 border border-[#FFC400]/20 px-2 py-0.5 rounded">
                    Scheduled
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-10 bg-[#151B24] border border-white/5 rounded-xl text-[#A8B0BF] text-xs font-bold uppercase">
                No upcoming workouts scheduled.
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
