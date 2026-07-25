export interface WorkoutRecommendation {
  id: string;
  userId: string;
  type: 'PROGRESSIVE_OVERLOAD' | 'DELOAD' | 'RECOVERY_DAY' | 'EXERCISE_SUBSTITUTION' | 'INTENSITY_REDUCTION' | 'VOLUME_REDUCTION';
  status: 'PENDING' | 'APPLIED' | 'DISMISSED' | 'EXPIRED';
  title: string;
  description: string;
  explanation: string;
  confidence: number;
  exerciseId?: string;
  workoutPlanId?: string;
  currentValues?: any;
  recommendedValues?: any;
  appliedAt?: Date;
  dismissedAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateRecommendationInput {
  type: 'PROGRESSIVE_OVERLOAD' | 'DELOAD' | 'RECOVERY_DAY' | 'EXERCISE_SUBSTITUTION' | 'INTENSITY_REDUCTION' | 'VOLUME_REDUCTION';
  title: string;
  description: string;
  explanation: string;
  confidence: number;
  exerciseId?: string;
  workoutPlanId?: string;
  currentValues?: any;
  recommendedValues?: any;
  expiresAt?: Date;
}

export interface ApplyRecommendationInput {
  appliedAt?: Date;
}

export interface DismissRecommendationInput {
  dismissedAt?: Date;
}
