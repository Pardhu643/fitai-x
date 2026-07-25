export interface DashboardStats {
  totalWorkouts: number;
  currentStreak: number;
  totalCaloriesBurned: number;
  totalMinutes: number;
  thisWeekWorkouts: number;
  thisWeekCalories: number;
  thisWeekMinutes: number;
}

export interface TodayWorkout {
  id: string;
  name: string;
  durationMinutes: number;
  exercisesCount: number;
  dayOfWeek: number;
}

export interface RecentActivity {
  id: string;
  workoutName: string;
  completedAt: Date;
  durationMinutes: number;
  caloriesBurned: number | null;
  rating: number | null;
}

export interface UpcomingWorkout {
  id: string;
  name: string;
  scheduledDate: Date;
  durationMinutes: number;
  exercisesCount: number;
}

export interface WeightProgress {
  date: Date;
  weightKg: number;
}

export interface RecoveryScore {
  score: number;
  factors: {
    sleep: number;
    stress: number;
    soreness: number;
  };
}

export interface FatigueSummary {
  score: number;
  level: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  confidence: number;
  recommendedAction: string;
  calculatedAt: Date;
}

export interface DashboardData {
  stats: DashboardStats;
  todayWorkout: TodayWorkout | null;
  recentActivity: RecentActivity[];
  upcomingWorkouts: UpcomingWorkout[];
  weightProgress: WeightProgress[];
  recoveryScore: RecoveryScore | null;
  fatigueSummary: FatigueSummary | null;
  currentGoal: {
    id: string;
    targetWeightKg: number | null;
    targetDate: Date | null;
    isAchieved: boolean;
  } | null;
  nutritionSummary?: {
    calorieTarget: number;
    caloriesConsumed: number;
    proteinGramsTarget: number;
    proteinGramsConsumed: number;
    nextMealTitle: string | null;
    nextMealTime: string | null;
    groceryItemsRemaining: number;
  } | null;
}
