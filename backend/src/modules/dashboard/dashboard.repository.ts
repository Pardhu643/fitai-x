import { prisma } from '../../core/database/prisma';
import { DashboardData, DashboardStats, TodayWorkout, RecentActivity, UpcomingWorkout, WeightProgress } from './dashboard.types';

export class DashboardRepository {
  async getDashboardData(userId: string): Promise<DashboardData> {
    const [
      stats,
      todayWorkout,
      recentActivity,
      upcomingWorkouts,
      weightProgress,
      currentGoal,
      latestRecovery,
    ] = await Promise.all([
      this.getStats(userId),
      this.getTodayWorkout(userId),
      this.getRecentActivity(userId),
      this.getUpcomingWorkouts(userId),
      this.getWeightProgress(userId),
      this.getCurrentGoal(userId),
      prisma.recoveryEntry.findFirst({ where: { userId }, orderBy: { date: 'desc' } }),
    ]);

    return {
      stats,
      todayWorkout,
      recentActivity,
      upcomingWorkouts,
      weightProgress,
      recoveryScore: latestRecovery ? {
        score: latestRecovery.score,
        factors: {
          sleep: Math.round(latestRecovery.sleepHours * 10),
          stress: latestRecovery.stressLevel === 'LOW' ? 100 : latestRecovery.stressLevel === 'MEDIUM' ? 60 : 20,
          soreness: latestRecovery.sorenessLevel === 'NONE' ? 100 : latestRecovery.sorenessLevel === 'LIGHT' ? 60 : 20,
        }
      } : null,
      currentGoal,
    };
  }

  private async getStats(userId: string): Promise<DashboardStats> {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const [
      totalWorkouts,
      thisWeekWorkouts,
      totalCaloriesBurned,
      totalMinutes,
      thisWeekData,
    ] = await Promise.all([
      prisma.workoutHistory.count({ where: { userId } }),
      prisma.workoutHistory.count({
        where: {
          userId,
          completedAt: { gte: weekStart },
        },
      }),
      prisma.workoutHistory.aggregate({
        where: { userId },
        _sum: { caloriesBurned: true },
      }),
      prisma.workoutHistory.aggregate({
        where: { userId },
        _sum: { durationMinutes: true },
      }),
      prisma.workoutHistory.aggregate({
        where: {
          userId,
          completedAt: { gte: weekStart },
        },
        _sum: { caloriesBurned: true, durationMinutes: true },
      }),
    ]);

    return {
      totalWorkouts,
      currentStreak: 0,
      totalCaloriesBurned: totalCaloriesBurned._sum.caloriesBurned || 0,
      totalMinutes: totalMinutes._sum.durationMinutes || 0,
      thisWeekWorkouts,
      thisWeekCalories: thisWeekData._sum.caloriesBurned || 0,
      thisWeekMinutes: thisWeekData._sum.durationMinutes || 0,
    };
  }

  private async getTodayWorkout(userId: string): Promise<TodayWorkout | null> {
    const now = new Date();
    const dayOfWeek = now.getDay();

    const activePlan = await prisma.workoutPlan.findFirst({
      where: {
        userId,
        isActive: true,
        startDate: { lte: now },
        OR: [{ endDate: null }, { endDate: { gte: now } }],
      },
      include: {
        workoutDays: {
          where: { dayOfWeek },
          include: {
            exercises: true,
            workoutExercises: true,
          },
        },
      },
    });

    if (!activePlan || activePlan.workoutDays.length === 0) {
      return null;
    }

    const workoutDay = activePlan.workoutDays[0];

    return {
      id: workoutDay.id,
      name: workoutDay.name,
      durationMinutes: workoutDay.durationMinutes,
      exercisesCount: workoutDay.workoutExercises.length || workoutDay.exercises.length,
      dayOfWeek: workoutDay.dayOfWeek,
    };
  }

  private async getRecentActivity(userId: string): Promise<RecentActivity[]> {
    const history = await prisma.workoutHistory.findMany({
      where: { userId },
      orderBy: { completedAt: 'desc' },
      take: 5,
      select: {
        id: true,
        completedAt: true,
        durationMinutes: true,
        caloriesBurned: true,
        rating: true,
      },
    });

    return history.map((h: any) => ({
      id: h.id,
      workoutName: 'Workout',
      completedAt: h.completedAt,
      durationMinutes: h.durationMinutes,
      caloriesBurned: h.caloriesBurned,
      rating: h.rating,
    }));
  }

  private async getUpcomingWorkouts(userId: string): Promise<UpcomingWorkout[]> {
    const now = new Date();
    const activePlan = await prisma.workoutPlan.findFirst({
      where: {
        userId,
        isActive: true,
        startDate: { lte: now },
        OR: [{ endDate: null }, { endDate: { gte: now } }],
      },
      include: {
        workoutDays: {
          include: {
            exercises: true,
            workoutExercises: true,
          },
        },
      },
    });

    if (!activePlan) {
      return [];
    }

    const upcoming = activePlan.workoutDays
      .filter((wd: any) => wd.dayOfWeek > now.getDay() || wd.dayOfWeek === 0)
      .sort((a: any, b: any) => a.dayOfWeek - b.dayOfWeek)
      .slice(0, 3);

    return upcoming.map((wd: any) => ({
      id: wd.id,
      name: wd.name,
      scheduledDate: new Date(),
      durationMinutes: wd.durationMinutes,
      exercisesCount: wd.workoutExercises.length || wd.exercises.length,
    }));
  }

  private async getWeightProgress(userId: string): Promise<WeightProgress[]> {
    const measurements = await prisma.bodyMeasurement.findMany({
      where: { userId },
      orderBy: { measuredAt: 'desc' },
      take: 30,
      select: {
        measuredAt: true,
        weightKg: true,
      },
    });

    return measurements.reverse().map((m: any) => ({
      date: m.measuredAt,
      weightKg: m.weightKg,
    }));
  }

  private async getCurrentGoal(userId: string) {
    return prisma.goal.findFirst({
      where: {
        userId,
        isAchieved: false,
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        targetWeightKg: true,
        targetDate: true,
        isAchieved: true,
      },
    });
  }
}

export const dashboardRepository = new DashboardRepository();
