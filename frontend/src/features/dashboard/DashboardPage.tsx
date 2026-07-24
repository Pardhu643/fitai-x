import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dumbbell, Calendar, TrendingUp, Flame, Target, Play, Plus, Settings, Clock, Heart } from 'lucide-react';
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
      <div className="min-h-screen bg-[#090909] flex items-center justify-center">
        <div className="text-gray-400 font-medium">Loading dashboard...</div>
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

  return (
    <div className="space-y-8 pb-12">
      {/* Header greetings */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-xs font-bold text-[#FFC400] tracking-widest uppercase">Overview</span>
          <h1 className="text-3xl font-extrabold text-white mt-1">
            Welcome back, {user?.name?.split(' ')[0] || 'User'}! 👋
          </h1>
          <p className="text-gray-400 text-sm mt-1">Here's your fitness overview for today.</p>
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
          iconColor="text-[#FFC400]"
          bgColor="bg-[#FFC400]/15"
        />
      </div>

      {/* Today's Workout & Recovery Score */}
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card variant="bordered" className="bg-[#151515] border-[#1B1B1B] h-full flex flex-col justify-between p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Dumbbell className="text-[#FFC400]" size={22} />
                Today's Workout
              </h2>
              {todayWorkout ? (
                <Button 
                  onClick={() => navigate(`/workouts/day/${todayWorkout.id}`)}
                  className="bg-[#FFC400] text-black hover:bg-[#e0ad00] font-bold rounded-xl px-4 py-2 flex items-center gap-2 text-xs"
                >
                  <Play size={14} fill="black" />
                  Start Workout
                </Button>
              ) : (
                <Button 
                  onClick={() => navigate('/workouts/generate')}
                  className="bg-[#FFC400] text-black hover:bg-[#e0ad00] font-bold rounded-xl px-4 py-2 flex items-center gap-2 text-xs"
                >
                  <Plus size={14} />
                  Generate Plan
                </Button>
              )}
            </div>
            {todayWorkout ? (
              <div className="bg-[#1B1B1B] border border-[#222] rounded-2xl p-6 relative overflow-hidden group">
                <div className="absolute -right-16 -bottom-16 w-48 h-48 bg-[#FFC400]/5 rounded-full blur-2xl group-hover:bg-[#FFC400]/10 transition-all duration-300"></div>
                <h3 className="text-xl font-bold text-white mb-2">{todayWorkout.name}</h3>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span className="flex items-center gap-1.5 bg-[#151515] px-3 py-1.5 rounded-xl border border-[#222]">
                    <Clock size={15} className="text-[#FFC400]" />
                    {todayWorkout.durationMinutes || 45} min
                  </span>
                  <span className="flex items-center gap-1.5 bg-[#151515] px-3 py-1.5 rounded-xl border border-[#222]">
                    <Dumbbell size={15} className="text-[#FFC400]" />
                    {todayWorkout.workoutExercises?.length || 6} exercises
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 bg-[#1B1B1B] border border-[#222] rounded-2xl">
                <Dumbbell size={40} className="mx-auto mb-3 text-gray-600" />
                <h4 className="text-sm font-bold text-white">No active plan scheduled</h4>
                <p className="text-xs text-gray-400 mt-1">Generate a dynamic plan customized for you.</p>
              </div>
            )}
          </Card>
        </div>

        <Card variant="bordered" className="bg-[#151515] border-[#1B1B1B] p-6 rounded-2xl flex flex-col justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Heart className="text-[#7CFF4D]" size={22} />
            Recovery Status
          </h2>
          <div className="flex flex-col items-center justify-center py-6">
            <ProgressRing progress={85} size={130} color="#7CFF4D" />
            <div className="text-center mt-4">
              <span className="text-lg font-bold text-white block">Ready to Train</span>
              <p className="text-xs text-gray-400 mt-0.5">Based on sleep, stress & activity</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Weight Progress & Goals */}
      <div className="grid lg:grid-cols-2 gap-8">
        <Card variant="bordered" className="bg-[#151515] border-[#1B1B1B] p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Weight Progress</h2>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/profile')}
              className="border-[#1B1B1B] hover:bg-[#1B1B1B] text-gray-300 font-bold rounded-xl text-xs"
            >
              <Plus size={14} className="mr-1.5" />
              Update Profile
            </Button>
          </div>
          <div className="bg-[#1B1B1B] border border-[#222] p-4 rounded-xl">
            {weightProgress?.length > 0 ? (
              <WeightChart data={weightProgress.map((wp: any) => ({
                date: new Date(wp.date).toLocaleDateString(),
                weight: wp.weightKg,
              }))} />
            ) : (
              <div className="text-center py-10 text-gray-500">
                No logged weights found. Profile weight is currently set.
              </div>
            )}
          </div>
        </Card>

        <Card variant="bordered" className="bg-[#151515] border-[#1B1B1B] p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Target className="text-[#FFC400]" size={22} />
              Current Goal
            </h2>
            {currentGoal ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4 bg-[#1B1B1B] border border-[#222] p-4 rounded-xl">
                  <div className="bg-[#FFC400]/10 p-2.5 rounded-xl border border-[#FFC400]/20">
                    <Target className="text-[#FFC400]" size={22} />
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 block font-semibold">Target Weight</span>
                    <span className="text-lg font-bold text-white">{currentGoal.targetWeightKg} kg</span>
                  </div>
                </div>
                {currentGoal.targetDate && (
                  <div className="flex items-center gap-4 bg-[#1B1B1B] border border-[#222] p-4 rounded-xl">
                    <div className="bg-blue-500/10 p-2.5 rounded-xl border border-blue-500/20">
                      <Calendar className="text-blue-400" size={22} />
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 block font-semibold">Target Date</span>
                      <span className="text-lg font-bold text-white">
                        {new Date(currentGoal.targetDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-10 bg-[#1B1B1B] border border-[#222] rounded-2xl">
                <Target size={40} className="mx-auto mb-3 text-gray-600" />
                <h4 className="text-sm font-bold text-white">No active goal set</h4>
                <Button 
                  variant="outline" 
                  className="mt-3 border-[#1B1B1B] hover:bg-[#1B1B1B] text-gray-300 font-bold rounded-xl text-xs" 
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
        <Card variant="bordered" className="bg-[#151515] border-[#1B1B1B] p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Recent Activity</h2>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/workouts/history')}
              className="border-[#1B1B1B] hover:bg-[#1B1B1B] text-gray-300 font-bold rounded-xl text-xs"
            >
              View All
            </Button>
          </div>
          <div className="space-y-3">
            {recentActivity.length > 0 ? (
              recentActivity.slice(0, 4).map((activity: any) => (
                <div key={activity.id} className="flex items-center justify-between p-4 bg-[#1B1B1B] border border-[#222] rounded-xl hover:border-gray-700 transition-colors">
                  <div>
                    <p className="font-bold text-white text-sm">{activity.workoutName || 'Push Workout'}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
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
              <div className="text-center py-10 bg-[#1B1B1B] border border-[#222] rounded-xl text-gray-400 text-sm">
                No recent activity. Keep pushing!
              </div>
            )}
          </div>
        </Card>

        <Card variant="bordered" className="bg-[#151515] border-[#1B1B1B] p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Upcoming Workouts</h2>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/calendar')}
              className="border-[#1B1B1B] hover:bg-[#1B1B1B] text-gray-300 font-bold rounded-xl text-xs"
            >
              View Calendar
            </Button>
          </div>
          <div className="space-y-3">
            {upcomingWorkouts.length > 0 ? (
              upcomingWorkouts.map((workout: any) => (
                <div key={workout.id} className="flex items-center justify-between p-4 bg-[#1B1B1B] border border-[#222] rounded-xl">
                  <div>
                    <p className="font-bold text-white text-sm">{workout.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {workout.durationMinutes} min • {workout.exercisesCount} exercises
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 bg-[#1B1B1B] border border-[#222] rounded-xl text-gray-400 text-sm">
                No upcoming workouts scheduled.
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Quick Actions Grid */}
      <Card variant="bordered" className="bg-[#151515] border-[#1B1B1B] p-6 rounded-2xl">
        <h2 className="text-xl font-bold text-white mb-6">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => navigate('/workouts')}
            className="p-5 bg-[#1B1B1B] border border-[#222] rounded-2xl hover:border-[#FFC400] transition-colors text-left flex flex-col justify-between h-32 group"
          >
            <Dumbbell className="text-[#FFC400] mb-2 group-hover:scale-110 transition-transform" size={26} />
            <div>
              <h3 className="font-bold text-white text-sm">Workouts</h3>
              <p className="text-[11px] text-gray-400 mt-0.5">View your workout plans</p>
            </div>
          </button>
          <button
            onClick={() => navigate('/calendar')}
            className="p-5 bg-[#1B1B1B] border border-[#222] rounded-2xl hover:border-[#FFC400] transition-colors text-left flex flex-col justify-between h-32 group"
          >
            <Calendar className="text-[#FFC400] mb-2 group-hover:scale-110 transition-transform" size={26} />
            <div>
              <h3 className="font-bold text-white text-sm">Calendar</h3>
              <p className="text-[11px] text-gray-400 mt-0.5">Check your schedule</p>
            </div>
          </button>
          <button
            onClick={() => navigate('/goals')}
            className="p-5 bg-[#1B1B1B] border border-[#222] rounded-2xl hover:border-[#FFC400] transition-colors text-left flex flex-col justify-between h-32 group"
          >
            <Target className="text-[#FFC400] mb-2 group-hover:scale-110 transition-transform" size={26} />
            <div>
              <h3 className="font-bold text-white text-sm">Goals</h3>
              <p className="text-[11px] text-gray-400 mt-0.5">Track your goals</p>
            </div>
          </button>
          <button
            onClick={() => navigate('/profile')}
            className="p-5 bg-[#1B1B1B] border border-[#222] rounded-2xl hover:border-[#FFC400] transition-colors text-left flex flex-col justify-between h-32 group"
          >
            <Settings className="text-[#FFC400] mb-2 group-hover:scale-110 transition-transform" size={26} />
            <div>
              <h3 className="font-bold text-white text-sm">Settings</h3>
              <p className="text-[11px] text-gray-400 mt-0.5">Manage your profile</p>
            </div>
          </button>
        </div>
      </Card>
    </div>
  );
}
